# BidSense AI — Backend v2.0.0

AI-powered Bid Intelligence & Decision Engine. Refactored for hackathon-quality scalability, modularity, and full RAG support.

---

## Quick Start

```bash
# 1. Clone / unzip the project
cd bidsense

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-your-key-here

# 5. Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Architecture

```
Request
  │
  ▼
API Layer  (app/api/)          — Routes only, zero business logic
  │
  ▼
Service Layer  (app/services/) — All business logic lives here
  │
  ▼
RAG Layer  (app/rag/)          — ChromaDB · embeddings · top-K retrieval
  │
  ▼
LLM Layer  (app/services/llm_service.py + app/prompts/)
  │
  ▼
Data Layer  (app/data/)        — dataset.xlsx · chroma_store/
```

---

## API Endpoints

### Preserved (v1 compatible)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Upload PDF or DOCX RFP |
| POST | `/extract-text` | Extract raw text from uploaded file |
| POST | `/extract-requirements` | Full NER + chunked LLM extraction |
| POST | `/match-capabilities` | RAG capability matching |
| POST | `/compliance` | LLM-enriched compliance analysis |
| POST | `/win-probability` | Weighted win probability score |
| POST | `/decision` | Multi-factor GO/NO-GO engine |
| POST | `/generate-proposal` | RAG-grounded proposal generation |

### New in v2.0

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | System health + dataset status |
| POST | `/ner` | Standalone Named Entity Recognition |
| POST | `/executive-summary` | Synthesised executive brief |
| POST | `/historical-analysis` | Historical bid dataset analysis |
| POST | `/full-pipeline` | Complete pipeline in one call |
| GET | `/` | Root status check |

---

## Workflow

```
Upload RFP
    ↓
Extract Text (PDF / DOCX — ALL pages)
    ↓
NER  →  deadlines, budget, client, project, compliance clauses
    ↓
Requirement Extraction  →  chunk ALL text → LLM each chunk → merge → dedup
    ↓
Capability Matching (RAG)  →  ChromaDB retrieval → LLM grounded assessment
    ↓
Compliance Analysis  →  algorithmic score + LLM risk enrichment
    ↓
Historical Bid Analysis  →  dataset lookup by sector
    ↓
Win Probability  →  35% compliance + 30% capability + 20% historical + 15% budget
    ↓
GO / NO-GO Decision  →  multi-factor weighted composite score
    ↓
Proposal Generation  →  RAG-grounded, evidence-referenced, 7 sections
    ↓
Executive Summary  →  synthesised brief from all analysis outputs
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app, startup, routers
│   │
│   ├── api/                       # Route handlers (no business logic)
│   │   ├── upload.py
│   │   ├── extraction.py          # /extract-text, /extract-requirements, /ner
│   │   ├── capability.py          # /match-capabilities
│   │   ├── compliance.py          # /compliance
│   │   ├── scoring.py             # /win-probability, /decision
│   │   ├── proposal.py            # /generate-proposal
│   │   ├── executive.py           # /executive-summary, /historical-analysis
│   │   └── health.py              # /health, /
│   │
│   ├── services/                  # Business logic
│   │   ├── llm_service.py         # Single OpenAI client + call_llm / call_llm_json
│   │   ├── pdf_service.py         # PyMuPDF — ALL pages extracted
│   │   ├── docx_service.py        # python-docx support
│   │   ├── chunking_service.py    # chunk_text + merge_extractions
│   │   ├── ner_service.py         # Named entity recognition
│   │   ├── rag_service.py         # RAG pipeline orchestration
│   │   ├── capability_service.py  # Capability matching facade
│   │   ├── compliance_service.py  # Compliance scoring + LLM enrichment
│   │   ├── scoring_service.py     # Win probability + GO/NO-GO
│   │   ├── proposal_service.py    # RAG-grounded proposal generation
│   │   ├── executive_service.py   # Executive summary generation
│   │   └── historical_service.py  # Bid history dataset analysis
│   │
│   ├── rag/                       # RAG infrastructure
│   │   ├── chroma_db.py           # ChromaDB singleton
│   │   ├── index_builder.py       # Indexes capability library on startup
│   │   ├── retriever.py           # Top-K retrieval for requirements
│   │   └── embedding.py           # Embedding extension points
│   │
│   ├── prompts/                   # All LLM prompts in one place
│   │   ├── system_prompt.py
│   │   ├── extraction_prompt.py
│   │   ├── ner_prompt.py
│   │   ├── capability_prompt.py
│   │   ├── compliance_prompt.py
│   │   ├── scoring_prompt.py
│   │   ├── proposal_prompt.py
│   │   └── executive_prompt.py
│   │
│   ├── models/                    # Pydantic request/response models
│   │   ├── request_models.py
│   │   ├── response_models.py
│   │   └── schemas.py             # Internal dataclasses
│   │
│   ├── utils/
│   │   ├── config.py              # Settings from .env (no hardcoded keys)
│   │   ├── logger.py              # Structured logging + @log_timing
│   │   ├── constants.py           # App-wide constants
│   │   ├── helpers.py             # parse_llm_json, deduplicate, clamp …
│   │   └── validators.py          # FastAPI input validation helpers
│   │
│   ├── data/
│   │   └── dataset.xlsx           # Bid history + capability library
│   │
│   └── uploads/                   # Uploaded RFP files
│
├── .env                           # Secrets (never commit)
├── requirements.txt
└── README.md
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *(required)* | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model to use |
| `OPENAI_TEMPERATURE` | `0.2` | LLM temperature |
| `UPLOAD_DIR` | `app/uploads` | Directory for uploaded files |
| `DATA_PATH` | `app/data/dataset.xlsx` | Path to dataset |
| `CHROMA_PERSIST_DIR` | `app/data/chroma_store` | ChromaDB persistence path |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CHUNK_SIZE` | `3000` | Characters per extraction chunk |
| `CHUNK_OVERLAP` | `300` | Overlap between chunks |
| `TOP_K_RAG_RESULTS` | `4` | ChromaDB results per requirement |
| `MAX_REQUIREMENTS_PER_REQUEST` | `25` | Cap on requirements processed |

---

## Key Improvements Over v1

| Area | v1 | v2 |
|------|----|----|
| Architecture | Single 500-line `main.py` | Layered: API → Service → RAG → LLM → Data |
| API key | Hardcoded `sk-YOUR_KEY` | `.env` + `config.py` |
| Document processing | First 3 chunks only | ALL chunks processed |
| NER | First 4000 chars | Full document text |
| DOCX support | ❌ | ✅ |
| LLM client | Duplicate creation per endpoint | Single shared client |
| Prompts | Inline strings | Dedicated `prompts/` module |
| RAG | ❌ Full library sent to LLM | ✅ ChromaDB top-K retrieval |
| Compliance | Algorithmic only | Algorithmic + LLM risk enrichment |
| GO/NO-GO | Single threshold | Multi-factor weighted composite |
| Proposal | No RAG, possible hallucination | RAG-grounded, evidence-referenced |
| Executive Summary | ❌ | ✅ Dedicated endpoint |
| Historical Analysis | ❌ | ✅ Dedicated endpoint |
| NER endpoint | ❌ | ✅ `/ner` |
| Health check | ❌ | ✅ `/health` |
| Logging | `print()` statements | Structured `logger.py` |
| Error handling | Per-route try/except | Global exception handler |
| Models | Inline dicts | Pydantic `request_models` / `response_models` |
| Type hints | Sparse | Throughout |

---

## Frontend Compatibility

**Zero frontend changes required.**

All 8 existing endpoints preserve their exact paths and response shapes.
New endpoints (`/health`, `/ner`, `/executive-summary`, `/historical-analysis`, `/full-pipeline`) are purely additive.

---

## Running Tests

```bash
# Basic smoke test (no pytest required)
python -c "
from app.utils.helpers import parse_llm_json, deduplicate_list, clamp
assert clamp(110) == 100
assert clamp(-5) == 0
assert deduplicate_list([{'text':'a'},{'text':'A'},{'text':'b'}], 'text') == [{'text':'a'},{'text':'b'}]
print('Utils OK')
"
```

For integration tests, upload a sample RFP through `/docs` and step through the full pipeline.
