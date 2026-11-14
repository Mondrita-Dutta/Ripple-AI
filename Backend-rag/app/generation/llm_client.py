"""LLM client adapter supporting Claude, OpenAI, Gemini, Ollama, and Mock mode."""

import json
import re
from typing import Dict, Any, List
from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()


class LLMClient:
    """Dispatches generation requests to configured LLM providers with robust fallbacks."""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.model = settings.LLM_MODEL

    def generate(self, prompt: str, temperature: float = None) -> str:
        """Generates text completion based on prompt."""
        temp = temperature if temperature is not None else settings.LLM_TEMPERATURE

        # 1. Anthropic Claude
        if self.provider == "anthropic" and settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
                message = client.messages.create(
                    model=self.model,
                    max_tokens=2048,
                    temperature=temp,
                    messages=[{"role": "user", "content": prompt}],
                )
                return message.content[0].text
            except Exception as exc:
                logger.error(f"Anthropic API call failed: {exc}. Falling back to mock generator.")

        # 2. OpenAI or Local OpenAI-Compatible Server (Ollama / LM Studio)
        elif (self.provider in ("openai", "ollama")) and (settings.OPENAI_API_KEY or settings.OPENAI_BASE_URL):
            try:
                import openai
                client = openai.OpenAI(
                    api_key=settings.OPENAI_API_KEY or "local-key",
                    base_url=settings.OPENAI_BASE_URL,
                )
                response = client.chat.completions.create(
                    model=self.model,
                    temperature=temp,
                    messages=[{"role": "user", "content": prompt}],
                )
                return response.choices[0].message.content or ""
            except Exception as exc:
                logger.error(f"OpenAI/Ollama API call failed: {exc}. Falling back to mock generator.")

        # 3. Google Gemini API
        elif self.provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                import httpx
                model_name = self.model if "gemini" in self.model else "gemini-1.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": temp},
                }
                with httpx.Client(timeout=30.0) as http_client:
                    res = http_client.post(url, json=payload)
                    res.raise_for_status()
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as exc:
                logger.error(f"Gemini API call failed: {exc}. Falling back to mock generator.")

        # 4. Ollama Local Endpoint (Native HTTP - 100% Free & Local)
        elif self.provider == "ollama":
            try:
                import httpx
                base_url = settings.OLLAMA_BASE_URL.rstrip("/")
                payload = {
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temp,
                    },
                }
                with httpx.Client(timeout=60.0) as http_client:
                    res = http_client.post(f"{base_url}/api/generate", json=payload)
                    res.raise_for_status()
                    data = res.json()
                    return data.get("response", "")
            except Exception as exc:
                logger.error(f"Ollama local API call failed: {exc}. Falling back to mock generator.")

        # 4. Default Dynamic Mock Generation for local testing
        return self._generate_mock_response(prompt)

    def extract_facts(self, chunk_text: str, chapter_index: int) -> List[Dict[str, Any]]:
        """Invokes structured extraction for chapter facts."""
        if self.provider == "mock":
            return []

        from app.generation.prompt_builder import PromptBuilder
        prompt = PromptBuilder.build_extraction_prompt(chunk_text, chapter_index)
        response_text = self.generate(prompt)
        try:
            start = response_text.find("[")
            end = response_text.rfind("]") + 1
            if start != -1 and end != 0:
                return json.loads(response_text[start:end])
        except Exception as exc:
            logger.warning(f"Could not parse LLM extraction JSON: {exc}")
        return []

    def _generate_mock_response(self, prompt: str) -> str:
        """Dynamic response synthesizer for mock mode extracting context evidence."""
        # Extract the user query
        query = ""
        if "Writer's Question:" in prompt:
            parts = prompt.split("Writer's Question:")
            if len(parts) > 1:
                query = parts[1].split("Answer")[0].strip()

        if "story_qa" in prompt or "Writer's Question" in prompt:
            if "=== MANUSCRIPT EXCERPTS ===" in prompt:
                parts = prompt.split("=== MANUSCRIPT EXCERPTS ===")
                excerpt_block = parts[1].split("Writer's Question:")[0].strip() if len(parts) > 1 else ""
                lines = [l.strip() for l in excerpt_block.split("\n") if l.strip() and not l.startswith("[Source")]
                if lines:
                    return f"According to [Source #1], {lines[0]}"

            q_lower = query.lower()
            if q_lower in ("hi", "hello", "hey"):
                return "Hello! I'm your lore assistant. Your backend is fully connected and responding! Ask me about characters, chapters, or the Ember Gate."
            if "antagonist" in q_lower:
                return "In The Ember Archives, the primary antagonist is Lord Vane of the Ashen Gate, who seeks to harness the forbidden Ember Core."
            if "chapter 12" in q_lower:
                return "Chapter 12 ('The Ashen Gate'): Mira and Kael breach the outer threshold, discovering that the ancient seal has already begun to fracture."
            if "ember gate" in q_lower:
                return "The Ember Gate is a colossal pre-cataclysm gateway located at the boundary of the Northern Reach, sealed four centuries ago by the Old King."

            return f"Received question: \"{query}\". (Mock Mode: Frontend and backend are connected! You can also connect Gemini or OpenAI in .env for full AI generation.)"

        if "continuity_check" in prompt:
            return json.dumps({
                "has_contradiction": False,
                "violations": [],
            })

        return "Synthesized RippleRAG narrative response."
