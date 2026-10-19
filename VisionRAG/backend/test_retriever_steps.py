import sys, time
sys.path.insert(0, 'backend')

from app.db.chroma_client import chroma_store
from app.rag.embeddings import embedding_service
from app.rag.reranker import reranker
from app.db.redis_cache import cache_manager

query = "What is the fleet size of Ethiopian Airlines?"

print("A. Cache get...")
t0 = time.time()
c = cache_manager.get("test")
print("Cache get in", time.time() - t0)

print("B. Embed query...")
t0 = time.time()
q_emb = embedding_service.embed_query(query)
print("Embed in", time.time() - t0, "dim:", len(q_emb))

print("C. Chroma query...")
t0 = time.time()
dense_results = chroma_store.query(query_embedding=q_emb, n_results=4)
print("Chroma query in", time.time() - t0, "docs:", len(dense_results.get("documents", [[]])[0]))

print("D. Reranker...")
candidates = [{"id": "1", "document": "Ethiopian Airlines operates over 140 modern aircraft."}]
t0 = time.time()
reranked = reranker.rerank(query, candidates, top_k=1)
print("Reranker in", time.time() - t0, "result:", reranked)
print("ALL SUB-STEPS COMPLETE!")
