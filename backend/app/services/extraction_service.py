"""
app/services/extraction_service.py
Requirement extraction — supports single-pass (efficient) and multi-chunk modes.
"""

from app.prompts.extraction_prompt import build_extraction_prompt, build_unified_extraction_prompt
from app.prompts.system_prompt import BASE_ANALYST
from app.services.chunking_service import chunk_text, merge_extractions, select_chunks_for_extraction
from app.services.llm_service import call_llm_json
from app.services.ner_service import extract_entities
from app.utils.config import settings
from app.utils.helpers import truncate
from app.utils.logger import get_logger

logger = get_logger(__name__)


def extract_requirements_from_text(full_text: str) -> tuple[dict, dict]:
    """
    Run requirement extraction (+ NER) on document text.

    Returns:
        (requirements dict, stats dict with chunks_used, total_chunks, mode)
    """
    if settings.LLM_EFFICIENCY_MODE:
        return _extract_single_pass(full_text)

    ner_data = extract_entities(full_text)
    all_chunks = chunk_text(full_text)
    chunks = select_chunks_for_extraction(all_chunks, settings.MAX_EXTRACTION_CHUNKS)
    logger.info("Multi-chunk extraction: processing %d/%d chunks", len(chunks), len(all_chunks))

    partial_results = []
    for i, chunk in enumerate(chunks):
        logger.debug("Processing chunk %d/%d", i + 1, len(chunks))
        result = call_llm_json(
            system_prompt=BASE_ANALYST,
            user_prompt=build_extraction_prompt(chunk),
            fallback=None,
        )
        if result and not result.get("error"):
            partial_results.append(result)

    requirements = merge_extractions(partial_results)
    requirements["ner_entities"] = ner_data
    stats = {
        "chunks_used": len(partial_results),
        "total_chunks": len(all_chunks),
        "chunks_processed": len(chunks),
        "mode": "multi-chunk",
    }
    return requirements, stats


def _extract_single_pass(full_text: str) -> tuple[dict, dict]:
    """
    One Gemini call for the full document — better context, fewer API calls.
    Gemini 2.5 Flash supports large inputs; 66-page tenders typically fit.
    """
    text = truncate(full_text, settings.MAX_EXTRACTION_CHARS)
    logger.info(
        "Single-pass extraction: %d chars (limit %d)",
        len(text), settings.MAX_EXTRACTION_CHARS,
    )

    result = call_llm_json(
        system_prompt=BASE_ANALYST,
        user_prompt=build_unified_extraction_prompt(text),
        fallback=None,
    )

    if not result or result.get("error"):
        requirements = merge_extractions([])
        requirements["ner_entities"] = {}
    else:
        ner_data = result.get("ner_entities", {}) or {}
        requirements = merge_extractions([result])
        requirements["ner_entities"] = ner_data

    stats = {
        "chunks_used": 1 if result and not result.get("error") else 0,
        "total_chunks": 1,
        "chunks_processed": 1,
        "mode": "single-pass",
    }
    return requirements, stats
