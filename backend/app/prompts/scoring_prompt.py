"""
app/prompts/scoring_prompt.py
Prompt templates for the GO/NO-GO decision engine.
"""


def build_decision_prompt(
    decision: str,
    win_prob: float,
    compliance_score: float,
    capability_score: float,
    missing_count: int,
    sector: str,
    weighted_factors: dict,
) -> str:
    return f"""You are a senior bid strategy advisor. Generate a strategic assessment.

Decision: {decision}
Win Probability: {win_prob}%
Compliance Score: {compliance_score}%
Capability Score: {capability_score}%
Missing Requirements: {missing_count}
Sector: {sector}
Weighted Factor Scores: {weighted_factors}

Generate a comprehensive decision package. Return JSON:
{{
  "executive_recommendation": "3-4 sentence strategic recommendation",
  "confidence": "High|Medium|Low",
  "risks": [
    {{"risk": "description", "severity": "High|Medium|Low", "mitigation": "action to take"}}
  ],
  "action_items": [
    {{"task": "specific action", "priority": "Critical|High|Medium", "days": 1-14}}
  ],
  "positive_factors": ["strength 1", "strength 2"],
  "negative_factors": ["weakness 1", "weakness 2"]
}}"""
