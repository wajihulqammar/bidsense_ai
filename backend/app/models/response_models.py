"""
app/models/response_models.py
Pydantic models for all API responses.
"""

from typing import Any, Optional
from pydantic import BaseModel


class StatusResponse(BaseModel):
    status: str
    message: Optional[str] = None


class UploadResponse(BaseModel):
    workspace_id: str
    filename: str
    filepath: str
    pages: int
    status: str
    message: str


class ExtractTextResponse(BaseModel):
    pages: int
    text: str
    char_count: int
    status: str


class NERResponse(BaseModel):
    status: str
    entities: dict


class RequirementsResponse(BaseModel):
    status: str
    pages: int
    requirements: dict
    chunks_used: int
    total_chunks: int
    ner_entities: dict


class CapabilityMatchSummary(BaseModel):
    total: int
    found: int
    partial: int
    missing: int
    avg_confidence: float
    capability_score: float


class CapabilityMatchResponse(BaseModel):
    status: str
    matched: list[dict]
    summary: CapabilityMatchSummary


class ComplianceResponse(BaseModel):
    status: str
    compliance_score: float
    pass_: int
    partial: int
    missing: int
    total: int
    pass_items: list[dict]
    partial_items: list[dict]
    missing_items: list[dict]
    high_risk_count: int
    threshold_met: bool
    grade: str
    compliance_details: Optional[list[dict]] = None

    model_config = {"populate_by_name": True}


class WinProbabilityResponse(BaseModel):
    status: str
    win_probability: float
    compliance_score: float
    capability_score: float
    historical_win_rate: float
    budget_alignment: float
    sector_bids: int
    sector_wins: int
    radar_data: list[dict]
    sector_chart: list[dict]
    formula: dict
    positive_factors: list[str]
    negative_factors: list[str]
    confidence: str


class DecisionResponse(BaseModel):
    status: str
    decision: str
    reason: str
    win_probability: float
    compliance_score: float
    confidence: str
    risks: list[dict]
    executive_recommendation: str
    thresholds: dict
    action_items: list[dict]
    weighted_factors: Optional[dict] = None


class ProposalResponse(BaseModel):
    status: str
    proposal: dict
    metadata: dict


class ExecutiveSummaryResponse(BaseModel):
    status: str
    summary: dict


class HistoricalAnalysisResponse(BaseModel):
    status: str
    analysis: dict


class HealthResponse(BaseModel):
    status: str
    version: str
    dataset_loaded: bool
    chroma_indexed: bool
    bid_history_rows: int
    capability_rows: int
