"""
app/api/scoring.py
Win probability and GO/NO-GO decision endpoints.
"""

from fastapi import APIRouter

from app.models.request_models import DecisionRequest, WinProbRequest
from app.services.scoring_service import compute_decision, compute_win_probability
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Injected by main.py after dataset load
_bid_history_df = None


def set_bid_history_df(df) -> None:
    global _bid_history_df
    _bid_history_df = df


@router.post("/win-probability")
async def win_probability(req: WinProbRequest):
    """
    Compute win probability using weighted formula:
    35% compliance + 30% capability + 20% historical + 15% budget alignment.
    """
    logger.info(
        "Win probability: compliance=%.1f capability=%.1f sector='%s'",
        req.compliance_score, req.capability_score, req.sector,
    )
    return compute_win_probability(
        compliance_score=req.compliance_score,
        capability_score=req.capability_score,
        sector=req.sector or "",
        budget_str=req.budget or "",
        bid_history_df=_bid_history_df,
    )


@router.post("/decision")
async def go_no_go(req: DecisionRequest):
    """
    Multi-factor weighted GO/NO-GO decision engine.
    Uses composite scoring across compliance, capability, win probability, and completeness.
    """
    logger.info(
        "Decision request: win_prob=%.1f compliance=%.1f missing=%d",
        req.win_probability, req.compliance_score, req.missing_count,
    )
    return compute_decision(
        win_prob=req.win_probability,
        compliance_score=req.compliance_score,
        capability_score=req.capability_score,
        missing_count=req.missing_count,
        sector=req.sector or "",
        requirements=req.requirements,
        matched_capabilities=req.matched_capabilities,
    )
