"""
app/api/proposal.py
Proposal generation endpoint.
"""

from fastapi import APIRouter

from app.models.request_models import ProposalRequest
from app.services.proposal_service import generate_proposal
from app.utils.logger import get_logger
from app.utils.validators import validate_non_empty_list

router = APIRouter()
logger = get_logger(__name__)


@router.post("/generate-proposal")
async def generate_proposal_endpoint(req: ProposalRequest):
    """
    Generate a full RAG-grounded bid proposal.
    All sections reference retrieved capability evidence — no hallucination.

    Sections generated:
      executive_summary, technical_response, compliance_response,
      past_experience, implementation_methodology, risk_mitigation, company_profile
    """
    validate_non_empty_list(req.requirements, "requirements")
    logger.info(
        "Proposal generation: rfp='%s' requirements=%d caps=%d",
        req.workspace_name, len(req.requirements), len(req.matched_capabilities),
    )
    return generate_proposal(
        requirements=req.requirements,
        matched_capabilities=req.matched_capabilities,
        compliance_data=req.compliance_data,
        workspace_name=req.workspace_name or "RFP",
    )
