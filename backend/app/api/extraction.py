"""
app/api/extraction.py
Text extraction and requirement extraction endpoints.
"""

from fastapi import APIRouter, HTTPException

from app.models.request_models import ExtractRequirementsRequest, ExtractTextRequest, NERRequest
from app.services.extraction_service import extract_requirements_from_text
from app.services.llm_service import GeminiAuthError, GeminiQuotaError
from app.services.ner_service import extract_entities
from app.services.pdf_service import extract_pdf_text
from app.services.docx_service import extract_docx_text
from app.utils.logger import get_logger
from app.utils.validators import validate_filepath

router = APIRouter()
logger = get_logger(__name__)


def _extract_document(filepath: str) -> dict:
    """Route to the correct extractor based on file extension."""
    if filepath.lower().endswith(".docx"):
        return extract_docx_text(filepath)
    return extract_pdf_text(filepath)


@router.post("/extract-text")
async def extract_text(payload: ExtractTextRequest):
    """Extract raw text from an uploaded PDF or DOCX."""
    validate_filepath(payload.filepath)
    result = _extract_document(payload.filepath)
    return {
        "pages": result["pages"],
        "text": result["full_text"],
        "char_count": len(result["full_text"]),
        "status": "extracted",
    }


@router.post("/extract-requirements")
async def extract_requirements(payload: ExtractRequirementsRequest):
    """
    Full extraction pipeline:
      1. Extract all text from document
      2. Run NER on full text
      3. Chunk text and run LLM on EVERY chunk
      4. Merge and deduplicate results
      5. Return structured requirements
    """
    validate_filepath(payload.filepath)

    # Step 1: Extract full text
    pdf_data = _extract_document(payload.filepath)
    full_text = pdf_data["full_text"]

    logger.info(
        "Starting extraction: %d pages, %d chars", pdf_data["pages"], len(full_text)
    )

    try:
        requirements, stats = extract_requirements_from_text(full_text)
    except GeminiAuthError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except GeminiQuotaError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc

    return {
        "status": "success",
        "pages": pdf_data["pages"],
        "requirements": requirements,
        "chunks_used": stats["chunks_used"],
        "total_chunks": stats["total_chunks"],
        "chunks_processed": stats["chunks_processed"],
        "extraction_mode": stats.get("mode", "unknown"),
    }


@router.post("/ner")
async def run_ner(payload: NERRequest):
    """Standalone NER endpoint — extract named entities from an uploaded document."""
    validate_filepath(payload.filepath)
    pdf_data = _extract_document(payload.filepath)
    entities = extract_entities(pdf_data["full_text"])
    return {"status": "success", "entities": entities}
