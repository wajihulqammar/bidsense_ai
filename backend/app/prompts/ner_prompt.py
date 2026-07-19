"""
app/prompts/ner_prompt.py
Prompt template for Named Entity Recognition.
"""


def build_ner_prompt(text: str) -> str:
    return f"""Extract the following named entities from this RFP text:

- submission_deadlines: dates with their context/purpose
- budget: monetary values with context
- currency: currency used (PKR, USD, EUR, etc.)
- client_name: procuring organization name
- project_name: name of the project or tender
- contract_duration: duration of the contract
- evaluation_weights: percentage weights for evaluation criteria
- compliance_clauses: certification or compliance requirements (ISO, PPRA, etc.)
- locations: geographic locations mentioned

TEXT:
{text}

Return JSON:
{{
  "submission_deadlines": [{{"date": "...", "context": "..."}}],
  "budget": [{{"amount": "...", "currency": "...", "context": "..."}}],
  "currency": "...",
  "client_name": "...",
  "project_name": "...",
  "contract_duration": "...",
  "evaluation_weights": [{{"criteria": "...", "weight": "..."}}],
  "compliance_clauses": ["..."],
  "locations": ["..."]
}}"""
