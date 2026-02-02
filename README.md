# FAQ Coverage Assistant

Live App: https://slush-faq.web.app/

An AI-powered internal tool that analyzes user questions to identify gaps in existing FAQ content. It clusters similar questions via embeddings, determines coverage (covered / partially covered / not covered) using an LLM, and surfaces actionable insights.

## Overview

- Purpose: Understand what users ask, group similar questions, and assess how well FAQs address them.
- Core capabilities:
  - Canonicalize questions for consistency
  - Generate embeddings and perform semantic clustering
  - Match top FAQs and determine coverage with structured LLM output
  - Display clusters with counts, matches, and explanations

## Architecture (PERN)

- Backend: Express + TypeScript; LangChain for LLM orchestration
- Database: PostgreSQL + pgvector (HNSW) for similarity search
- Frontend: React + Vite + Styled Components; Zustand for state
- API: `/api/analyze` (analysis), `/api/faqs` (catalog), `/api/questions` (clusters)

## Data Flow

1. UI submits question(s)
2. Backend generates embeddings (OpenAI) and searches for similar clusters (pgvector)
3. If no similar cluster exists:
   - Canonicalize the question via LLM
   - Find similar FAQs and determine coverage (structured JSON)
   - Persist a new cluster with metadata
4. If a similar cluster exists:
   - Normalize and add question, increment counts for duplicates
   - Optionally regenerate canonical question at thresholds
5. Frontend lists clusters with status, FAQ matches, and explanations

## LLM Components

- Canonicalization: Strict JSON schema output to fix typos/grammar without changing intent (see backend/services/ai/canonicalization.ts)
- Coverage analysis: JSON schema with `status` and `explanation` (see backend/services/ai/coverage.ts)
- Deterministic posture: `temperature = 0` for reproducibility; structured outputs via LangChain `response_format`

## Design Decisions

- pgvector in Postgres for semantic grouping (simple stack, good relevance)
- zod-validated JSON from LangChain for robust parsing
- Threshold-based canonical regeneration as clusters grow
- Lightweight normalization to prevent duplicate inflation

## Trade-offs

- LLM accuracy vs. latency/cost: `gpt-4o-mini`, temperature 0
- Search simplicity vs. sophistication: pgvector over ElasticSearch
- Minimal UI to prioritize pipeline clarity

## Setup

### Prerequisites

- Node.js ≥ 18, npm ≥ 9
- PostgreSQL 14+ with pgvector
- OpenAI API key

### Install & Configure

```bash
cd faq-analysis-tool
npm run install:all
```

Create `.env` (or use `.env.example`):

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

Set `DATABASE_URL` to your SQL database connection string (Postgres + pgvector recommended).

Frontend API base: create `frontend/.env.local` for Vite

```env
VITE_API_BASE_URL=http://localhost:3001
```

For production builds, set `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

Initialize and seed:

```bash
npm run init-db
npm run seed
 # Optional helpers
 npm run reset-db           # drop + recreate tables, then seed
 npm run clear-all-questions
```

Start development:

```bash
npm run dev            # frontend + backend
# Or
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

Backend health check: http://localhost:3001/health

## Usage

- Open http://localhost:5173
- Enter a question and click Analyze
- Review clusters, coverage status, explanations, and FAQ matches

### API Endpoints

- Analyze: POST [backend/src/routes/analyze.ts](backend/src/routes/analyze.ts) at `/api/analyze`
   - Body: JSON array of strings (questions)
   - Response: `{ clusters: ClusterResult[] }`
- FAQs: GET [backend/src/routes/faqs.ts](backend/src/routes/faqs.ts) at `/api/faqs`
   - Response: `{ faqs: FAQ[] }`
- Clusters: GET [backend/src/routes/questions.ts](backend/src/routes/questions.ts) at `/api/questions`
   - Query: `page`, `limit`, `sortBy` (`createdAt`|`totalAsks`), `order` (`asc`|`desc`)
   - Response: `{ clusters: StoredCluster[], pagination }`

See request typings in [frontend/src/api.ts](frontend/src/api.ts). Route constants: [backend/src/config/constants.ts](backend/src/config/constants.ts).

## Project Structure

```
faq-analysis-tool/
├── backend/
│   └── src/
│       ├── routes/          # API endpoints
│       ├── services/
│       │   ├── ai/          # embeddings, coverage, canonicalization
│       │   └── clustering/  # vector search + cluster management
│       ├── db/              # schema + seed + client
│       └── utils/           # helpers
└── frontend/
    └── src/
        ├── components/      # views
        ├── store/           # state
        └── api.ts           # backend calls
```

## Environment

- Backend: `OPENAI_API_KEY`, `DATABASE_URL`, `PORT`
   - Default port: 3001 (override via `PORT`)
   - pgvector dimensions: 1536 (see [backend/src/config/constants.ts](backend/src/config/constants.ts))
- Frontend: `VITE_API_BASE_URL` (preferred; defaults to `http://localhost:3001`).
  

## Database

- Schema and pgvector setup: [backend/src/db/init.sql](backend/src/db/init.sql)
- Seed FAQ catalog: [backend/src/db/seed.ts](backend/src/db/seed.ts)
- Reset DB (drop/recreate + seed): [backend/src/db/reset.ts](backend/src/db/reset.ts)
- Clear only questions: [backend/src/db/clear-questions.ts](backend/src/db/clear-questions.ts)

## Docker (Backend)

- Dockerfile: [backend/Dockerfile](backend/Dockerfile)
- Uses `PORT` env (Cloud Run defaults to 8080). Example:

```bash
docker build -t faq-backend ./backend
docker run -e OPENAI_API_KEY=xxx -e DATABASE_URL=postgresql://... -e PORT=8080 -p 8080:8080 faq-backend
```

## Development

```bash
npm run test          # backend tests
npm run lint          # check lint
npm run lint:fix      # auto-fix lint
```

## Deploy

- Frontend is hosted on Firebase Hosting.
- Configure `frontend/.env.production` with `VITE_API_BASE_URL` pointing to your deployed backend.
