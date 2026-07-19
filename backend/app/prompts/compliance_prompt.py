"""
app/prompts/compliance_prompt.py
Prompt templates for LLM-enriched compliance analysis.
"""

import json


def build_compliance_analysis_prompt(matched_items: list[dict]) -> str:
    items_text = json.dumps(matched_items[:15], indent=2)
    return f"""Analyze the following capability match results and produce a detailed compliance assessment.

Matched capability items:
{items_text}

For each item, determine:
- status: Pass | Partial | Missing
- risk_level: High | Medium | Low
- reason: specific explanation referencing the evidence

Return JSON:
{{
  "compliance_details": [
    {{
      "requirement": "...",
      "evidence": "...",
      "status": "Pass|Partial|Missing",
      "risk_level": "High|Medium|Low",
      "reason": "..."
    }}
  ],
  "overall_assessment": "Pass|Partial|Fail",
  "critical_gaps": ["list of critical missing items"],
  "strengths": ["list of strong compliance areas"]
}}"""
