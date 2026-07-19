"""
app/api/compliance.py
Compliance analysis endpoint.
"""

from fastapi import APIRouter

from app.models.request_models import ComplianceRequest
from app.services.compliance_service import analyze_compliance
from app.utils.logger import get_logger
from app.utils.validators import validate_non_empty_list

router = APIRouter()
logger = get_logger(__name__)


@router.post("/compliance")
async def compliance_analysis(req: ComplianceRequest):
    """
    Compute compliance score with LLM-enriched risk assessment.
    Returns pass/partial/missing breakdown, risk levels, and grade.
    """
    validate_non_empty_list(req.matched_capabilities, "matched_capabilities")
    logger.info("Compliance analysis: %d matched items", len(req.matched_capabilities))
    return analyze_compliance(req.matched_capabilities)
