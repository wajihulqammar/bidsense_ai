"""
app/prompts/proposal_prompt.py
Prompt templates for RAG-grounded proposal generation.
"""


def build_executive_summary_prompt(
    workspace_name: str, req_text: str, caps_text: str, comp_score: float
) -> str:
    return f"""Write an Executive Summary for this bid proposal.
RFP: {workspace_name}
Key Requirements: {req_text}
Capability Evidence: {caps_text}
Our Compliance Score: {comp_score}%

Write 3-4 professional paragraphs. Reference specific capabilities from the evidence.
Highlight our strongest matching areas. Do not invent credentials."""


def build_technical_response_prompt(
    workspace_name: str, req_text: str, caps_text: str
) -> str:
    return f"""Write a Technical Response section for this bid.
RFP: {workspace_name}
Requirements: {req_text}
Our Capabilities (from RAG retrieval): {caps_text}

Cover: technical approach, methodology, team qualifications, and delivery timeline.
Reference the capability evidence explicitly. Write 4-5 paragraphs."""


def build_compliance_response_prompt(
    workspace_name: str, caps_text: str, comp_score: float
) -> str:
    return f"""Write a Compliance Response section for this bid.
RFP: {workspace_name}
Compliance Score: {comp_score}%
Matched Requirements Evidence: {caps_text}

Confirm compliance with each major requirement using evidence. Structured format.
Write 3-4 paragraphs."""


def build_past_experience_prompt(workspace_name: str, caps_text: str) -> str:
    return f"""Write a Past Experience section for this bid.
RFP Context: {workspace_name}
Relevant Experience Evidence: {caps_text}

Describe specific past projects that demonstrate relevant experience.
Use the capability evidence provided — do not fabricate projects."""


def build_methodology_prompt(workspace_name: str, req_text: str) -> str:
    return f"""Write an Implementation Methodology section for this bid.
RFP: {workspace_name}
Key Requirements: {req_text}

Describe the project implementation methodology: phases, milestones, team structure,
quality assurance, and delivery approach. Write 3-4 paragraphs."""


def build_risk_mitigation_prompt(workspace_name: str, req_text: str) -> str:
    return f"""Write a Risk Mitigation section for this bid.
RFP: {workspace_name}
Key Requirements: {req_text}

Identify the top 4-5 project risks and describe specific mitigation strategies for each.
Be specific and practical. Write in a structured format."""


def build_company_profile_prompt(workspace_name: str) -> str:
    return f"""Write a Company Profile section for a bid proposal.
Context: Pakistani IT/Engineering company bidding for: {workspace_name}

Highlight: years of experience, certifications (ISO 27001, CMMI L3), past government
projects, team strength, and sector expertise. Write 2-3 paragraphs."""
