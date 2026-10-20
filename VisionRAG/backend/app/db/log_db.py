"""
Dedicated Simple Database Section for System Logging and Progress Tracking.
Utilizes Python's standard 'logging' library with a custom DBLoggingHandler to store
all user and system progress events in a separate simple DB section (not the main section).
"""

import os
import sqlite3
import logging
import json
import datetime
from typing import List, Dict, Any, Optional

class SimpleLogDatabase:
    """Manages the separate simple logging database section."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            storage_dir = os.path.join(project_root, "storage")
            os.makedirs(storage_dir, exist_ok=True)
            self.db_path = os.path.join(storage_dir, "visionrag_logs.db")
        else:
            self.db_path = db_path
        
        self._init_db()

    def _init_db(self):
        """Creates the progress and audit logging table in the separate simple DB."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_progress_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    level TEXT NOT NULL,
                    logger_name TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    message TEXT NOT NULL,
                    user_id TEXT,
                    details TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_progress_logs(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_event ON system_progress_logs(event_type)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_user ON system_progress_logs(user_id)")
            conn.commit()

    def insert_log(
        self,
        level: str,
        logger_name: str,
        event_type: str,
        message: str,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> int:
        """Insert a log record into the separate simple DB."""
        details_str = json.dumps(details) if details else None
        now = datetime.datetime.utcnow().isoformat()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO system_progress_logs (timestamp, level, logger_name, event_type, message, user_id, details)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (now, level, logger_name, event_type, message, user_id, details_str))
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            # Avoid crashing if logging store has issue
            print(f"[Logging DB Error]: {e}")
            return -1

    def get_logs(
        self,
        limit: int = 100,
        level: Optional[str] = None,
        event_type: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve recent progress logs from the separate simple DB section."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = "SELECT * FROM system_progress_logs WHERE 1=1"
            params = []
            
            if level:
                query += " AND level = ?"
                params.append(level.upper())
            if event_type:
                query += " AND event_type = ?"
                params.append(event_type)
            if user_id:
                query += " AND user_id = ?"
                params.append(user_id)
                
            query += " ORDER BY id DESC LIMIT ?"
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            logs = []
            for r in rows:
                item = dict(r)
                if item.get("details"):
                    try:
                        item["details"] = json.loads(item["details"])
                    except Exception:
                        pass
                logs.append(item)
            return logs

    def count(self) -> int:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM system_progress_logs")
            return cursor.fetchone()[0]


# Instantiate the separate simple DB instance
log_database = SimpleLogDatabase()


class DBLoggingHandler(logging.Handler):
    """
    Custom Python logging Handler that intercepts log records and stores them
    in the separate simple DB section.
    """

    def __init__(self, db: SimpleLogDatabase):
        super().__init__()
        self.db = db

    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            user_id = getattr(record, "user_id", None)
            event_type = getattr(record, "event_type", "SYSTEM_LOG")
            details = getattr(record, "details", None)
            
            self.db.insert_log(
                level=record.levelname,
                logger_name=record.name,
                event_type=event_type,
                message=msg,
                user_id=user_id,
                details=details
            )
        except Exception:
            self.handleError(record)


# Configure and initialize VisionRAG logger with Python's standard logging library
def setup_visionrag_logging() -> logging.Logger:
    logger = logging.getLogger("visionrag")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers on hot reload
    if not any(isinstance(h, DBLoggingHandler) for h in logger.handlers):
        # 1. Attach the DB logging handler for storing in separate DB section
        db_handler = DBLoggingHandler(log_database)
        db_handler.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        db_handler.setFormatter(formatter)
        logger.addHandler(db_handler)
        
        # 2. Console stream handler for terminal readability
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
    return logger

# Global application logger
app_logger = setup_visionrag_logging()
