"""
Information and Task Progress API Endpoints.
Stores and serves progress indicators for async ingestion, file uploads,
OCR extraction, and multimodal reasoning stored in PostgreSQL.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Header, Depends
from pydantic import BaseModel
from app.services.user_service import user_service

router = APIRouter(prefix="/api/progress", tags=["Information & Task Progress Tracking"])

class TaskProgressUpdateRequest(BaseModel):
    task_id: str
    task_type: str
    stage: str
    progress_percent: int
    status: str = "in_progress"
    user_id: Optional[str] = None
    message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def get_optional_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()

@router.get("/{task_id}")
def get_task_progress_endpoint(task_id: str):
    """
    Returns information progress for a specific task recorded in PostgreSQL.
    """
    task = user_service.get_task_progress(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task progress not found.")
    return task

@router.post("")
@router.post("/")
def update_task_progress_endpoint(req: TaskProgressUpdateRequest):
    """
    Updates or inserts task progress in PostgreSQL.
    """
    updated = user_service.update_task_progress(
        task_id=req.task_id,
        task_type=req.task_type,
        stage=req.stage,
        progress_percent=req.progress_percent,
        status=req.status,
        user_id=req.user_id,
        message=req.message,
        metadata=req.metadata
    )
    return {
        "success": True,
        "task": updated
    }

@router.get("")
@router.get("/")
def list_tasks_progress_endpoint(
    token: Optional[str] = Depends(get_optional_token),
    user_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """
    Lists recent information progress records from PostgreSQL.
    """
    effective_user_id = user_id
    if token:
        user_info = user_service.get_current_user_from_token(token)
        if user_info:
            effective_user_id = user_info["id"]

    tasks = user_service.list_user_tasks(user_id=effective_user_id, limit=limit)
    return {
        "count": len(tasks),
        "tasks": tasks
    }
