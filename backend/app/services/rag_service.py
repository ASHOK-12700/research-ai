"""RAG service for querying papers with AI synthesis."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import requests

from app.core.config import get_settings
from app.schemas.rag import Evidence, RAGResponse
from app.services.ai_provider import ProviderCompletionError, complete_with_fallback, configured_providers
from app.services.folder_repository import folder_repository
from app.services.paper_repository import paper_repository


logger = logging.getLogger(__name__)


def _response_content(response: requests.Response) -> str:
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


class RAGServiceError(RuntimeError):
    def __init__(self, user_message: str, internal_message: str, status_code: int = 503):
        super().__init__(internal_message)
        self.user_message = user_message
        self.internal_message = internal_message
        self.status_code = status_code


class SimpleRAGService:
    """
    Simple RAG service that retrieves relevant paper sections and uses LLM for synthesis.
    
    For now, uses simple text matching for retrieval. In production, would use embeddings.
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

    def _retrieve_relevant_sections(
        self, query: str, user_id: str, top_k: int = 5, folder_id: str | None = None
    ) -> list[tuple[str, str, str, int]]:
        """
        Retrieve relevant paper sections using simple text matching.
        
        Returns: list of (paper_id, paper_title, section_content, page_number) tuples
        """
        papers = (
            paper_repository.list_in_folder(folder_id, user_id)
            if folder_id
            else paper_repository.list(user_id=user_id)
        )
        if not papers:
            return []

        # Normalize query for matching
        query_terms = set(query.lower().split())
        relevant = []

        for paper in papers:
            # Search in title and sections
            sections = paper.sections or [
                type("PaperText", (), {"title": "Full text", "content": paper.full_text, "page_start": None})()
            ]
            for section in sections:
                if not section.content:
                    continue
                section_text = f"{section.title} {section.content}".lower()
                # Simple term matching - count how many query terms appear
                matches = sum(1 for term in query_terms if term in section_text)
                
                if matches > 0:
                    relevant.append({
                        "paper_id": paper.id,
                        "paper_title": paper.title,
                        "section_title": section.title,
                        "content": section.content,
                        "page_number": section.page_start if hasattr(section, 'page_start') else None,
                        "score": matches / len(query_terms) if query_terms else 0,
                    })

        # Sort by relevance score and return top_k
        relevant.sort(key=lambda x: x["score"], reverse=True)
        return relevant[:top_k]

    def _build_rag_prompt(
        self,
        query: str,
        retrieved_sections: list[dict[str, Any]],
        reasoning_depth: str = "Standard Analysis",
    ) -> str:
        """Build prompt for RAG synthesis."""
        
        context = "\n\n".join([
            f"Paper: {s['paper_title']} (Section: {s['section_title']})\n{s['content']}"
            for s in retrieved_sections
        ])

        depth_instructions = {
            "Standard Analysis": "Provide a concise, direct answer based on the evidence.",
            "Deep Analysis": "Provide a detailed answer with full explanation of methodologies, equations, and technical details.",
            "Exhaustive": "Provide a comprehensive synthesis across all available evidence, including methodological variations, competing approaches, and nuanced findings.",
        }

        depth_instruction = depth_instructions.get(reasoning_depth, depth_instructions["Standard Analysis"])

        return f"""You are an AI research assistant helping a researcher analyze their paper collection.

User Question: {query}

Available Evidence from Papers:
{context}

Instructions:
1. Answer the user's question based ONLY on the provided evidence.
2. If evidence is insufficient, clearly state "I don't have enough evidence in your papers to fully answer this question."
3. Cite the paper title and section for each piece of evidence.
4. {depth_instruction}
5. Be precise and academic in tone.
6. Do not make up or assume information not in the papers.

Provide a well-structured answer with clear citations."""

    def query(
        self,
        query: str,
        user_id: str,
        temperature: float = 0.2,
        reasoning_depth: str = "Standard Analysis",
        folder_id: str | None = None,
    ) -> RAGResponse:
        """Execute RAG query over user's papers."""
        
        if not query or not query.strip():
            raise RAGServiceError(
                user_message="Query cannot be empty.",
                internal_message="Empty query provided to RAG.",
                status_code=422,
            )

        if folder_id:
            folder = folder_repository.get(user_id, folder_id)
            if folder is None:
                raise RAGServiceError(
                    user_message="The selected folder was not found.",
                    internal_message=f"Folder {folder_id} is not owned by user {user_id}.",
                    status_code=404,
                )
            if not folder.get("paper_ids"):
                return RAGResponse(
                    answer="The selected folder has no papers to search.",
                    evidence=[],
                    query=query,
                    reasoning_depth=reasoning_depth,
                )

        # Retrieve relevant sections
        retrieved = self._retrieve_relevant_sections(query, user_id, top_k=5, folder_id=folder_id)
        
        if not retrieved:
            return RAGResponse(
                answer="I couldn't find enough evidence in your uploaded papers to answer this question. Try uploading more papers or asking about different topics.",
                evidence=[],
                query=query,
                reasoning_depth=reasoning_depth,
            )

        # Build prompt and call LLM
        prompt = self._build_rag_prompt(query, retrieved, reasoning_depth)
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI research assistant. Answer based only on the provided evidence from research papers."
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": 800,
            "stream": True,
            "reasoning_effort": "low",
            "chat_template_kwargs": {"clear_thinking": True},
        }

        if not configured_providers(get_settings()):
            raise RAGServiceError(
                user_message="The AI service is not configured. Please contact the administrator.",
                internal_message="No AI provider API key and model are configured.",
                status_code=503,
            )

        try:
            result = complete_with_fallback(payload, timeout_seconds=self.timeout_seconds)
        except ProviderCompletionError as exc:
            raise RAGServiceError(
                user_message="The AI service is unavailable. Please try again later.",
                internal_message=str(exc),
                status_code=503,
            ) from exc
        answer = result.content

        # Build evidence list
        evidence = [
            Evidence(
                paper_id=s["paper_id"],
                paper_title=s["paper_title"],
                page_number=s.get("page_number"),
                section=s.get("section_title"),
                snippet=s["content"][:300],  # Truncate snippet
                relevance_score=min(s["score"], 1.0),
            )
            for s in retrieved
        ]

        return RAGResponse(
            answer=answer,
            evidence=evidence,
            query=query,
            reasoning_depth=reasoning_depth,
        )


# Global instance
rag_service = SimpleRAGService()
