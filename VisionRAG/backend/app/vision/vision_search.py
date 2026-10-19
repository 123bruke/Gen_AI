"""
Vision Search & Multimodal Query Engine for VisionRAG
Combines YOLO object detection and dense visual encoding for queries against multimodal assets.
"""

from typing import List, Dict, Any, Union
import numpy as np
from PIL import Image

from app.vision.yolo_detector import detector
from app.vision.image_encoder import encoder
from app.vision.frame_extractor import frame_extractor

class VisionSearchEngine:
    """End-to-end vision processing: object detection, visual embedding, and visual reasoning."""

    def __init__(self):
        self.detector = detector
        self.encoder = encoder
        self.frame_extractor = frame_extractor

    def process_image(self, image_source: Union[str, Image.Image]) -> Dict[str, Any]:
        """
        Analyze an image by detecting objects with YOLO and generating a dense CLIP vector.
        """
        detections = self.detector.detect(image_source)
        summary = self.detector.summarize_detections(detections)
        vector = self.encoder.encode_image(image_source)

        return {
            "detections": detections,
            "summary": summary,
            "embedding": vector.tolist() if isinstance(vector, np.ndarray) else vector,
            "salient_labels": list(set(d.get("label") for d in detections))
        }

    def process_video(self, video_path: str) -> Dict[str, Any]:
        """
        Analyze video by extracting keyframes, running detections, and generating scene descriptions.
        """
        keyframes = self.frame_extractor.extract_keyframes(video_path)
        analyzed_frames = []

        for kf in keyframes[:5]:
            analyzed_frames.append({
                "timestamp": kf.get("timestamp"),
                "seconds": kf.get("seconds"),
                "description": kf.get("description", "High salient visual frame"),
                "variance": kf.get("variance")
            })

        return {
            "total_keyframes": len(keyframes),
            "keyframes": analyzed_frames,
            "temporal_summary": f"Indexed {len(keyframes)} scene keyframes with temporal timestamps."
        }

vision_engine = VisionSearchEngine()
