"""Routes for Chatbot (general-purpose AI assistant)."""

import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.rag import ChatRequest, ChatResponse
from app.services.chatbot_service import ChatbotServiceError, chatbot_service


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("/message", response_model=ChatResponse)
async def chat(chat_data: ChatRequest) -> ChatResponse:
    """
    Send a message to the general-purpose chatbot.
    
    Unlike Ask Your Papers (RAG), this chatbot does NOT query the user's papers.
    It's a general-purpose AI assistant for arbitrary questions.
    
    Authentication is optional for the chatbot (works for logged-in and anonymous users).
    """
    try:
        response = chatbot_service.chat(
            messages=chat_data.messages,
            temperature=chat_data.temperature,
        )
        return response
    except ChatbotServiceError as exc:
        logger.error("Chatbot request failed: %s", exc.internal_message)
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.user_message,
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected chatbot request failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing your message.",
        ) from exc
