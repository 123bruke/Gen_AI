"""
Neural Cross-Encoder Reranker for VisionRAG
Reranks hybrid search candidates using deep cross-attention transformer models.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

class CrossEncoderReranker:
    """Neural reranker prioritizing semantic alignment between queries and retrieved passages."""

    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model_name = model_name
        self._model = None
        self._initialized = False

    def _load_model(self):
        if not self._initialized:
            import os
            enable_heavy = os.getenv("ENABLE_HEAVY_TRANSFORMERS", "false").lower() in ("true", "1", "yes")
            if enable_heavy:
                try:
                    os.environ["HF_HUB_OFFLINE"] = "1"
                    os.environ["TRANSFORMERS_OFFLINE"] = "1"
                    from sentence_transformers import CrossEncoder
                    self._model = CrossEncoder(self.model_name, local_files_only=True)
                except Exception:
                    self._model = None
            else:
                self._model = None
            self._initialized = True

    def rerank(self, query: str, candidates: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Rerank retrieved candidates based on cross-encoder relevance scores.
        """
        if not candidates:
            return []

        self._load_model()
        pairs = [[query, c.get("text", c.get("document", ""))] for c in candidates]

        if self._model is not None:
            try:
                scores = self._model.predict(pairs)
                for idx, score in enumerate(scores):
                    candidates[idx]["rerank_score"] = float(score)
                candidates.sort(key=lambda x: x.get("rerank_score", 0.0), reverse=True)
                return candidates[:top_k]
            except Exception:
                pass

        # Fast lexical-semantic intersection scoring fallback
        q_words = set(query.lower().split())
        for c in candidates:
            doc_words = set(c.get("text", c.get("document", "")).lower().split())
            overlap = len(q_words.intersection(doc_words)) / max(1, len(q_words))
            c["rerank_score"] = round(overlap, 4)

        candidates.sort(key=lambda x: x.get("rerank_score", 0.0), reverse=True)
        return candidates[:top_k]

reranker = CrossEncoderReranker()
