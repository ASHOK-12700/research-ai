from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = Field(default="ResearchAI")
    APP_VERSION: str = Field(default="1.0.0")
    API_PREFIX: str = Field(default="/api")
    FRONTEND_URL: str = Field(
        default="http://localhost:5173,https://researchai-app.vercel.app"
    )
    ENVIRONMENT: str = Field(default="development")
    
    # AI/RAG Configuration
    AI_MODEL: str = Field(default="meta/llama-3.2-3b-instruct")
    NVIDIA_API_KEY: str | None = Field(default=None)
    NVIDIA_BASE_URL: str = Field(default="https://integrate.api.nvidia.com/v1")
    
    # Chatbot Configuration (separate from RAG)
    CHATBOT_MODEL: str | None = Field(default=None)
    CHATBOT_API_KEY: str | None = Field(default=None)
    CHATBOT_BASE_URL: str | None = Field(default=None)
    
    # Supabase Configuration
    SUPABASE_URL: str = Field(default="")
    SUPABASE_ANON_KEY: str = Field(default="")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="")

    _env_path = Path(__file__).resolve().parents[2] / ".env"

    model_config = SettingsConfigDict(
        env_file=str(_env_path),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        configured_origins = [
            origin.strip() for origin in self.FRONTEND_URL.split(",") if origin.strip()
        ]
        return list(dict.fromkeys([
            "http://localhost:5173",
            "https://researchai-app.vercel.app",
            *configured_origins,
        ]))


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
