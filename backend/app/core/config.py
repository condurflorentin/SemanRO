"""
Configurare centralizată a aplicației.
Toate variabilele sensibile sunt citite din fișierul .env
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Aplicație ──────────────────────────────────────────────
    APP_NAME: str = "SemanRO API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Securitate JWT ─────────────────────────────────────────
    SECRET_KEY: str = "SCHIMBA_ACEASTA_CHEIE_CU_SECRETS_TOKEN_URLSAFE"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Baza de date PostgreSQL (async) ────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://antiplagiat_user:ParolaSecreta123!@localhost:5432/antiplagiat"

    # ── CORS – doar frontend-ul tău ───────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_LOGIN: str = "5/minute"

    # ── Cookie Settings ───────────────────────────────────────
    COOKIE_SECURE: bool = False  # True în producție (HTTPS)
    COOKIE_DOMAIN: str | None = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
