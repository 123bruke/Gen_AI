"""
Google Gemini API Client for VisionRAG.
Provides direct integration with Google Gemini 2.5 Flash, 2.0 Flash, and 1.5 Flash.
Supports:
1. Dynamic / Temporary API keys passed from frontend settings or environment.
2. Grounded text generation with multi-agent context.
3. Multimodal vision and audio transcription using Gemini's native multimodal API.
4. Resilient multi-model cascade with fallback.
"""

from typing import Dict, Any, List, Optional
import os
import json
import base64
import requests
from app.db.log_db import app_logger

class GeminiClient:
    """Production Gemini API Client for VisionRAG multimodal agentic reasoning."""

    # Models ordered by speed, capability, reliability, and broad key support
    DEFAULT_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash"]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")

    def get_effective_key(self, override_key: Optional[str] = None) -> str:
        """Returns the active API key, preferring per-request override."""
        if override_key and override_key.strip():
            return override_key.strip()
        if self.api_key and self.api_key.strip():
            return self.api_key.strip()
        return os.getenv("GEMINI_API_KEY", "").strip()

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        override_key: Optional[str] = None,
        preferred_model: Optional[str] = None,
        temperature: float = 0.4,
        max_output_tokens: int = 2048
    ) -> tuple[Optional[str], Optional[str]]:
        """
        Generates text using Google Gemini REST API.
        Returns (generated_text, reasoning_trace) or (None, None) if key is missing/fails.
        """
        active_key = self.get_effective_key(override_key)
        if not active_key:
            return None, None

        # Build prompt content with grounded multi-agent context
        prompt_parts = []
        if context:
            ctx_summary = []
            if context.get("retrieved_docs"):
                ctx_summary.append(f"Retrieved Documents: {' | '.join(context['retrieved_docs'][:3])}")
            if context.get("books"):
                ctx_summary.append(f"Educational Books: {', '.join(context['books'][:4])}")
            if context.get("videos"):
                ctx_summary.append(f"Relevant Videos: {', '.join(context['videos'][:3])}")
            if context.get("news"):
                ctx_summary.append(f"Recent News: {', '.join(context['news'][:3])}")
            if context.get("map"):
                ctx_summary.append(f"Location Landmark: {context['map']}")
            if context.get("vision"):
                ctx_summary.append(f"Visual Analysis: {context['vision']}")

            if ctx_summary:
                grounded_ctx = "\n".join(f"- {c}" for c in ctx_summary)
                prompt_parts.append(f"Verified Multi-Agent Grounded Context:\n{grounded_ctx}\n")

        prompt_parts.append(f"User Question: {prompt}\n")
        full_user_content = "\n".join(prompt_parts)

        models = [preferred_model] if preferred_model else self.DEFAULT_MODELS
        models = [m for m in models if m]

        for model_name in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={active_key}"
                payload = {
                    "contents": [{"parts": [{"text": full_user_content}]}],
                    "generationConfig": {
                        "temperature": temperature,
                        "maxOutputTokens": max_output_tokens
                    }
                }
                if system_instruction:
                    payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

                headers = {"Content-Type": "application/json"}
                resp = requests.post(url, headers=headers, json=payload, timeout=12.0)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            text_out = parts[0]["text"].strip()
                            reasoning = f"Generated via Google {model_name} with multi-agent context grounding."
                            app_logger.info(f"Successfully generated answer using Gemini ({model_name})")
                            return text_out, reasoning
                else:
                    app_logger.warning(f"Gemini API ({model_name}) returned status {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                app_logger.warning(f"Gemini API ({model_name}) error: {e}")

        return None, None

    def transcribe_audio(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/wav",
        override_key: Optional[str] = None
    ) -> Optional[str]:
        """
        Transcribes speech audio using Gemini's native multimodal capabilities.
        Accepts WAV, MP3, WebM, OGG audio bytes.
        """
        active_key = self.get_effective_key(override_key)
        if not active_key or not audio_bytes:
            return None

        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        models = ["gemini-2.0-flash", "gemini-1.5-flash"]

        for model_name in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={active_key}"
                payload = {
                    "contents": [{
                        "parts": [
                            {
                                "inlineData": {
                                    "mimeType": mime_type,
                                    "data": b64_audio
                                }
                            },
                            {
                                "text": "Please transcribe the speech in this audio clearly into plain text. Only return the exact transcribed speech, with no commentary or extra markdown."
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 512
                    }
                }
                headers = {"Content-Type": "application/json"}
                resp = requests.post(url, headers=headers, json=payload, timeout=14.0)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            transcript = parts[0]["text"].strip()
                            if transcript:
                                app_logger.info(f"Gemini audio transcription succeeded via {model_name}")
                                return transcript
            except Exception as e:
                app_logger.warning(f"Gemini audio transcription ({model_name}) error: {e}")

        return None

gemini_client = GeminiClient()
