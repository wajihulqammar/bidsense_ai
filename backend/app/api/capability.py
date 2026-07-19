"""
app/api/capability.py
Capability matching endpoint.
"""

from fastapi import APIRouter

from app.models.request_models import MatchRequest
from app.services.capability_service import run_capability_matching
from app.utils.logger import get_logger
from app.utils.validators import validate_non_empty_list

router = APIRouter()
logger = get_logger(__name__)


@router.post("/match-capabilities")
async def match_capabilities(req: MatchRequest):
    """
    RAG capability matching:
    For each requirement, query ChromaDB → retrieve top-K evidence →
    send to LLM for grounded assessment.
    """
    validate_non_empty_list(req.requirements, "requirements")
    logger.info("Capability matching request: %d requirements", len(req.requirements))
    return run_capability_matching(req.requirements)
