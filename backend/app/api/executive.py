"""
app/api/executive.py
Executive summary and historical analysis endpoints.
"""

from fastapi import APIRouter

from app.models.request_models import ExecutiveSummaryRequest, HistoricalAnalysisRequest
from app.services.executive_service import generate_executive_summary
from app.services.historical_service import analyze_historical_bids
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Injected by main.py after dataset load
_bid_history_df = None


def set_bid_history_df(df) -> None:
    global _bid_history_df
    _bid_history_df = df


@router.post("/executive-summary")
async def executive_summary(req: ExecutiveSummaryRequest):
    """
    Generate a synthesised executive summary from all analysis outputs.

    Returns:
      tender_overview, major_strengths, major_weaknesses,
      compliance_summary, historical_insights, final_recommendation
    """
    logger.info("Executive summary requested")
    return generate_executive_summary(
        requirements=req.requirements,
        compliance_data=req.compliance_data,
        win_probability_data=req.win_probability_data,
        decision_data=req.decision_data,
        historical_data=req.historical_data,
    )


@router.post("/historical-analysis")
async def historical_analysis(req: HistoricalAnalysisRequest):
    """
    Analyse historical bid outcomes from the dataset.

    Returns:
      similar_projects, avg_win_rate, avg_evaluation_score,
      avg_contract_value, most_common_loss_reasons, sector_performance
    """
    logger.info("Historical analysis: sector='%s'", req.sector)
    return analyze_historical_bids(
        bid_history_df=_bid_history_df,
        sector=req.sector or "",
        budget=req.budget or "",
    )
