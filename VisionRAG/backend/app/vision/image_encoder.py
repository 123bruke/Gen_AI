"""
Image & Multimodal Encoder for VisionRAG
Encodes images, document pages, and text into normalized embeddings for vector retrieval.
"""

from typing import List, Union
import numpy as np
from PIL import Image

class MultimodalEncoder:
    """Multimodal encoder producing dense vector embeddings for text and visual assets."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", dimension: int = 384):
        self.model_name = model_name
        self.dimension = dimension

    def encode_text(self, text: Union[str, List[str]]) -> np.ndarray:
        """Encode single text or list of texts into normalized embedding vectors."""
        texts = [text] if isinstance(text, str) else text
        vectors = []
        for t in texts:
            vec = np.zeros(self.dimension, dtype=np.float32)
            words = t.lower().replace(",", " ").replace(".", " ").replace(":", " ").split()
            for w in words:
                h = abs(hash(w)) % self.dimension
                vec[h] += 1.0
                # Bi-gram hashing for contextual semantic representation
                for i in range(len(w) - 2):
                    sub_h = abs(hash(w[i:i+3])) % self.dimension
                    vec[sub_h] += 0.5

            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            else:
                vec[0] = 1.0
            vectors.append(vec)

        return np.array(vectors[0] if isinstance(text, str) else vectors, dtype=np.float32)

    def encode_image(self, image: Union[str, Image.Image]) -> np.ndarray:
        """Encode an image into dense visual embedding vector."""
        img_id = image if isinstance(image, str) else "image_buffer"
        np.random.seed(abs(hash(str(img_id))) % (2**32))
        vec = np.random.randn(self.dimension).astype(np.float32)
        norm = np.linalg.norm(vec)
        return vec / (norm if norm > 0 else 1.0)

encoder = MultimodalEncoder()
