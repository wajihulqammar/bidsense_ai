"""
app/services/llm_service.py
Centralised LLM service — single Gemini client for the entire application.
All LLM calls go through call_llm(); all responses are parsed JSON.
"""

from google import genai
from google.genai import types

from app.utils.config import settings
from app.utils.helpers import parse_llm_json
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ── Single shared client ──────────────────────────────────────────────────
_client: genai.Client | None = None


class GeminiAuthError(RuntimeError):
    """Raised when the Gemini API rejects credentials (401 / invalid key)."""


class GeminiQuotaError(RuntimeError):
    """Raised when Gemini free-tier or rate limits are exceeded (429)."""


def _is_auth_error(exc: Exception) -> bool:
    msg = str(exc).upper()
    return any(
        token in msg
        for token in ("401", "UNAUTHENTICATED", "API_KEY_INVALID", "ACCESS_TOKEN_TYPE_UNSUPPORTED")
    )


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc).upper()
    return any(
        token in msg
        for token in ("429", "RESOURCE_EXHAUSTED", "TOOMANYREQUESTS", "QUOTA", "RATE LIMIT")
    )


def _wrap_api_error(exc: Exception) -> Exception:
    if _is_quota_error(exc):
        return GeminiQuotaError(
            "Gemini API daily quota exceeded (free tier: ~20 requests/day for gemini-2.5-flash). "
            "Wait until tomorrow, enable billing at https://ai.google.dev, "
            "or reduce MAX_EXTRACTION_CHUNKS / MAX_REQUIREMENTS_PER_REQUEST in backend/.env."
        )
    if _is_auth_error(exc):
        return GeminiAuthError(
            "Gemini API authentication failed. Check GEMINI_API_KEY in backend/.env "
            "(create a new key at https://aistudio.google.com/apikey)."
        )
    return exc


def get_gemini_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise GeminiAuthError(
                "GEMINI_API_KEY is not set. Add it to backend/.env"
            )
        _client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())
        logger.info("Gemini client initialised (model: %s)", settings.GEMINI_MODEL)
    return _client


def call_llm(
    system_prompt: str,
    user_prompt: str,
    model: str | None = None,
    temperature: float | None = None,
) -> str:
    """
    Make a single LLM completion request and return the raw string response.
    Raises on API errors (callers are responsible for try/except).
    """
    client = get_gemini_client()
    try:
        response = client.models.generate_content(
            model=model or settings.GEMINI_MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature if temperature is not None else settings.GEMINI_TEMPERATURE,
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
    except Exception as exc:
        raise _wrap_api_error(exc) from exc
    raw = response.text or ""
    logger.debug(
        "LLM call: model=%s response_chars=%d",
        model or settings.GEMINI_MODEL,
        len(raw),
    )
    return raw


def call_llm_json(
    system_prompt: str,
    user_prompt: str,
    fallback: dict | None = None,
    model: str | None = None,
) -> dict:
    """
    Call the LLM and parse the response as JSON.
    Returns *fallback* (or an empty dict) on parse failure.
    """
    try:
        raw = call_llm(system_prompt, user_prompt, model=model)
        return parse_llm_json(raw)
    except (GeminiAuthError, GeminiQuotaError):
        raise
    except Exception as exc:
        wrapped = _wrap_api_error(exc)
        if isinstance(wrapped, (GeminiAuthError, GeminiQuotaError)):
            raise wrapped from exc
        logger.error("LLM JSON parse failed: %s", exc)
        return fallback if fallback is not None else {"error": str(exc)}


def call_llm_text(
    system_prompt: str,
    user_prompt: str,
    fallback: str = "",
    model: str | None = None,
) -> str:
    """
    Call the LLM and return the raw text response.
    Returns *fallback* on failure.
    """
    try:
        return call_llm(system_prompt, user_prompt, model=model)
    except (GeminiAuthError, GeminiQuotaError):
        raise
    except Exception as exc:
        wrapped = _wrap_api_error(exc)
        if isinstance(wrapped, (GeminiAuthError, GeminiQuotaError)):
            raise wrapped from exc
        logger.error("LLM text call failed: %s", exc)
        return fallback
