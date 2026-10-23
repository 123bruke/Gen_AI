"""
VisionRAG Multimodal Image Pipeline
Orchestrates educational image classification, CLIP visual feature extraction,
YOLO human verification / anti-hallucination filtering, and search indexing.
"""

from typing import Dict, Any, Optional, List, Union
import os
import logging
from PIL import Image
import numpy as np

from app.vision.image_encoder import educational_encoder
from app.vision.yolo_detector import yolo_detector
from app.db.log_db import log_database

logger = logging.getLogger("visionrag.image_pipeline")

class EducationalImagePipeline:
    """
    End-to-End Image Processing Pipeline for Ethiopian MOE Educational Visuals.
    - Classifies educational archetype (Algebra, Geometry, Chemistry, Physics, Biology, MOE Documents)
    - Generates 512-dim CLIP feature embeddings with disk caching
    - Detects human faces / candidate presence with YOLO & OpenCV Haar Cascades
    - Identifies and purges visual hallucinations or non-human impersonations
    - Audits every step in the visible log database
    """

    def __init__(self):
        self.encoder = educational_encoder
        self.detector = yolo_detector

    def process_image(
        self,
        image_source: Union[str, np.ndarray, Image.Image],
        filename: Optional[str] = None,
        user_id: Optional[str] = "student_moe",
        request_human: bool = False,
        context: str = "educational_content_inspection"
    ) -> Dict[str, Any]:
        """
        Processes an image through encoding, archetype classification, and anti-hallucination inspection.
        """
        source_name = filename or (os.path.basename(image_source) if isinstance(image_source, str) else "in_memory_image")

        # 1. Educational CLIP Encoding and Archetype Classification
        encoding_result = self.encoder.encode_and_audit(
            image_source=image_source,
            filename=source_name,
            user_id=user_id
        )

        # 2. YOLO Human Verification & Anti-Hallucination Inspection
        detection_result = self.detector.detect_and_filter_hallucinations(
            source=image_source,
            request_human=request_human,
            context=context,
            user_id=user_id
        )

        pipeline_result = {
            "status": "success",
            "filename": source_name,
            "style_classification": encoding_result.get("style_classification"),
            "embedding_dimension": encoding_result.get("dimension", 512),
            "cached": encoding_result.get("cached", False),
            "human_verification": {
                "is_valid_human": detection_result.get("is_valid_human"),
                "human_count": detection_result.get("human_count"),
                "verified_humans": detection_result.get("verified_humans"),
                "hallucinations_removed_count": detection_result.get("hallucinations_removed_count"),
                "audit_status": detection_result.get("audit_status"),
                "summary": detection_result.get("summary")
            }
        }

        # 3. Log pipeline completion
        log_database.record_event(
            event_type="IMAGE_PIPELINE_COMPLETE",
            stage="IMAGE_PIPELINE",
            status="SUCCESS",
            user_id=user_id,
            payload={
                "filename": source_name,
                "subject": encoding_result.get("style_classification", {}).get("subject"),
                "archetype": encoding_result.get("style_classification", {}).get("style_category"),
                "hallucinations_purged": detection_result.get("hallucinations_removed_count", 0)
            }
        )

        return pipeline_result

image_pipeline = EducationalImagePipeline()
