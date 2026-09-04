"""Schemas for RAG (Ask Your Papers) and Chatbot endpoints."""

from typing import Any

from pydantic import BaseModel, Field


class RAGQuery(BaseModel):
    """Request for RAG query over user's papers."""
    query: str = Field(..., min_length=1, max_length=1000)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    reasoning_depth: str = Field(
        default="Standard Analysis",
        pattern="^(Standard Analysis|Deep Analysis|Exhaustive)$"
    )


class Evidence(BaseModel):
    """Evidence snippet from a paper."""
    paper_id: str
    paper_title: str
    page_number: int | None = None
    section: str | None = None
    snippet: str
    relevance_score: float = Field(ge=0.0, le=1.0)


class RAGResponse(BaseModel):
    """Response from RAG query."""
    answer: str
    evidence: list[Evidence] = Field(default_factory=list)
    query: str
    reasoning_depth: str


class ChatMessage(BaseModel):
    """A single chat message."""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    """Request for chatbot endpoint."""
    messages: list[ChatMessage]
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)


class ChatResponse(BaseModel):
    """Response from chatbot endpoint."""
    message: ChatMessage
    usage: dict[str, Any] | None = None


class AIPreferences(BaseModel):
    """User's AI preferences."""
    user_id: str
    model: str = "meta/llama-3.2-3b-instruct"
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    reasoning_depth: str = Field(
        default="Standard Analysis",
        pattern="^(Standard Analysis|Deep Analysis|Exhaustive)$"
    )


class AIPreferencesResponse(BaseModel):
    """Response with saved AI preferences."""
    user_id: str
    model: str
    temperature: float
    reasoning_depth: str
    saved_at: str
