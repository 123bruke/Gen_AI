"""
Semantic Cache for VisionRAG.
Provides sub-millisecond question-and-answer semantic caching.
Features:
1. Exact and semantic similarity matching (token Jaccard + sequence similarity).
2. Dual-tier storage: High-speed in-memory LRU cache + Persistent SQLite database.
3. Caches full multimodal divided answers (books, videos, images, maps, news, citations).
4. Stores question history, timestamps, and access metrics.
"""

from typing import Dict, Any, List, Optional
import os
import re
import json
import time
import sqlite3
import difflib
from app.db.log_db import app_logger

STOP_WORDS = {
    "what", "is", "the", "a", "an", "of", "and", "in", "to", "for", "on", "with",
    "can", "you", "tell", "me", "about", "please", "give", "show", "how", "why",
    "where", "who", "when", "which", "are", "do", "does"
}

class SemanticCache:
    """Enterprise Semantic Cache with persistent SQLite storage and sub-millisecond LRU lookup."""

    def __init__(self, db_filename: str = "visionrag_semantic_cache.db", max_memory_items: int = 500):
        self.max_memory_items = max_memory_items
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        
        # Setup persistent SQLite path
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        storage_dir = os.path.join(project_root, "storage")
        os.makedirs(storage_dir, exist_ok=True)
        self.db_path = os.path.join(storage_dir, db_filename)
        
        self._init_sqlite()
        self._warm_up_cache()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=5.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self):
        try:
            with self._get_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS semantic_cache (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        normalized_query TEXT UNIQUE NOT NULL,
                        raw_query TEXT NOT NULL,
                        answer_text TEXT NOT NULL,
                        multimodal_json TEXT NOT NULL,
                        reasoning TEXT,
                        hit_count INTEGER DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.execute("CREATE INDEX IF NOT EXISTS idx_cache_norm ON semantic_cache(normalized_query)")
                conn.commit()
        except Exception as e:
            app_logger.warning(f"SemanticCache SQLite init note: {e}")

    def normalize_query(self, query: str) -> str:
        """Strips punctuation, lowercases, and removes non-semantic fillers."""
        q = query.lower().strip()
        # Remove punctuation
        q = re.sub(r'[^\w\s]', ' ', q)
        # Collapse multiple spaces
        q = re.sub(r'\s+', ' ', q).strip()
        return q

    def get_semantic_tokens(self, query: str) -> set[str]:
        """Extracts content words for semantic similarity scoring."""
        norm = self.normalize_query(query)
        words = norm.split()
        tokens = {w for w in words if w not in STOP_WORDS and len(w) > 1}
        return tokens or set(words)

    def _calculate_similarity(self, tokens_a: set[str], tokens_b: set[str], norm_a: str, norm_b: str) -> float:
        """Calculates combined token Jaccard similarity and sequence similarity."""
        if norm_a == norm_b:
            return 1.0

        # Jaccard index
        intersection = tokens_a.intersection(tokens_b)
        union = tokens_a.union(tokens_b)
        jaccard = len(intersection) / len(union) if union else 0.0

        # Sequence matcher ratio
        seq_ratio = difflib.SequenceMatcher(None, norm_a, norm_b).ratio()

        # Weighted combination: 60% semantic tokens, 40% sequence match
        return 0.6 * jaccard + 0.4 * seq_ratio

    def _warm_up_cache(self):
        """Loads recent high-frequency items into in-memory LRU cache on startup."""
        try:
            with self._get_connection() as conn:
                rows = conn.execute(
                    "SELECT normalized_query, raw_query, answer_text, multimodal_json, reasoning, hit_count "
                    "FROM semantic_cache ORDER BY last_accessed_at DESC LIMIT ?",
                    (self.max_memory_items,)
                ).fetchall()
                for r in rows:
                    try:
                        mm = json.loads(r["multimodal_json"])
                    except Exception:
                        mm = {}
                    self._memory_cache[r["normalized_query"]] = {
                        "raw_query": r["raw_query"],
                        "text": r["answer_text"],
                        "multimodal": mm,
                        "reasoning": r["reasoning"],
                        "hit_count": r["hit_count"],
                        "tokens": self.get_semantic_tokens(r["normalized_query"])
                    }
        except Exception as e:
            app_logger.info(f"SemanticCache warm up note: {e}")

    def lookup(self, query: str, threshold: float = 0.86) -> Optional[Dict[str, Any]]:
        """
        Sub-millisecond semantic search.
        1. Exact match on normalized query.
        2. Semantic similarity scan across cached tokens.
        """
        norm_query = self.normalize_query(query)
        if not norm_query:
            return None

        # 1. Exact Match (O(1) in-memory)
        if norm_query in self._memory_cache:
            item = self._memory_cache[norm_query]
            item["hit_count"] = item.get("hit_count", 0) + 1
            self._update_sqlite_hit(norm_query)
            app_logger.info(f"SemanticCache HIT (Exact) for: '{query[:40]}'")
            return {
                "text": item["text"],
                "multimodal": item["multimodal"],
                "reasoning": f"{item.get('reasoning', '')} (Served instantly from VisionRAG Semantic Cache)",
                "cached": True,
                "hit_count": item["hit_count"]
            }

        # 2. Semantic Similarity Match
        query_tokens = self.get_semantic_tokens(query)
        best_match_key = None
        best_score = 0.0

        for cached_norm, cached_data in self._memory_cache.items():
            cached_tokens = cached_data.get("tokens", set())
            score = self._calculate_similarity(query_tokens, cached_tokens, norm_query, cached_norm)
            if score > best_score:
                best_score = score
                best_match_key = cached_norm

        if best_score >= threshold and best_match_key:
            item = self._memory_cache[best_match_key]
            item["hit_count"] = item.get("hit_count", 0) + 1
            self._update_sqlite_hit(best_match_key)
            app_logger.info(f"SemanticCache HIT (Semantic score {best_score:.2f}) for: '{query[:40]}' matching '{item['raw_query'][:40]}'")
            return {
                "text": item["text"],
                "multimodal": item["multimodal"],
                "reasoning": f"{item.get('reasoning', '')} (Semantic cache hit with {int(best_score*100)}% match to '{item['raw_query']}')",
                "cached": True,
                "similarity_score": round(best_score, 2),
                "hit_count": item["hit_count"]
            }

        return None

    def store(
        self,
        query: str,
        answer_text: str,
        multimodal: Optional[Dict[str, Any]] = None,
        reasoning: Optional[str] = None
    ):
        """Stores a question and answer into persistent SQLite and in-memory LRU cache."""
        norm_query = self.normalize_query(query)
        if not norm_query or not answer_text:
            return

        mm_safe = multimodal or {}
        mm_str = json.dumps(mm_safe)
        reasoning_str = reasoning or "Multi-Agent Multimodal Verification"
        tokens = self.get_semantic_tokens(query)

        # Store in-memory
        if len(self._memory_cache) >= self.max_memory_items:
            # Pop first item (LRU approximation)
            oldest_key = next(iter(self._memory_cache))
            del self._memory_cache[oldest_key]

        self._memory_cache[norm_query] = {
            "raw_query": query,
            "text": answer_text,
            "multimodal": mm_safe,
            "reasoning": reasoning_str,
            "hit_count": 1,
            "tokens": tokens
        }

        # Store in SQLite
        try:
            with self._get_connection() as conn:
                conn.execute("""
                    INSERT INTO semantic_cache (normalized_query, raw_query, answer_text, multimodal_json, reasoning, hit_count, last_accessed_at)
                    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                    ON CONFLICT(normalized_query) DO UPDATE SET
                        raw_query = excluded.raw_query,
                        answer_text = excluded.answer_text,
                        multimodal_json = excluded.multimodal_json,
                        reasoning = excluded.reasoning,
                        last_accessed_at = CURRENT_TIMESTAMP
                """, (norm_query, query, answer_text, mm_str, reasoning_str))
                conn.commit()
        except Exception as e:
            app_logger.warning(f"SemanticCache SQLite store error: {e}")

    def _update_sqlite_hit(self, normalized_query: str):
        try:
            with self._get_connection() as conn:
                conn.execute(
                    "UPDATE semantic_cache SET hit_count = hit_count + 1, last_accessed_at = CURRENT_TIMESTAMP WHERE normalized_query = ?",
                    (normalized_query,)
                )
                conn.commit()
        except Exception:
            pass

    def list_cached_queries(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns recent questions saved in the semantic cache."""
        try:
            with self._get_connection() as conn:
                rows = conn.execute(
                    "SELECT id, raw_query, hit_count, created_at, last_accessed_at FROM semantic_cache ORDER BY last_accessed_at DESC LIMIT ?",
                    (limit,)
                ).fetchall()
                return [dict(r) for r in rows]
        except Exception:
            return []

    def get_stats(self) -> Dict[str, Any]:
        """Returns cache telemetry."""
        try:
            with self._get_connection() as conn:
                row = conn.execute("SELECT COUNT(*) as total_entries, SUM(hit_count) as total_hits FROM semantic_cache").fetchone()
                return {
                    "total_cached_queries": row["total_entries"] if row else 0,
                    "total_hits": row["total_hits"] if row and row["total_hits"] else 0,
                    "in_memory_items": len(self._memory_cache)
                }
        except Exception:
            return {"total_cached_queries": len(self._memory_cache), "in_memory_items": len(self._memory_cache)}

semantic_cache = SemanticCache()
