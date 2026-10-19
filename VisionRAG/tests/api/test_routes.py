"""
API Integration Tests for VisionRAG FastAPI Server
"""

import pytest
from app.main import app, health_check, list_documents

def test_health_check_endpoint():
    health = health_check()
    assert health["status"] == "healthy"
    assert "services" in health
    services = health["services"]
    assert "chromadb" in services
    assert "redis_cache" in services
    assert "yolo_vision" in services
    assert "metadata_store" in services

def test_documents_listing():
    docs_res = list_documents()
    assert "count" in docs_res
    assert "documents" in docs_res
    assert isinstance(docs_res["documents"], list)

def test_chat_endpoint_execution():
    import asyncio
    from app.main import chat_endpoint, ChatRequest
    req = ChatRequest(query="Where is the Commercial Bank of Ethiopia headquarters?")
    res = asyncio.run(chat_endpoint(req))
    assert "text" in res
    assert "multimodal" in res
    assert "maps" in res["multimodal"]
