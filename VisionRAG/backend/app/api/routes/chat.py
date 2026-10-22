"""
Chat and Conversation Management API Endpoints.
Coordinates RAG pipeline execution, stores user prompts/messages in PostgreSQL,
stores multimodal divided responses with metadata in PostgreSQL, and manages conversation history.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel

from app.agents.orchestrator import agent_orchestrator
from app.services.user_service import user_service
from app.db.log_db import app_logger

router = APIRouter(prefix="/api/chat", tags=["Agentic Chat & PostgreSQL Conversations"])

class ChatMessageRequest(BaseModel):
    query: str
    chat_id: Optional[str] = None
    user_id: Optional[str] = None
    attachments: Optional[List[Any]] = []
    settings: Optional[Dict[str, Any]] = {}

class ConversationCreateRequest(BaseModel):
    id: str
    title: str
    folder_id: Optional[str] = None
    pinned: bool = False
    metadata: Optional[Dict[str, Any]] = None

def get_optional_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()

@router.post("")
@router.post("/")
async def chat_endpoint(
    req: ChatMessageRequest,
    token: Optional[str] = Depends(get_optional_token)
):
    """
    Primary Agentic Chat Endpoint.
    1. Stores user sended prompt/message in PostgreSQL.
    2. Executes Multimodal RAG with YOLO vision & Cross-Encoder reranking.
    3. Stores divided multimodal answer & metadata in PostgreSQL.
    4. Records execution progress in PostgreSQL.
    """
    if not req.query.strip() and not req.attachments:
        raise HTTPException(status_code=400, detail="Query or attachments required")

    # Determine user_id
    effective_user_id = req.user_id
    if token:
        user_info = user_service.get_current_user_from_token(token)
        if user_info:
            effective_user_id = user_info["id"]

    chat_id = req.chat_id or f"chat_{int(id(req))}"

    # 1. Store user sended info in PostgreSQL
    user_service.record_chat_message(
        chat_id=chat_id,
        sender="user",
        text=req.query,
        user_id=effective_user_id,
        attachments=req.attachments,
        metadata={"client_settings": req.settings}
    )

    # 2. Record task progress in PostgreSQL
    task_id = f"rag_{chat_id}"
    if effective_user_id:
        user_service.update_task_progress(
            task_id=task_id,
            task_type="chat_inference",
            stage="retrieval_and_vision_reasoning",
            progress_percent=40,
            status="in_progress",
            user_id=effective_user_id,
            message="Retrieving multimodal documents and executing YOLO object detection..."
        )

    app_logger.info(
        f"Processing RAG chat query for chat '{chat_id}': '{req.query[:60]}...'",
        extra={
            "user_id": effective_user_id,
            "event_type": "CHAT_QUERY",
            "details": {
                "chat_id": chat_id,
                "query_length": len(req.query),
                "attachments_count": len(req.attachments or [])
            }
        }
    )

    # 3. Plan & Execute Agentic RAG
    result = agent_orchestrator.plan_and_execute(
        prompt=req.query,
        attachments=req.attachments,
        settings=req.settings
    )

    # 4. Store assistant response and multimodal metadata in PostgreSQL
    assistant_msg = user_service.record_chat_message(
        chat_id=chat_id,
        sender="assistant",
        text=result.get("text", ""),
        user_id=effective_user_id,
        multimodal=result.get("multimodal", {}),
        metadata={
            "steps_executed": result.get("steps_executed", []),
            "tools_called": result.get("tools_called", []),
            "confidence": 0.95
        }
    )

    # 5. Finalize task progress in PostgreSQL
    if effective_user_id:
        user_service.update_task_progress(
            task_id=task_id,
            task_type="chat_inference",
            stage="completed",
            progress_percent=100,
            status="completed",
            user_id=effective_user_id,
            message="Multimodal response generated and saved to PostgreSQL."
        )

    return {
        "text": result.get("text", ""),
        "multimodal": result.get("multimodal", {}),
        "chat_id": chat_id,
        "message_id": assistant_msg["id"],
        "persisted_in_postgres": True
    }

@router.get("/conversations")
def list_conversations_endpoint(
    token: Optional[str] = Depends(get_optional_token),
    user_id: Optional[str] = None
):
    """
    Lists conversations and message history from PostgreSQL.
    """
    effective_user_id = user_id
    if token:
        user_info = user_service.get_current_user_from_token(token)
        if user_info:
            effective_user_id = user_info["id"]

    convs = user_service.list_conversations(user_id=effective_user_id, limit=50)
    return {
        "count": len(convs),
        "conversations": convs
    }

@router.post("/conversations")
def save_conversation_endpoint(
    req: ConversationCreateRequest,
    token: Optional[str] = Depends(get_optional_token)
):
    """
    Saves or syncs conversation metadata in PostgreSQL.
    """
    effective_user_id = None
    if token:
        user_info = user_service.get_current_user_from_token(token)
        if user_info:
            effective_user_id = user_info["id"]

    conv = user_service.save_conversation(
        conversation_id=req.id,
        user_id=effective_user_id,
        title=req.title,
        folder_id=req.folder_id,
        pinned=req.pinned,
        metadata=req.metadata
    )
    return {
        "success": True,
        "conversation": conv
    }
