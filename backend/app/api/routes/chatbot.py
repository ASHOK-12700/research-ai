"""Routes for Chatbot (general-purpose AI assistant)."""

import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.api.routes.papers import get_authenticated_user_id
from app.schemas.rag import ChatRequest, ChatResponse
from app.services.chatbot_service import ChatbotServiceError, chatbot_service
from app.services.rag_service import RAGServiceError, rag_service


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("/message", response_model=None)
async def chat(request: Request, chat_data: ChatRequest):
    """
    Send a message to the general-purpose chatbot.
    
    Unlike Ask Your Papers (RAG), this chatbot does NOT query the user's papers.
    It's a general-purpose AI assistant for arbitrary questions.
    
    Authentication is optional for the chatbot (works for logged-in and anonymous users).
    """
    if chat_data.is_paper_query:
        if not chat_data.query or not chat_data.folder_id:
            raise HTTPException(status_code=422, detail="Select a folder before asking about papers.")
        try:
            user_id = get_authenticated_user_id(request.headers.get("Authorization"))
            return rag_service.query(
                query=chat_data.query,
                user_id=user_id,
                folder_id=chat_data.folder_id,
                temperature=chat_data.temperature,
            )
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
        except RAGServiceError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.user_message) from exc

    if not chat_data.messages:
        raise HTTPException(status_code=422, detail="No messages provided.")

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
