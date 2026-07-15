from functools import lru_cache

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------

    APP_NAME: str = Field(default="BusinessOS AI")
    APP_VERSION: str = Field(default="1.0.0")
    APP_DESCRIPTION: str = Field(default="Enterprise AI Business Operating System")

    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    API_V1_PREFIX: str = Field(default="/api/v1")

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------

    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    JWT_ALGORITHM: str = Field(default="HS256")

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------

    DATABASE_URL: PostgresDsn

    # ------------------------------------------------------------------
    # Redis
    # ------------------------------------------------------------------

    REDIS_URL: str

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------

    BACKEND_CORS_ORIGINS: list[str] = Field(default=["http://localhost:3000"])

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------

    LOG_LEVEL: str = Field(default="INFO")


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    """
    return Settings()


settings = get_settings()