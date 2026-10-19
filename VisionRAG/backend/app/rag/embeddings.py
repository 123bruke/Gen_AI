"""
Embedding Provider for VisionRAG Pipeline
Bridges text and image encoding to ChromaDB vector layers.
"""

from typing import List, Union
import numpy as np
from app.vision.image_encoder import encoder

class EmbeddingService:
    """Provides high-throughput normalized vector embeddings for RAG queries."""

    def __init__(self):
        self.encoder = encoder

    def embed_query(self, text: str) -> List[float]:
        vec = self.encoder.encode_text(text)
        return vec.tolist() if isinstance(vec, np.ndarray) else list(vec)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        vecs = self.encoder.encode_text(texts)
        if isinstance(vecs, np.ndarray):
            return [v.tolist() for v in vecs]
        return [list(v) for v in vecs]

embedding_service = EmbeddingService()
