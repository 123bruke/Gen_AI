"""
Backend Service Adapter for Hugging Face CLIP Image Search Engine.
Exposes semantic visual search to VisionRAG agents, routers, and orchestrators.
"""

import os
import sys
from typing import List, Dict, Any, Union

# Import the core CLIP search engine from data/raw/images
DATA_IMAGES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "raw", "images"))
if DATA_IMAGES_DIR not in sys.path:
    sys.path.insert(0, DATA_IMAGES_DIR)

try:
    from clip_image_search import clip_search_engine, search_images_by_agent_keywords
except ImportError:
    # Direct import fallback
    import importlib.util
    spec = importlib.util.spec_from_file_location("clip_image_search", os.path.join(DATA_IMAGES_DIR, "clip_image_search.py"))
    clip_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(clip_module)
    clip_search_engine = clip_module.clip_search_engine
    search_images_by_agent_keywords = clip_module.search_images_by_agent_keywords

class CLIPVisualSearchService:
    """Service bridge for agentic image discovery via Hugging Face CLIP."""

    def __init__(self):
        self.engine = clip_search_engine

    def search_by_keywords(
        self,
        keywords: Union[str, List[str]],
        top_k: int = 4,
        sync_to_postgres: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Executes fast cached CLIP zero-shot search and persists matches into PostgreSQL.
        """
        return self.engine.search(keywords, top_k=top_k, sync_to_postgres=sync_to_postgres)

clip_visual_service = CLIPVisualSearchService()
