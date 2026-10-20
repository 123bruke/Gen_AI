"""
PostgreSQL Database Manager for VisionRAG
Manages PostgreSQL connections with resilient automatic SQLite fallback.
Provides session factories, schema generation, and health checks.
"""

import os
import logging
from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from app.models.postgres_models import Base

logger = logging.getLogger("visionrag.db")

class PostgresDatabaseManager:
    """Enterprise Database Manager supporting PostgreSQL with resilient SQLite fallback."""

    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self.db_type = "uninitialized"
        self.is_connected = False
        self._init_engine()

    def _init_engine(self):
        # 1. First, attempt PostgreSQL connection
        pg_url = settings.postgres_connection_string
        try:
            pg_engine = create_engine(
                pg_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3}
            )
            # Test connection with a fast query
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            self.engine = pg_engine
            self.db_type = "postgresql"
            self.is_connected = True
            logger.info("Successfully connected to PostgreSQL database: %s", settings.POSTGRES_DB)
        except Exception as pg_err:
            logger.warning("PostgreSQL connection could not be established (%s). Activating resilient SQLite main DB fallback.", pg_err)
            
            # 2. Resilient SQLite fallback
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            storage_dir = os.path.join(project_root, "storage")
            os.makedirs(storage_dir, exist_ok=True)
            sqlite_path = os.path.join(storage_dir, "visionrag_main.db")
            sqlite_url = f"sqlite:///{sqlite_path}"
            
            self.engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
            self.db_type = "sqlite_fallback"
            self.is_connected = True
            logger.info("Main DB running on local fallback storage: %s", sqlite_path)

        # Create sessionmaker and build tables
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        try:
            Base.metadata.create_all(bind=self.engine)
        except Exception as e:
            logger.error("Failed to initialize database tables: %s", e)

    @contextmanager
    def session_scope(self) -> Generator[Session, None, None]:
        """Provide a transactional scope around a series of operations."""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_db(self) -> Generator[Session, None, None]:
        """FastAPI dependency for yielding database sessions."""
        session = self.SessionLocal()
        try:
            yield session
        finally:
            session.close()

    def get_status(self) -> dict:
        """Returns database health status and counts."""
        status = {
            "db_type": self.db_type,
            "connected": self.is_connected,
            "is_postgres": self.db_type == "postgresql",
        }
        try:
            with self.session_scope() as session:
                from app.models.postgres_models import User, UserSession, UploadedFile, Conversation, ChatMessage, TaskProgress
                status["user_count"] = session.query(User).count()
                status["session_count"] = session.query(UserSession).count()
                status["uploaded_files_count"] = session.query(UploadedFile).count()
                status["conversations_count"] = session.query(Conversation).count()
                status["messages_count"] = session.query(ChatMessage).count()
                status["task_progress_count"] = session.query(TaskProgress).count()
                status["healthy"] = True
        except Exception as e:
            status["healthy"] = False
            status["error"] = str(e)
        return status

postgres_manager = PostgresDatabaseManager()
db_manager = postgres_manager
