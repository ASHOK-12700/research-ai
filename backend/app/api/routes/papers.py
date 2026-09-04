from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import requests
from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile, status

from app.core.config import get_settings
from app.schemas.papers import PaperResponse, UploadResponse
from app.schemas.summaries import StructuredPaperSummary
from app.services.ai_summary_service import AISummaryServiceError, ai_summary_service
from app.services.paper_repository import StoredPaper, build_paper_id, paper_repository
from app.services.pdf_service import extract_pdf_document
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/papers", tags=["Papers"])

MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_MIME_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}
STORAGE_DIR = Path(__file__).resolve().parents[3] / "storage" / "papers"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def validate_pdf_upload(filename: str | None, content_type: str | None, file_bytes: bytes) -> None:
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    if filename and not filename.lower().endswith(".pdf"):
        raise ValueError("Only PDF files are supported.")

    normalized_content_type = (content_type or "").split(";", 1)[0].strip().lower()
    if normalized_content_type and normalized_content_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Invalid file type. Upload a PDF file.")

    if not file_bytes[:5] == b"%PDF-":
        raise ValueError("The uploaded file is not a valid PDF.")

    try:
        import fitz

        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            if doc.page_count < 1:
                raise ValueError("The uploaded PDF is empty or corrupted.")
    except Exception as exc:  # pragma: no cover - defensive parser guard
        raise ValueError("The uploaded file is not a valid PDF or could not be parsed.") from exc


def get_authenticated_user_id(authorization_header: str | None) -> str:
    if not authorization_header:
        raise ValueError("Missing Authorization header")

    scheme, _, token = authorization_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise ValueError("Authorization header must be in the format: Bearer <token>")

    settings = get_settings()
    if not settings.SUPABASE_URL:
        raise ValueError("Supabase URL is not configured")

    response = requests.get(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        },
        timeout=15,
    )

    if response.status_code != 200:
        raise ValueError("Invalid or expired authentication token.")

    payload = response.json()
    user_id = payload.get("id")
    if not user_id:
        raise ValueError("Authenticated user ID could not be resolved.")
    return str(user_id)


def _paper_to_response(paper: StoredPaper) -> PaperResponse:
    return PaperResponse(
        id=paper.id,
        filename=paper.filename,
        title=paper.title,
        pages=paper.pages,
        metadata=paper.metadata,
        sections=paper.sections,
        uploaded_at=paper.uploaded_at,
        project_id=paper.project_id,
        file_size_bytes=paper.file_size_bytes,
    )


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_paper(
    request: Request,
    file: UploadFile = File(...),
    project_id: str | None = Form(default=None),
) -> UploadResponse:
    original_name = file.filename or ""
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 50 MB limit.",
        )

    try:
        validate_pdf_upload(original_name, file.content_type, file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=str(exc),
        ) from exc

    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    paper_id = build_paper_id()
    stored_filename = f"{paper_id}_{uuid4().hex}.pdf"
    storage_path = STORAGE_DIR / stored_filename
    storage_path.write_bytes(file_bytes)

    try:
        storage_reference = supabase_service.upload_pdf(paper_id, file_bytes, stored_filename)
    except Exception as exc:  # pragma: no cover - integration guard
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PDF upload to Supabase Storage failed.",
        ) from exc

    extraction = extract_pdf_document(storage_path)
    uploaded_at = datetime.now(timezone.utc).isoformat()

    stored_paper = StoredPaper(
        id=paper_id,
        filename=stored_filename,
        original_filename=original_name,
        title=extraction.title,
        pages=extraction.page_count,
        metadata=extraction.metadata,
        sections=extraction.sections,
        uploaded_at=uploaded_at,
        project_id=project_id,
        file_size_bytes=len(file_bytes),
        storage_path=storage_reference,
        user_id=user_id,
        full_text=extraction.full_text,
    )

    paper_repository.add(stored_paper)
    return _paper_to_response(stored_paper)


@router.get("", response_model=list[PaperResponse])
async def list_papers(request: Request, project_id: str | None = None) -> list[PaperResponse]:
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
    return [_paper_to_response(paper) for paper in paper_repository.list(project_id=project_id, user_id=user_id)]


@router.get("/{paper_id}", response_model=PaperResponse)
async def get_paper(request: Request, paper_id: str) -> PaperResponse:
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    paper = paper_repository.get(paper_id, user_id=user_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")
    return _paper_to_response(paper)


@router.post("/{paper_id}/summarize", response_model=StructuredPaperSummary)
async def summarize_paper(request: Request, paper_id: str) -> StructuredPaperSummary:
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    paper = paper_repository.get(paper_id, user_id=user_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")

    if not paper.full_text or not paper.full_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Paper text is missing or empty. Upload and extract the PDF again.",
        )

    try:
        summary = ai_summary_service.summarize_paper(paper.title, paper.metadata.authors, paper.full_text)
        paper_repository.save_summary(paper_id, summary)
        return summary
    except AISummaryServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.user_message,
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive guard for network or parser failures
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI summarization failed due to an unexpected backend error.",
        ) from exc
