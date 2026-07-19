"""
app/prompts/extraction_prompt.py
Prompt templates for the requirement-extraction pipeline.
"""


def build_extraction_prompt(combined_text: str) -> str:
    return f"""Analyze this RFP document text and extract ALL requirements.

RFP TEXT:
{combined_text}

Return this exact JSON structure:
{{
  "mandatory_requirements": [
    {{"text": "requirement text", "priority": "Critical|High|Medium", "tag": "Legal|Certification|Technical|Financial|Experience|Compliance"}}
  ],
  "evaluation_criteria": [
    {{"text": "criteria text", "weight": 0, "tag": "Technical|Financial|HR|Experience"}}
  ],
  "deadlines": [
    {{"text": "deadline description", "date": "date string", "tag": "Submission|Meeting|Opening"}}
  ],
  "budget": [
    {{"text": "budget description", "amount": "PKR amount", "tag": "Budget|Security|Guarantee"}}
  ],
  "qa_sections": [
    {{"question": "question text", "section": "section reference"}}
  ],
  "document_title": "name of the RFP",
  "issuing_organization": "organization name",
  "sector": "IT Services|Construction|Logistics|Energy|Healthcare|Education|Telecom|Finance"
}}"""


def build_unified_extraction_prompt(combined_text: str) -> str:
    """Single-call extraction + NER (saves 1 API call, full-document context)."""
    return f"""Analyze this RFP document and extract ALL requirements AND named entities in ONE response.

RFP TEXT:
{combined_text}

Return this exact JSON structure:
{{
  "mandatory_requirements": [
    {{"text": "requirement text", "priority": "Critical|High|Medium", "tag": "Legal|Certification|Technical|Financial|Experience|Compliance"}}
  ],
  "evaluation_criteria": [
    {{"text": "criteria text", "weight": 0, "tag": "Technical|Financial|HR|Experience"}}
  ],
  "deadlines": [
    {{"text": "deadline description", "date": "date string", "tag": "Submission|Meeting|Opening"}}
  ],
  "budget": [
    {{"text": "budget description", "amount": "PKR amount", "tag": "Budget|Security|Guarantee"}}
  ],
  "qa_sections": [
    {{"question": "question text", "section": "section reference"}}
  ],
  "document_title": "name of the RFP",
  "issuing_organization": "organization name",
  "sector": "IT Services|Construction|Logistics|Energy|Healthcare|Education|Telecom|Finance",
  "ner_entities": {{
    "submission_deadlines": [{{"date": "...", "context": "..."}}],
    "budget": [{{"amount": "...", "currency": "...", "context": "..."}}],
    "currency": "...",
    "client_name": "...",
    "project_name": "...",
    "contract_duration": "...",
    "evaluation_weights": [{{"criteria": "...", "weight": "..."}}],
    "compliance_clauses": ["..."],
    "locations": ["..."]
  }}
}}"""


def build_merge_prompt(partial_extractions: list[dict]) -> str:
    import json
    parts_text = json.dumps(partial_extractions, indent=2)
    return f"""You have received multiple partial JSON extractions from different chunks of the same RFP.
Merge them into a single consolidated JSON. Rules:
- Deduplicate requirements by text (case-insensitive)
- Keep the most complete version of each item
- Preserve all unique entries
- Consolidate document_title, issuing_organization, and sector (prefer non-empty values)

Partial extractions:
{parts_text}

Return a single merged JSON using the same structure as the input objects."""
