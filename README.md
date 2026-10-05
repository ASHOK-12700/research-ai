# 📚 ResearchAI

### Research Paper Summarizer and Literature Assistant

An AI-powered web app that turns a stack of research paper PDFs into structured summaries, evidence-backed answers, side-by-side comparisons and research-gap suggestions, with **page-level citations** on every claim.

🔗 **Live Demo:** [researchai-app.vercel.app](https://researchai-app.vercel.app/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 📖 Overview

A literature review can mean reading and comparing 15–20 papers, each 10–30 pages long, just to extract the problem, method, dataset, results and limitations of every one. **ResearchAI** reduces that effort.

Upload your papers, and ResearchAI parses them, detects their sections, and uses a **Retrieval-Augmented Generation (RAG)** pipeline to produce answers that are grounded in your own documents, not in the LLM's general memory. This keeps hallucination low and every claim verifiable.

## ✨ Features

| Feature | Description |
| --- | --- |
| **Multi-PDF Upload** | Drag-and-drop upload (up to 50 MB per file) with automatic text, section and page-metadata extraction. |
| **Structured Summaries** | Section-wise output: Abstract, Problem Statement, Methodology, Datasets, Algorithms/Models, Major Findings, Limitations, Future Work. |
| **Ask Your Papers** | Natural-language Q&A across a folder of papers, with page-cited answers and a "RAG Active" indicator. |
| **Multi-Paper Comparison** | Compare up to 4 papers side by side on problem, methodology, dataset and results, each traced to its source page. |
| **Research Gap Explorer** | Evidence-backed "limitation" and "future direction" cards to spot under-explored areas. |
| **Folders / Projects** | Organise papers into collections and scope questions and comparisons to a topic. |
| **Citation Generator** | Ready-to-use citations in APA, IEEE, MLA, Chicago and BibTeX. |
| **ResearchAI Copilot** | In-app assistant that guides new users through the platform. |
| **Secure Auth** | Email/password and Google login via Supabase Auth, with per-user data isolation. |

## 🧠 How It Works

```
PDF Upload → Text & Section Extraction (PyMuPDF) → Retrieval of relevant passages
          → LLM Answer / Summary (Groq → OpenRouter → Mistral fallback)
          → Page-level Citations
```

1. **Extract:** PyMuPDF pulls text, page numbers and section structure from each PDF.
2. **Store:** Papers, folders, projects and summaries are saved in Supabase (PostgreSQL), with PDFs kept in the backend `storage/papers/` folder.
3. **Retrieve:** The most relevant passages for a question are selected from the chosen papers.
4. **Generate:** The LLM answers using *only* the retrieved evidence and attaches the source page and section.

> **Note:** Retrieval currently uses text matching. Vector embeddings with `pgvector` are the planned upgrade (see Future Scope).

## 🏗️ Architecture

ResearchAI uses a client–server architecture:

- **Frontend:** React 19 SPA (TypeScript, Vite, Tailwind CSS) at the repository root
- **Backend:** FastAPI REST API in `backend/`, split into routes, schemas and services (PDF, RAG, AI provider, summaries, analysis, chatbot)
- **Data layer:** Supabase for authentication and PostgreSQL storage; schema in `backend/app/supabase_schema.sql`
- **AI layer:** LLM calls go through a provider chain, trying Groq first, then OpenRouter, then Mistral if a provider fails or times out

## 🛠️ Tech Stack

**Frontend**
React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Router · Lucide React · Supabase JS client

**Backend**
Python · FastAPI · Uvicorn · Pydantic / pydantic-settings · PyMuPDF · python-multipart · Supabase Python SDK

**Database & Auth**
Supabase (PostgreSQL, Auth with Google OAuth)

**AI**
Groq, OpenRouter and Mistral LLM APIs with automatic fallback

**Testing & Tooling**
pytest · oxlint · Swagger UI (via FastAPI) · Git & GitHub

**Deployment**
Vercel (frontend) · cloud-hosted backend and database

## 📁 Project Structure

```
research-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # chatbot, folders, health, papers, preferences, projects, rag
│   │   ├── core/                # config.py (settings & env loading)
│   │   ├── models/
│   │   ├── schemas/             # Pydantic models (papers, folders, projects, rag, summaries, analysis)
│   │   ├── services/            # ai_provider, ai_summary, chatbot, paper_analysis,
│   │   │                        # pdf, rag, repositories, supabase client
│   │   ├── utils/
│   │   ├── main.py              # FastAPI entry point
│   │   └── supabase_schema.sql  # Database schema
│   ├── storage/papers/          # Uploaded PDFs (local)
│   ├── tests/                   # pytest: summaries, upload validation, user isolation
│   ├── .env.example
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── auth/                # Login scene, protected routes, redirects
│   │   ├── layout/              # AppLayout, Header, Sidebar, MobileDrawer, evidence drawer
│   │   ├── search/              # Command palette
│   │   ├── timeline/            # Activity & research timelines
│   │   ├── ui/                  # Button, Card, Modal, Tabs, Copilot, etc.
│   │   └── upload/              # Drag-and-drop upload modal
│   ├── contexts/                # AuthContext
│   ├── hooks/                   # useTheme, useToast, useStatsCounter
│   ├── pages/                   # Dashboard, Papers, Folders, Projects, Compare, AskPapers,
│   │                            # ResearchGaps, Summary, Settings, Login/Signup, Help
│   ├── services/                # API clients (paper, folder, project, rag, chat, gaps)
│   ├── shaders/ · styles/ · types/ · utils/
│   ├── App.tsx                  # Routes
│   └── main.tsx
├── public/                      # Favicon and icons
├── .env.example                 # Frontend env template
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json                  # SPA rewrite rules for Vercel
└── LICENSE
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS) and npm
- Python 3.10+
- A [Supabase](https://supabase.com/) project
- At least one LLM API key: [Groq](https://console.groq.com/), [OpenRouter](https://openrouter.ai/) or [Mistral](https://console.mistral.ai/)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Set up the database

Open the Supabase SQL editor and run `backend/app/supabase_schema.sql`. Enable Google under Authentication → Providers if you want Google login.

### 3. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

cp .env.example .env             # Windows: Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 4. Frontend setup

From the repository root:

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. Environment variables

**Backend (`backend/.env`)**

```env
APP_NAME=ResearchAI
APP_VERSION=1.0.0
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development

# AI providers, tried in order: Groq → OpenRouter → Mistral (at least one key required)
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-chat
MISTRAL_API_KEY=
MISTRAL_MODEL=mistral-medium-latest

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Frontend (`.env`)**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` files or API keys. The service-role key in particular must stay on the backend only.

### Other scripts

```bash
npm run build     # type-check and build for production
npm run lint      # run oxlint
```

## 🧪 Running Tests

The backend test suite (pytest) covers summary generation, per-user data isolation and upload validation.

```bash
cd backend
pytest
```

| Test | Expected Result |
| --- | --- |
| Upload a valid text-based PDF | Accepted; text and sections extracted |
| Upload a non-PDF file | Rejected with a clear error |
| Upload a PDF over the size limit | Rejected with a file-size error |
| Generate a structured summary | All expected sections present |
| User A accesses User B's papers | Access denied |
| Ask a question with no relevant evidence | "No relevant evidence found" rather than a fabricated answer |

## 📸 Screenshots

> Add your screenshots to a `/screenshots` folder and update the paths below.

| Login | Dashboard |
| --- | --- |
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) |

| Paper Summary | Compare Papers |
| --- | --- |
| ![Summary](screenshots/summary.png) | ![Compare](screenshots/compare.png) |

| Ask Your Papers | Research Gap Explorer |
| --- | --- |
| ![Ask Papers](screenshots/ask-papers.png) | ![Research Gaps](screenshots/research-gaps.png) |

## ⚠️ Limitations

- Supports text-based (digitally native) PDFs only; scanned/image-only PDFs are not yet supported.
- Section detection can be imperfect for unusual or multi-column layouts.
- Requires an internet connection for the LLM APIs and Supabase.
- Research-gap suggestions are a starting point for human investigation, not a final judgement.

## 🔮 Future Scope

- [ ] Vector embeddings and semantic search with `pgvector`
- [ ] OCR support for scanned papers
- [ ] Citation-network analysis and visualisation
- [ ] Cross-database search (Semantic Scholar, arXiv)
- [ ] Duplicate and similar-paper detection
- [ ] Collaborative, multi-user workspaces
- [ ] Companion mobile app

## 📚 References

- Lewis et al., *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, NeurIPS 2020
- [pgvector](https://github.com/pgvector/pgvector) · [FastAPI](https://fastapi.tiangolo.com/) · [PyMuPDF](https://pymupdf.readthedocs.io/) · [Supabase](https://supabase.com/docs)

## 📄 License

This project is licensed under the [MIT License](LICENSE).
