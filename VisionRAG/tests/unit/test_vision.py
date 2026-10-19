"""
Unit Tests for Computer Vision, YOLOv8 Object Detection, and Audio Processing
"""

import numpy as np
import pytest
from app.vision.yolo_detector import detector
from app.vision.image_encoder import encoder
from app.vision.audio_transcriber import audio_service

def test_yolo_detection_on_synthetic_frame():
    # Create 300x300 RGB synthetic test frame
    frame = np.zeros((300, 300, 3), dtype=np.uint8)
    detections = detector.detect(frame)
    assert isinstance(detections, list)
    assert len(detections) > 0
    first = detections[0]
    assert "label" in first
    assert "box" in first
    assert len(first["box"]) == 4

def test_yolo_detection_summary():
    mock_detections = [
        {"label": "airplane", "confidence": 0.92, "box": [10, 10, 100, 100]},
        {"label": "person", "confidence": 0.85, "box": [20, 20, 50, 80]},
        {"label": "person", "confidence": 0.88, "box": [70, 20, 95, 80]}
    ]
    summary = detector.summarize_detections(mock_detections)
    assert "airplane" in summary
    assert "2 persons" in summary or "2 person" in summary

def test_multimodal_encoder_text_and_image():
    # Text encoding
    t_vec = encoder.encode_text("Ethiopian Airlines aviation hub")
    assert isinstance(t_vec, np.ndarray)
    assert t_vec.shape == (384,)
    # Vector should be normalized
    norm = np.linalg.norm(t_vec)
    assert pytest.approx(norm, rel=1e-3) == 1.0

    # Image encoding
    img_vec = encoder.encode_image("test_image_path.jpg")
    assert isinstance(img_vec, np.ndarray)
    assert img_vec.shape == (384,)
    assert pytest.approx(np.linalg.norm(img_vec), rel=1e-3) == 1.0

def test_audio_transcriber_and_tts():
    # Test speech transcription
    res = audio_service.transcribe(b"synthetic_audio_bytes")
    assert "text" in res
    assert len(res["text"]) > 0

    # Test speech synthesis
    tts_res = audio_service.synthesize_speech("Hello from VisionRAG")
    assert tts_res.get("status") == "synthesized"
    assert "format" in tts_res
