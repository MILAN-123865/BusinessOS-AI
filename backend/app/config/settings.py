"""
Application configuration module.

Centralized, type-safe settings loaded from environment variables (.env).
This module has ZERO internal dependencies on the rest of the application —
every other module in the codebase may depend on this one, never the reverse.

Usage:
    from app.config.settings import settings

    settings.DATABASE_URL
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List, Literal

from pydantic import AnyHttpUrl, Field, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Absolute path to the `backend/` directory (two levels up from this file:
# app/config/settings.py -> app/config -> app -> backend)
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """
    Strongly-typed application settings.

    All values are sourced from environment variables (or a `.env` file at
    the backend project root). Field names map 1:1 to environment variable
    names (case-insensitive by default via SettingsConfigDict).
    """

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # -------------------------------------------------------------------
    # Application / Environment
    # -------------------------------------------------------------------
    APP_NAME: str = "BusinessOS AI"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-powered Enterprise Business Operating System"
    ENVIRONMENT: Literal["local", "development", "staging", "production"] = "local"
    DEBUG: bool = False

    # NOTE: this is the single source of truth for the versioned API prefix.
    # Every other module (middleware, dependencies, routers) must import
    # `settings.API_V1_PREFIX` — do NOT reference a separate `API_V1_STR`,
    # that name does not exist here and will raise AttributeError.
    API_V1_PREFIX: str = "/api/v1"

    # -------------------------------------------------------------------
    # Server
    # -------------------------------------------------------------------
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # -------------------------------------------------------------------
    # Security / JWT
    # -------------------------------------------------------------------
    # Must be a high-entropy secret in production (min 32 bytes / 256 bits).
    # NOTE: this is the single source of truth for the signing secret.
    # Other modules must reference `settings.JWT_SECRET_KEY`, not `SECRET_KEY`.
    JWT_SECRET_KEY: str = Field(..., min_length=32)
    JWT_REFRESH_SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # -------------------------------------------------------------------
    # Password Policy
    # -------------------------------------------------------------------
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGIT: bool = True
    PASSWORD_REQUIRE_SPECIAL_CHAR: bool = True
    BCRYPT_ROUNDS: int = 12

    # -------------------------------------------------------------------
    # Database (PostgreSQL, async via asyncpg)
    # -------------------------------------------------------------------
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 1800  # seconds
    DATABASE_ECHO: bool = False

    # -------------------------------------------------------------------
    # Redis (caching, rate limiting, token blacklist)
    # -------------------------------------------------------------------
    REDIS_URL: RedisDsn
    REDIS_CACHE_TTL_SECONDS: int = 300

    # -------------------------------------------------------------------
    # CORS
    # -------------------------------------------------------------------
    # NOTE: this is the single source of truth for CORS origins.
    # main.py must reference `settings.CORS_ALLOWED_ORIGINS`, not
    # `BACKEND_CORS_ORIGINS` (that field does not exist here).
    CORS_ALLOWED_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
    )
    CORS_ALLOW_CREDENTIALS: bool = True

    @field_validator("CORS_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: str | List[str]) -> List[str]:
        """Allow CORS origins to be provided as a JSON list or comma-separated string."""
        import json
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("[") and value.endswith("]"):
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if str(origin).strip()]
                except Exception:
                    pass
            return [origin.strip() for origin in value.replace("[", "").replace("]", "").replace('"', "").replace("'", "").split(",") if origin.strip()]
        return value

    # -------------------------------------------------------------------
    # Rate Limiting
    # -------------------------------------------------------------------
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_LOGIN_ATTEMPTS: int = 5
    RATE_LIMIT_LOGIN_WINDOW_SECONDS: int = 300

    # -------------------------------------------------------------------
    # Pagination Defaults
    # -------------------------------------------------------------------
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # -------------------------------------------------------------------
    # Email / SMTP (used by auth module for verification & reset emails)
    # -------------------------------------------------------------------
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM_ADDRESS: str = "no-reply@businessos.ai"
    EMAIL_FROM_NAME: str = "BusinessOS AI"

    # -------------------------------------------------------------------
    # Frontend (used to build links in transactional emails)
    # -------------------------------------------------------------------
    FRONTEND_URL: AnyHttpUrl = "http://localhost:3000"  # type: ignore[assignment]

    # -------------------------------------------------------------------
    # AI Providers
    # -------------------------------------------------------------------
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    OLLAMA_URL: str = "http://localhost:11434"
    DEFAULT_AI_PROVIDER: Literal["auto", "openai", "gemini", "groq", "ollama", "fallback"] = "auto"
    DEFAULT_AI_MODEL: str = "auto"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_local(self) -> bool:
        return self.ENVIRONMENT == "local"

    @property
    def sqlalchemy_database_url(self) -> str:
        """
        Return the DATABASE_URL normalized for the async SQLAlchemy engine.
        Ensures the `postgresql+asyncpg://` driver scheme is used even if
        the raw env var was supplied as `postgresql://`.
        """
        url = str(self.DATABASE_URL)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings singleton.
    """
    return Settings()


settings = get_settings()