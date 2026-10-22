"""
VisionRAG Configuration Settings
Supports PostgreSQL configuration with intelligent local SQLite fallback.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend directory as well as cwd
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(env_path):
    load_dotenv(env_path)
load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "VisionRAG Multimodal Agentic AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Primary Relational Database (PostgreSQL)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "visionrag")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)
    
    # Separate Simple DB for Logging & Audit Progress (as requested)
    LOG_DB_FILENAME: str = "visionrag_logs.db"
    
    # File Storage
    UPLOAD_DIR_NAME: str = "uploads"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "visionrag_secure_multimodal_key_2026")
    SESSION_EXPIRE_HOURS: int = 72
    
    # Gemini API Key (Temporary or Permanent)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")

    @property
    def postgres_connection_string(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()
