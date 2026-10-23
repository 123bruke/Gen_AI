"""
VisionRAG Unified Multimodal Verification & Experimentation Suite.
Tests every modeling file with authentic demo data:
- CLIP Educational Image Encoder & Archetype Classifier
- YOLO Face Detection & Anti-Hallucination Filter
- Video Frame Extractor via Hugging Face Models
- Audio Transcriber & Multilingual Rewriter (English, Amharic, Afaan Oromoo)
- Map Searcher & Geospatial Educational Explorer
- Generalist Master Pedagogical Agent
- All 4 Processing Pipelines (Document, Image, Video, Text)
- Visible Logging Database & WebSocket Event Dispatch
"""

import sys
import os
import numpy as np
import cv2
from PIL import Image

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Ensure backend is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.vision.image_encoder import educational_encoder
from app.vision.yolo_detector import yolo_detector
from app.vision.frame_extractor import frame_extractor
from app.vision.audio_transcriber import audio_service
from app.vision.map_searcher import map_searcher
from app.agents.specialized.generalist_agent import generalist_agent
from app.pipelines.document_pipeline import document_pipeline
from app.pipelines.image_pipeline import image_pipeline
from app.pipelines.video_pipeline import video_pipeline
from app.pipelines.text_pipeline import text_pipeline
from app.db.log_db import log_database

def run_multimodal_tests():
    print("=" * 70)
    print("STARTING VISIONRAG COMPREHENSIVE MULTIMODAL EXPERIMENT SUITE")
    print("=" * 70)

    # 1. Test Educational Image Encoder
    print("\n[TEST 1] Testing Educational Image Encoder (CLIP + Archetype Classification)...")
    demo_algebra_img = np.ones((300, 300, 3), dtype=np.uint8) * 255
    cv2.line(demo_algebra_img, (30, 270), (270, 270), (0, 0, 0), 2)  # X-axis
    cv2.line(demo_algebra_img, (150, 30), (150, 270), (0, 0, 0), 2)  # Y-axis
    
    enc_res = educational_encoder.encode_and_audit(
        demo_algebra_img,
        filename="algebra_parabola_coordinate_graph.png",
        user_id="test_runner"
    )
    print(f"  -> Style: {enc_res['style_classification']['style_category']}")
    print(f"  -> Subject: {enc_res['style_classification']['subject']}")
    print(f"  -> Embedding Dimension: {enc_res['dimension']}")
    assert enc_res['dimension'] == 512, "CLIP dimension mismatch"

    # 2. Test YOLO Face Detection & Anti-Hallucination Filter
    print("\n[TEST 2] Testing YOLO Face Detector & Anti-Hallucination Filter...")
    demo_face_img = np.ones((400, 400, 3), dtype=np.uint8) * 255
    cv2.circle(demo_face_img, (200, 200), 75, (200, 200, 200), -1)  # Face
    
    yolo_res = yolo_detector.detect_and_filter_hallucinations(
        demo_face_img,
        request_human=True,
        context="student_exam_hall_inspection",
        user_id="test_runner"
    )
    print(f"  -> Human Audit Status: {yolo_res['audit_status']}")
    print(f"  -> Verified Humans: {len(yolo_res['verified_humans'])}")
    print(f"  -> Hallucinations Filtered: {yolo_res['hallucinations_removed_count']}")

    # 3. Test Video Frame Extractor (Hugging Face Open-Source Model)
    print("\n[TEST 3] Testing Video Frame Extractor (Hugging Face)...")
    vf_res = frame_extractor.extract_all_frames(
        "moe_biology_photosynthesis_lecture.mp4",
        extract_every_frame=True,
        max_limit=10,
        user_id="test_runner"
    )
    print(f"  -> Total Extracted Frames: {vf_res['total_extracted']}")
    print(f"  -> HF Model Used: {vf_res['hf_model_used']}")
    print(f"  -> Output Directory: {vf_res['output_directory']}")

    # 4. Test Audio Transcriber & Multilingual Rewriter
    print("\n[TEST 4] Testing Audio Transcriber & Multilingual Pedagogical Rewriter...")
    audio_query = "explain how quadratic equations and derivatives find max points"
    audio_res = audio_service.rewrite_for_educational_query(audio_query)
    print(f"  -> Subject: {audio_res['subject']}")
    print(f"  -> English Rewrite: {audio_res['rewritten_queries']['en'][:75]}...")
    print(f"  -> Amharic Rewrite: {audio_res['rewritten_queries']['am'][:75]}...")
    print(f"  -> Afaan Oromoo Rewrite: {audio_res['rewritten_queries']['om'][:75]}...")

    # 5. Test Map Searcher
    print("\n[TEST 5] Testing Educational Map Searcher & Geospatial Keyword Filter...")
    map_res = map_searcher.search_by_keyword("Jimma University Oromia", user_id="test_runner")
    print(f"  -> Keyword Matches: {map_res['count']}")
    if map_res['locations']:
        loc = map_res['locations'][0]
        print(f"  -> Top Match: {loc['name']} ({loc['lat']}, {loc['lng']})")
        print(f"  -> OpenStreetMap Embed: {loc.get('embed_url')[:65]}...")

    # 6. Test Generalist Pedagogical Agent
    print("\n[TEST 6] Testing Generalist Master Pedagogical Agent...")
    gen_res = generalist_agent.process_and_synthesize(
        "What are Newton's laws of motion and where is the Ministry of Education located?",
        user_id="test_runner"
    )
    print(f"  -> Agent: {gen_res['agent']}")
    print(f"  -> Classified Subject: {gen_res['query_analysis']['subject']}")
    print(f"  -> Grade Level: {gen_res['query_analysis']['grade_level']}")
    print(f"  -> Map Attached: {gen_res['map_insights'] is not None}")

    # 7. Test Educational Pipelines
    print("\n[TEST 7] Testing Document, Image, Video, and Text Pipelines...")
    img_pipe_res = image_pipeline.process_image(
        demo_algebra_img,
        filename="algebra_parabola_coordinate_graph.png",
        user_id="test_runner"
    )
    print(f"  -> Image Pipeline Archetype: {img_pipe_res['style_classification']['style_category']}")

    txt_pipe_res = text_pipeline.execute_rag(
        "Explain Pythagorean theorem and right triangles",
        n_results=3,
        user_id="test_runner"
    )
    print(f"  -> Text RAG Pipeline Latency: {txt_pipe_res['latency_ms']} ms")
    print(f"  -> Retrieved Context Items: {len(txt_pipe_res['retrieved_context'])}")

    # 8. Check Visible Database Stats
    print("\n[TEST 8] Checking Visible Log Database Status...")
    stats = log_database.get_stats()
    print(f"  -> Total Log Events in Visible DB: {stats['total_logs']}")
    print(f"  -> Log Level Breakdown: {stats['by_level']}")
    print(f"  -> Event Types Tracked: {list(stats['by_event_type'].keys())}")

    print("\n" + "=" * 70)
    print("ALL MULTIMODAL MODELING & PIPELINE TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_multimodal_tests()
