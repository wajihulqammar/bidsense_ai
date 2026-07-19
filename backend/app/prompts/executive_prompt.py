"""
app/prompts/executive_prompt.py
Prompt template for the executive summary endpoint.
"""

import json


def build_executive_summary_prompt(
    requirements: dict,
    compliance_data: dict,
    win_probability_data: dict,
    decision_data: dict,
    historical_data: dict | None,
) -> str:
    context = {
        "document_title": requirements.get("document_title", "RFP"),
        "issuing_organization": requirements.get("issuing_organization", ""),
        "sector": requirements.get("sector", ""),
        "mandatory_count": len(requirements.get("mandatory_requirements", [])),
        "compliance_score": compliance_data.get("compliance_score", 0),
        "compliance_grade": compliance_data.get("grade", ""),
        "missing_count": compliance_data.get("missing", 0),
        "win_probability": win_probability_data.get("win_probability", 0),
        "decision": decision_data.get("decision", ""),
        "historical_win_rate": win_probability_data.get("historical_win_rate", 0),
    }

    hist_text = json.dumps(historical_data, indent=2) if historical_data else "Not available"

    return f"""Generate a comprehensive executive summary for this bid opportunity.

Context:
{json.dumps(context, indent=2)}

Historical Analysis:
{hist_text}

Return JSON:
{{
  "tender_overview": "2-3 sentence overview of the tender opportunity",
  "major_strengths": ["strength 1", "strength 2", "strength 3"],
  "major_weaknesses": ["weakness 1", "weakness 2"],
  "compliance_summary": "2-3 sentences on compliance posture",
  "historical_insights": "2 sentences on relevant historical bid performance",
  "final_recommendation": "3-4 sentence final strategic recommendation"
}}"""
