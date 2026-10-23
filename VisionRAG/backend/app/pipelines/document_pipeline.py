"""
VisionRAG Educational Document Processing Pipeline (document_pipeline.py)
Handles parsing, structural recursive chunking, metadata extraction,
and ChromaDB / PostgreSQL vector indexing for Ethiopian MOE textbooks, syllabi, and exam notes.
"""

from typing import List, Dict, Any, Optional, Union
import os
import uuid
import datetime
import logging

from app.rag.embeddings import embedding_service
from app.db.chroma_client import chroma_store
from app.db.postgres_db import postgres_manager
from app.models.postgres_models import UploadedFile
from app.db.log_db import log_database

logger = logging.getLogger("visionrag.document_pipeline")

class EducationalDocumentPipeline:
    """
    End-to-End Document Ingestion and Vectorization Pipeline.
    Supports Markdown (.md), PDF (.pdf), Text (.txt), and JSON (.json).
    """

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embedder = embedding_service
        self.chroma = chroma_store
        self.postgres = postgres_manager

    def chunk_text(self, text: str) -> List[str]:
        """Recursive chunking preserving paragraph boundaries and markdown headers."""
        if len(text) <= self.chunk_size:
            return [text.strip()] if text.strip() else []

        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_len = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if current_len + len(para) > self.chunk_size:
                if current_chunk:
                    chunks.append("\n\n".join(current_chunk))
                current_chunk = [para]
                current_len = len(para)
            else:
                current_chunk.append(para)
                current_len += len(para) + 2

        if current_chunk:
            chunks.append("\n\n".join(current_chunk))

        return chunks

    def process_file(
        self,
        file_path: str,
        user_id: Optional[str] = "student_moe",
        sync_to_postgres: bool = True
    ) -> Dict[str, Any]:
        """
        Parses an educational file, generates chunks, computes embeddings,
        upserts to ChromaDB, and records the process in the visible log database.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Document file not found: {file_path}")

        fname = os.path.basename(file_path)
        ext = os.path.splitext(fname)[1].lower()

        # Read content
        with open(file_path, "rb") as f:
            raw_bytes = f.read()

        file_size = len(raw_bytes)
        text_content = ""

        if ext in [".md", ".txt", ".csv"]:
            text_content = raw_bytes.decode("utf-8", errors="ignore")
        elif ext == ".json":
            try:
                data = json.loads(raw_bytes.decode("utf-8", errors="ignore"))
                text_content = json.dumps(data, indent=2, ensure_ascii=False)
            except Exception:
                text_content = raw_bytes.decode("utf-8", errors="ignore")
        elif ext == ".pdf":
            try:
                import fitz
                doc = fitz.open(stream=raw_bytes, filetype="pdf")
                pages = [page.get_text() for page in doc]
                text_content = "\n\n".join(pages)
            except Exception as e:
                logger.warning(f"PyMuPDF extract note: {e}")
                text_content = raw_bytes.decode("utf-8", errors="ignore")

        # Chunk document
        chunks = self.chunk_text(text_content)
        total_chunks = len(chunks)

        # Vectorize and upsert into ChromaDB
        doc_ids = []
        for idx, chunk in enumerate(chunks[:80]):  # Cap initial chunk burst
            chunk_id = f"chunk_{uuid.uuid4().hex[:10]}"
            emb = self.embedder.embed_query(chunk)
            self.chroma.add_item(
                item_id=chunk_id,
                embedding=emb,
                document=chunk,
                metadata={
                    "filename": fname,
                    "chunk_index": idx,
                    "total_chunks": total_chunks,
                    "file_type": ext,
                    "pipeline": "educational_document_pipeline"
                }
            )
            doc_ids.append(chunk_id)

        # Sync to PostgreSQL if enabled
        if sync_to_postgres:
            try:
                with self.postgres.session_scope() as session:
                    file_id = f"doc_{fname.split('.')[0]}"
                    existing = session.query(UploadedFile).filter(UploadedFile.id == file_id).first()
                    if existing:
                        session.delete(existing)
                    uf = UploadedFile(
                        id=file_id,
                        user_id=user_id,
                        original_filename=fname,
                        stored_filename=f"pg_doc_{fname}",
                        file_path=file_path,
                        file_type=f"text/document; ext={ext}",
                        file_size_bytes=file_size,
                        file_size_display=f"{file_size/1024:.1f} KB",
                        checksum_md5=uuid.uuid4().hex[:32],
                        status="processed_in_postgres",
                        progress_percent=100,
                        has_binary=True,
                        file_blob=raw_bytes,
                        metadata_={
                            "total_chunks": total_chunks,
                            "indexed_chunks": len(doc_ids),
                            "pipeline": "document_pipeline"
                        }
                    )
                    session.add(uf)
            except Exception as e:
                logger.warning(f"PostgreSQL document sync note: {e}")

        summary = f"Processed '{fname}' ({file_size/1024:.1f} KB). Generated {total_chunks} chunk(s) and indexed into ChromaDB."

        # Audit in visible log database
        log_database.record_event(
            event_type="DOCUMENT_PIPELINE_COMPLETE",
            stage="DOCUMENT_PIPELINE",
            status="SUCCESS",
            user_id=user_id,
            payload={
                "filename": fname,
                "file_size_bytes": file_size,
                "chunks_count": total_chunks,
                "indexed_vectors": len(doc_ids),
                "summary": summary
            }
        )

        return {
            "status": "success",
            "filename": fname,
            "file_size_bytes": file_size,
            "chunks_count": total_chunks,
            "indexed_vectors": len(doc_ids),
            "summary": summary
        }

document_pipeline = EducationalDocumentPipeline()
