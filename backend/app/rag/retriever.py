"""
app/rag/retriever.py
Retrieval logic: query ChromaDB for top-K capability records given a requirement.
"""

from app.rag.chroma_db import get_capability_collection
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def retrieve_for_requirement(
    requirement_text: str,
    top_k: int | None = None,
) -> tuple[list[str], list[dict]]:
    """
    Query ChromaDB for the top-K capability records most similar to *requirement_text*.

    Returns:
        documents: list of document strings
        metadatas: list of metadata dicts
    """
    k = top_k or settings.TOP_K_RAG_RESULTS
    collection = get_capability_collection()

    if collection.count() == 0:
        logger.warning("ChromaDB collection is empty — returning no results")
        return [], []

    try:
        results = collection.query(query_texts=[requirement_text], n_results=k)
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        logger.debug("RAG: retrieved %d records for requirement: %.80s", len(docs), requirement_text)
        return docs, metas
    except Exception as exc:
        logger.error("ChromaDB query failed: %s", exc)
        return [], []


def format_evidence(documents: list[str], metadatas: list[dict]) -> str:
    """Format retrieved documents into a single evidence string for LLM prompts."""
    if not documents:
        return "No direct match found in capability library."
    lines = [f"- {doc}" for doc in documents]
    return "\n".join(lines)
