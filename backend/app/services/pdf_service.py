from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import fitz

from app.schemas.papers import PaperMetadata, PaperSection


SECTION_HEADINGS = {
    "abstract", "introduction", "background", "related work", "literature review",
    "methodology", "methods", "materials and methods", "proposed method",
    "system architecture", "algorithms", "models", "dataset", "data", "experiments",
    "experimental setup", "results", "discussion", "limitations", "problems",
    "future work", "conclusion", "conclusions", "references", "review planning",
    "mapping questions", "inclusion and exclusion criteria", "search strategy",
    "review process",
}

NUMBER_PREFIX = r"(?:\d+(?:\.\d+)*|[IVXLCDM]+)"
HEADING_PATTERN = re.compile(
    r"^\s*(?P<title>[A-Za-z][A-Za-z0-9 &'()/,-]{1,100})\s*(?:[:.\-–—?])?\s*$",
    re.IGNORECASE,
)


def _strip_number_prefix(line: str) -> str:
    stripped = line.strip()
    match = re.match(rf"^\s*(?:(?:{NUMBER_PREFIX})(?:[.)-]\s*|\s+))?", stripped)
    if not match:
        return stripped
    return stripped[match.end():].strip()


@dataclass(slots=True)
class PDFExtractionResult:
    title: str
    page_count: int
    metadata: PaperMetadata
    sections: list[PaperSection]
    page_texts: list[str]
    full_text: str


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text).strip()


def _split_authors(author_value: str | None) -> list[str]:
    if not author_value:
        return []

    normalized = re.sub(r"\s+(?:and|&)\s+", ",", author_value, flags=re.IGNORECASE)
    parts = [part.strip() for part in re.split(r"[,;]", normalized) if part.strip()]
    return parts


def _safe_metadata_value(metadata: dict[str, Any], key: str) -> str | None:
    value = metadata.get(key)
    if not value:
        return None
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned or None
    return str(value)


def _extract_title(doc: fitz.Document, page_texts: list[str], metadata: PaperMetadata, source_path: Path) -> str:
    if metadata.title:
        cleaned_title = metadata.title.strip()
        if cleaned_title and not cleaned_title.lower().startswith("microsoft word -"):
            return cleaned_title

    if page_texts:
        first_page_lines = [line.strip() for line in page_texts[0].splitlines() if line.strip()]
        for line in first_page_lines[:15]:
            if HEADING_PATTERN.match(line):
                continue
            if len(line) >= 12:
                return _normalize_whitespace(line)

    fallback_title = source_path.stem.replace("_", " ").strip()
    return fallback_title or "Untitled Paper"


def _build_metadata(doc: fitz.Document) -> PaperMetadata:
    raw_metadata = doc.metadata or {}
    keywords_value = _safe_metadata_value(raw_metadata, "keywords")

    keywords: list[str] = []
    if keywords_value:
        keywords = [item.strip() for item in re.split(r"[,;]", keywords_value) if item.strip()]

    return PaperMetadata(
        title=_safe_metadata_value(raw_metadata, "title"),
        authors=_split_authors(_safe_metadata_value(raw_metadata, "author")),
        subject=_safe_metadata_value(raw_metadata, "subject"),
        keywords=keywords,
        creator=_safe_metadata_value(raw_metadata, "creator"),
        producer=_safe_metadata_value(raw_metadata, "producer"),
        creation_date=_safe_metadata_value(raw_metadata, "creationDate"),
        modification_date=_safe_metadata_value(raw_metadata, "modDate"),
    )


def _is_heading(line: str) -> re.Match[str] | None:
    if len(line) > 120:
        return None

    candidate = _strip_number_prefix(line)
    match = HEADING_PATTERN.match(candidate)
    if not match:
        return None

    title = re.sub(r"\s+", " ", match.group("title")).strip(" .:;!?–—-")
    if title.casefold() in SECTION_HEADINGS:
        return match

    has_number_prefix = bool(re.match(rf"^\s*{NUMBER_PREFIX}", line))
    words = title.split()
    looks_like_heading = (
        has_number_prefix
        and len(words) <= 12
        and not re.search(r"[.!?]", title)
        and title == title.title()
    )
    return match if looks_like_heading or title.casefold() in SECTION_HEADINGS else None


def _finalize_section(
    sections: list[PaperSection],
    title: str | None,
    lines: list[str],
    page_start: int | None,
    page_end: int,
) -> None:
    if not title or page_start is None:
        return

    content = "\n".join(line for line in lines if line.strip()).strip()
    if not content:
        return

    sections.append(
        PaperSection(
            id=f"section-{len(sections) + 1}",
            title=title,
            content=content,
            page_start=page_start,
            page_end=page_end,
        )
    )


def extract_pdf_document(source_path: Path) -> PDFExtractionResult:
    with fitz.open(source_path) as doc:
        page_count = len(doc)
        page_texts: list[str] = []
        for page in doc:
            page_texts.append(page.get_text("text").strip())

        metadata = _build_metadata(doc)
        title = _extract_title(doc, page_texts, metadata, source_path)

        sections: list[PaperSection] = []
        current_title: str | None = None
        current_lines: list[str] = []
        current_page_start: int | None = None

        for page_index, page_text in enumerate(page_texts, start=1):
            page_lines = [line.rstrip() for line in page_text.splitlines() if line.strip()]

            for raw_line in page_lines:
                cleaned_line = _normalize_whitespace(raw_line)
                heading_match = _is_heading(cleaned_line)

                if heading_match:
                    _finalize_section(sections, current_title, current_lines, current_page_start, page_index)
                    current_title = re.sub(r"\s+", " ", heading_match.group("title")).strip(" .:")
                    current_lines = []
                    current_page_start = page_index
                    continue

                if current_title is not None:
                    current_lines.append(cleaned_line)

        _finalize_section(sections, current_title, current_lines, current_page_start, page_count)

        full_text = "\n\n".join(page_texts).strip()

        return PDFExtractionResult(
            title=title,
            page_count=page_count,
            metadata=metadata,
            sections=sections,
            page_texts=page_texts,
            full_text=full_text,
        )
