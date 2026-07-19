"""
app/main.py
BidSense AI — FastAPI application entry point.

Startup sequence:
  1. Load .env configuration
  2. Load dataset (bid history + capability library)
  3. Index capability library into ChromaDB
  4. Register all API routers
  5. Wire dataset references into routes that need them
"""

import os
import time

import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import capability, compliance, executive, extraction, health, proposal, scoring, upload
from app.rag.index_builder import build_capability_index
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ── App factory ───────────────────────────────────────────────────────────

app = FastAPI(
    title="BidSense AI Backend",
    description="AI-powered Bid Intelligence & Decision Engine",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ──────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "detail": str(exc), "path": str(request.url.path)},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "detail": exc.detail, "path": str(request.url.path)},
    )


# ── Dataset state (shared across route modules) ───────────────────────────

bid_history_df: pd.DataFrame | None = None
capability_df: pd.DataFrame | None = None


def _normalize_bid_history(df: pd.DataFrame) -> pd.DataFrame:
    """Map custom bid-history column names to the schema used by historical_service."""
    if "Project Name" in df.columns:
        return df
    out = df.copy()
    if "Client" in out.columns:
        if "Bid ID" in out.columns:
            out["Project Name"] = out["Bid ID"].astype(str) + " — " + out["Client"].astype(str)
        else:
            out["Project Name"] = out["Client"]
    if "Score (%)" in out.columns:
        out["Evaluation Score"] = out["Score (%)"]
    if "Budget" in out.columns:
        out["Contract Value"] = out["Budget"]
    if "Submission Date" in out.columns:
        out["Year"] = pd.to_datetime(out["Submission Date"], errors="coerce").dt.year
    if "Gaps Found" in out.columns:
        out["Loss Reason"] = out.apply(
            lambda r: f"{int(r['Gaps Found'])} compliance gaps"
            if str(r.get("Outcome", "")).lower() != "win" and pd.notna(r.get("Gaps Found"))
            else "",
            axis=1,
        )
    return out


def _load_dataset() -> None:
    global bid_history_df, capability_df

    data_path = settings.DATA_PATH
    if not os.path.exists(data_path):
        logger.warning("Dataset not found at %s — historical features disabled", data_path)
        return

    try:
        t0 = time.perf_counter()
        bid_history_df = _normalize_bid_history(pd.read_excel(
            data_path, sheet_name=settings.BID_HISTORY_SHEET, skiprows=settings.DATASET_SKIPROWS,
        ))
        capability_df = pd.read_excel(
            data_path, sheet_name=settings.CAPABILITY_SHEET, skiprows=settings.DATASET_SKIPROWS,
        )
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.info(
            "Dataset loaded in %s ms: bid_history=%d rows, capability=%d rows",
            elapsed, len(bid_history_df), len(capability_df),
        )
    except Exception as exc:
        logger.error("Dataset load failed: %s", exc)
        bid_history_df = None
        capability_df = None


def _index_chroma() -> int:
    if capability_df is None:
        logger.warning("Capability DataFrame unavailable — ChromaDB not indexed")
        return 0
    return build_capability_index(capability_df)


# ── Startup ───────────────────────────────────────────────────────────────

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("BidSense AI starting up…")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    _load_dataset()
    chroma_count = _index_chroma()

    # Wire dataset into route modules that need it
    scoring.set_bid_history_df(bid_history_df)
    executive.set_bid_history_df(bid_history_df)

    # Update health state
    health.update_health_state(
        dataset_loaded=bid_history_df is not None,
        chroma_indexed=chroma_count > 0,
        bid_history_rows=len(bid_history_df) if bid_history_df is not None else 0,
        capability_rows=len(capability_df) if capability_df is not None else 0,
    )

    logger.info(
        "Startup complete. ChromaDB records: %d. API ready at http://0.0.0.0:8000",
        chroma_count,
    )


# ── Routers ───────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(upload.router)
app.include_router(extraction.router)
app.include_router(capability.router)
app.include_router(compliance.router)
app.include_router(scoring.router)
app.include_router(proposal.router)
app.include_router(executive.router)


# ── Full pipeline (single-call convenience endpoint) ─────────────────────

@app.post("/full-pipeline")
async def full_pipeline(payload: dict):
    """
    Run the complete BidSense analysis pipeline in a single API call.
    Equivalent to calling all steps in sequence.

    Returns: requirements, capability_matching, compliance, win_probability, decision
    """
    from app.api.extraction import _extract_document
    from app.services.capability_service import run_capability_matching
    from app.services.compliance_service import analyze_compliance
    from app.services.extraction_service import extract_requirements_from_text
    from app.services.scoring_service import compute_win_probability, compute_decision
    from app.services.chunking_service import build_requirements_list
    from app.utils.validators import validate_filepath

    filepath = payload.get("filepath", "")
    sector = payload.get("sector", "")

    validate_filepath(filepath)

    logger.info("Full pipeline started for: %s", filepath)
    t0 = time.perf_counter()

    # 1. Extract text + requirements (+ NER in efficiency mode)
    pdf_data = _extract_document(filepath)
    full_text = pdf_data["full_text"]
    requirements_data, _ = extract_requirements_from_text(full_text)

    # 3. Build requirements list (all sections + NER fallback)
    all_reqs = build_requirements_list(requirements_data)

    # 4. RAG capability matching
    match_result = run_capability_matching(all_reqs)
    matched = match_result["matched"]
    summary = match_result["summary"]

    # 5. Compliance analysis
    comp_result = analyze_compliance(matched)

    # 6. Win probability
    detected_sector = sector or requirements_data.get("sector", "")
    budgets = requirements_data.get("budget", [])
    budget_str = str(budgets[0].get("amount", "")) if budgets else ""

    win_result = compute_win_probability(
        compliance_score=comp_result["compliance_score"],
        capability_score=summary["capability_score"],
        sector=detected_sector,
        budget_str=budget_str,
        bid_history_df=bid_history_df,
    )

    # 7. GO/NO-GO decision
    decision_result = compute_decision(
        win_prob=win_result["win_probability"],
        compliance_score=comp_result["compliance_score"],
        capability_score=summary["capability_score"],
        missing_count=comp_result["missing"],
        sector=detected_sector,
    )

    elapsed = round((time.perf_counter() - t0) * 1000, 1)
    logger.info("Full pipeline completed in %s ms", elapsed)

    return {
        "status": "success",
        "processing_time_ms": elapsed,
        "requirements": requirements_data,
        "capability_matching": {"matched": matched, "summary": summary},
        "compliance": comp_result,
        "win_probability": win_result,
        "decision": decision_result,
    }


# ── Dev entry point ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
