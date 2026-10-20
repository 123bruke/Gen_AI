"""
VisionRAG Production FastAPI Application
Multimodal Agentic AI Engine with PostgreSQL, Dedicated Simple DB Logging, ChromaDB, Redis, and YOLOv8
"""

import os
import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.orchestrator import agent_orchestrator
from app.db.chroma_client import chroma_client
from app.db.redis_cache import redis_cache
from app.db.metadata_store import metadata_store
from app.db.postgres_db import postgres_manager
from app.db.log_db import log_database, app_logger
from app.storage.ethiopian_crawler import ethiopian_crawler
from app.vision.yolo_detector import yolo_detector
from app.vision.audio_transcriber import audio_service

# Routers
from app.api.routes.auth import router as auth_router
from app.api.routes.uploads import router as uploads_router
from app.api.routes.chat import router as chat_router
from app.api.routes.progress import router as progress_router

app = FastAPI(
    title="VisionRAG Multimodal Agentic AI API",
    description="Multimodal RAG with PostgreSQL Account & File Tracking, Dedicated Simple DB Logging, and Ethiopian Corpus",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(uploads_router)
app.include_router(chat_router)
app.include_router(progress_router)

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AudioSynthesizeRequest(BaseModel):
    text: str

@app.on_event("startup")
def on_startup():
    db_status = postgres_manager.get_status()
    app_logger.info(
        f"VisionRAG API Started. Primary Database: {db_status.get('db_type', 'unknown')}",
        extra={
            "event_type": "SERVER_STARTUP",
            "details": db_status
        }
    )

@app.get("/")
def read_root():
    return {
        "system": "VisionRAG Multimodal Agentic AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "database": postgres_manager.get_status()
    }

@app.get("/health")
def health_check():
    chroma_health = chroma_client.is_healthy()
    redis_health = redis_cache.is_healthy()
    yolo_health = yolo_detector.is_healthy()
    doc_count = metadata_store.count()
    db_status = postgres_manager.get_status()
    log_count = log_database.count()

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "primary_database": {
                "type": db_status.get("db_type"),
                "is_postgres": db_status.get("is_postgres", False),
                "healthy": db_status.get("healthy", False),
                "users_count": db_status.get("user_count", 0),
                "sessions_count": db_status.get("session_count", 0),
                "uploaded_files_count": db_status.get("uploaded_files_count", 0),
                "conversations_count": db_status.get("conversations_count", 0),
                "messages_count": db_status.get("messages_count", 0),
                "task_progress_count": db_status.get("task_progress_count", 0)
            },
            "progress_logging_database": {
                "section": "separate_simple_db",
                "healthy": True,
                "total_logged_progress_events": log_count
            },
            "chromadb": {
                "status": "connected" if chroma_health else "local_fallback",
                "healthy": True
            },
            "redis_cache": {
                "status": "connected" if redis_health else "in_memory_ttl_fallback",
                "healthy": True
            },
            "yolo_vision": {
                "status": "ready" if yolo_health else "standby",
                "healthy": yolo_health
            },
            "metadata_store": {
                "status": "operational",
                "indexed_documents": doc_count
            }
        }
    }

@app.get("/api/db/status")
def get_db_status():
    """
    Returns current status of primary database (PostgreSQL vs SQLite)
    and count of accounts, sessions, files, conversations, messages, and progress stored.
    """
    return postgres_manager.get_status()

@app.get("/api/logs/progress")
def get_progress_logs(
    limit: int = Query(50, ge=1, le=200),
    level: Optional[str] = None,
    event_type: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    Retrieves progress and audit logs captured via Python's 'logging' library
    stored in the separate simple DB section.
    """
    logs = log_database.get_logs(
        limit=limit,
        level=level,
        event_type=event_type,
        user_id=user_id
    )
    return {
        "count": len(logs),
        "total_records": log_database.count(),
        "logs": logs
    }

@app.post("/api/ingest/ethiopia")
def trigger_ethiopian_crawl(background_tasks: BackgroundTasks):
    """
    Triggers web crawling, HTTP ETag/MD5 change detection, and multimodal ingestion
    for Ethiopian enterprise corpus.
    """
    def run_crawl():
        app_logger.info("Ethiopian crawl background task triggered.", extra={"event_type": "CRAWL_STARTED"})
        ethiopian_crawler.seed_ethiopian_corpus()
        app_logger.info("Ethiopian crawl background task finished.", extra={"event_type": "CRAWL_FINISHED"})

    background_tasks.add_task(run_crawl)
    return {
        "status": "crawl_initiated",
        "message": "Ethiopian enterprise multimodal crawler running in background"
    }

@app.post("/api/audio/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    Whisper speech-to-text audio transcriber.
    """
    audio_bytes = await file.read()
    result = audio_service.transcribe(audio_bytes)
    return result

@app.post("/api/audio/synthesize")
def synthesize_audio_endpoint(req: AudioSynthesizeRequest):
    """
    Speech synthesis (TTS) for voice answers.
    """
    result = audio_service.synthesize_speech(req.text)
    return result

@app.get("/api/documents")
def list_documents():
    """
    List indexed documents in the reference metadata store.
    """
    docs = metadata_store.list_all(limit=50)
    return {
        "count": len(docs),
        "documents": docs
    }
