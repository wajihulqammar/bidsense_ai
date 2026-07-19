"""
app/services/executive_service.py
Service for the dedicated /executive-summary endpoint.
Synthesises all analysis results into a single executive view.
"""

from app.prompts.executive_prompt import build_executive_summary_prompt
from app.prompts.system_prompt import BASE_ANALYST
from app.services.llm_service import call_llm_json
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_executive_summary(
    requirements: dict,
    compliance_data: dict,
    win_probability_data: dict,
    decision_data: dict,
    historical_data: dict | None = None,
) -> dict:
    """
    Generate a synthesised executive summary from all analysis outputs.

    Returns:
        {
            "status": "success",
            "summary": {
                "tender_overview": str,
                "major_strengths": [...],
                "major_weaknesses": [...],
                "compliance_summary": str,
                "historical_insights": str,
                "final_recommendation": str
            }
        }
    """
    logger.info(
        "Generating executive summary for: %s",
        requirements.get("document_title", "Unknown RFP"),
    )

    summary = call_llm_json(
        system_prompt=BASE_ANALYST,
        user_prompt=build_executive_summary_prompt(
            requirements, compliance_data, win_probability_data,
            decision_data, historical_data,
        ),
        fallback=_fallback_summary(requirements, compliance_data, win_probability_data, decision_data),
    )

    return {"status": "success", "summary": summary}


def _fallback_summary(
    requirements: dict,
    compliance_data: dict,
    win_probability_data: dict,
    decision_data: dict,
) -> dict:
    return {
        "tender_overview": (
            f"This RFP is issued by {requirements.get('issuing_organization', 'the client')} "
            f"for {requirements.get('document_title', 'the project')} in the "
            f"{requirements.get('sector', '')} sector."
        ),
        "major_strengths": compliance_data.get("strengths", ["Adequate compliance posture"]),
        "major_weaknesses": compliance_data.get("critical_gaps", ["Some capability gaps identified"]),
        "compliance_summary": (
            f"Compliance score: {compliance_data.get('compliance_score', 0):.0f}% "
            f"({compliance_data.get('grade', 'N/A')}). "
            f"{compliance_data.get('missing', 0)} requirements are unmet."
        ),
        "historical_insights": (
            f"Historical win rate: {win_probability_data.get('historical_win_rate', 0):.0f}% "
            f"based on {win_probability_data.get('sector_bids', 0)} sector bids."
        ),
        "final_recommendation": decision_data.get("executive_recommendation", decision_data.get("reason", "")),
    }
