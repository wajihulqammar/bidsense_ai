"""
app/models/schemas.py
Internal data-transfer schemas used between service layers.
Not directly exposed to API consumers.
"""

from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class Requirement:
    text: str
    priority: str = "Medium"
    tag: str = "General"

    @classmethod
    def from_dict(cls, data: Any) -> "Requirement":
        if isinstance(data, str):
            return cls(text=data)
        return cls(
            text=data.get("text", ""),
            priority=data.get("priority", "Medium"),
            tag=data.get("tag", "General"),
        )

    def to_dict(self) -> dict:
        return {"text": self.text, "priority": self.priority, "tag": self.tag}


@dataclass
class CapabilityRecord:
    cap_id: str
    domain: str
    summary: str
    certification: str
    year: str
    value: str
    client_type: str

    def to_embedding_text(self) -> str:
        return (
            f"{self.domain}: {self.summary}. "
            f"Certification: {self.certification}. "
            f"Year: {self.year}. "
            f"Contract Value: {self.value}. "
            f"Client Type: {self.client_type}"
        )

    def to_metadata(self) -> dict:
        return {
            "domain": self.domain,
            "cert": self.certification,
            "year": self.year,
            "value": self.value,
            "client_type": self.client_type,
        }


@dataclass
class MatchResult:
    requirement: str
    status: str
    confidence: float
    evidence: str
    matched_caps: list[str] = field(default_factory=list)
    gap: Optional[str] = None
    similarity_score: float = 0.0

    def to_dict(self) -> dict:
        return {
            "requirement": self.requirement,
            "status": self.status,
            "confidence": self.confidence,
            "evidence": self.evidence,
            "matched_caps": self.matched_caps,
            "gap": self.gap,
            "similarity_score": self.similarity_score,
        }


@dataclass
class ComplianceItem:
    requirement: str
    evidence: str
    status: str
    risk_level: str
    reason: str

    def to_dict(self) -> dict:
        return {
            "requirement": self.requirement,
            "evidence": self.evidence,
            "status": self.status,
            "risk_level": self.risk_level,
            "reason": self.reason,
        }
