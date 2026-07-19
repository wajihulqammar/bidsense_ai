"""
app/services/chunking_service.py
Text chunking and multi-chunk merging for large RFP documents.
Processes EVERY chunk — no page limit.
"""

import json

from app.utils.config import settings
from app.utils.helpers import deduplicate_list
from app.utils.logger import get_logger

logger = get_logger(__name__)


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[str]:
    """
    Split *text* into overlapping chunks.
    Returns a list of chunk strings.
    """
    cs = chunk_size or settings.CHUNK_SIZE
    ov = overlap or settings.CHUNK_OVERLAP

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + cs
        chunks.append(text[start:end])
        start = end - ov
        if start >= len(text):
            break

    logger.debug("Chunked text into %d chunks (size=%d, overlap=%d)", len(chunks), cs, ov)
    return chunks


def select_chunks_for_extraction(chunks: list[str], max_chunks: int | None = None) -> list[str]:
    """
    Cap LLM extraction calls for large documents (important on Gemini free tier).
    Evenly samples across the document, always including first and last chunk.
    """
    cap = max_chunks if max_chunks is not None else settings.MAX_EXTRACTION_CHUNKS
    if len(chunks) <= cap:
        return chunks
    if cap <= 1:
        return [chunks[0]]

    step = (len(chunks) - 1) / (cap - 1)
    indices = sorted({round(i * step) for i in range(cap)})
    selected = [chunks[i] for i in indices]
    logger.info(
        "Sampling %d/%d chunks for extraction (free-tier friendly)",
        len(selected), len(chunks),
    )
    return selected


def merge_extractions(partial_results: list[dict]) -> dict:
    """
    Merge multiple partial extraction JSONs (one per chunk) into a single
    consolidated result. Deduplicates requirements by text field.
    """
    if not partial_results:
        return _empty_extraction()

    merged = _empty_extraction()

    for result in partial_results:
        if not isinstance(result, dict) or result.get("error"):
            continue

        # List fields — accumulate
        for key in ("mandatory_requirements", "evaluation_criteria", "deadlines", "budget", "qa_sections"):
            items = result.get(key, [])
            if isinstance(items, list):
                merged[key].extend(items)

        # Scalar fields — take first non-empty value
        for key in ("document_title", "issuing_organization", "sector"):
            if not merged[key] and result.get(key):
                merged[key] = result[key]

    # Deduplicate list fields
    for key in ("mandatory_requirements", "evaluation_criteria", "qa_sections"):
        merged[key] = deduplicate_list(merged[key], "text")
    for key in ("deadlines",):
        merged[key] = deduplicate_list(merged[key], "date")
    for key in ("budget",):
        merged[key] = deduplicate_list(merged[key], "amount")

    logger.info(
        "Merged %d partial extractions: %d mandatory, %d criteria, %d deadlines",
        len(partial_results),
        len(merged["mandatory_requirements"]),
        len(merged["evaluation_criteria"]),
        len(merged["deadlines"]),
    )
    return merged


def _requirement_text(item) -> str:
    if isinstance(item, str):
        return item.strip()
    if not isinstance(item, dict):
        return ""
    return str(
        item.get("text")
        or item.get("requirement")
        or item.get("description")
        or item.get("question")
        or item.get("clause")
        or item.get("name")
        or ""
    ).strip()


def build_requirements_list(requirements_data: dict) -> list[dict]:
    """Collect matchable requirements from all extraction sections + NER fallback."""
    if not requirements_data:
        return []

    sources: list = []
    for key in ("mandatory_requirements", "evaluation_criteria", "deadlines", "budget", "qa_sections"):
        sources.extend(requirements_data.get(key) or [])

    ner = requirements_data.get("ner_entities") or {}
    for clause in ner.get("compliance_clauses") or []:
        text = clause if isinstance(clause, str) else _requirement_text(clause)
        if text:
            sources.append({"text": text, "tag": "Compliance", "priority": "High"})

    seen: set[str] = set()
    result: list[dict] = []
    for item in sources:
        text = _requirement_text(item)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(item if isinstance(item, dict) else {"text": text})
    return result


def _empty_extraction() -> dict:
    return {
        "mandatory_requirements": [],
        "evaluation_criteria": [],
        "deadlines": [],
        "budget": [],
        "qa_sections": [],
        "document_title": "",
        "issuing_organization": "",
        "sector": "",
    }
