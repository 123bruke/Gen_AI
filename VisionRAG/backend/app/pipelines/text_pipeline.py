"""
VisionRAG High-Throughput Text RAG Pipeline (text_pipeline.py)
Orchestrates multilingual query rewriting, semantic embedding search in ChromaDB,
and pedagogical synthesis across English, Amharic, and Afaan Oromoo.
"""

from typing import List, Dict, Any, Optional
import time
import datetime
import logging

from app.rag.embeddings import embedding_service
from app.db.chroma_client import chroma_store
from app.agents.specialized.generalist_agent import generalist_agent
from app.db.log_db import log_database

logger = logging.getLogger("visionrag.text_pipeline")

class EducationalTextPipeline:
    """
    Multilingual Text Retrieval and Pedagogical Synthesis Pipeline.
    """

    def __init__(self):
        self.embedder = embedding_service
        self.chroma = chroma_store
        self.agent = generalist_agent

    def execute_rag(
        self,
        query: str,
        n_results: int = 5,
        user_id: Optional[str] = "student_moe",
        where_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end RAG on a student or teacher query:
        1. Query rewriting across English, Amharic, and Afaan Oromoo.
        2. Vector search in ChromaDB.
        3. Pedagogical answer synthesis.
        4. Structured audit logging in visible database.
        """
        start_time = time.time()

        # Step 1: Deep Pedagogical Query Rewriting
        rewrite = self.agent.rewrite_and_structure_query(query)
        en_query = rewrite["rewritten_queries"]["en"]

        # Step 2: Vector Search
        query_vec = self.embedder.embed_query(en_query)
        search_results = self.chroma.query(
            query_embedding=query_vec,
            n_results=n_results,
            where_filter=where_filter
        )

        doc_snippets = search_results.get("documents", [[]])[0]
        meta_snippets = search_results.get("metadatas", [[]])[0]
        distances = search_results.get("distances", [[]])[0]

        # Step 3: Pedagogical Synthesis
        synthesis = self.agent.process_and_synthesize(
            query=query,
            user_id=user_id,
            include_vision=False,
            include_map=True
        )

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        # Step 4: Record in Visible Log Database
        log_database.record_event(
            event_type="TEXT_RAG_PIPELINE_COMPLETE",
            stage="TEXT_PIPELINE",
            status="SUCCESS",
            user_id=user_id,
            payload={
                "query": query[:120],
                "subject": rewrite["subject"],
                "grade_level": rewrite["grade_level"],
                "results_retrieved": len(doc_snippets),
                "latency_ms": elapsed_ms
            }
        )

        return {
            "status": "success",
            "query": query,
            "query_analysis": rewrite,
            "synthesis": synthesis["academic_synthesis"],
            "retrieved_context": [
                {
                    "snippet": doc,
                    "metadata": meta,
                    "similarity_score": round(1.0 - dist, 4) if dist is not None else 0.95
                }
                for doc, meta, dist in zip(doc_snippets, meta_snippets, distances)
            ],
            "map_insights": synthesis.get("map_insights"),
            "latency_ms": elapsed_ms
        }

text_pipeline = EducationalTextPipeline()
