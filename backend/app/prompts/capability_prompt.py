"""
app/prompts/capability_prompt.py
Prompt templates for RAG-based capability matching.
"""


def build_capability_match_prompt(requirement_text: str, evidence_text: str) -> str:
    return f"""Requirement: {requirement_text}

Company Capability Evidence (retrieved from capability library):
{evidence_text}

Assess whether the company has matching capability evidence for this requirement.
Return JSON:
{{
  "requirement": "{requirement_text}",
  "status": "Found|Partial|Not Found",
  "confidence": <0-100>,
  "evidence": "brief description of the matching evidence",
  "matched_caps": ["CAP-ID list if any"],
  "gap": "description of capability gap, or null if fully met",
  "similarity_score": <0-100>
}}"""


def build_batch_capability_match_prompt(items: list[dict]) -> str:
    """Assess multiple requirements in one LLM call (RAG evidence pre-retrieved per item)."""
    import json
    blocks = []
    for i, item in enumerate(items, 1):
        blocks.append(
            f"--- Requirement {i} ---\n"
            f"REQUIREMENT: {item['requirement']}\n"
            f"EVIDENCE:\n{item['evidence']}"
        )
    joined = "\n\n".join(blocks)
    return f"""Assess capability match for EACH requirement below using ONLY the provided evidence.

{joined}

Return JSON:
{{
  "matches": [
    {{
      "requirement": "exact requirement text",
      "status": "Found|Partial|Not Found",
      "confidence": <0-100>,
      "evidence": "brief matching evidence",
      "matched_caps": ["CAP-ID if any"],
      "gap": "gap description or null",
      "similarity_score": <0-100>
    }}
  ]
}}

Return one match object per requirement, in the same order."""
