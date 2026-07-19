# 🚀 BidSense AI
### AI-Powered Bid Intelligence Platform

> Transforming the way organizations analyze, evaluate, and respond to RFPs, RFQs, and Tender Documents using Artificial Intelligence.

---

## 📌 Overview

BidSense AI is an AI-powered Bid Intelligence Platform that automates the complete bid preparation workflow.

Instead of simply generating proposal documents, BidSense AI helps organizations determine **whether they should bid in the first place** by analyzing tender requirements, verifying organizational capabilities, identifying compliance gaps, estimating win probability, and finally generating an evidence-backed proposal.

Our goal is to reduce manual bid preparation effort while improving decision quality and proposal quality.

---

# 🎯 Problem Statement

Organizations spend hundreds of employee hours manually reviewing lengthy tender documents.

The process typically involves:

- Reading 15–80 page RFP/RFQ documents
- Identifying mandatory requirements
- Extracting evaluation criteria
- Checking company capabilities
- Reviewing compliance
- Estimating chances of winning
- Preparing proposal documents

This process is repetitive, time-consuming, and prone to human error.

---

# 💡 Solution

BidSense AI transforms the entire workflow into an intelligent AI-assisted pipeline.

Instead of manually analyzing every document, users receive:

- AI-powered requirement extraction
- Capability matching
- Compliance analysis
- Win probability estimation
- GO / NO-GO recommendation
- AI-generated proposal draft
- Executive summary

---

# ✨ Key Features

## 📄 Intelligent Document Processing

- Upload PDF or DOCX RFP documents
- Automatic text extraction
- Large document support (15–80 pages)

---

## 🤖 AI Requirement Extraction

Automatically extracts:

- Mandatory Requirements
- Evaluation Criteria
- Deadlines
- Budget Information
- Compliance Clauses
- Questions & Answers

---

## 🔍 Capability Matching (RAG)

Uses Retrieval-Augmented Generation (RAG) to match extracted requirements against:

- Past Projects
- Company Certifications
- Previous Experience
- Capability Library

---

## ✅ Compliance Analysis

Automatically identifies:

- Fully Compliant Requirements
- Partial Matches
- Missing Requirements
- Compliance Score

---

## 📈 Win Probability Analysis

Calculates bid success probability using multiple factors:

- Compliance Score
- Capability Match
- Historical Bid Performance
- Budget Alignment

---

## 🚦 GO / NO-GO Decision Engine

Provides strategic recommendation:

- GO
- NO-GO

with AI-generated reasoning.

---

## 📝 Proposal Generator

Automatically generates:

- Executive Summary
- Technical Response
- Company Experience
- Methodology
- Team Structure
- Compliance Matrix
- Conclusion

---

# 🏗 System Architecture

```
                React + Vite Frontend
                        │
                        ▼
                FastAPI REST API
                        │
                        ▼
             Document Processing Layer
         (PyMuPDF + python-docx)
                        │
                        ▼
             Google Gemini AI Services
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
      ChromaDB RAG             Historical Dataset
          │                           │
          └─────────────┬─────────────┘
                        ▼
               Bid Intelligence Engine
                        │
                        ▼
            Proposal + Decision Output
```

---

# 🧠 AI Pipeline

```
Upload Tender
      │
      ▼
Text Extraction
      │
      ▼
Named Entity Recognition
      │
      ▼
Requirement Extraction
      │
      ▼
Capability Matching (RAG)
      │
      ▼
Compliance Analysis
      │
      ▼
Historical Bid Analysis
      │
      ▼
Win Probability
      │
      ▼
GO / NO-GO Decision
      │
      ▼
Proposal Generation
      │
      ▼
Executive Summary
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

---

## Backend

- FastAPI
- Python

---

## AI

- Google Gemini
- Retrieval-Augmented Generation (RAG)

---

## Vector Database

- ChromaDB

---

## Document Processing

- PyMuPDF
- python-docx

---

## Machine Learning

- Sentence Transformers
- all-MiniLM-L6-v2

---

# 📂 Dataset

The prototype utilizes:

### Historical Bid Dataset

- 120 Previous Bids
- Win/Loss Outcomes
- Evaluation Scores
- Industry Sectors

### Capability Library

- 50 Company Projects
- Certifications
- Contract Values
- Client Types
- Project Duration

---

# 📊 Win Probability Formula

```
35% Compliance Score

30% Capability Match

20% Historical Performance

15% Budget Alignment
```

---

# 📸 Screenshots

> Add screenshots here

- Dashboard
- Upload Workspace
- Requirement Extraction
- Capability Matching
- Compliance Analysis
- Win Probability
- GO / NO-GO
- Proposal Generator

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/BidSense-AI.git
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Environment Variables

Create a `.env` file.

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

# 📡 API Endpoints

```
POST /upload

POST /extract-text

POST /extract-requirements

POST /match-capabilities

POST /compliance

POST /historical-analysis

POST /win-probability

POST /decision

POST /generate-proposal

POST /executive-summary

POST /full-pipeline
```

---

# 💼 Business Value

BidSense AI helps organizations:

- Reduce manual bid preparation effort
- Improve proposal quality
- Detect compliance gaps
- Increase bid success probability
- Make informed GO / NO-GO decisions
- Save valuable employee time

---

# 🚀 Future Enhancements

- Multi-Agent AI Architecture
- Live Government Tender Monitoring
- Competitor Intelligence
- Microsoft Word Add-in
- ERP Integration
- SAP Integration
- Salesforce Integration
- Multi-language Support
- Contract Risk Analysis
- AI Bid Strategy Recommendations

---

# 🌟 Innovation

Unlike traditional AI proposal generators, **BidSense AI focuses on Bid Intelligence rather than document generation.**

The platform:

- Evaluates organizational readiness
- Performs evidence-backed capability verification
- Identifies compliance gaps
- Predicts bid success probability
- Recommends GO / NO-GO decisions
- Generates grounded proposals using Retrieval-Augmented Generation (RAG)

This transforms AI from a writing assistant into a strategic business decision-support platform.

---

# 👨‍💻 Authors

Developed as part of an AI Hackathon project focused on transforming enterprise procurement using Artificial Intelligence.

---

# 📜 License

This project is developed for educational and demonstration purposes.
