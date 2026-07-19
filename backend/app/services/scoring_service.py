"""
app/services/scoring_service.py
Win probability scoring and GO/NO-GO decision engine.

Win probability uses a weighted formula:
  35% × compliance + 30% × capability + 20% × historical + 15% × budget_alignment

GO/NO-GO uses multiple weighted factors — NOT a single threshold.
"""

import re

import numpy as np
import pandas as pd

from app.prompts.scoring_prompt import build_decision_prompt
from app.prompts.system_prompt import BASE_STRATEGY_ADVISOR
from app.services.llm_service import call_llm_json
from app.utils.config import settings
from app.utils.constants import (
    DECISION_GO, DECISION_CONDITIONAL, DECISION_NOGO,
)
from app.utils.helpers import clamp, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)


# ── Win Probability ───────────────────────────────────────────────────────

def compute_win_probability(
    compliance_score: float,
    capability_score: float,
    sector: str,
    budget_str: str,
    bid_history_df: pd.DataFrame | None,
) -> dict:
    """Compute win probability and return full scoring breakdown."""

    historical_win_rate, sector_bids, sector_wins = _get_historical_win_rate(
        sector, bid_history_df
    )
    budget_alignment = _compute_budget_alignment(budget_str, bid_history_df)

    win_prob = round(
        settings.WEIGHT_COMPLIANCE * compliance_score
        + settings.WEIGHT_CAPABILITY * capability_score
        + settings.WEIGHT_HISTORICAL * historical_win_rate
        + settings.WEIGHT_BUDGET * budget_alignment,
        1,
    )
    win_prob = min(win_prob, 98.0)

    positive_factors = _positive_factors(compliance_score, capability_score, historical_win_rate)
    negative_factors = _negative_factors(compliance_score, capability_score, historical_win_rate)

    confidence = "High" if win_prob >= 70 else "Medium" if win_prob >= 50 else "Low"

    return {
        "status": "success",
        "win_probability": win_prob,
        "compliance_score": compliance_score,
        "capability_score": capability_score,
        "historical_win_rate": historical_win_rate,
        "budget_alignment": budget_alignment,
        "sector_bids": sector_bids,
        "sector_wins": sector_wins,
        "radar_data": _build_radar(compliance_score, capability_score, historical_win_rate, budget_alignment),
        "sector_chart": _build_sector_chart(bid_history_df),
        "formula": {
            "compliance_weight": "35%",
            "capability_weight": "30%",
            "historical_weight": "20%",
            "budget_weight": "15%",
        },
        "positive_factors": positive_factors,
        "negative_factors": negative_factors,
        "confidence": confidence,
    }


def _get_historical_win_rate(
    sector: str, df: pd.DataFrame | None
) -> tuple[float, int, int]:
    default_rate = 65.0
    if df is None or not sector:
        return default_rate, 0, 0
    try:
        sector_df = df[df["Sector"].str.lower() == sector.lower()]
        if len(sector_df) == 0:
            return default_rate, 0, 0
        wins = len(sector_df[sector_df["Outcome"] == "Win"])
        rate = round(wins / len(sector_df) * 100, 1)
        return rate, len(sector_df), wins
    except Exception as exc:
        logger.warning("Historical win rate calculation failed: %s", exc)
        return default_rate, 0, 0


def _compute_budget_alignment(budget_str: str, df: pd.DataFrame | None) -> float:
    if not budget_str or df is None:
        return 75.0
    try:
        nums = re.findall(r"\d+", budget_str.replace(",", ""))
        if not nums:
            return 75.0
        budget_val = float(nums[0])
        avg_budget = (
            df["Budget"].str.extract(r"(\d+)")[0].astype(float).mean()
            if "Budget" in df.columns
            else budget_val
        )
        ratio = budget_val / avg_budget if avg_budget else 1.0
        alignment = clamp(70.0 + (1 - abs(1 - ratio)) * 30.0, 0.0, 100.0)
        return round(alignment, 1)
    except Exception:
        return 75.0


def _build_radar(c: float, cap: float, h: float, b: float) -> list[dict]:
    return [
        {"factor": "Compliance Fit", "value": round(c)},
        {"factor": "Capability Match", "value": round(cap)},
        {"factor": "Historical Win", "value": round(h)},
        {"factor": "Budget Alignment", "value": round(b)},
        {"factor": "Team Strength", "value": 72},
        {"factor": "Competitor Risk", "value": 58},
    ]


def _build_sector_chart(df: pd.DataFrame | None) -> list[dict]:
    if df is None:
        return []
    try:
        result = []
        for s in df["Sector"].unique():
            s_df = df[df["Sector"] == s]
            wins = len(s_df[s_df["Outcome"] == "Win"])
            result.append({
                "sector": s,
                "winRate": round(wins / len(s_df) * 100, 1),
                "bids": len(s_df),
            })
        return result
    except Exception:
        return []


def _positive_factors(c: float, cap: float, h: float) -> list[str]:
    factors = []
    if c >= 75:
        factors.append(f"Strong compliance score ({c:.0f}%)")
    if cap >= 70:
        factors.append(f"High capability match ({cap:.0f}%)")
    if h >= 65:
        factors.append(f"Good historical win rate in sector ({h:.0f}%)")
    return factors or ["Adequate baseline scores across key factors"]


def _negative_factors(c: float, cap: float, h: float) -> list[str]:
    factors = []
    if c < 70:
        factors.append(f"Below-threshold compliance score ({c:.0f}%)")
    if cap < 60:
        factors.append(f"Significant capability gaps ({cap:.0f}%)")
    if h < 50:
        factors.append(f"Low historical win rate in sector ({h:.0f}%)")
    return factors or ["No critical negative factors identified"]


# ── GO / NO-GO Decision ───────────────────────────────────────────────────

def compute_decision(
    win_prob: float,
    compliance_score: float,
    capability_score: float,
    missing_count: int,
    sector: str = "",
    requirements: list | None = None,
    matched_capabilities: list | None = None,
) -> dict:
    """
    Multi-factor weighted GO/NO-GO decision engine.
    Does NOT rely on a single threshold.
    """
    # Weighted factor scores
    weighted_factors = {
        "compliance":  round(compliance_score * 0.30, 1),
        "capability":  round(capability_score * 0.25, 1),
        "win_prob":    round(win_prob * 0.25, 1),
        "completeness": round(max(0.0, 100 - missing_count * 10) * 0.20, 1),
    }
    total_score = sum(weighted_factors.values())

    # Decision logic — multiple conditions, not a single threshold
    if compliance_score < settings.COMPLIANCE_MIN_THRESHOLD:
        decision = DECISION_NOGO
        reason = f"Compliance score ({compliance_score:.0f}%) below minimum threshold of {settings.COMPLIANCE_MIN_THRESHOLD:.0f}% — disqualification risk is high."
    elif missing_count >= settings.MISSING_REQS_NOGO_THRESHOLD:
        decision = DECISION_NOGO
        reason = f"{missing_count} critical requirements are unmet — proceeding would expose significant compliance and evaluation risk."
    elif total_score >= 65 and compliance_score >= 75:
        decision = DECISION_GO
        reason = (
            f"Multi-factor analysis yields a composite score of {total_score:.0f}/100. "
            f"Win probability {win_prob:.0f}%, compliance {compliance_score:.0f}%, "
            f"and capability match {capability_score:.0f}% all support proceeding."
        )
    elif total_score >= 50:
        decision = DECISION_CONDITIONAL
        reason = (
            f"Borderline composite score of {total_score:.0f}/100. "
            f"Proceed only if identified capability gaps can be addressed before submission. "
            f"Win probability: {win_prob:.0f}%."
        )
    else:
        decision = DECISION_NOGO
        reason = (
            f"Low composite score ({total_score:.0f}/100) across compliance, capability, "
            f"and win probability factors. Resource investment is not justified."
        )

    # LLM enrichment (skipped in efficiency mode — decision logic is already computed)
    if settings.LLM_EFFICIENCY_MODE:
        llm_result = _rule_based_decision_enrichment(
            decision, reason, missing_count, compliance_score, capability_score, win_prob,
        )
    else:
        llm_result = call_llm_json(
            system_prompt=BASE_STRATEGY_ADVISOR,
            user_prompt=build_decision_prompt(
                decision, win_prob, compliance_score, capability_score,
                missing_count, sector, weighted_factors,
            ),
            fallback={
                "executive_recommendation": reason,
                "confidence": "Medium",
                "risks": [],
                "action_items": [],
                "positive_factors": [],
                "negative_factors": [],
            },
        )

    logger.info(
        "Decision: %s (composite=%.1f win_prob=%.1f compliance=%.1f)",
        decision, total_score, win_prob, compliance_score,
    )

    return {
        "status": "success",
        "decision": decision,
        "reason": reason,
        "win_probability": win_prob,
        "compliance_score": compliance_score,
        "confidence": llm_result.get("confidence", "Medium"),
        "risks": llm_result.get("risks", []),
        "executive_recommendation": llm_result.get("executive_recommendation", reason),
        "thresholds": {
            "win_prob_threshold": settings.WIN_PROB_GO_THRESHOLD,
            "compliance_threshold": settings.COMPLIANCE_GOOD_THRESHOLD,
        },
        "action_items": llm_result.get("action_items", []),
        "weighted_factors": weighted_factors,
        "composite_score": round(total_score, 1),
    }


def _rule_based_decision_enrichment(
    decision: str,
    reason: str,
    missing_count: int,
    compliance_score: float,
    capability_score: float,
    win_prob: float,
) -> dict:
    """Build decision UI fields without an extra LLM call."""
    risks = []
    if missing_count > 0:
        risks.append({
            "text": f"{missing_count} requirement(s) have no matching capability evidence",
            "severity": "High" if missing_count >= 3 else "Medium",
        })
    if compliance_score < 75:
        risks.append({
            "text": f"Compliance score {compliance_score:.0f}% is below the 75% target",
            "severity": "High" if compliance_score < 60 else "Medium",
        })
    if capability_score < 70:
        risks.append({
            "text": f"Capability match score {capability_score:.0f}% needs improvement",
            "severity": "Medium",
        })

    action_items = []
    if missing_count > 0:
        action_items.append({
            "task": "Obtain evidence or certifications for unmatched mandatory requirements",
            "priority": "Critical",
            "days": 5,
        })
    if compliance_score < 75:
        action_items.append({
            "task": "Close compliance gaps before final submission",
            "priority": "High",
            "days": 7,
        })

    confidence = "High" if decision == DECISION_GO and win_prob >= 65 else "Medium"
    if decision == DECISION_NOGO:
        confidence = "High"

    return {
        "executive_recommendation": reason,
        "confidence": confidence,
        "risks": risks,
        "action_items": action_items,
        "positive_factors": [
            f"Win probability estimated at {win_prob:.0f}%",
            f"Compliance score {compliance_score:.0f}%",
        ] if win_prob >= 50 else [],
        "negative_factors": [r["text"] for r in risks],
    }
