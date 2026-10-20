"""
ChromaDB Vector Store Client for VisionRAG
Supports ChromaDB HTTP client with persistent local vector fallback for multimodal embeddings.
"""

from typing import List, Dict, Any, Optional
import os
import json
import numpy as np

class LocalVectorCollection:
    """Embedded fallback vector collection with cosine similarity calculation."""

    def __init__(self, name: str, storage_file: str):
        self.name = name
        self.storage_file = storage_file
        self.records: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r", encoding="utf-8") as f:
                    self.records = json.load(f)
            except Exception:
                self.records = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_file), exist_ok=True)
        try:
            with open(self.storage_file, "w", encoding="utf-8") as f:
                json.dump(self.records, f, indent=2)
        except Exception:
            pass

    def upsert(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]]):
        for item_id, emb, doc, meta in zip(ids, embeddings, documents, metadatas):
            self.records[item_id] = {
                "id": item_id,
                "embedding": emb,
                "document": doc,
                "metadata": meta
            }
        self._save()

    def query(self, query_embeddings: List[List[float]], n_results: int = 5, where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.records or not query_embeddings:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        query_vec = np.array(query_embeddings[0], dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q > 0:
            query_vec /= norm_q

        scored_items = []
        for item_id, data in self.records.items():
            # Check where filter if provided
            if where:
                match = True
                for k, v in where.items():
                    if data.get("metadata", {}).get(k) != v:
                        match = False
                        break
                if not match:
                    continue

            item_vec = np.array(data["embedding"], dtype=np.float32)
            norm_i = np.linalg.norm(item_vec)
            if norm_i > 0:
                item_vec /= norm_i

            cos_sim = float(np.dot(query_vec, item_vec))
            # Chroma distance = 1 - cosine_similarity
            distance = round(1.0 - cos_sim, 4)
            scored_items.append((distance, data))

        # Sort by lowest distance (highest similarity)
        scored_items.sort(key=lambda x: x[0])
        top = scored_items[:n_results]

        ids = [item[1]["id"] for item in top]
        docs = [item[1]["document"] for item in top]
        metas = [item[1]["metadata"] for item in top]
        dists = [item[0] for item in top]

        return {
            "ids": [ids],
            "documents": [docs],
            "metadatas": [metas],
            "distances": [dists]
        }

    def count(self) -> int:
        return len(self.records)


class ChromaVectorStore:
    """Manages persistent multimodal vector collections in ChromaDB with local fallback."""

    def __init__(self, persist_dir: Optional[str] = None):
        if persist_dir is None:
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
            self.persist_dir = os.path.join(project_root, "storage", "chromadb")
        else:
            self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)
        self.client = None
        self.collection = None
        self._use_fallback = False
        self._init_client()

    def _init_client(self):
        import socket
        port_open = False
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.05)
                port_open = (s.connect_ex(("127.0.0.1", 8000)) == 0)
        except Exception:
            port_open = False

        if port_open:
            try:
                import chromadb
                client = chromadb.HttpClient(host="localhost", port=8000)
                self.collection = client.get_or_create_collection(
                    name="ethiopia_multimodal_knowledge",
                    metadata={"description": "Multimodal RAG layer for Ethiopian enterprises and media"}
                )
                self.client = client
                return
            except Exception:
                pass

        # Resilient embedded vector collection
        storage_file = os.path.join(self.persist_dir, "ethiopia_vectors.json")
        self.collection = LocalVectorCollection("ethiopia_multimodal_knowledge", storage_file)
        self._use_fallback = True

    def add_item(
        self,
        item_id: str,
        embedding: List[float],
        document: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Add a single vector entry with document text and reference metadata."""
        try:
            self.collection.upsert(
                ids=[item_id],
                embeddings=[embedding],
                documents=[document],
                metadatas=[metadata]
            )
            return True
        except Exception:
            return False

    def query(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Query nearest neighbor embeddings from ChromaDB / vector store."""
        try:
            query_kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": n_results
            }
            if where_filter:
                query_kwargs["where"] = where_filter

            return self.collection.query(**query_kwargs)
        except Exception:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    def is_healthy(self) -> bool:
        """Returns True if connected to ChromaDB service."""
        return not self._use_fallback and self.client is not None

chroma_store = ChromaVectorStore()
chroma_client = chroma_store
