"""
Agentic AI Orchestrator for VisionRAG
Autonomous agent decision engine that manages tools, executes multimodal reasoning,
and synthesizes Google-like divided responses.
"""

from typing import Dict, Any, List, Optional
import re

from app.agents.tools import tools_registry
from app.rag.hybrid_retriever import hybrid_retriever
from app.rag.evidence_builder import evidence_builder
from app.vision.audio_transcriber import audio_service

class AgenticOrchestrator:
    """Orchestrates multi-tool execution and multimodal RAG reasoning."""

    def __init__(self):
        self.tools = tools_registry
        self.retriever = hybrid_retriever
        self.evidence_builder = evidence_builder
        self.audio_service = audio_service

    def plan_and_execute(
        self,
        prompt: str,
        attachments: Optional[List[Dict[str, Any]]] = None,
        voice_audio: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Main agentic entrypoint: analyze input, invoke tools, retrieve from ChromaDB, and build output.
        """
        executed_tools = []
        tool_findings = {}

        # 1. Voice transcription if voice audio input was provided
        effective_query = prompt
        if voice_audio:
            transcript_res = self.audio_service.transcribe(voice_audio)
            transcribed_text = transcript_res.get("text", "")
            if transcribed_text:
                effective_query = f"{prompt} {transcribed_text}".strip()
                executed_tools.append("audio_whisper_transcriber")
                tool_findings["transcript"] = transcribed_text

        # 2. Vision inspection if images are attached
        has_images = False
        if attachments:
            for att in attachments:
                att_type = att.get("type", "")
                if "image" in att_type or att.get("name", "").lower().endswith((".png", ".jpg", ".jpeg")):
                    has_images = True
                    break

        if has_images or "detect" in effective_query.lower() or "image" in effective_query.lower():
            yolo_res = self.tools["yolo_vision"].execute("visual_asset")
            executed_tools.append("yolo_vision")
            tool_findings["yolo"] = yolo_res

        # 3. Calculation tool if math expressions detected
        calc_match = re.search(r'(\d+(?:\.\d+)?[\s\+\-\*\/]+\d+(?:\.\d+)?)', effective_query)
        if calc_match and any(op in effective_query for op in ["+", "-", "*", "/", "%", "calculate", "growth"]):
            calc_res = self.tools["calculator"].execute(calc_match.group(1))
            executed_tools.append("calculator")
            tool_findings["calculation"] = calc_res

        # 4. Hybrid Multimodal Retrieval from ChromaDB
        retrieved_items = self.retriever.retrieve(effective_query, top_k=4)
        executed_tools.append("chromadb_hybrid_retriever")

        # 5. Google Maps Geolocation Tool
        map_triggers = ["where", "location", "map", "place", "headquarters", "airport", "city", "addis", "lalibela", "axum", "gondar"]
        if any(trig in effective_query.lower() for trig in map_triggers) or retrieved_items:
            maps_res = self.tools["google_maps"].execute(effective_query)
            executed_tools.append("google_maps")
            tool_findings["maps"] = maps_res

        # 6. Real-time Search Tool
        search_res = self.tools["realtime_search"].execute(effective_query)
        executed_tools.append("realtime_search")
        tool_findings["search"] = search_res

        # 7. Synthesize into Google-Style Divided View Response
        response = self.evidence_builder.build_multimodal_response(effective_query, retrieved_items)

        # Enhance response with tool annotations
        if "yolo" in tool_findings:
            yolo_summary = tool_findings["yolo"].get("summary", "")
            response["text"] += f"\n\n**Visual Intelligence (YOLOv8):** {yolo_summary}"

        if "calculation" in tool_findings and "result" in tool_findings["calculation"]:
            calc_val = tool_findings["calculation"]["result"]
            response["text"] += f"\n\n**Analytical Calculation:** Result = `{calc_val}`."

        if "maps" in tool_findings:
            loc_info = tool_findings["maps"]
            # Inject verified map point if not already present
            existing_maps = response["multimodal"]["maps"]
            if not any(m.get("locationName") == loc_info.get("locationName") for m in existing_maps):
                existing_maps.insert(0, {
                    "id": "map-agent-verified",
                    "locationName": loc_info.get("locationName", "Verified Geolocation"),
                    "coordinates": loc_info.get("coordinates", "9.0222° N, 38.7468° E"),
                    "region": loc_info.get("region", "Ethiopia Spatial Hub"),
                    "type": "Agentic Spatial Grounding"
                })

        response["agent_metadata"] = {
            "executed_tools": executed_tools,
            "tool_findings_count": len(tool_findings),
            "retrieved_count": len(retrieved_items)
        }

        return response

agent_orchestrator = AgenticOrchestrator()
