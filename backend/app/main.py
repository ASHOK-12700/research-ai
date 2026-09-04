from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.papers import router as papers_router
from app.api.routes.health import router as health_router
from app.api.routes.projects import router as projects_router
from app.api.routes.rag import router as rag_router
from app.api.routes.chatbot import router as chatbot_router
from app.api.routes.preferences import router as preferences_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(papers_router, prefix=settings.API_PREFIX)
app.include_router(projects_router, prefix=settings.API_PREFIX)
app.include_router(rag_router, prefix=settings.API_PREFIX)
app.include_router(chatbot_router, prefix=settings.API_PREFIX)
app.include_router(preferences_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    return {
        "message": f"{settings.APP_NAME} is running.",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
