from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import requests

from app.core.config import Settings

DEFAULT_PROVIDER_TIMEOUT_SECONDS = 60


@dataclass(frozen=True)
class ProviderConfig:
    name: str
    base_url: str
    api_key: str
    model: str


@dataclass(frozen=True)
class CompletionResult:
    content: str
    usage: dict[str, Any] | None = None
    provider: str = ""


class ProviderCompletionError(RuntimeError):
    pass


def configured_providers(settings: Settings) -> list[ProviderConfig]:
    candidates = (
        ("Groq", "https://api.groq.com/openai/v1", settings.GROQ_API_KEY, settings.GROQ_MODEL),
        (
            "OpenRouter",
            "https://openrouter.ai/api/v1",
            settings.OPENROUTER_API_KEY,
            settings.OPENROUTER_MODEL,
        ),
        ("Mistral", "https://api.mistral.ai/v1", settings.MISTRAL_API_KEY, settings.MISTRAL_MODEL),
    )
    return [
        ProviderConfig(name, base_url, api_key, model)
        for name, base_url, api_key, model in candidates
        if api_key and model
    ]


def _stream_content(response: requests.Response) -> str:
    content: list[str] = []
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


def complete_with_fallback(
    payload: dict[str, Any],
    timeout_seconds: int = DEFAULT_PROVIDER_TIMEOUT_SECONDS,
) -> CompletionResult:
    settings = __import__("app.core.config", fromlist=["get_settings"]).get_settings()
    providers = configured_providers(settings)
    if not providers:
        raise ProviderCompletionError("No AI provider API key and model are configured.")

    failures: list[str] = []
    for provider in providers:
        provider_payload = {**payload, "model": provider.model}
        if provider.name == "Groq":
            provider_payload.pop("chat_template_kwargs", None)
        try:
            response = requests.post(
                f"{provider.base_url}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {provider.api_key}",
                },
                json=provider_payload,
                timeout=timeout_seconds,
                stream=True,
            )
            if response.status_code >= 400:
                failures.append(f"{provider.name} returned HTTP {response.status_code}")
                continue

            content = _stream_content(response).strip()
            if not content:
                failures.append(f"{provider.name} returned no content")
                continue

            return CompletionResult(content=content, provider=provider.name)
        except requests.RequestException as exc:
            failures.append(f"{provider.name} request failed: {exc}")

    raise ProviderCompletionError("; ".join(failures))
