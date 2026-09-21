from __future__ import annotations

from pydantic import BaseModel, Field


NOT_AVAILABLE = "Not available in this paper."


class PaperGap(BaseModel):
    id: str
    title: str
    category: str
    description: str
    page: int | None = None
    source_section: str | None = None


class PaperSource(BaseModel):
    paper_id: str
    page: int
    section: str
    snippet: str


class AnalyzedField(BaseModel):
    content: str = NOT_AVAILABLE
    sources: list[PaperSource] = Field(default_factory=list)


class PaperAnalysis(BaseModel):
    abstract: AnalyzedField = Field(default_factory=AnalyzedField)
    problem_statement: AnalyzedField = Field(default_factory=AnalyzedField)
    objectives: AnalyzedField = Field(default_factory=AnalyzedField)
    methodology: AnalyzedField = Field(default_factory=AnalyzedField)
    experimental_setup: AnalyzedField = Field(default_factory=AnalyzedField)
    datasets: AnalyzedField = Field(default_factory=AnalyzedField)
    algorithms_models: AnalyzedField = Field(default_factory=AnalyzedField)
    major_findings: AnalyzedField = Field(default_factory=AnalyzedField)
    limitations: AnalyzedField = Field(default_factory=AnalyzedField)
    future_work: AnalyzedField = Field(default_factory=AnalyzedField)
    keywords: list[str] = Field(default_factory=list)
    research_gaps: list[PaperGap] = Field(default_factory=list)
