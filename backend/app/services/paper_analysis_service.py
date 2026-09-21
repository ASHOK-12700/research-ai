from __future__ import annotations

import re
from collections.abc import Iterable

from app.schemas.analysis import AnalyzedField, NOT_AVAILABLE, PaperAnalysis, PaperGap, PaperSource
from app.schemas.papers import PaperMetadata, PaperSection


_HEADING_GROUPS: dict[str, tuple[str, ...]] = {
    "problem_statement": ("problem", "problem statement", "research problem", "problem definition", "motivation", "introduction", "background", "research questions", "contributions"),
    "objectives": ("objective", "objectives", "goal", "goals", "aim", "aims", "research questions", "contributions"),
    "methodology": ("method", "methods", "methodology", "materials and methods", "approach", "proposed method", "proposed approach", "implementation", "system architecture", "model architecture", "experimental setup", "models and training"),
    "experimental_setup": ("experimental setup", "experiments", "experiment", "evaluation setup", "training setup", "experimental design", "setup", "preprocessing", "evaluation methodology"),
    "datasets": ("dataset", "datasets", "custom dataset", "custom skill dataset", "dataset construction", "data collection", "experimental data", "data", "data used", "corpus", "benchmark", "experimental setup"),
    "algorithms_models": ("algorithm", "algorithms", "model", "models", "models and training", "training", "model architecture", "architecture", "proposed approach", "approach", "method"),
    "major_findings": ("results", "result", "findings", "key findings", "evaluation", "evaluation results", "experiments", "experimental results", "results and discussion", "discussion", "conclusion", "conclusions"),
    "limitations": ("limitations", "limitation", "threats to validity", "threats", "weaknesses", "discussion"),
    "future_work": ("future work", "future directions", "future research", "limitations and future work", "conclusion", "conclusions", "discussion"),
}

_CONTENT_MARKERS: dict[str, tuple[str, ...]] = {
    "experimental_setup": ("experimental setup", "train on", "trained on", "validate on", "validation set", "baseline", "preprocessing", "evaluation protocol", "protocol", "setup", "benchmarks"),
    "datasets": ("dataset", "data set", "data collection", "training data", "test set", "evaluation data", "corpus"),
    "algorithms_models": ("model", "models", "algorithm", "training", "fine-tun", "neural", "language model", "code completion"),
    "limitations": ("limitation", "limitations", "threat to validity", "threats to validity", "future work", "future direction", "we plan", "could be improved"),
    "future_work": ("future work", "future direction", "future research", "we plan", "in the future", "could be extended", "remain to be explored"),
}


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _normalized_title(title: str) -> str:
    title = re.sub(r"^\s*(?:(?:[ivxlcdm]+|\d+(?:\.\d+)*)\s*[.)-]\s*)", "", title, flags=re.IGNORECASE)
    return re.sub(r"[^a-z0-9 ]", " ", title.casefold()).strip()


def _matches(title: str, aliases: Iterable[str]) -> bool:
    normalized = _normalized_title(title)
    return any(alias == normalized or alias in normalized for alias in aliases)


def _dedupe_sections(sections: list[PaperSection]) -> list[PaperSection]:
    seen: set[tuple[str, int, str]] = set()
    result: list[PaperSection] = []
    for section in sections:
        content = _clean(section.content)
        if not content:
            continue
        key = (_normalized_title(section.title), section.page_start, content[:180])
        if key not in seen:
            seen.add(key)
            result.append(section)
    return result


def _section_text(paper_id: str, sections: list[PaperSection], aliases: Iterable[str]) -> AnalyzedField:
    matches = [section for section in sections if _matches(section.title, aliases)]
    if not matches:
        return AnalyzedField()
    content = "\n\n".join(_clean(section.content) for section in matches if _clean(section.content)).strip()
    if not content:
        return AnalyzedField()
    return AnalyzedField(
        content=content,
        sources=[PaperSource(paper_id=paper_id, page=section.page_start, section=section.title, snippet=_clean(section.content)[:320]) for section in matches],
    )


def _content_evidence(paper_id: str, sections: list[PaperSection], markers: Iterable[str]) -> AnalyzedField:
    matches: list[tuple[PaperSection, str]] = []
    marker_list = tuple(marker.casefold() for marker in markers)
    for section in sections:
        paragraphs = [part.strip() for part in re.split(r"\n\s*\n", section.content) if part.strip()]
        for paragraph in paragraphs:
            if any(marker in paragraph.casefold() for marker in marker_list):
                matches.append((section, _clean(paragraph)))
    if not matches:
        return AnalyzedField()
    unique: list[tuple[PaperSection, str]] = []
    seen: set[str] = set()
    for section, paragraph in matches:
        if paragraph not in seen:
            seen.add(paragraph)
            unique.append((section, paragraph))
    return AnalyzedField(
        content="\n\n".join(paragraph for _, paragraph in unique),
        sources=[PaperSource(paper_id=paper_id, page=section.page_start, section=section.title, snippet=paragraph[:320]) for section, paragraph in unique],
    )


def _abstract(paper_id: str, sections: list[PaperSection]) -> AnalyzedField:
    abstract = _section_text(paper_id, sections, ("abstract", "summary"))
    if abstract.content != NOT_AVAILABLE:
        words = abstract.content.split()
        if len(words) > 250:
            abstract.content = " ".join(words[:250]).rstrip(" ,;:") + "."
        return abstract
    # A paper without an abstract heading must not be given an invented abstract.
    return AnalyzedField()


def _keywords(metadata: PaperMetadata, sections: list[PaperSection], full_text: str) -> list[str]:
    if metadata.keywords:
        return [_clean(item) for item in metadata.keywords if _clean(item)]
    keyword_sections = [section for section in sections if re.search(r"\bkeywords?\b|\bkey words\b|\bindex terms?\b", section.title, re.IGNORECASE)]
    if keyword_sections:
        raw = _clean(" ".join(section.content for section in keyword_sections)).strip(" .;:")
        values = [_clean(item) for item in re.split(r"[,;|]", raw) if _clean(item)]
        if values:
            return values
    match = re.search(r"(?:keywords?|key words)\s*[:\-]\s*(.+?)(?:\n\s*\n|\.|\b(?:introduction|background)\b)", full_text, re.IGNORECASE | re.DOTALL)
    if not match:
        return []
    raw = re.sub(r"\s+", " ", match.group(1)).strip(" .;:")
    return [_clean(item) for item in re.split(r"[,;|]", raw) if _clean(item)]


def _gap_from_section(paper_id: str, section: PaperSection, category: str, title: str) -> PaperGap | None:
    content = _clean(section.content)
    if not content:
        return None
    return PaperGap(
        id=f"{paper_id}-gap-{section.id or section.page_start}-{category}",
        title=title,
        category=category,
        description=content,
        page=section.page_start,
        source_section=section.title,
    )


def build_paper_analysis(
    paper_id: str,
    metadata: PaperMetadata,
    sections: list[PaperSection],
    full_text: str,
) -> PaperAnalysis:
    normalized_sections = _dedupe_sections(sections)
    fields: dict[str, AnalyzedField] = {}
    for field, aliases in _HEADING_GROUPS.items():
        fields[field] = _section_text(paper_id, normalized_sections, aliases)

    # Papers often put dataset/model details under methodology and discuss
    # limitations/future work inside conclusions or discussion paragraphs.
    for field, markers in _CONTENT_MARKERS.items():
        if not fields[field].sources:
            fields[field] = _content_evidence(paper_id, normalized_sections, markers)

    gaps: list[PaperGap] = []
    gap_sections = [
        (section, "limitation", "Research limitation")
        for section in normalized_sections
        if _matches(section.title, _HEADING_GROUPS["limitations"])
    ]
    gap_sections.extend(
        (section, "direction", "Future research direction")
        for section in normalized_sections
        if _matches(section.title, _HEADING_GROUPS["future_work"])
    )
    for section, category, title in gap_sections:
        gap = _gap_from_section(paper_id, section, category, title)
        if gap and not any(existing.description == gap.description for existing in gaps):
            gaps.append(gap)

    return PaperAnalysis(
        abstract=_abstract(paper_id, normalized_sections),
        problem_statement=fields["problem_statement"],
        objectives=fields["objectives"],
        methodology=fields["methodology"],
        experimental_setup=fields["experimental_setup"],
        datasets=fields["datasets"],
        algorithms_models=fields["algorithms_models"],
        major_findings=fields["major_findings"],
        limitations=fields["limitations"],
        future_work=fields["future_work"],
        keywords=_keywords(metadata, normalized_sections, full_text),
        research_gaps=gaps,
    )
