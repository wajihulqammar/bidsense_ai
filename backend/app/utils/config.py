"""
app/utils/config.py
Centralised settings loaded from environment variables / .env file.
All other modules import from here — never from os.environ directly.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (two levels up from this file)
_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(_ROOT / ".env")


class Settings:
    # ── Google Gemini ──────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_TEMPERATURE: float = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))

    # ── Storage paths ────────────────────────────────────────────────────
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "app/uploads")
    DATA_PATH: str = os.getenv("DATA_PATH", "app/data/dataset.xlsx")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "app/data/chroma_store")
    BID_HISTORY_SHEET: str = os.getenv("BID_HISTORY_SHEET", "PS1 – Bid History")
    CAPABILITY_SHEET: str = os.getenv("CAPABILITY_SHEET", "PS1 – Capability Library")
    DATASET_SKIPROWS: int = int(os.getenv("DATASET_SKIPROWS", "2"))

    # ── Processing ───────────────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    MAX_REQUIREMENTS_PER_REQUEST: int = int(os.getenv("MAX_REQUIREMENTS_PER_REQUEST", "25"))
    MAX_EXTRACTION_CHUNKS: int = int(os.getenv("MAX_EXTRACTION_CHUNKS", "6"))
    MAX_EXTRACTION_CHARS: int = int(os.getenv("MAX_EXTRACTION_CHARS", "250000"))
    LLM_EFFICIENCY_MODE: bool = os.getenv("LLM_EFFICIENCY_MODE", "true").lower() in ("1", "true", "yes")
    PROPOSAL_COMBINED: bool = os.getenv("PROPOSAL_COMBINED", "true").lower() in ("1", "true", "yes")
    TOP_K_RAG_RESULTS: int = int(os.getenv("TOP_K_RAG_RESULTS", "4"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "3000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "300"))

    # ── Scoring thresholds ───────────────────────────────────────────────
    WIN_PROB_GO_THRESHOLD: float = 65.0
    WIN_PROB_CONDITIONAL_THRESHOLD: float = 50.0
    COMPLIANCE_MIN_THRESHOLD: float = 60.0
    COMPLIANCE_GOOD_THRESHOLD: float = 75.0
    MISSING_REQS_NOGO_THRESHOLD: int = 5

    # ── Win-probability formula weights ─────────────────────────────────
    WEIGHT_COMPLIANCE: float = 0.35
    WEIGHT_CAPABILITY: float = 0.30
    WEIGHT_HISTORICAL: float = 0.20
    WEIGHT_BUDGET: float = 0.15


settings = Settings()
