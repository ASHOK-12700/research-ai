"""RAG service for querying papers with AI synthesis."""

from __future__ import annotations

import re
from typing import Any

import requests

from app.core.config import get_settings
from app.schemas.rag import Evidence, RAGResponse
from app.services.paper_repository import paper_repository


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
        self.model = model or (settings.AI_MODEL or "meta/llama-3.2-3b-instruct")
        self.base_url = (base_url or (settings.NVIDIA_BASE_URL or "https://integrate.api.nvidia.com/v1")).rstrip("/")
        self.api_key = api_key or settings.NVIDIA_API_KEY
        self.timeout_seconds = timeout_seconds or 180

    def _retrieve_relevant_sections(
        self, query: str, user_id: str, top_k: int = 5
    ) -> list[tuple[str, str, str, int]]:
        """
        Retrieve relevant paper sections using simple text matching.
        
        Returns: list of (paper_id, paper_title, section_content, page_number) tuples
        """
        papers = paper_repository.list(user_id=user_id)
        if not papers:
            return []

        # Normalize query for matching
        query_terms = set(query.lower().split())
        relevant = []

        for paper in papers:
            # Search in title and sections
            for section in paper.sections:
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
    ) -> RAGResponse:
        """Execute RAG query over user's papers."""
        
        if not query or not query.strip():
            raise RAGServiceError(
                user_message="Query cannot be empty.",
                internal_message="Empty query provided to RAG.",
                status_code=422,
            )

        # Retrieve relevant sections
        retrieved = self._retrieve_relevant_sections(query, user_id, top_k=5)
        
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
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI research assistant. Answer based only on the provided evidence from research papers."
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": 800,
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=self.timeout_seconds,
            )
        except requests.Timeout as exc:
            raise RAGServiceError(
                user_message="The AI service timed out. Please try again.",
                internal_message=f"RAG LLM timed out: {exc}",
                status_code=504,
            ) from exc
        except requests.RequestException as exc:
            raise RAGServiceError(
                user_message="The AI service is unavailable. Please try again later.",
                internal_message=f"RAG LLM request failed: {exc}",
                status_code=503,
            ) from exc

        if response.status_code >= 400:
            raise RAGServiceError(
                user_message="The AI service failed to generate an answer.",
                internal_message=f"RAG LLM returned {response.status_code}: {response.text[:300]}",
                status_code=response.status_code,
            )

        try:
            body = response.json()
            choices = body.get("choices") or []
            if not choices:
                raise RAGServiceError(
                    user_message="The AI service returned no answer.",
                    internal_message="No response choices from RAG LLM.",
                    status_code=502,
                )
            
            answer = choices[0].get("message", {}).get("content", "").strip()
            if not answer:
                raise RAGServiceError(
                    user_message="The AI service returned an empty answer.",
                    internal_message="Empty content from RAG LLM response.",
                    status_code=502,
                )

        except (ValueError, KeyError) as exc:
            raise RAGServiceError(
                user_message="The AI service returned an invalid response.",
                internal_message=f"Failed to parse RAG LLM response: {exc}",
                status_code=502,
            ) from exc

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
