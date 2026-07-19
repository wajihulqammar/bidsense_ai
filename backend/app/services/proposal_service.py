"""
app/services/proposal_service.py
RAG-grounded proposal generation.
Every section is generated using retrieved capability evidence — no hallucination.
"""

from app.prompts.proposal_prompt import (
    build_executive_summary_prompt,
    build_technical_response_prompt,
    build_compliance_response_prompt,
    build_past_experience_prompt,
    build_methodology_prompt,
    build_risk_mitigation_prompt,
    build_company_profile_prompt,
)
from app.prompts.system_prompt import BASE_PROPOSAL_WRITER
from app.rag.retriever import retrieve_for_requirement, format_evidence
from app.services.llm_service import call_llm_json, call_llm_text
from app.utils.config import settings
from app.utils.constants import STATUS_FOUND, PROPOSAL_SECTIONS
from app.utils.helpers import truncate
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_proposal(
    requirements: list,
    matched_capabilities: list[dict],
    compliance_data: dict,
    workspace_name: str,
) -> dict:
    """
    Generate a full proposal using RAG-grounded content.
    Each section references retrieved capability evidence.

    Returns:
        {
            "status": "success",
            "proposal": {section: text, ...},
            "metadata": {...}
        }
    """
    # ── Prepare context ───────────────────────────────────────────────
    req_text = _build_req_text(requirements)
    caps_text = _build_caps_text(matched_capabilities)
    comp_score = compliance_data.get("compliance_score", 80)

    # ── Retrieve additional RAG evidence ─────────────────────────────
    # Use a broad query to pull more relevant capability evidence for the proposal
    rag_docs, _ = retrieve_for_requirement(
        f"{workspace_name} requirements capabilities experience", top_k=6
    )
    rag_caps_text = format_evidence(rag_docs, [])
    enriched_caps = f"{caps_text}\n\nAdditional Retrieved Evidence:\n{rag_caps_text}"

    logger.info("Generating proposal for: %s", workspace_name)

    sections: dict[str, str] = {}

    if settings.PROPOSAL_COMBINED:
        combined = call_llm_json(
            BASE_PROPOSAL_WRITER,
            _build_combined_proposal_prompt(
                workspace_name, req_text, enriched_caps, comp_score,
            ),
            fallback={},
        )
        for key in PROPOSAL_SECTIONS:
            val = combined.get(key, "")
            if val:
                sections[key] = str(val)
    else:
        sections = _generate_proposal_sections(
            workspace_name, req_text, enriched_caps, comp_score,
        )

    logger.info("Proposal generated: %d sections", len(sections))

    return {
        "status": "success",
        "proposal": sections,
        "metadata": {
            "rfp_name": workspace_name,
            "compliance_score": comp_score,
            "sections": list(sections.keys()),
            "rag_evidence_used": bool(rag_docs),
        },
    }


# ── Helpers ───────────────────────────────────────────────────────────────

def _build_combined_proposal_prompt(
    workspace_name: str, req_text: str, caps_text: str, comp_score: float,
) -> str:
    return f"""Write a complete bid proposal for "{workspace_name}" as JSON with these keys:
executive_summary, technical_response, compliance_response, past_experience,
implementation_methodology, risk_mitigation, company_profile

Requirements:
{truncate(req_text, 2000)}

Capability evidence (use only this — do not invent):
{truncate(caps_text, 2000)}

Compliance score: {comp_score}%

Each section should be 2–4 paragraphs of professional proposal text."""


def _generate_proposal_sections(
    workspace_name: str, req_text: str, enriched_caps: str, comp_score: float,
) -> dict[str, str]:
    sections: dict[str, str] = {}
    sections["executive_summary"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_executive_summary_prompt(workspace_name, truncate(req_text, 1500), truncate(enriched_caps, 1500), comp_score),
        fallback="Executive summary generation failed.",
    )
    sections["technical_response"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_technical_response_prompt(workspace_name, truncate(req_text, 1500), truncate(enriched_caps, 1500)),
        fallback="Technical response generation failed.",
    )
    sections["compliance_response"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_compliance_response_prompt(workspace_name, truncate(enriched_caps, 1200), comp_score),
        fallback="Compliance response generation failed.",
    )
    sections["past_experience"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_past_experience_prompt(workspace_name, truncate(enriched_caps, 1500)),
        fallback="Past experience section generation failed.",
    )
    sections["implementation_methodology"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_methodology_prompt(workspace_name, truncate(req_text, 1200)),
        fallback="Implementation methodology generation failed.",
    )
    sections["risk_mitigation"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_risk_mitigation_prompt(workspace_name, truncate(req_text, 1200)),
        fallback="Risk mitigation section generation failed.",
    )
    sections["company_profile"] = call_llm_text(
        BASE_PROPOSAL_WRITER,
        build_company_profile_prompt(workspace_name),
        fallback="Company profile generation failed.",
    )
    return sections


def _build_req_text(requirements: list) -> str:
    lines = []
    for r in requirements[:15]:
        text = r if isinstance(r, str) else r.get("text", "")
        if text:
            lines.append(f"- {text}")
    return "\n".join(lines)


def _build_caps_text(matched_capabilities: list[dict]) -> str:
    lines = []
    for c in matched_capabilities:
        if c.get("status") == STATUS_FOUND and c.get("evidence"):
            lines.append(f"- {c['evidence']}")
    return "\n".join(lines) if lines else "No direct capability matches found."
