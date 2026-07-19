"""
app/services/capability_service.py
Business logic for the /match-capabilities endpoint.
Delegates to rag_service for actual RAG processing.
"""

from app.services.rag_service import match_all_requirements
from app.utils.logger import get_logger

logger = get_logger(__name__)


def run_capability_matching(requirements: list) -> dict:
    """
    Match requirements against the capability library via RAG.

    Returns:
        {
            "status": "success",
            "matched": [...],
            "summary": {...}
        }
    """
    matched, summary = match_all_requirements(requirements)
    return {
        "status": "success",
        "matched": matched,
        "summary": summary,
    }
