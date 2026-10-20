"""
Uploads API Endpoints.
Handles file ingestion, stores major large file binary data in PostgreSQL (BYTEA),
saves metadata in JSON format, records upload progress in PostgreSQL, and logs progress.
"""

import os
import hashlib
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import FileResponse, StreamingResponse
import io
from app.services.user_service import user_service

router = APIRouter(prefix="/api/uploads", tags=["File Uploads & PostgreSQL Binary Storage"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "storage", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
@router.post("/")
async def upload_file_endpoint(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    store_binary_in_db: bool = Form(True)
):
    """
    Ingests multimodal files (PDF, images, videos, audio, documents),
    saves them to disk, hashes content, stores major large file binary (BYTEA)
    directly in PostgreSQL, creates metadata format record, and persists progress.
    """
    try:
        task_id = f"upload_{file.filename}_{int(os.times().elapsed)}"
        if user_id:
            user_service.update_task_progress(
                task_id=task_id,
                task_type="file_upload",
                stage="receiving_stream",
                progress_percent=25,
                status="in_progress",
                user_id=user_id,
                message=f"Receiving {file.filename}..."
            )

        content = await file.read()
        file_size = len(content)

        # Compute MD5 and SHA256 checksums
        md5_hash = hashlib.md5(content).hexdigest()
        sha256_hash = hashlib.sha256(content).hexdigest()

        # Sanitize and create storage path
        safe_filename = os.path.basename(file.filename or "uploaded_asset")
        stored_filename = f"{md5_hash[:10]}_{safe_filename}"
        file_path = os.path.join(UPLOAD_DIR, stored_filename)

        with open(file_path, "wb") as f:
            f.write(content)

        content_type = file.content_type or "application/octet-stream"

        if user_id:
            user_service.update_task_progress(
                task_id=task_id,
                task_type="file_upload",
                stage="persisting_to_postgres",
                progress_percent=75,
                status="in_progress",
                user_id=user_id,
                message="Storing file and metadata in PostgreSQL..."
            )

        # File metadata format
        metadata = {
            "mime_type": content_type,
            "md5": md5_hash,
            "sha256": sha256_hash,
            "size_bytes": file_size,
            "original_filename": safe_filename,
            "extension": os.path.splitext(safe_filename)[1].lower(),
            "stored_in_postgres_bytea": store_binary_in_db
        }

        # Store in PostgreSQL with BYTEA binary support
        db_file = user_service.record_file_upload(
            original_filename=safe_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            file_type=content_type,
            file_size_bytes=file_size,
            user_id=user_id,
            checksum_md5=md5_hash,
            file_blob=content if store_binary_in_db else None,
            metadata=metadata
        )

        if user_id:
            user_service.update_task_progress(
                task_id=task_id,
                task_type="file_upload",
                stage="completed",
                progress_percent=100,
                status="completed",
                user_id=user_id,
                message=f"Successfully stored {safe_filename} in PostgreSQL."
            )

        return {
            "success": True,
            "fileId": db_file["id"],
            "filename": db_file["filename"],
            "fileType": db_file["fileType"],
            "size": db_file["size"],
            "sizeBytes": db_file["size_bytes"],
            "checksum": db_file["checksum"],
            "hasBinaryInPostgres": db_file["has_binary"],
            "metadata": db_file["metadata"],
            "path": db_file["path"],
            "userId": db_file["user_id"],
            "uploadedAt": db_file["uploaded_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("")
@router.get("/")
def list_uploaded_files_endpoint(user_id: Optional[str] = None):
    """
    Retrieves uploaded files and their metadata stored in PostgreSQL.
    """
    files = user_service.list_user_files(user_id=user_id, limit=100)
    return {
        "count": len(files),
        "files": files
    }

@router.get("/user/{user_id}")
def list_user_files_endpoint(user_id: str):
    """
    Retrieves all files uploaded by a specific user from PostgreSQL.
    """
    files = user_service.list_user_files(user_id=user_id, limit=100)
    return {
        "userId": user_id,
        "count": len(files),
        "files": files
    }

@router.get("/{file_id}/download")
def download_file_endpoint(file_id: str):
    """
    Downloads raw file binary directly from PostgreSQL BYTEA storage.
    """
    record = user_service.get_file_binary(file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File not found in PostgreSQL.")

    # 1. If stored in PostgreSQL BYTEA binary
    if record.get("has_binary") and record.get("binary"):
        return StreamingResponse(
            io.BytesIO(record["binary"]),
            media_type=record["file_type"],
            headers={"Content-Disposition": f'attachment; filename="{record["filename"]}"'}
        )

    # 2. Local disk fallback
    if record.get("path") and os.path.exists(record["path"]):
        return FileResponse(
            record["path"],
            media_type=record["file_type"],
            filename=record["filename"]
        )

    raise HTTPException(status_code=404, detail="Binary data not found.")
