"""Routes for AI Preferences (user settings)."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import get_settings
from app.schemas.rag import AIPreferences, AIPreferencesResponse
from app.services.supabase_service import supabase_service


router = APIRouter(prefix="/preferences", tags=["AI Preferences"])


def get_authenticated_user_id(authorization_header: str | None) -> str:
    """Extract and validate user ID from authorization header."""
    if not authorization_header:
        raise ValueError("Missing Authorization header")

    scheme, _, token = authorization_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise ValueError("Authorization header must be in the format: Bearer <token>")

    import requests

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


@router.get("/", response_model=AIPreferencesResponse)
async def get_preferences(request: Request) -> AIPreferencesResponse:
    """Get user's saved AI preferences."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    try:
        # Try to get from preferences table
        response = supabase_service.table("ai_preferences").select("*").eq("user_id", user_id).limit(1).execute()
        
        if response.data and len(response.data) > 0:
            pref = response.data[0]
            return AIPreferencesResponse(
                user_id=user_id,
                model=pref.get("model", "meta/llama-3.2-3b-instruct"),
                temperature=pref.get("temperature", 0.2),
                reasoning_depth=pref.get("reasoning_depth", "Standard Analysis"),
                saved_at=pref.get("updated_at", datetime.now(timezone.utc).isoformat()),
            )
        
        # Return defaults if no preferences saved yet
        return AIPreferencesResponse(
            user_id=user_id,
            model="meta/llama-3.2-3b-instruct",
            temperature=0.2,
            reasoning_depth="Standard Analysis",
            saved_at=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve preferences.",
        ) from exc


@router.post("/", response_model=AIPreferencesResponse)
async def save_preferences(request: Request, preferences: AIPreferences) -> AIPreferencesResponse:
    """Save or update user's AI preferences."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    # Verify user_id matches
    if preferences.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot save preferences for another user.",
        )

    try:
        payload = {
            "user_id": user_id,
            "model": preferences.model,
            "temperature": preferences.temperature,
            "reasoning_depth": preferences.reasoning_depth,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        # Upsert preferences
        response = supabase_service.table("ai_preferences").upsert(
            payload, 
            on_conflict="user_id"
        ).execute()

        if response.data and len(response.data) > 0:
            saved = response.data[0]
            return AIPreferencesResponse(
                user_id=user_id,
                model=saved.get("model", preferences.model),
                temperature=saved.get("temperature", preferences.temperature),
                reasoning_depth=saved.get("reasoning_depth", preferences.reasoning_depth),
                saved_at=saved.get("updated_at", datetime.now(timezone.utc).isoformat()),
            )

        # If no response data, return what was sent
        return AIPreferencesResponse(
            user_id=user_id,
            model=preferences.model,
            temperature=preferences.temperature,
            reasoning_depth=preferences.reasoning_depth,
            saved_at=datetime.now(timezone.utc).isoformat(),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save preferences.",
        ) from exc
