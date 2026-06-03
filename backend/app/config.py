"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings with sensible defaults for development."""

    # Application
    APP_NAME: str = "Hindustan University Cultural Event Registration Portal"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database - SQLite for development
    DATABASE_URL: str = "sqlite:///cultural_event.db"

    # JWT Settings
    JWT_SECRET_KEY: str = "hindustan-cultural-event-secret-key-2026-super-secure"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # AES-256 Encryption Key for Aadhaar (32 bytes hex-encoded)
    AES_ENCRYPTION_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

    # Payment
    PAYMENT_AMOUNT_EXTERNAL: float = 500.0

    # Admin defaults
    DEFAULT_ADMIN_EMAIL: str = "admin@hindustanuniv.ac.in"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    DEFAULT_ADMIN_NAME: str = "System Administrator"

    # Internal domain
    INTERNAL_EMAIL_DOMAIN: str = "@student.hindustanuniv.ac.in"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
