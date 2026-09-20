from pydantic import BaseModel, Field


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)
    paper_ids: list[str] = Field(default_factory=list, max_length=500)


class FolderUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)


class FolderPaperRequest(BaseModel):
    paper_ids: list[str] = Field(..., min_length=1, max_length=500)


class FolderResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    paper_ids: list[str]
    paper_count: int
    created_at: str
    updated_at: str


class FolderListResponse(BaseModel):
    folders: list[FolderResponse]
    total: int