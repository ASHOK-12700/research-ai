import json

import pytest

from app.core.config import Settings
from app.schemas.summaries import StructuredPaperSummary
from app.services.ai_summary_service import AISummaryService, AISummaryServiceError, extract_summary_payload


def test_extract_summary_payload_parses_json_from_markdown():
    raw = '''```json
{
  "paper_title": "Test Paper",
  "authors": ["A. Author"],
  "abstract_overview": "Summary detail.",
  "research_problem": "Problem statement.",
  "objectives": "Objectives.",
  "methodology": "Method.",
  "dataset_data_used": "Dataset.",
  "proposed_approach_model": "Approach.",
  "key_results": "Results.",
  "evaluation_metrics": "Accuracy.",
  "main_contributions": "Contribution.",
  "limitations": "Not specified",
  "future_work": "Not specified",
  "key_takeaways": "Takeaways."
}
```'''

    payload = extract_summary_payload(raw)
    summary = StructuredPaperSummary.model_validate(payload)

    assert summary.paper_title == "Test Paper"
    assert summary.authors == ["A. Author"]
    assert summary.limitations == "Not specified"
    assert summary.key_takeaways == "Takeaways."


def test_structured_summary_defaults_missing_values_to_not_specified():
    payload = {
        "paper_title": "Example",
        "authors": [],
        "abstract_overview": "",
        "research_problem": "",
        "objectives": "",
        "methodology": "",
        "dataset_data_used": "",
        "proposed_approach_model": "",
        "key_results": "",
        "evaluation_metrics": "",
        "main_contributions": "",
        "limitations": "",
        "future_work": "",
        "key_takeaways": ""
    }

    summary = StructuredPaperSummary.model_validate(payload)

    assert summary.authors == ["Not specified"]
    assert summary.abstract_overview == "Not specified"
    assert summary.future_work == "Not specified"


def test_ai_summary_service_uses_primary_provider_model():
    service = AISummaryService()
    settings = __import__('app.core.config', fromlist=['get_settings']).get_settings()

    assert service.model == settings.GROQ_MODEL
    assert service.base_url == ""


def test_summarize_paper_uses_primary_provider_and_completes(monkeypatch):
    service = AISummaryService()
    settings = __import__('app.core.config', fromlist=['get_settings']).get_settings()
    model = settings.GROQ_MODEL

    class DummyResponse:
        def __init__(self, status_code=200, payload=None, text=""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

        def iter_lines(self, decode_unicode=True):
            content = self._payload["choices"][0]["message"]["content"]
            yield f'data: {json.dumps({"choices": [{"delta": {"content": content}}]})}'
            yield "data: [DONE]"

    def fake_post(url, headers=None, json=None, timeout=None, stream=None):
        assert url == "https://api.groq.com/openai/v1/chat/completions"
        assert headers == {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        }
        assert json["model"] == model
        payload = {
            "choices": [{
                "message": {
                    "content": "```json\n{\n  \"paper_title\": \"Test Paper\",\n  \"authors\": [\"A. Author\"],\n  \"abstract_overview\": \"Summary\",\n  \"research_problem\": \"Problem\",\n  \"objectives\": \"Objectives\",\n  \"methodology\": \"Methods\",\n  \"dataset_data_used\": \"Dataset\",\n  \"proposed_approach_model\": \"Approach\",\n  \"key_results\": \"Results\",\n  \"evaluation_metrics\": \"Accuracy\",\n  \"main_contributions\": \"Contribution\",\n  \"limitations\": \"Not specified\",\n  \"future_work\": \"Not specified\",\n  \"key_takeaways\": \"Takeaways\"\n}\n```"
                }
            }]
        }
        return DummyResponse(payload=payload)

    monkeypatch.setattr("requests.post", fake_post)

    summary = service.summarize_paper("Test Paper", ["A. Author"], "Long paper text..." * 5)

    assert summary.paper_title == "Test Paper"
    assert summary.authors == ["A. Author"]
    assert summary.key_takeaways == "Takeaways"


def test_summarize_paper_requires_configured_provider(monkeypatch):
    monkeypatch.setattr(
        "app.core.config.get_settings",
        lambda: Settings(
            GROQ_MODEL="",
            OPENROUTER_MODEL="",
            MISTRAL_MODEL="",
            SUPABASE_URL="https://example.supabase.co",
            SUPABASE_ANON_KEY="public-anon-key",
            SUPABASE_SERVICE_ROLE_KEY="service-role-key",
        ),
    )
    service = AISummaryService()

    with pytest.raises(AISummaryServiceError, match="No AI provider"):
        service.summarize_paper("Test Paper", ["A. Author"], "Valid paper text.")


def test_summarize_paper_falls_back_after_provider_auth_failure(monkeypatch):
    service = AISummaryService()
    settings = __import__('app.core.config', fromlist=['get_settings']).get_settings()
    calls = []

    class DummyResponse:
        def __init__(self, status_code=200, payload=None, text=""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

        def iter_lines(self, decode_unicode=True):
            content = self._payload["choices"][0]["message"]["content"]
            yield f'data: {json.dumps({"choices": [{"delta": {"content": content}}]})}'
            yield "data: [DONE]"

    def fake_post(url, headers=None, json=None, timeout=None, stream=None):
        calls.append(url)
        if "groq.com" in url:
            return DummyResponse(status_code=401, payload={"error": {"message": "Unauthorized"}})
        return DummyResponse(
            payload={
                "choices": [{
                    "message": {
                        "content": "```json\n{\n  \"paper_title\": \"Test Paper\",\n  \"authors\": [\"A. Author\"],\n  \"abstract_overview\": \"Summary\",\n  \"research_problem\": \"Problem\",\n  \"objectives\": \"Objectives\",\n  \"methodology\": \"Methods\",\n  \"dataset_data_used\": \"Dataset\",\n  \"proposed_approach_model\": \"Approach\",\n  \"key_results\": \"Results\",\n  \"evaluation_metrics\": \"Accuracy\",\n  \"main_contributions\": \"Contribution\",\n  \"limitations\": \"Not specified\",\n  \"future_work\": \"Not specified\",\n  \"key_takeaways\": \"Takeaways\"\n}\n```"
                    }
                }]
            }
        )

    monkeypatch.setattr("requests.post", fake_post)

    summary = service.summarize_paper("Test Paper", ["A. Author"], "Valid paper text.")

    assert summary.paper_title == "Test Paper"
    assert calls == [
        "https://api.groq.com/openai/v1/chat/completions",
        "https://openrouter.ai/api/v1/chat/completions",
    ]


def test_settings_include_supabase_variables():
    settings = Settings(
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_ANON_KEY="public-anon-key",
        SUPABASE_SERVICE_ROLE_KEY="service-role-key",
    )

    assert settings.SUPABASE_URL == "https://example.supabase.co"
    assert settings.SUPABASE_ANON_KEY == "public-anon-key"
    assert settings.SUPABASE_SERVICE_ROLE_KEY == "service-role-key"
