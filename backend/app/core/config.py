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
    
    # AI provider configuration, tried in priority order.
    GROQ_API_KEY: str | None = Field(default=None)
    GROQ_MODEL: str = Field(default="")
    OPENROUTER_API_KEY: str | None = Field(default=None)
    OPENROUTER_MODEL: str = Field(default="")
    MISTRAL_API_KEY: str | None = Field(default=None)
    MISTRAL_MODEL: str = Field(default="")
    
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

    @property
    def AI_MODEL(self) -> str:
        return self.GROQ_MODEL


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
