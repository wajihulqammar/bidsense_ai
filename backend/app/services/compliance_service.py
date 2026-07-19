"""
app/services/compliance_service.py
Compliance analysis service.
Combines algorithmic scoring with LLM-enriched risk assessment.
"""

from app.prompts.compliance_prompt import build_compliance_analysis_prompt
from app.prompts.system_prompt import BASE_COMPLIANCE_ANALYST
from app.services.llm_service import call_llm_json
from app.utils.constants import (
    STATUS_FOUND, STATUS_PARTIAL, STATUS_NOT_FOUND,
    GRADE_EXCELLENT, GRADE_GOOD, GRADE_AT_RISK, GRADE_POOR,
    RISK_HIGH, RISK_MEDIUM, RISK_LOW,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


def analyze_compliance(matched_capabilities: list[dict]) -> dict:
    """
    Compute compliance score and produce enriched compliance details.

    Returns full compliance assessment including:
    - Numeric score
    - Pass/partial/missing breakdown
    - LLM-generated risk analysis
    - High-risk items
    - Grade
    """
    if not matched_capabilities:
        return _empty_compliance()

    pass_items = [m for m in matched_capabilities if m.get("status") == STATUS_FOUND]
    partial_items = [m for m in matched_capabilities if m.get("status") == STATUS_PARTIAL]
    missing_items = [m for m in matched_capabilities if m.get("status") == STATUS_NOT_FOUND]

    total = len(matched_capabilities)
    score = round((len(pass_items) + len(partial_items) * 0.5) / total * 100, 1) if total else 0.0

    # LLM enrichment: detailed compliance analysis with risk levels
    llm_analysis = call_llm_json(
        system_prompt=BASE_COMPLIANCE_ANALYST,
        user_prompt=build_compliance_analysis_prompt(matched_capabilities),
        fallback={"compliance_details": [], "critical_gaps": [], "strengths": []},
    )

    compliance_details = _enrich_compliance_details(
        pass_items, partial_items, missing_items,
        llm_analysis.get("compliance_details", []),
    )

    high_risk_count = sum(
        1 for d in compliance_details if d.get("risk_level") == RISK_HIGH
    )

    grade = _compute_grade(score)

    logger.info(
        "Compliance analysis: score=%.1f grade=%s pass=%d partial=%d missing=%d high_risk=%d",
        score, grade, len(pass_items), len(partial_items), len(missing_items), high_risk_count,
    )

    return {
        "status": "success",
        "compliance_score": score,
        "pass": len(pass_items),
        "partial": len(partial_items),
        "missing": len(missing_items),
        "total": total,
        "pass_items": pass_items,
        "partial_items": partial_items,
        "missing_items": missing_items,
        "high_risk_count": high_risk_count,
        "threshold_met": score >= 75,
        "grade": grade,
        "compliance_details": compliance_details,
        "critical_gaps": llm_analysis.get("critical_gaps", []),
        "strengths": llm_analysis.get("strengths", []),
        "overall_assessment": llm_analysis.get("overall_assessment", ""),
    }


def _enrich_compliance_details(
    pass_items: list[dict],
    partial_items: list[dict],
    missing_items: list[dict],
    llm_details: list[dict],
) -> list[dict]:
    """
    Merge algorithmic results with LLM-enriched details.
    Falls back to basic structure when LLM details are unavailable.
    """
    # Build a lookup by requirement text from LLM enrichment
    llm_lookup: dict[str, dict] = {}
    for d in llm_details:
        key = d.get("requirement", "").strip().lower()
        if key:
            llm_lookup[key] = d

    def enrich(item: dict, default_status: str, default_risk: str) -> dict:
        req = item.get("requirement", item.get("text", ""))
        key = req.strip().lower()
        llm = llm_lookup.get(key, {})
        return {
            "requirement": req,
            "evidence": item.get("evidence", llm.get("evidence", "")),
            "status": llm.get("status", default_status),
            "risk_level": llm.get("risk_level", default_risk),
            "reason": llm.get("reason", item.get("gap", "")),
        }

    result = (
        [enrich(i, "Pass", RISK_LOW) for i in pass_items]
        + [enrich(i, "Partial", RISK_MEDIUM) for i in partial_items]
        + [enrich(i, "Missing", RISK_HIGH) for i in missing_items]
    )
    return result


def _compute_grade(score: float) -> str:
    if score >= 85:
        return GRADE_EXCELLENT
    if score >= 75:
        return GRADE_GOOD
    if score >= 60:
        return GRADE_AT_RISK
    return GRADE_POOR


def _empty_compliance() -> dict:
    return {
        "status": "success",
        "compliance_score": 0.0,
        "pass": 0,
        "partial": 0,
        "missing": 0,
        "total": 0,
        "pass_items": [],
        "partial_items": [],
        "missing_items": [],
        "high_risk_count": 0,
        "threshold_met": False,
        "grade": GRADE_POOR,
        "compliance_details": [],
        "critical_gaps": [],
        "strengths": [],
        "overall_assessment": "Fail",
    }
