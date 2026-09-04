"""Routes for Ask Your Papers (RAG) endpoint."""

from fastapi import APIRouter, HTTPException, Request, status

from app.schemas.rag import RAGQuery, RAGResponse
from app.services.rag_service import RAGServiceError, rag_service


router = APIRouter(prefix="/ask", tags=["Ask Your Papers"])


def get_authenticated_user_id(authorization_header: str | None) -> str:
    """Extract and validate user ID from authorization header."""
    if not authorization_header:
        raise ValueError("Missing Authorization header")

    scheme, _, token = authorization_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise ValueError("Authorization header must be in the format: Bearer <token>")

    # Import here to avoid circular imports
    import requests
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.SUPABASE_URL:
        raise ValueError("Supabase URL is not configured")

    response = requests.get(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": settings.SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
        },
        timeout=15,
    )

    if response.status_code != 200:
        raise ValueError("Invalid or expired authentication token.")

    payload = response.json()
    user_id = payload.get("id")
    if not user_id:
        raise ValueError("Authenticated user ID could not be resolved.")
    return str(user_id)


@router.post("/query", response_model=RAGResponse)
async def query_papers(request: Request, query_data: RAGQuery) -> RAGResponse:
    """
    Query user's uploaded papers with AI-powered synthesis.
    
    Returns evidence-based answers with citations to source papers.
    """
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    try:
        response = rag_service.query(
            query=query_data.query,
            user_id=user_id,
            temperature=query_data.temperature,
            reasoning_depth=query_data.reasoning_depth,
        )
        return response
    except RAGServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.user_message,
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while querying papers.",
        ) from exc
