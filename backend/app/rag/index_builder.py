"""
app/rag/index_builder.py
Indexes the capability library DataFrame into ChromaDB on startup.
Skips indexing if records already exist (cached).
"""

import pandas as pd

from app.models.schemas import CapabilityRecord
from app.rag.chroma_db import get_capability_collection
from app.utils.logger import get_logger

logger = get_logger(__name__)


def build_capability_index(capability_df: pd.DataFrame) -> int:
    """
    Index all rows of *capability_df* into ChromaDB.
    Returns the total number of indexed records.
    Skips gracefully if the collection is already populated.
    """
    collection = get_capability_collection()

    existing_count = collection.count()
    if existing_count > 0:
        logger.info("ChromaDB already contains %d capability records — skipping re-index", existing_count)
        return existing_count

    docs: list[str] = []
    ids: list[str] = []
    metas: list[dict] = []

    for idx, row in capability_df.iterrows():
        cap = CapabilityRecord(
            cap_id=str(row.get("Cap ID", f"CAP-{idx}")),
            domain=str(row.get("Domain", "")),
            summary=str(row.get("Project Summary", "")),
            certification=str(row.get("Certification", "")),
            year=str(row.get("Year Completed", "")),
            value=str(row.get("Contract Value", "")),
            client_type=str(row.get("Client Type", "")),
        )
        docs.append(cap.to_embedding_text())
        ids.append(cap.cap_id)
        metas.append(cap.to_metadata())

    if not docs:
        logger.warning("Capability DataFrame was empty — nothing indexed")
        return 0

    # ChromaDB accepts at most 5461 items per upsert; batch if needed
    batch_size = 500
    for start in range(0, len(docs), batch_size):
        collection.add(
            documents=docs[start : start + batch_size],
            ids=ids[start : start + batch_size],
            metadatas=metas[start : start + batch_size],
        )

    total = collection.count()
    logger.info("ChromaDB indexed %d capability records", total)
    return total
