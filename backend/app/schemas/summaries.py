import re

from pydantic import BaseModel, Field, field_validator


class StructuredPaperSummary(BaseModel):
    paper_title: str = "Not specified"
    authors: list[str] = Field(default_factory=lambda: ["Not specified"])
    abstract_overview: str = "Not specified"
    research_problem: str = "Not specified"
    objectives: str = "Not specified"
    methodology: str = "Not specified"
    dataset_data_used: str = "Not specified"
    proposed_approach_model: str = "Not specified"
    key_results: str = "Not specified"
    evaluation_metrics: str = "Not specified"
    main_contributions: str = "Not specified"
    limitations: str = "Not specified"
    future_work: str = "Not specified"
    key_takeaways: str = "Not specified"

    @staticmethod
    def _clean_text(value: str | None) -> str:
        if value is None:
            return "Not specified"
        cleaned = value.strip()
        return cleaned or "Not specified"

    @staticmethod
    def _normalize_authors(value: list[str] | str | None) -> list[str]:
        if value is None:
            return ["Not specified"]
        if isinstance(value, str):
            items = [item.strip() for item in re.split(r",|;|\n|\band\b", value, flags=re.IGNORECASE) if item.strip()]
            return items or ["Not specified"]
        if isinstance(value, list):
            cleaned = [str(item).strip() for item in value if str(item).strip()]
            return cleaned or ["Not specified"]
        return ["Not specified"]

    @field_validator(
        "paper_title",
        "abstract_overview",
        "research_problem",
        "objectives",
        "methodology",
        "dataset_data_used",
        "proposed_approach_model",
        "key_results",
        "evaluation_metrics",
        "main_contributions",
        "limitations",
        "future_work",
        "key_takeaways",
        mode="before",
    )
    @classmethod
    def _validate_text_field(cls, value: str | None) -> str:
        return cls._clean_text(value)

    @field_validator("authors", mode="before")
    @classmethod
    def _validate_authors(cls, value: list[str] | str | None) -> list[str]:
        return cls._normalize_authors(value)
