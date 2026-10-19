"""
Hybrid Dense + Sparse Retriever for VisionRAG
Combines semantic vector search (ChromaDB) with keyword matching using Reciprocal Rank Fusion (RRF)
and neural Cross-Encoder reranking.
"""

from typing import List, Dict, Any, Optional
import math
from collections import defaultdict

from app.db.chroma_client import chroma_store
from app.rag.embeddings import embedding_service
from app.rag.reranker import reranker
from app.db.redis_cache import cache_manager

class HybridRetriever:
    """Enterprise hybrid retrieval engine blending dense vector and sparse lexical rankings."""

    def __init__(self, rrf_k: int = 60):
        self.rrf_k = rrf_k
        self.chroma = chroma_store
        self.embedder = embedding_service
        self.reranker = reranker

    def _sparse_score(self, query: str, document: str) -> float:
        """Compute simple TF-IDF / BM25 style lexical score."""
        q_terms = [t for t in query.lower().split() if len(t) > 2]
        if not q_terms:
            return 0.0

        doc_lower = document.lower()
        score = 0.0
        doc_len = max(1, len(doc_lower.split()))

        for term in q_terms:
            tf = doc_lower.count(term)
            if tf > 0:
                # BM25 term saturation
                score += (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (doc_len / 50.0)))
        return score

    def retrieve(self, query: str, top_k: int = 5, where_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute end-to-end hybrid search: Dense + Sparse -> RRF -> Neural Reranking.
        """
        # 1. Check cache for query results
        cache_key = f"hybrid:{hash(query)}:{top_k}"
        cached = cache_manager.get(cache_key)
        if cached:
            return cached

        # 2. Dense Vector Retrieval (ChromaDB)
        query_emb = self.embedder.embed_query(query)
        dense_results = self.chroma.query(query_embedding=query_emb, n_results=top_k * 2, where_filter=where_filter)

        dense_candidates = []
        ids = dense_results.get("ids", [[]])[0]
        docs = dense_results.get("documents", [[]])[0]
        metas = dense_results.get("metadatas", [[]])[0]

        for i, item_id in enumerate(ids):
            dense_candidates.append({
                "id": item_id,
                "document": docs[i] if i < len(docs) else "",
                "metadata": metas[i] if i < len(metas) else {}
            })

        # 3. Sparse Retrieval Ranking
        sparse_candidates = []
        for cand in dense_candidates:
            score = self._sparse_score(query, cand["document"])
            sparse_candidates.append((score, cand))
        sparse_candidates.sort(key=lambda x: x[0], reverse=True)

        # 4. Reciprocal Rank Fusion (RRF)
        rrf_scores = defaultdict(float)
        candidate_map = {}

        # Dense rank contributions
        for rank, cand in enumerate(dense_candidates):
            cid = cand["id"]
            candidate_map[cid] = cand
            rrf_scores[cid] += 1.0 / (self.rrf_k + rank + 1)

        # Sparse rank contributions
        for rank, (score, cand) in enumerate(sparse_candidates):
            cid = cand["id"]
            candidate_map[cid] = cand
            rrf_scores[cid] += 1.0 / (self.rrf_k + rank + 1)

        # Sort by RRF score
        fused = []
        for cid, score in rrf_scores.items():
            item = dict(candidate_map[cid])
            item["rrf_score"] = round(score, 5)
            fused.append(item)
        fused.sort(key=lambda x: x["rrf_score"], reverse=True)

        # 5. Neural Cross-Encoder Reranking
        reranked = self.reranker.rerank(query, fused[:top_k * 2], top_k=top_k)

        # Cache response in Redis
        cache_manager.set(cache_key, reranked, ttl_seconds=1800)
        return reranked

hybrid_retriever = HybridRetriever()
