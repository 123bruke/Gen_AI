"""
VisionRAG Production FastAPI Application
Multimodal Agentic AI Engine with ChromaDB, Redis, YOLOv8, and Cross-Encoder Reranking
"""

import os
import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.orchestrator import agent_orchestrator
from app.db.chroma_client import chroma_client
from app.db.redis_cache import redis_cache
from app.db.metadata_store import metadata_store
from app.storage.ethiopian_crawler import ethiopian_crawler
from app.vision.yolo_detector import yolo_detector
from app.vision.audio_transcriber import audio_service

app = FastAPI(
    title="VisionRAG Multimodal Agentic AI API",
    description="Infrastructural Multimodal RAG with Autonomous Agentic Tool Use, Ethiopian Corpus, and Dual DB Layer",
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

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    query: str
    attachments: Optional[List[Any]] = []
    settings: Optional[Dict[str, Any]] = {}

class AudioSynthesizeRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {
        "system": "VisionRAG Multimodal Agentic AI",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    chroma_health = chroma_client.is_healthy()
    redis_health = redis_cache.is_healthy()
    yolo_health = yolo_detector.is_healthy()
    doc_count = metadata_store.count()

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
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

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Primary Agentic Chat Endpoint.
    Coordinates tools, YOLO vision analysis, hybrid dense+sparse retrieval,
    neural cross-encoder reranking, and Google-style divided multimodal response.
    """
    if not req.query.strip() and not req.attachments:
        raise HTTPException(status_code=400, detail="Query or attachments required")

    result = agent_orchestrator.plan_and_execute(
        prompt=req.query,
        attachments=req.attachments
    )
    return result

@app.post("/api/uploads")
async def upload_endpoint(file: UploadFile = File(...)):
    """
    Handles multimodal uploads (images, videos, PDF documents)
    """
    try:
        content = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

        file_size_mb = len(content) / (1024 * 1024)

        return {
            "success": True,
            "fileId": f"f-{int(time.time() * 1000)}",
            "filename": file.filename,
            "fileType": file.content_type or "application/octet-stream",
            "size": f"{file_size_mb:.2f} MB",
            "path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/ingest/ethiopia")
def trigger_ethiopian_crawl(background_tasks: BackgroundTasks):
    """
    Triggers web crawling, HTTP ETag/MD5 change detection, and multimodal ingestion
    for Ethiopian enterprise corpus (Ethiopian Airlines, Ethio Telecom/Telebirr, CBE, Axum/Lalibela).
    """
    def run_crawl():
        ethiopian_crawler.seed_ethiopian_corpus()

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
