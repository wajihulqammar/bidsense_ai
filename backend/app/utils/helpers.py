"""
app/utils/helpers.py
Shared pure-utility functions used across services.
"""

import json
import re
import uuid
from typing import Any


def parse_llm_json(raw: str) -> dict:
    """
    Safely strip markdown fences and parse JSON returned by an LLM.
    Raises ValueError if the string cannot be decoded.
    """
    cleaned = raw.strip()
    # Remove ```json ... ``` or ``` ... ``` wrappers
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def generate_id(length: int = 8) -> str:
    """Return a short random hex ID."""
    return str(uuid.uuid4())[:length]


def safe_float(value: Any, default: float = 0.0) -> float:
    """Convert a value to float, returning *default* on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    """Clamp a float to [lo, hi]."""
    return max(lo, min(hi, value))


def deduplicate_list(items: list[dict], key: str) -> list[dict]:
    """
    Remove duplicate dicts from *items* based on a string *key*.
    Case-insensitive comparison; first occurrence wins.
    """
    seen: set[str] = set()
    result: list[dict] = []
    for item in items:
        val = str(item.get(key, "")).strip().lower()
        if val and val not in seen:
            seen.add(val)
            result.append(item)
    return result


def extract_budget_value(budget_str: str) -> float | None:
    """
    Parse a budget string like 'PKR 15,000,000' and return the numeric value.
    Returns None if no number is found.
    """
    nums = re.findall(r"[\d,]+", budget_str.replace(" ", ""))
    for n in nums:
        try:
            val = float(n.replace(",", ""))
            if val > 0:
                return val
        except ValueError:
            continue
    return None


def truncate(text: str, max_chars: int) -> str:
    """Truncate *text* to at most *max_chars* characters."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"
