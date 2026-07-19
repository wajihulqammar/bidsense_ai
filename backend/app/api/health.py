"""
app/api/health.py
Health check endpoint.
"""

from fastapi import APIRouter

from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# These are set by main.py after dataset load
_state: dict = {
    "dataset_loaded": False,
    "chroma_indexed": False,
    "bid_history_rows": 0,
    "capability_rows": 0,
}


def update_health_state(**kwargs: object) -> None:
    _state.update(kwargs)


@router.get("/health")
def health_check():
    logger.debug("Health check requested")
    return {
        "status": "ok",
        "version": "2.0.0",
        **_state,
    }


@router.get("/")
def root():
    return {"status": "BidSense AI Backend Running", "version": "2.0.0"}
