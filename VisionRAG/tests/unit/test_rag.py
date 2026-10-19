"""
Unit Tests for VisionRAG Retrieval and Database Subsystems
Validates Hybrid Search, Reciprocal Rank Fusion (RRF), Cross-Encoder Reranker,
ChromaDB Vector Store, Redis Cache, and SQLite Metadata Store.
"""

import pytest
from app.rag.hybrid_retriever import hybrid_retriever
from app.rag.reranker import reranker
from app.db.chroma_client import chroma_store
from app.db.redis_cache import cache_manager
from app.db.metadata_store import meta_store

def test_chroma_store_indexing_and_query():
    # Insert test vector
    test_id = "test-doc-1"
    test_emb = [0.1] * 384
    test_doc = "Ethiopian Airlines cargo hub at Bole Addis Ababa"
    test_meta = {"title": "Cargo Operations", "category": "aviation"}

    success = chroma_store.add_item(test_id, test_emb, test_doc, test_meta)
    assert success is True

    # Query nearest vector
    query_results = chroma_store.query(query_embedding=test_emb, n_results=1)
    ids = query_results["ids"][0]
    assert test_id in ids

def test_redis_cache_set_and_get():
    key = "test:query:ethiopia"
    val = {"answer": "Bole International Airport", "cached": True}
    cache_manager.set(key, val, ttl_seconds=60)

    retrieved = cache_manager.get(key)
    assert retrieved is not None
    assert retrieved.get("answer") == "Bole International Airport"

def test_metadata_store_record_and_retrieve():
    meta_store.record_reference(
        item_id="meta-test-1",
        url="https://example.com/telebirr",
        title="Telebirr Mobile Money",
        category="telecom",
        content_hash="abc123hash",
        source_type="ethiopia_corpus"
    )

    rec = meta_store.get_reference("meta-test-1")
    assert rec is not None
    assert rec["title"] == "Telebirr Mobile Money"
    assert rec["category"] == "telecom"
    assert meta_store.count() >= 1

def test_hybrid_retriever_dense_and_sparse():
    query = "Ethiopian Airlines aircraft fleet Boeing"
    results = hybrid_retriever.retrieve(query, top_k=3)
    assert len(results) > 0
    # Every result must have rrf_score or rerank_score
    first = results[0]
    assert "rrf_score" in first or "rerank_score" in first

def test_reranker_ordering():
    query = "telecom mobile money transactions"
    candidates = [
        {"id": "doc-a", "document": "Lalibela rock hewn churches architectural survey", "text": "Lalibela rock hewn churches"},
        {"id": "doc-b", "document": "Ethio telecom Telebirr processed over 1.6 trillion ETB in transactions", "text": "Ethio telecom Telebirr mobile transactions"}
    ]
    reranked = reranker.rerank(query, candidates, top_k=2)
    assert len(reranked) == 2
    # The telecom document should score higher for a telecom query
    assert reranked[0]["id"] == "doc-b"
