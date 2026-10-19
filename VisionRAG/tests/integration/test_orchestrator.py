"""
Integration Tests for VisionRAG Autonomous Agentic AI Orchestrator
Validates Multi-Tool Execution, Geolocation Grounding, Math Calculation,
and Google-Style Divided Multimodal Response Synthesis.
"""

import pytest
from app.agents.orchestrator import agent_orchestrator

def test_agent_orchestrator_ethiopian_query(sample_ethiopian_query):
    response = agent_orchestrator.plan_and_execute(sample_ethiopian_query)

    assert "text" in response
    assert len(response["text"]) > 0

    # Verify agent metadata
    metadata = response.get("agent_metadata", {})
    executed_tools = metadata.get("executed_tools", [])
    assert "chromadb_hybrid_retriever" in executed_tools
    assert "google_maps" in executed_tools

    # Verify Google-style divided multimodal response structures
    multimodal = response.get("multimodal", {})
    assert "images" in multimodal
    assert "videos" in multimodal
    assert "news" in multimodal
    assert "maps" in multimodal
    assert "papers" in multimodal

    # Verify items are populated
    assert len(multimodal["images"]) > 0
    assert len(multimodal["videos"]) > 0
    assert len(multimodal["maps"]) > 0

def test_agent_orchestrator_math_and_calculation(sample_math_query):
    response = agent_orchestrator.plan_and_execute(sample_math_query)

    metadata = response.get("agent_metadata", {})
    executed_tools = metadata.get("executed_tools", [])
    assert "calculator" in executed_tools
    assert "1725" in response["text"]

def test_agent_orchestrator_with_image_attachment():
    attachments = [{"name": "aircraft_engine.png", "type": "image/png"}]
    response = agent_orchestrator.plan_and_execute(
        prompt="Inspect this jet engine and detect salient components",
        attachments=attachments
    )

    metadata = response.get("agent_metadata", {})
    executed_tools = metadata.get("executed_tools", [])
    assert "yolo_vision" in executed_tools
    assert "Visual Intelligence" in response["text"]
