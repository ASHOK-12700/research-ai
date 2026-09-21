from __future__ import annotations

import re
from collections.abc import Iterable

from app.schemas.analysis import AnalyzedField, NOT_AVAILABLE, PaperAnalysis, PaperGap, PaperSource
from app.schemas.papers import PaperMetadata, PaperSection


_HEADING_GROUPS: dict[str, tuple[str, ...]] = {
    "problem_statement": ("problem", "problem statement", "research problem", "motivation", "introduction", "background", "research questions"),
    "objectives": ("objective", "objectives", "goal", "goals", "aim", "aims", "research questions", "contributions"),
    "methodology": ("method", "methods", "methodology", "materials and methods", "approach", "proposed method", "implementation", "system architecture", "experimental setup"),
    "datasets": ("dataset", "datasets", "data", "data used", "corpus", "benchmark", "experimental setup"),
    "algorithms_models": ("algorithm", "algorithms", "model", "models", "architecture", "proposed approach", "approach", "method"),
    "major_findings": ("results", "result", "findings", "key findings", "evaluation", "experiments", "experimental results", "discussion", "conclusion", "conclusions"),
    "limitations": ("limitations", "limitation", "threats to validity", "threats", "weaknesses", "discussion"),
    "future_work": ("future work", "future directions", "future research", "conclusion", "conclusions", "discussion"),
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


def _abstract(paper_id: str, sections: list[PaperSection]) -> AnalyzedField:
    abstract = _section_text(paper_id, sections, ("abstract", "summary"))
    if abstract.content != NOT_AVAILABLE:
        words = abstract.content.split()
        if len(words) > 250:
            abstract.content = " ".join(words[:250]).rstrip(" ,;:") + "."
        return abstract
    # A paper without an abstract heading must not be given an invented abstract.
    return AnalyzedField()


def _keywords(metadata: PaperMetadata, full_text: str) -> list[str]:
    if metadata.keywords:
        return [_clean(item) for item in metadata.keywords if _clean(item)]
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
        datasets=fields["datasets"],
        algorithms_models=fields["algorithms_models"],
        major_findings=fields["major_findings"],
        limitations=fields["limitations"],
        future_work=fields["future_work"],
        keywords=_keywords(metadata, full_text),
        research_gaps=gaps,
    )
