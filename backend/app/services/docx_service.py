"""
app/services/docx_service.py
DOCX text extraction using python-docx.
"""

from app.utils.logger import get_logger

logger = get_logger(__name__)


def extract_docx_text(filepath: str) -> dict:
    """
    Extract text from a DOCX file.

    Returns the same dict shape as pdf_service.extract_pdf_text so the
    rest of the pipeline can treat both identically.
    """
    try:
        from docx import Document  # python-docx
    except ImportError:
        raise RuntimeError(
            "python-docx is not installed. Run: pip install python-docx"
        )

    logger.info("Extracting DOCX: %s", filepath)
    doc = Document(filepath)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    # Group into virtual "pages" of ~40 paragraphs each
    page_size = 40
    pages_data: list[dict] = []
    for i in range(0, len(paragraphs), page_size):
        chunk = paragraphs[i : i + page_size]
        pages_data.append({"page": len(pages_data) + 1, "text": "\n".join(chunk)})

    if not pages_data:
        pages_data = [{"page": 1, "text": ""}]

    full_text = "\n".join(p["text"] for p in pages_data)
    logger.info("DOCX extraction complete: %d virtual pages, %d chars", len(pages_data), len(full_text))

    return {
        "pages": len(pages_data),
        "full_text": full_text,
        "pages_data": pages_data,
    }
