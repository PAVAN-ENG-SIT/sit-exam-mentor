# ─────────────────────────────────────────────────────────────
# OpenRouter Service  —  backend/app/services/openrouter.py
# Reusable client that proxies chat-completion calls through
# OpenRouter's unified API to any supported open-source LLM.
# ─────────────────────────────────────────────────────────────
import os
import requests
from typing import List, Dict
from fastapi import HTTPException

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1"

if not OPENROUTER_API_KEY:
    raise ValueError(
        "OPENROUTER_API_KEY not found in environment variables. "
        "Add it to backend/.env"
    )


def call_openrouter(
    messages: List[Dict[str, str]],
    model: str = "meta-llama/llama-3.1-8b-instruct",
    temperature: float = 0.7,
    max_tokens: int = 300,
    top_p: float = 0.95,
) -> str:
    """
    Send a chat-completion request to OpenRouter and return the
    assistant's reply as a plain string.

    Raises HTTPException(500) on any network / API error.
    """
    # Ensure any stray quotes or spaces are removed from the env var key
    # explicitly cast to str to prevent IDE type checker complaints
    clean_key = str(OPENROUTER_API_KEY).strip(' "')

    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",         # Your frontend URL
        "X-Title": "Exam Mentor AI",
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": top_p,
    }

    try:
        # Reverted trailing slash — OpenRouter strictly expects NO trailing slash
        response = requests.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,   # generous timeout for large models
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except requests.exceptions.RequestException as e:
        status_code = getattr(e.response, "status_code", 500)
        err_msg = e.response.text if e.response else str(e)
        raise HTTPException(
            status_code=status_code,
            detail=f"OpenRouter API error: {err_msg}",
        )
