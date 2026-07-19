"""
app/services/rag_service.py
Orchestrates the full Retrieval-Augmented Generation pipeline:
  requirement → ChromaDB retrieval → LLM assessment → MatchResult
"""

import numpy as np

from app.models.schemas import MatchResult
from app.prompts.capability_prompt import build_batch_capability_match_prompt, build_capability_match_prompt
from app.prompts.system_prompt import BASE_COMPLIANCE_ANALYST
from app.rag.retriever import retrieve_for_requirement, format_evidence
from app.services.llm_service import call_llm_json
from app.utils.config import settings
from app.utils.constants import STATUS_NOT_FOUND
from app.utils.logger import get_logger

logger = get_logger(__name__)

_FALLBACK_MATCH = {
    "status": STATUS_NOT_FOUND,
    "confidence": 0,
    "evidence": "Assessment failed",
    "matched_caps": [],
    "gap": "LLM assessment unavailable",
    "similarity_score": 0,
}


def assess_single_requirement(req_text: str) -> MatchResult:
    """
    Run the full RAG → LLM pipeline for one requirement string.
    Returns a MatchResult dataclass.
    """
    # 1. Retrieve relevant capability records from ChromaDB
    docs, metas = retrieve_for_requirement(req_text)
    evidence_text = format_evidence(docs, metas)

    # 2. Send requirement + evidence to LLM for grounded assessment
    result = call_llm_json(
        system_prompt=BASE_COMPLIANCE_ANALYST,
        user_prompt=build_capability_match_prompt(req_text, evidence_text),
        fallback={**_FALLBACK_MATCH, "requirement": req_text},
    )

    return MatchResult(
        requirement=req_text,
        status=result.get("status", STATUS_NOT_FOUND),
        confidence=float(result.get("confidence", 0)),
        evidence=result.get("evidence", ""),
        matched_caps=result.get("matched_caps", []),
        gap=result.get("gap"),
        similarity_score=float(result.get("similarity_score", 0)),
    )


def match_all_requirements(requirements: list) -> tuple[list[dict], dict]:
    """
    Run RAG capability matching for all requirements.

    Args:
        requirements: list of str or dict with a 'text' key

    Returns:
        (matched_list, summary_dict)
    """
    cap = settings.MAX_REQUIREMENTS_PER_REQUEST
    req_texts: list[str] = []
    for r in requirements[:cap]:
        if isinstance(r, str):
            text = r
        else:
            text = (
                r.get("text")
                or r.get("requirement")
                or r.get("description")
                or r.get("question")
                or ""
            )
        if str(text).strip():
            req_texts.append(str(text).strip())

    logger.info("Matching %d requirements via RAG", len(req_texts))

    if settings.LLM_EFFICIENCY_MODE and req_texts:
        matched = _batch_assess_requirements(req_texts)
    else:
        matched = []
        for req_text in req_texts:
            result = assess_single_requirement(req_text)
            matched.append(result.to_dict())

    summary = _compute_summary(matched)
    logger.info(
        "Capability matching complete: found=%d partial=%d missing=%d score=%.1f",
        summary["found"], summary["partial"], summary["missing"], summary["capability_score"]
    )
    return matched, summary


def _batch_assess_requirements(req_texts: list[str]) -> list[dict]:
    """Retrieve ChromaDB evidence per requirement, assess all in ONE LLM call."""
    items: list[dict] = []
    for req_text in req_texts:
        docs, metas = retrieve_for_requirement(req_text)
        items.append({
            "requirement": req_text,
            "evidence": format_evidence(docs, metas),
        })

    batch_result = call_llm_json(
        system_prompt=BASE_COMPLIANCE_ANALYST,
        user_prompt=build_batch_capability_match_prompt(items),
        fallback={"matches": []},
    )

    matches = batch_result.get("matches") or []
    lookup = {m.get("requirement", "").strip().lower(): m for m in matches if isinstance(m, dict)}

    matched: list[dict] = []
    for req_text in req_texts:
        raw = lookup.get(req_text.strip().lower(), {})
        if not raw:
            for key, val in lookup.items():
                if key in req_text.strip().lower() or req_text.strip().lower() in key:
                    raw = val
                    break
        if raw:
            matched.append(MatchResult(
                requirement=req_text,
                status=raw.get("status", STATUS_NOT_FOUND),
                confidence=float(raw.get("confidence", 0)),
                evidence=raw.get("evidence", ""),
                matched_caps=raw.get("matched_caps", []),
                gap=raw.get("gap"),
                similarity_score=float(raw.get("similarity_score", 0)),
            ).to_dict())
        else:
            matched.append({**_FALLBACK_MATCH, "requirement": req_text})

    logger.info("Batch RAG matching: %d requirements in 1 LLM call", len(req_texts))
    return matched


def _compute_summary(matched: list[dict]) -> dict:
    from app.utils.constants import STATUS_FOUND, STATUS_PARTIAL

    found = sum(1 for m in matched if m.get("status") == STATUS_FOUND)
    partial = sum(1 for m in matched if m.get("status") == STATUS_PARTIAL)
    missing = sum(1 for m in matched if m.get("status") == STATUS_NOT_FOUND)
    confs = [m.get("confidence", 0) for m in matched]
    avg_conf = round(float(np.mean(confs)), 1) if confs else 0.0
    total = len(matched)
    cap_score = round((found + partial * 0.5) / max(total, 1) * 100, 1)

    return {
        "total": total,
        "found": found,
        "partial": partial,
        "missing": missing,
        "avg_confidence": avg_conf,
        "capability_score": cap_score,
    }
