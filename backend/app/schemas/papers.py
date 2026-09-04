from typing import Literal

from pydantic import BaseModel, Field


class PaperMetadata(BaseModel):
    title: str | None = None
    authors: list[str] = Field(default_factory=list)
    subject: str | None = None
    keywords: list[str] = Field(default_factory=list)
    creator: str | None = None
    producer: str | None = None
    creation_date: str | None = None
    modification_date: str | None = None


class PaperSection(BaseModel):
    title: str
    content: str
    page_start: int
    page_end: int


class PaperResponse(BaseModel):
    id: str
    filename: str
    title: str
    pages: int
    metadata: PaperMetadata
    sections: list[PaperSection]
    uploaded_at: str
    project_id: str | None = None
    file_size_bytes: int | None = None
    status: Literal["processed"] = "processed"


class UploadResponse(PaperResponse):
    pass
