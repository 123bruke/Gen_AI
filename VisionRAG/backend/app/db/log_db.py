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

    def record_event(
        self,
        event_type: str,
        stage: str = "SYSTEM",
        status: str = "INFO",
        message: Optional[str] = None,
        user_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> int:
        """Ergonomic wrapper to record structured events to visible log DB."""
        level = "ERROR" if status.upper() in ["ERROR", "FAILED"] else (
            "WARNING" if status.upper() in ["WARNING", "WARN"] else "INFO"
        )
        msg = message or f"[{stage}] Event '{event_type}' processed with status '{status}'."
        details = payload or {}
        if kwargs:
            details.update(kwargs)
        details["stage"] = stage
        details["status"] = status
        return self.insert_log(
            level=level,
            logger_name=f"visionrag.{stage.lower()}",
            event_type=event_type,
            message=msg,
            user_id=user_id,
            details=details
        )


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

    def get_stats(self) -> Dict[str, Any]:
        """Aggregate statistical summary of progress and vision events."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM system_progress_logs")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT event_type, COUNT(*) FROM system_progress_logs GROUP BY event_type")
            by_event = dict(cursor.fetchall())

            cursor.execute("SELECT level, COUNT(*) FROM system_progress_logs GROUP BY level")
            by_level = dict(cursor.fetchall())

            cursor.execute("SELECT MAX(timestamp) FROM system_progress_logs")
            latest = cursor.fetchone()[0]

            return {
                "total_logs": total,
                "by_event_type": by_event,
                "by_level": by_level,
                "latest_timestamp": latest,
                "database_path": self.db_path,
                "status": "healthy"
            }

    def export_visible_logs(self, limit: int = 200, output_path: Optional[str] = None) -> str:
        """Exports recent visible logs to a human-readable JSON file."""
        logs = self.get_logs(limit=limit)
        stats = self.get_stats()
        export_payload = {
            "metadata": {
                "title": "VisionRAG System Progress & Auditing Visible Log Database",
                "generated_at": datetime.datetime.utcnow().isoformat(),
                "total_records_exported": len(logs),
                "stats": stats
            },
            "recent_progress_records": logs
        }
        if output_path is None:
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            logs_dir = os.path.join(project_root, "logs")
            os.makedirs(logs_dir, exist_ok=True)
            output_path = os.path.join(logs_dir, "visible_system_progress_logs.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(export_payload, f, indent=2, ensure_ascii=False)

        return output_path

    def render_visible_html_dashboard(self, limit: int = 150) -> str:
        """Renders an interactive, responsive HTML UI displaying all visible progress logs."""
        logs = self.get_logs(limit=limit)
        stats = self.get_stats()
        events_html = "".join([f'<span class="badge badge-event">{k}: {v}</span> ' for k, v in stats.get("by_event_type", {}).items()])

        rows_html = []
        for l in logs:
            lvl = l.get("level", "INFO")
            badge_class = "badge-info" if lvl == "INFO" else ("badge-warn" if lvl == "WARNING" else "badge-err")
            details = l.get("details")
            details_json = json.dumps(details, indent=2) if details else ""
            details_cell = f'<pre class="details-box">{details_json}</pre>' if details else '<span class="text-muted">None</span>'
            
            rows_html.append(f"""
            <tr>
                <td><strong>#{l.get('id')}</strong></td>
                <td><span class="timestamp">{l.get('timestamp')}</span></td>
                <td><span class="badge {badge_class}">{lvl}</span></td>
                <td><code class="event-tag">{l.get('event_type')}</code></td>
                <td>{l.get('logger_name')}</td>
                <td class="msg-cell">{l.get('message')}</td>
                <td>{details_cell}</td>
            </tr>
            """)

        table_rows = "".join(rows_html)

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VisionRAG - Visible System Progress & Log Database</title>
    <style>
        :root {{
            --bg-dark: #0f172a;
            --card-bg: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent: #38bdf8;
            --border: #334155;
            --success: #22c55e;
            --warn: #f59e0b;
            --danger: #ef4444;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg-dark);
            color: var(--text-main);
            margin: 0;
            padding: 24px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        h1 {{ margin: 0; font-size: 24px; color: var(--accent); }}
        .stats-bar {{
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }}
        .stat-card {{
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px 20px;
            min-width: 150px;
        }}
        .stat-val {{ font-size: 22px; font-weight: bold; color: var(--text-main); }}
        .stat-lbl {{ font-size: 12px; color: var(--text-muted); text-transform: uppercase; }}
        .badge {{
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }}
        .badge-info {{ background: #0369a1; color: #e0f2fe; }}
        .badge-warn {{ background: #b45309; color: #fef3c7; }}
        .badge-err {{ background: #b91c1c; color: #fee2e2; }}
        .badge-event {{ background: #334155; color: #38bdf8; border: 1px solid #475569; }}
        .table-container {{
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow-x: auto;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
        }}
        th, td {{
            padding: 10px 14px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }}
        th {{ background: #0b1329; color: var(--text-muted); font-weight: 600; }}
        tr:hover {{ background: rgba(56, 189, 248, 0.05); }}
        .timestamp {{ font-family: monospace; color: var(--text-muted); font-size: 12px; }}
        .event-tag {{ color: var(--accent); font-weight: bold; font-family: monospace; }}
        .msg-cell {{ max-width: 420px; word-break: break-word; }}
        .details-box {{
            background: #0b1120;
            border: 1px solid #1e293b;
            border-radius: 4px;
            padding: 6px;
            font-size: 11px;
            max-height: 120px;
            overflow-y: auto;
            color: #38bdf8;
            margin: 0;
        }}
        .refresh-btn {{
            background: var(--accent);
            color: #0f172a;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
        }}
        .refresh-btn:hover {{ opacity: 0.9; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>VisionRAG Visible System Progress Database</h1>
            <p style="color: var(--text-muted); margin: 4px 0 0 0; font-size: 13px;">
                Active Progress Tracking, YOLO Detections, Video Frame Extractions, and Audio Transcriptions
            </p>
        </div>
        <div>
            <a href="/api/logs/export" class="refresh-btn" style="background: #475569; color: #fff; margin-right: 8px;">Export JSON</a>
            <button onclick="location.reload()" class="refresh-btn">Refresh Live</button>
        </div>
    </div>

    <div class="stats-bar">
        <div class="stat-card">
            <div class="stat-val">{stats.get('total_logs', 0)}</div>
            <div class="stat-lbl">Total Audit Records</div>
        </div>
        <div class="stat-card">
            <div class="stat-val">{len(stats.get('by_event_type', {}))}</div>
            <div class="stat-lbl">Unique Event Types</div>
        </div>
        <div class="stat-card">
            <div class="stat-val">{stats.get('latest_timestamp', 'N/A')[:19]}</div>
            <div class="stat-lbl">Latest Activity</div>
        </div>
    </div>

    <div style="margin-bottom: 16px;">
        <span style="font-size: 12px; color: var(--text-muted); margin-right: 8px;">Event Breakdown:</span>
        {events_html}
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Timestamp (UTC)</th>
                    <th>Level</th>
                    <th>Event Type</th>
                    <th>Logger</th>
                    <th>Message</th>
                    <th>Details & Progress Payload</th>
                </tr>
            </thead>
            <tbody>
                {table_rows if table_rows else '<tr><td colspan="7" style="text-align:center; padding: 20px;">No progress records logged yet.</td></tr>'}
            </tbody>
        </table>
    </div>
</body>
</html>"""
        return html

# Global simple logging database instance
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
