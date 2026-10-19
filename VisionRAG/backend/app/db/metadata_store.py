"""
Relational & Reference Metadata Store for VisionRAG
Maintains ingestion references, website links, content hashes, and change timestamps using SQLite.
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional
import datetime

class MetadataReferenceStore:
    """Relational reference store for website links, downloaded media, and change-detection checksums."""

    def __init__(self, db_path: str = "storage/metadata.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS references_metadata (
                    id TEXT PRIMARY KEY,
                    url TEXT,
                    title TEXT,
                    category TEXT,
                    content_hash TEXT,
                    local_path TEXT,
                    source_type TEXT,
                    last_checked TIMESTAMP,
                    created_at TIMESTAMP
                )
            """)
            conn.commit()

    def record_reference(
        self,
        item_id: str,
        url: str,
        title: str,
        category: str,
        content_hash: str,
        local_path: Optional[str] = None,
        source_type: str = "web"
    ) -> bool:
        """Upsert a reference metadata record."""
        now = datetime.datetime.utcnow().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO references_metadata (id, url, title, category, content_hash, local_path, source_type, last_checked, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    url = excluded.url,
                    title = excluded.title,
                    category = excluded.category,
                    content_hash = excluded.content_hash,
                    local_path = excluded.local_path,
                    source_type = excluded.source_type,
                    last_checked = excluded.last_checked
            """, (item_id, url, title, category, content_hash, local_path, source_type, now, now))
            conn.commit()
            return True

    def get_reference(self, item_id: str) -> Optional[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM references_metadata WHERE id = ?", (item_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def list_all(self, limit: int = 50) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM references_metadata ORDER BY last_checked DESC LIMIT ?", (limit,))
            return [dict(r) for r in cursor.fetchall()]

    def count(self) -> int:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM references_metadata")
            return cursor.fetchone()[0]

meta_store = MetadataReferenceStore()
metadata_store = meta_store
