"""
app/services/historical_service.py
Historical bid analysis using the dataset's Bid History sheet.
"""

import pandas as pd

from app.utils.helpers import safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)


def analyze_historical_bids(
    bid_history_df: pd.DataFrame | None,
    sector: str = "",
    budget: str = "",
) -> dict:
    """
    Analyze historical bid outcomes to provide contextual intelligence.

    Returns:
        {
            "status": "success",
            "analysis": {
                "similar_projects": [...],
                "avg_win_rate": float,
                "avg_evaluation_score": float,
                "avg_contract_value": str,
                "most_common_loss_reasons": [...],
                "sector_performance": {...}
            }
        }
    """
    if bid_history_df is None:
        return {"status": "success", "analysis": _empty_analysis()}

    try:
        df = bid_history_df.copy()

        # Filter to sector if provided
        sector_df = df
        if sector:
            mask = df.get("Sector", pd.Series(dtype=str)).str.lower() == sector.lower()
            sector_df = df[mask] if mask.any() else df

        total = len(sector_df)
        if total == 0:
            return {"status": "success", "analysis": _empty_analysis()}

        wins = sector_df[sector_df.get("Outcome", pd.Series()) == "Win"]
        win_rate = round(len(wins) / total * 100, 1)

        # Average evaluation score
        avg_eval = _safe_mean(sector_df, "Evaluation Score")

        # Average contract value
        avg_value = _safe_mean(sector_df, "Contract Value")
        avg_value_str = f"PKR {avg_value:,.0f}" if avg_value else "N/A"

        # Most common loss reasons
        loss_df = sector_df[sector_df.get("Outcome", pd.Series()) != "Win"]
        loss_reasons = _top_values(loss_df, "Loss Reason", n=5)

        # Similar project summaries (up to 5)
        similar = []
        for _, row in sector_df.head(5).iterrows():
            similar.append({
                "project": str(row.get("Project Name", row.get("Tender Name", ""))),
                "outcome": str(row.get("Outcome", "")),
                "year": str(row.get("Year", "")),
                "value": str(row.get("Contract Value", "")),
            })

        # Sector performance breakdown
        sector_perf = {}
        for s in df.get("Sector", pd.Series()).dropna().unique():
            s_df = df[df["Sector"] == s]
            s_wins = len(s_df[s_df.get("Outcome", pd.Series()) == "Win"])
            sector_perf[str(s)] = {
                "total_bids": len(s_df),
                "wins": s_wins,
                "win_rate": round(s_wins / len(s_df) * 100, 1) if len(s_df) > 0 else 0,
            }

        analysis = {
            "similar_projects": similar,
            "avg_win_rate": win_rate,
            "avg_evaluation_score": avg_eval,
            "avg_contract_value": avg_value_str,
            "most_common_loss_reasons": loss_reasons,
            "sector_performance": sector_perf,
            "total_bids_analyzed": total,
            "sector_filter": sector or "All",
        }

        logger.info(
            "Historical analysis: sector='%s' total=%d win_rate=%.1f%%",
            sector or "All", total, win_rate,
        )
        return {"status": "success", "analysis": analysis}

    except Exception as exc:
        logger.error("Historical analysis failed: %s", exc)
        return {"status": "success", "analysis": _empty_analysis()}


def _safe_mean(df: pd.DataFrame, col: str) -> float:
    if col not in df.columns:
        return 0.0
    try:
        return round(float(df[col].dropna().astype(float).mean()), 2)
    except Exception:
        return 0.0


def _top_values(df: pd.DataFrame, col: str, n: int = 5) -> list[str]:
    if col not in df.columns or df.empty:
        return []
    try:
        return df[col].dropna().value_counts().head(n).index.tolist()
    except Exception:
        return []


def _empty_analysis() -> dict:
    return {
        "similar_projects": [],
        "avg_win_rate": 0.0,
        "avg_evaluation_score": 0.0,
        "avg_contract_value": "N/A",
        "most_common_loss_reasons": [],
        "sector_performance": {},
        "total_bids_analyzed": 0,
        "sector_filter": "All",
    }
