import fitz
import pytest
from pathlib import Path

from app.api.routes.papers import validate_pdf_upload
from app.services.pdf_service import extract_pdf_document


def _build_valid_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "ResearchAI validation sample")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_validate_pdf_upload_accepts_basic_valid_pdf_bytes():
    assert validate_pdf_upload("paper.pdf", "application/octet-stream", _build_valid_pdf_bytes()) is None


def test_validate_pdf_upload_rejects_non_pdf_bytes():
    with pytest.raises(ValueError, match="valid PDF"):
        validate_pdf_upload("paper.pdf", "application/octet-stream", b"not-a-pdf")


def test_extract_pdf_document_preserves_numbered_sections_and_subsections(tmp_path: Path):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_textbox((50, 50, 550, 750), """ABSTRACT
This is the abstract.

I. INTRODUCTION
This is the introduction.

1. Review Planning
This is the review planning subsection.

II. METHODOLOGY
This is the methodology.

III. RESULTS
This is the result.

REFERENCES
[1] A reference.
""")
    pdf_path = tmp_path / "sectioned.pdf"
    doc.save(pdf_path)
    doc.close()

    result = extract_pdf_document(pdf_path)

    assert [section.title for section in result.sections] == [
        "ABSTRACT",
        "INTRODUCTION",
        "Review Planning",
        "METHODOLOGY",
        "RESULTS",
        "REFERENCES",
    ]
    assert result.sections[1].page_start == 1
    assert result.sections[1].id == "section-2"
    assert result.sections[1].content == "This is the introduction."
    assert result.sections[-1].content == "[1] A reference."
