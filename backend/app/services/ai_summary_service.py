from __future__ import annotations

import json
import re
from typing import Any

import requests

from app.core.config import get_settings
from app.schemas.summaries import StructuredPaperSummary

MAX_TEXT_LENGTH = 12000
DEFAULT_NVIDIA_MODEL = "meta/llama-3.2-3b-instruct"
DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"
DEFAULT_NVIDIA_TIMEOUT_SECONDS = 180


class AISummaryServiceError(RuntimeError):
    def __init__(self, user_message: str, internal_message: str, status_code: int = 503):
        super().__init__(internal_message)
        self.user_message = user_message
        self.internal_message = internal_message
        self.status_code = status_code


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
        self.model = model if model is not None else (settings.AI_MODEL or DEFAULT_NVIDIA_MODEL)
        configured_base_url = base_url if base_url is not None else (settings.NVIDIA_BASE_URL or DEFAULT_NVIDIA_BASE_URL)
        self.base_url = configured_base_url.rstrip("/")
        self.api_key = api_key if api_key is not None else settings.NVIDIA_API_KEY
        self.timeout_seconds = timeout_seconds if timeout_seconds is not None else DEFAULT_NVIDIA_TIMEOUT_SECONDS

    def is_configured(self) -> bool:
        return bool(self.model) and bool(self.base_url)

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

    def verify_model_available(self) -> str:
        if not self.api_key:
            raise AISummaryServiceError(
                user_message="AI summary is unavailable because backend configuration is incomplete.",
                internal_message="Missing NVIDIA_API_KEY in backend environment.",
                status_code=500,
            )

        model_check_url = f"{self.base_url}/models"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            response = requests.get(model_check_url, headers=headers, timeout=self.timeout_seconds)
        except requests.Timeout as exc:
            raise AISummaryServiceError(
                user_message="The AI service timed out while checking model availability. Please try again.",
                internal_message=f"NVIDIA model registry request timed out at {model_check_url}: {exc}",
                status_code=504,
            ) from exc
        except requests.RequestException as exc:
            raise AISummaryServiceError(
                user_message="The AI service is currently unavailable. Please try again later.",
                internal_message=f"Unable to reach NVIDIA model registry at {model_check_url}: {exc}",
                status_code=503,
            ) from exc

        if response.status_code == 401:
            raise AISummaryServiceError(
                user_message="AI summary is unavailable due to an authentication issue.",
                internal_message="NVIDIA authentication failed while listing models (401).",
                status_code=502,
            )

        if response.status_code == 429:
            raise AISummaryServiceError(
                user_message="AI summary is temporarily rate limited. Please retry shortly.",
                internal_message="NVIDIA rate limit hit while listing models (429).",
                status_code=503,
            )

        if response.status_code >= 500:
            raise AISummaryServiceError(
                user_message="The AI service is currently unavailable. Please try again later.",
                internal_message=f"NVIDIA model registry unavailable ({response.status_code}).",
                status_code=503,
            )

        if response.status_code >= 400:
            detail = self._extract_error_detail(response)
            raise AISummaryServiceError(
                user_message="Unable to validate the configured AI model.",
                internal_message=f"NVIDIA model registry request failed ({response.status_code}): {detail}",
                status_code=502,
            )

        try:
            body = response.json()
        except ValueError as exc:
            raise AISummaryServiceError(
                user_message="The AI service returned an unexpected response.",
                internal_message=f"NVIDIA model registry returned invalid JSON: {response.text[:300]}",
                status_code=502,
            ) from exc

        available_models = [
            str(item.get("id"))
            for item in (body.get("data") or [])
            if isinstance(item, dict) and item.get("id")
        ]

        if not available_models:
            raise AISummaryServiceError(
                user_message="No AI model is currently available for summarization.",
                internal_message="NVIDIA model registry returned no models.",
                status_code=503,
            )

        if self.model not in available_models:
            raise AISummaryServiceError(
                user_message="The configured AI model is invalid or unavailable.",
                internal_message=(
                    f"Configured model '{self.model}' is unavailable in NVIDIA NIM. "
                    f"Available models: {', '.join(available_models)}"
                ),
                status_code=502,
            )

        return self.model

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

        self.verify_model_available()

        prompt = self.build_prompt(paper_title, authors, text)
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You produce structured JSON summaries for research papers based strictly on the provided text."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 700,
        }

        headers = {"Content-Type": "application/json"}
        headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=self.timeout_seconds,
            )
        except requests.Timeout as exc:
            raise AISummaryServiceError(
                user_message="The AI service timed out while generating the summary. Please retry.",
                internal_message=f"NVIDIA chat completion timed out: {exc}",
                status_code=504,
            ) from exc
        except requests.RequestException as exc:
            raise AISummaryServiceError(
                user_message="The AI service is currently unavailable. Please try again later.",
                internal_message=f"NVIDIA chat completion request failed: {exc}",
                status_code=503,
            ) from exc

        if response.status_code == 401:
            raise AISummaryServiceError(
                user_message="AI summary is unavailable due to an authentication issue.",
                internal_message="NVIDIA authentication failed during chat completion (401).",
                status_code=502,
            )

        if response.status_code == 429:
            raise AISummaryServiceError(
                user_message="AI summary is temporarily rate limited. Please retry shortly.",
                internal_message="NVIDIA rate limit hit during chat completion (429).",
                status_code=503,
            )

        if response.status_code >= 500:
            raise AISummaryServiceError(
                user_message="The AI service is currently unavailable. Please try again later.",
                internal_message=f"NVIDIA service unavailable during chat completion ({response.status_code}).",
                status_code=503,
            )

        if response.status_code >= 400:
            detail = self._extract_error_detail(response)
            raise AISummaryServiceError(
                user_message="The AI service rejected the summary request.",
                internal_message=f"NVIDIA chat completion failed ({response.status_code}): {detail}",
                status_code=502,
            )

        try:
            body = response.json()
        except ValueError as exc:
            raise AISummaryServiceError(
                user_message="The AI service returned an unexpected response.",
                internal_message=f"NVIDIA chat completion returned invalid JSON: {response.text[:300]}",
                status_code=502,
            ) from exc

        choices = body.get("choices") or []
        if not choices:
            raise AISummaryServiceError(
                user_message="The AI service returned no summary output.",
                internal_message="NVIDIA chat completion returned no response choices.",
                status_code=502,
            )

        content = choices[0].get("message", {}).get("content")
        if not content:
            raise AISummaryServiceError(
                user_message="The AI service returned an empty summary.",
                internal_message="NVIDIA chat completion returned empty message content.",
                status_code=502,
            )

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
