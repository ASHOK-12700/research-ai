"""Chatbot service for general-purpose AI conversations."""

from __future__ import annotations

import json
import logging

import requests

from app.core.config import get_settings
from app.services.ai_provider import ProviderCompletionError, complete_with_fallback, configured_providers
from app.schemas.rag import ChatMessage, ChatResponse


logger = logging.getLogger(__name__)


def _response_body(response: requests.Response) -> dict:
    if not hasattr(response, "iter_lines"):
        return response.json()

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

    return {"choices": [{"message": {"content": "".join(content)}}]}


class ChatbotServiceError(RuntimeError):
    def __init__(self, user_message: str, internal_message: str, status_code: int = 503):
        super().__init__(internal_message)
        self.user_message = user_message
        self.internal_message = internal_message
        self.status_code = status_code


class ChatbotService:
    """
    General-purpose chatbot service for arbitrary questions.
    Separate from RAG - this does NOT query papers.
    """
    
    def __init__(
        self,
        model: str | None = None,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout_seconds: int | None = None,
    ):
        settings = get_settings()
        self.model = model or settings.GROQ_MODEL
        self.base_url = (base_url or "").rstrip("/")
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds or 180

    def _build_system_prompt(self) -> str:
        """Build system prompt for ResearchAI Copilot."""
        return """You are ResearchAI Copilot, the official AI assistant for ResearchAI - an AI-powered research workspace.

# PRIMARY ROLE
You help users understand and use the ResearchAI application. You provide accurate, step-by-step guidance about ResearchAI features and workflows.

# RESEARCHAI CORE FEATURES
Understand these features:

1. **Authentication**
   - Email/password login
   - Google OAuth sign-in
   - Supabase-backed authentication

2. **Research Paper Management**
   - Upload PDF research papers
   - Automatic PDF text extraction
   - Paper metadata extraction (title, authors, etc.)
   - Paper library organization
   - Search across all uploaded papers

3. **AI-Generated Paper Summaries**
   - Generate structured AI summaries after uploading
   - Summaries include: problem statement, methodology, dataset, key results, limitations, future work
   - Summaries are cached for later review

4. **Ask Your Papers (RAG Feature)**
   - Query the user's paper library with natural language questions
   - Retrieves relevant sections from uploaded papers
   - Provides evidence/citations with page numbers
   - Shows exact snippets from papers
   - Different from Copilot - uses uploaded papers as knowledge source

5. **My Research Projects**
   - Create research projects
   - Organize papers into projects
   - Track project progress
   - Archive completed projects
   - Project filtering and search

6. **Global Search**
   - Search across papers and projects
   - Filter by title, topic, tags
   - Quick navigation

7. **AI Preferences**
   - Configure AI model selection
   - Adjust temperature (creativity level)
   - Set reasoning depth for analysis
   - Preferences persist across sessions

8. **Research Workspace**
   - Dashboard showing recent activity
   - All features accessible from main navigation
   - Sidebar with quick access to main sections

# HOW TO DISTINGUISH COPILOT FROM ASK YOUR PAPERS
When users ask about AI help:
- **ResearchAI Copilot (Me)**: Helps understand the app, provides instructions, answers general questions
- **Ask Your Papers**: Uses uploaded papers as the knowledge source, provides research-specific answers with citations

# GUIDELINES FOR RESPONSES

1. **About ResearchAI Features**: Explain clearly and accurately
   - Only mention features that exist in the application
   - Provide step-by-step workflows
   - Reference actual UI elements

2. **Step-by-Step Instructions**: For user workflows (uploading, searching, etc.):
   - Start with the initial action
   - List each step clearly
   - Mention what happens after each step
   - End with the expected result

3. **General Questions**: If users ask about concepts ("What is RAG?", "Explain machine learning"), answer normally
   - But prioritize ResearchAI context if relevant

4. **Unknown Features**: If you're unsure about a ResearchAI capability:
   - Say: "I'm not certain that feature is available in the current version of ResearchAI."
   - Do NOT invent features
   - Do NOT hallucinate workflows

5. **Accuracy**: Be precise about what ResearchAI actually does
   - Do not exaggerate capabilities
   - Reference actual components/pages
   - Acknowledge limitations

# COMMON WORKFLOWS TO EXPLAIN

**Getting Started**:
1. Sign in with email/password or Google
2. Upload a PDF research paper
3. Wait for text extraction (automatic)
4. View extracted content and paper metadata
5. Generate an AI summary (if available)
6. Explore features like Ask Your Papers

**Asking Questions About Papers**:
1. Go to Ask Your Papers
2. Enter your question naturally
3. The system retrieves relevant paper sections
4. Review the synthesized answer
5. Check evidence cards with page references
6. Click evidence to see the full context

**Creating a Research Project**:
1. Navigate to My Research
2. Click "Create Research Project"
3. Enter project title, topic, description
4. Organize papers into the project
5. Track progress through the workspace

Be helpful, accurate, and professional. If users need general technical help not about ResearchAI, you can assist. But prioritize ResearchAI guidance."""

    def chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
    ) -> ChatResponse:
        """Send chat messages and get response."""
        
        if not messages:
            raise ChatbotServiceError(
                user_message="No messages provided.",
                internal_message="Empty message list in chatbot request.",
                status_code=422,
            )

        if not configured_providers(get_settings()):
            raise ChatbotServiceError(
                user_message="The chatbot is not configured. Please contact the administrator.",
                internal_message="No AI provider API key and model are configured.",
                status_code=503,
            )

        # Convert to API format
        api_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
        
        # Ensure we have system message
        if not api_messages or api_messages[0].get("role") != "system":
            api_messages.insert(0, {
                "role": "system",
                "content": self._build_system_prompt()
            })

        payload = {
            "messages": api_messages,
            "temperature": temperature,
            "max_tokens": 256,
            "stream": True,
            "reasoning_effort": "low",
            "chat_template_kwargs": {"clear_thinking": True},
        }

        try:
            result = complete_with_fallback(payload, timeout_seconds=self.timeout_seconds)
        except ProviderCompletionError as exc:
            raise ChatbotServiceError(
                user_message="The chatbot service is unavailable. Please try again later.",
                internal_message=str(exc),
                status_code=503,
            ) from exc

        return ChatResponse(
            message=ChatMessage(role="assistant", content=result.content),
            usage=result.usage,
        )


# Global instance
chatbot_service = ChatbotService()
