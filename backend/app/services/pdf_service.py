"""
app/services/pdf_service.py
PDF text extraction using PyMuPDF (fitz).
Extracts ALL pages — no page limit.
"""

import fitz  # PyMuPDF

from app.utils.logger import get_logger

logger = get_logger(__name__)


def extract_pdf_text(filepath: str) -> dict:
    """
    Extract text from every page of a PDF.

    Returns:
        {
            "pages": int,
            "full_text": str,
            "pages_data": [{"page": int, "text": str}]
        }
    """
    logger.info("Extracting PDF: %s", filepath)
    doc = fitz.open(filepath)
    pages_data: list[dict] = []

    for i, page in enumerate(doc):
        text = page.get_text()
        pages_data.append({"page": i + 1, "text": text})

    doc.close()
    full_text = "\n".join(p["text"] for p in pages_data)
    logger.info("PDF extraction complete: %d pages, %d chars", len(pages_data), len(full_text))

    return {
        "pages": len(pages_data),
        "full_text": full_text,
        "pages_data": pages_data,
    }


def get_pdf_page_count(filepath: str) -> int:
    """Quick page count without full text extraction."""
    try:
        doc = fitz.open(filepath)
        count = len(doc)
        doc.close()
        return count
    except Exception as exc:
        logger.error("Page count failed for %s: %s", filepath, exc)
        return 0
