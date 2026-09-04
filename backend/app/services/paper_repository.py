from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.schemas.papers import PaperMetadata, PaperSection
from app.schemas.summaries import StructuredPaperSummary
from app.services.supabase_service import supabase_service


@dataclass(slots=True)
class StoredPaper:
    id: str
    filename: str
    original_filename: str
    title: str
    pages: int
    metadata: PaperMetadata
    sections: list[PaperSection]
    uploaded_at: str
    project_id: str | None
    file_size_bytes: int
    storage_path: str
    user_id: str | None = None
    full_text: str = ""


class SupabasePaperRepository:
    def __init__(self) -> None:
        self._table = "papers"

    @staticmethod
    def _coerce_metadata(value: Any) -> PaperMetadata:
        if isinstance(value, PaperMetadata):
            return value
        if isinstance(value, dict):
            return PaperMetadata.model_validate(value)
        return PaperMetadata()

    @staticmethod
    def _coerce_sections(value: Any) -> list[PaperSection]:
        if not value:
            return []
        if isinstance(value, list):
            return [PaperSection.model_validate(item) for item in value if isinstance(item, dict)]
        return []

    @classmethod
    def _row_to_paper(cls, row: dict[str, Any]) -> StoredPaper:
        metadata = cls._coerce_metadata(row.get("metadata"))
        sections = cls._coerce_sections(row.get("sections"))
        return StoredPaper(
            id=str(row["id"]),
            filename=str(row.get("filename") or ""),
            original_filename=str(row.get("original_filename") or row.get("filename") or ""),
            title=str(row.get("title") or "Untitled Paper"),
            pages=int(row.get("page_count") or 0),
            metadata=metadata,
            sections=sections,
            uploaded_at=str(row.get("uploaded_at") or row.get("created_at") or datetime.now(timezone.utc).isoformat()),
            project_id=row.get("project_id"),
            file_size_bytes=int(row.get("file_size_bytes") or 0),
            storage_path=str(row.get("storage_path") or ""),
            user_id=row.get("user_id"),
            full_text=str(row.get("full_text") or row.get("extracted_text") or ""),
        )

    def add(self, paper: StoredPaper) -> StoredPaper:
        payload = {
            "id": paper.id,
            "title": paper.title,
            "filename": paper.filename,
            "storage_path": paper.storage_path,
            "original_filename": paper.original_filename,
            "uploaded_at": paper.uploaded_at,
            "page_count": paper.pages,
            "project_id": paper.project_id,
            "user_id": paper.user_id,
            "file_size_bytes": paper.file_size_bytes,
            "metadata": paper.metadata.model_dump(mode="json"),
            "sections": [section.model_dump(mode="json") for section in paper.sections],
            "full_text": paper.full_text,
            "extracted_text": paper.full_text,
        }
        response = supabase_service.table(self._table).upsert(payload, on_conflict="id").execute()
        row = (response.data or [{}])[0]
        return self._row_to_paper(row or payload)

    def list(self, project_id: str | None = None, user_id: str | None = None) -> list[StoredPaper]:
        query = supabase_service.table(self._table).select("*")
        if user_id:
            query = query.eq("user_id", user_id)
        if project_id:
            query = query.eq("project_id", project_id)
        response = query.order("uploaded_at", desc=True).execute()
        rows = response.data or []
        return [self._row_to_paper(row) for row in rows]

    def get(self, paper_id: str, user_id: str | None = None) -> StoredPaper | None:
        query = supabase_service.table(self._table).select("*").eq("id", paper_id)
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.limit(1).execute()
        rows = response.data or []
        if not rows:
            return None
        return self._row_to_paper(rows[0])

    def delete(self, paper_id: str, user_id: str | None = None) -> bool:
        query = supabase_service.table(self._table).delete().eq("id", paper_id)
        if user_id:
            query = query.eq("user_id", user_id)
        response = query.execute()
        return bool((response.data or []))

    def save_summary(self, paper_id: str, summary: StructuredPaperSummary) -> dict[str, Any]:
        payload = {
            "paper_id": paper_id,
            "paper_title": summary.paper_title,
            "research_problem": summary.research_problem,
            "objectives": summary.objectives,
            "methodology": summary.methodology,
            "dataset_data_used": summary.dataset_data_used,
            "proposed_approach_model": summary.proposed_approach_model,
            "key_results": summary.key_results,
            "evaluation_metrics": summary.evaluation_metrics,
            "main_contributions": summary.main_contributions,
            "limitations": summary.limitations,
            "future_work": summary.future_work,
            "key_takeaways": summary.key_takeaways,
        }
        response = supabase_service.table("summaries").insert(payload).execute()
        rows = response.data or []
        if rows:
            return rows[0]
        return payload


paper_repository = SupabasePaperRepository()


def build_paper_id() -> str:
    return f"paper_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
