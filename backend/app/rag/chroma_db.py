"""
app/rag/chroma_db.py
Singleton ChromaDB client and collection accessor.
"""

from __future__ import annotations

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.utils.config import settings
from app.utils.constants import CAPABILITY_COLLECTION
from app.utils.logger import get_logger

logger = get_logger(__name__)

_client: chromadb.Client | None = None
_collection: chromadb.Collection | None = None


def get_chroma_client() -> chromadb.Client:
    """Return (or lazily create) the shared ChromaDB client."""
    global _client
    if _client is None:
        _client = chromadb.Client(
            ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True,
            )
        )
        logger.info("ChromaDB client initialised (in-memory)")
    return _client


def get_capability_collection() -> chromadb.Collection:
    """Return (or lazily create) the capability library collection."""
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(CAPABILITY_COLLECTION)
        logger.info("ChromaDB collection '%s' ready", CAPABILITY_COLLECTION)
    return _collection


def reset_collection() -> None:
    """Drop and recreate the capability collection (used in testing)."""
    global _collection
    client = get_chroma_client()
    client.delete_collection(CAPABILITY_COLLECTION)
    _collection = client.get_or_create_collection(CAPABILITY_COLLECTION)
    logger.warning("ChromaDB collection reset")
