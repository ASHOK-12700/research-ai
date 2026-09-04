from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    topic: str = Field(default="General Research", max_length=255)
    description: str = Field(default="", max_length=2000)
    tags: list[str] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    title: str | None = None
    topic: str | None = None
    description: str | None = None
    tags: list[str] | None = None
    status: str | None = None
    progress: int | None = None


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    topic: str
    description: str
    tags: list[str]
    status: str
    progress: int
    paper_count: int
    created_at: str
    updated_at: str


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int
