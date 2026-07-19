"""
app/models/request_models.py
Pydantic models for all incoming request bodies.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


class UploadRequest(BaseModel):
    """Not used directly (file uploads use Form/File), kept for documentation."""
    pass


class ExtractTextRequest(BaseModel):
    filepath: str


class ExtractRequirementsRequest(BaseModel):
    filepath: str


class NERRequest(BaseModel):
    filepath: str


class MatchRequest(BaseModel):
    requirements: list[Any] = Field(..., min_length=1)
    workspace_id: Optional[str] = ""


class ComplianceRequest(BaseModel):
    requirements: list[Any]
    matched_capabilities: list[dict] = Field(..., min_length=1)


class WinProbRequest(BaseModel):
    compliance_score: float = Field(..., ge=0, le=100)
    capability_score: float = Field(..., ge=0, le=100)
    sector: Optional[str] = ""
    budget: Optional[str] = ""


class DecisionRequest(BaseModel):
    win_probability: float = Field(..., ge=0, le=100)
    compliance_score: float = Field(..., ge=0, le=100)
    capability_score: float = Field(..., ge=0, le=100)
    missing_count: int = Field(default=0, ge=0)
    sector: Optional[str] = ""
    requirements: Optional[list[Any]] = None
    matched_capabilities: Optional[list[dict]] = None


class ProposalRequest(BaseModel):
    requirements: list[Any]
    matched_capabilities: list[dict]
    compliance_data: dict
    workspace_name: Optional[str] = "RFP"


class ExecutiveSummaryRequest(BaseModel):
    requirements: dict
    compliance_data: dict
    win_probability_data: dict
    decision_data: dict
    historical_data: Optional[dict] = None


class HistoricalAnalysisRequest(BaseModel):
    sector: Optional[str] = ""
    budget: Optional[str] = ""
    requirements: Optional[list[Any]] = None


class FullPipelineRequest(BaseModel):
    filepath: str
    sector: Optional[str] = ""
