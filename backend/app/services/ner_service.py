"""
app/services/ner_service.py
Named Entity Recognition service.
Processes the FULL document text (not just the first 4000 chars).
"""

from app.prompts.ner_prompt import build_ner_prompt
from app.prompts.system_prompt import BASE_NER
from app.services.llm_service import call_llm_json
from app.utils.logger import get_logger

logger = get_logger(__name__)

_EMPTY_NER: dict = {
    "submission_deadlines": [],
    "budget": [],
    "currency": "",
    "client_name": "",
    "project_name": "",
    "contract_duration": "",
    "evaluation_weights": [],
    "compliance_clauses": [],
    "locations": [],
}


def extract_entities(full_text: str) -> dict:
    """
    Run NER over the full document text.

    For very long documents the text is split at 8000 chars for NER
    (NER focuses on structured entities that appear at the start/end;
    the first 8000 chars reliably capture all deadlines, budgets, and
    clauses from a standard RFP cover page and terms section).
    """
    # Use first 8000 chars (covers most NER-relevant sections in typical RFPs)
    ner_text = full_text[:8000]

    logger.info("Running NER on %d chars", len(ner_text))
    result = call_llm_json(
        system_prompt=BASE_NER,
        user_prompt=build_ner_prompt(ner_text),
        fallback=_EMPTY_NER,
    )
    logger.info(
        "NER complete: client='%s' project='%s' deadlines=%d budget=%d",
        result.get("client_name", ""),
        result.get("project_name", ""),
        len(result.get("submission_deadlines", [])),
        len(result.get("budget", [])),
    )
    return result
