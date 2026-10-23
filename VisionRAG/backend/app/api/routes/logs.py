"""
Visible System Progress & Database Audit Routes for VisionRAG.
Provides endpoints to view, search, export, and inspect progress logs from the dedicated simple logging DB.
"""

from typing import Optional
from fastapi import APIRouter, Query, Response
from fastapi.responses import HTMLResponse, JSONResponse
from app.db.log_db import log_database

router = APIRouter(tags=["Visible System Progress & Audit Logs"])

@router.get("/api/logs")
def list_logs_api(
    limit: int = Query(100, ge=1, le=500),
    level: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None)
):
    """Returns JSON array of progress records from the simple logging DB."""
    records = log_database.get_logs(limit=limit, level=level, event_type=event_type, user_id=user_id)
    return {
        "status": "success",
        "count": len(records),
        "logs": records
    }

@router.get("/api/logs/stats")
def get_logs_stats_api():
    """Returns aggregated summary counts of progress events."""
    return log_database.get_stats()

@router.get("/api/logs/export")
def export_logs_api():
    """Exports visible progress logs to disk and returns the JSON payload."""
    path = log_database.export_visible_logs(limit=250)
    stats = log_database.get_stats()
    records = log_database.get_logs(limit=250)
    return JSONResponse(content={
        "status": "exported",
        "file_saved_at": path,
        "total_records": len(records),
        "stats": stats,
        "records": records
    })

@router.get("/api/logs/visible", response_class=HTMLResponse)
@router.get("/logs", response_class=HTMLResponse)
def view_visible_logs_dashboard(limit: int = Query(150, ge=10, le=500)):
    """Renders the visible interactive HTML dashboard displaying progress and events."""
    html_content = log_database.render_visible_html_dashboard(limit=limit)
    return HTMLResponse(content=html_content)
