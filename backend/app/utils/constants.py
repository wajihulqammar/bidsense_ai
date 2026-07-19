"""
app/utils/constants.py
Application-wide constants that do not belong in config (not env-configurable).
"""

# ── Capability match statuses ─────────────────────────────────────────────
STATUS_FOUND = "Found"
STATUS_PARTIAL = "Partial"
STATUS_NOT_FOUND = "Not Found"

# ── Compliance grades ─────────────────────────────────────────────────────
GRADE_EXCELLENT = "Excellent"
GRADE_GOOD = "Good"
GRADE_AT_RISK = "At Risk"
GRADE_POOR = "Poor"

# ── Decision outcomes ─────────────────────────────────────────────────────
DECISION_GO = "GO"
DECISION_CONDITIONAL = "CONDITIONAL GO"
DECISION_NOGO = "NO-GO"

# ── Risk levels ───────────────────────────────────────────────────────────
RISK_HIGH = "High"
RISK_MEDIUM = "Medium"
RISK_LOW = "Low"

# ── Supported file types ──────────────────────────────────────────────────
SUPPORTED_EXTENSIONS = (".pdf", ".docx")

# ── Dataset sheet names ───────────────────────────────────────────────────
BID_HISTORY_SHEET = "PS1 – Bid History"
CAPABILITY_SHEET = "PS1 – Capability Library"
DATASET_SKIPROWS = 2

# ── ChromaDB collection name ──────────────────────────────────────────────
CAPABILITY_COLLECTION = "capability_library"

# ── Sector list (for validation / defaults) ───────────────────────────────
KNOWN_SECTORS = [
    "IT Services",
    "Construction",
    "Logistics",
    "Energy",
    "Healthcare",
    "Education",
    "Telecom",
    "Finance",
]

# ── Proposal sections ─────────────────────────────────────────────────────
PROPOSAL_SECTIONS = [
    "executive_summary",
    "technical_response",
    "compliance_response",
    "past_experience",
    "implementation_methodology",
    "risk_mitigation",
    "company_profile",
]
