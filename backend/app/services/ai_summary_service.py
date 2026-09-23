from __future__ import annotations

import json
import re
from typing import Any

import requests

from app.core.config import get_settings
from app.schemas.summaries import StructuredPaperSummary
from app.services.ai_provider import ProviderCompletionError, complete_with_fallback, configured_providers

MAX_TEXT_LENGTH = 120000
DEFAULT_PROVIDER_TIMEOUT_SECONDS = 180


class AISummaryServiceError(RuntimeError):
    def __init__(self, user_message: str, internal_message: str, status_code: int = 503):
        super().__init__(internal_message)
        self.user_message = user_message
        self.internal_message = internal_message
        self.status_code = status_code


def _streamed_content(response: requests.Response) -> str:
    content = []
    for line in response.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            break
        try:
            chunk = json.loads(data)
        except json.JSONDecodeError:
            continue
        delta = ((chunk.get("choices") or [{}])[0].get("delta") or {}).get("content")
        if isinstance(delta, str):
            content.append(delta)
    return "".join(content)


def _prepare_summary_text(full_text: str, max_chars: int = MAX_TEXT_LENGTH) -> str:
    text = re.sub(r"\s+", " ", full_text or "").strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars]


def extract_summary_payload(raw_response: str) -> dict[str, Any]:
    cleaned = raw_response.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL | re.IGNORECASE)
    if match:
        cleaned = match.group(1)

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.IGNORECASE)

    if cleaned.startswith("{") and cleaned.endswith("}"):
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data

    raise ValueError("AI response was not valid JSON")


class AISummaryService:
    def __init__(self, model: str | None = None, base_url: str | None = None, api_key: str | None = None, timeout_seconds: int | None = None):
        settings = get_settings()
        self.model = model if model is not None else settings.GROQ_MODEL
        self.base_url = (base_url or "").rstrip("/")
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds if timeout_seconds is not None else DEFAULT_PROVIDER_TIMEOUT_SECONDS

    def is_configured(self) -> bool:
        return bool(configured_providers(get_settings()))

    def _extract_error_detail(self, response: requests.Response) -> str:
        try:
            body = response.json()
        except ValueError:
            body = None

        if isinstance(body, dict):
            error = body.get("error")
            if isinstance(error, dict):
                message = error.get("message")
                if message:
                    return str(message)
            if body.get("message"):
                return str(body["message"])
        text = (response.text or "").strip()
        if text:
            return text[:600]
        return f"HTTP {response.status_code}"

    def build_prompt(self, paper_title: str, authors: list[str], text: str) -> str:
        author_text = ", ".join(authors) if authors else "Not specified"
        truncated = _prepare_summary_text(text)
        json_schema = '''{
  "paper_title": "<paper title or 'Not specified'>",
  "authors": ["<author names or 'Not specified'>"],
  "abstract_overview": "<summary of the paper's purpose and scope>",
  "research_problem": "<problem addressed>",
  "objectives": "<goals or questions>",
  "methodology": "<methods and setup>",
  "dataset_data_used": "<datasets, benchmarks, or data sources>",
  "proposed_approach_model": "<proposed method or model>",
  "key_results": "<main findings>",
  "evaluation_metrics": "<metrics if reported>",
  "main_contributions": "<main contributions>",
  "limitations": "<limitations or weaknesses>",
  "future_work": "<future directions>",
  "key_takeaways": "<most important takeaways>"
}'''
        return f"""
You are summarizing a research paper from its extracted text.

Write a JSON object only. No markdown fences. No prose before or after.

Paper title: {paper_title}
Authors: {author_text}

Instruction requirements:
- Summarize only information supported by the paper.
- Never invent missing authors, datasets, results, metrics, or claims.
- If information is not available in the paper, return the exact string "Not specified".
- Preserve technical terminology.
- Distinguish reported results from interpretation.
- Keep the result concise but research-oriented.

Required JSON keys and semantics:
{json_schema}

Extracted paper text:
{truncated}
"""

    def summarize_paper(self, paper_title: str, authors: list[str], text: str) -> StructuredPaperSummary:
        if not text or not text.strip():
            raise AISummaryServiceError(
                user_message="The paper content is empty. Re-upload the PDF and try again.",
                internal_message="Paper text is empty or unavailable for summarization.",
                status_code=422,
            )

        prompt = self.build_prompt(paper_title, authors, text)
        payload = {
            "messages": [
                {"role": "system", "content": "You produce structured JSON summaries for research papers based strictly on the provided text."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 700,
            "stream": True,
            "reasoning_effort": "low",
            "chat_template_kwargs": {"clear_thinking": True},
        }

        try:
            result = complete_with_fallback(payload, timeout_seconds=self.timeout_seconds)
        except ProviderCompletionError as exc:
            raise AISummaryServiceError(
                user_message="The AI service is currently unavailable. Please try again later.",
                internal_message=str(exc),
                status_code=503,
            ) from exc
        content = result.content

        try:
            payload_dict = extract_summary_payload(content)
        except ValueError as exc:
            raise AISummaryServiceError(
                user_message="The AI response could not be parsed into a structured summary.",
                internal_message=f"Malformed AI response payload: {exc}",
                status_code=502,
            ) from exc

        return StructuredPaperSummary.model_validate(payload_dict)


ai_summary_service = AISummaryService()
