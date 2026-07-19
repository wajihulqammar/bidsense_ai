"""
app/utils/validators.py
Input validation helpers called from API routes before handing off to services.
"""

import os
from fastapi import HTTPException

from app.utils.constants import SUPPORTED_EXTENSIONS


def validate_filepath(filepath: str) -> None:
    """Raise HTTP 404 if the file does not exist on disk."""
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"File not found: {filepath}")


def validate_extension(filename: str) -> None:
    """Raise HTTP 400 if the file extension is not supported."""
    if not filename.lower().endswith(SUPPORTED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(SUPPORTED_EXTENSIONS)}",
        )


def validate_non_empty_list(items: list, field_name: str = "items") -> None:
    """Raise HTTP 400 if the list is empty."""
    if not items:
        raise HTTPException(status_code=400, detail=f"'{field_name}' must not be empty.")


def validate_score_range(value: float, name: str = "score") -> None:
    """Raise HTTP 422 if the score is outside [0, 100]."""
    if not (0 <= value <= 100):
        raise HTTPException(
            status_code=422,
            detail=f"'{name}' must be between 0 and 100, got {value}.",
        )
