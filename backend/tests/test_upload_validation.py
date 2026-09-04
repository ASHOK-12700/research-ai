import fitz
import pytest

from app.api.routes.papers import validate_pdf_upload


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
