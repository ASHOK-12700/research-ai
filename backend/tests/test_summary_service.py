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


def test_ai_summary_service_uses_nvidia_model_and_base_url():
    service = AISummaryService()

    assert service.model == "meta/llama-3.2-3b-instruct"
    assert service.base_url == "https://integrate.api.nvidia.com/v1"


def test_summarize_paper_checks_nvidia_model_registry_and_completes(monkeypatch):
    service = AISummaryService(api_key="test-key")

    class DummyResponse:
        def __init__(self, status_code=200, payload=None, text=""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

    def fake_get(url, headers=None, timeout=None):
        assert url == "https://integrate.api.nvidia.com/v1/models"
        assert headers == {"Authorization": "Bearer test-key"}
        return DummyResponse(payload={"data": [{"id": "meta/llama-3.2-3b-instruct"}]})

    def fake_post(url, headers=None, json=None, timeout=None):
        assert url == "https://integrate.api.nvidia.com/v1/chat/completions"
        assert headers == {
            "Content-Type": "application/json",
            "Authorization": "Bearer test-key",
        }
        assert json["model"] == "meta/llama-3.2-3b-instruct"
        payload = {
            "choices": [{
                "message": {
                    "content": "```json\n{\n  \"paper_title\": \"Test Paper\",\n  \"authors\": [\"A. Author\"],\n  \"abstract_overview\": \"Summary\",\n  \"research_problem\": \"Problem\",\n  \"objectives\": \"Objectives\",\n  \"methodology\": \"Methods\",\n  \"dataset_data_used\": \"Dataset\",\n  \"proposed_approach_model\": \"Approach\",\n  \"key_results\": \"Results\",\n  \"evaluation_metrics\": \"Accuracy\",\n  \"main_contributions\": \"Contribution\",\n  \"limitations\": \"Not specified\",\n  \"future_work\": \"Not specified\",\n  \"key_takeaways\": \"Takeaways\"\n}\n```"
                }
            }]
        }
        return DummyResponse(payload=payload)

    monkeypatch.setattr("requests.get", fake_get)
    monkeypatch.setattr("requests.post", fake_post)

    summary = service.summarize_paper("Test Paper", ["A. Author"], "Long paper text..." * 5)

    assert summary.paper_title == "Test Paper"
    assert summary.authors == ["A. Author"]
    assert summary.key_takeaways == "Takeaways"


def test_summarize_paper_reports_missing_nvidia_model(monkeypatch):
    service = AISummaryService(api_key="test-key")

    class DummyResponse:
        def __init__(self, status_code=200, payload=None, text=""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

    def fake_get(url, headers=None, timeout=None):
        assert url == "https://integrate.api.nvidia.com/v1/models"
        assert headers == {"Authorization": "Bearer test-key"}
        return DummyResponse(payload={"data": [{"id": "other-model"}]})

    monkeypatch.setattr("requests.get", fake_get)

    with pytest.raises(AISummaryServiceError, match="meta/llama-3.2-3b-instruct"):
        service.summarize_paper("Test Paper", ["A. Author"], "Valid paper text.")


def test_summarize_paper_requires_nvidia_api_key():
    service = AISummaryService(api_key="")

    with pytest.raises(AISummaryServiceError, match="Missing NVIDIA_API_KEY"):
        service.summarize_paper("Test Paper", ["A. Author"], "Valid paper text.")


def test_summarize_paper_handles_nvidia_auth_failure(monkeypatch):
    service = AISummaryService(api_key="bad-key")

    class DummyResponse:
        def __init__(self, status_code=200, payload=None, text=""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

    def fake_get(url, headers=None, timeout=None):
        return DummyResponse(status_code=401, payload={"error": {"message": "Unauthorized"}})

    monkeypatch.setattr("requests.get", fake_get)

    with pytest.raises(AISummaryServiceError, match="authentication failed"):
        service.summarize_paper("Test Paper", ["A. Author"], "Valid paper text.")


def test_settings_include_supabase_variables():
    settings = Settings(
        SUPABASE_URL="https://example.supabase.co",
        SUPABASE_ANON_KEY="public-anon-key",
        SUPABASE_SERVICE_ROLE_KEY="service-role-key",
    )

    assert settings.SUPABASE_URL == "https://example.supabase.co"
    assert settings.SUPABASE_ANON_KEY == "public-anon-key"
    assert settings.SUPABASE_SERVICE_ROLE_KEY == "service-role-key"
