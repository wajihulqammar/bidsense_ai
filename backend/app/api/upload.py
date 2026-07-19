"""
app/api/upload.py
File upload endpoint.
"""

import os

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.pdf_service import get_pdf_page_count
from app.utils.config import settings
from app.utils.helpers import generate_id
from app.utils.logger import get_logger
from app.utils.validators import validate_extension

router = APIRouter()
logger = get_logger(__name__)


@router.post("/upload")
async def upload_rfp(file: UploadFile = File(...)):
    """Upload an RFP PDF or DOCX file. Returns workspace_id and file metadata."""
    validate_extension(file.filename or "")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    workspace_id = generate_id(8)
    filename = f"{workspace_id}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    logger.info("Uploaded file: %s (%d bytes)", filename, len(content))

    pages = get_pdf_page_count(filepath) if filepath.endswith(".pdf") else 0

    return {
        "workspace_id": workspace_id,
        "filename": filename,
        "filepath": filepath,
        "pages": pages,
        "status": "uploaded",
        "message": f"File uploaded successfully. {pages} pages detected.",
    }
