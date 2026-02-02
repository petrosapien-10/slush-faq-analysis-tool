# FAQ Coverage Assistant

Live App: https://slush-faq.web.app/

Backend Health Check: https://slush-faq-analysis-tool-571183354240.europe-north2.run.app/health

This project is a prototype that explores how semantic clustering and LLMs can be used to analyze user questions and identify gaps in existing FAQ content. It groups similar questions using embeddings, assesses FAQ coverage (covered, partially covered, not covered), and surfaces structured insights to support internal analysis.

## Overview

This tool is designed to help teams understand patterns in user questions and evaluate how effectively existing FAQs address real user needs. By clustering semantically similar questions and mapping them against a known FAQ set, it highlights areas that are well-covered, partially covered, or missing entirely.

The system is designed to be extensible and can be integrated into automated pipelines that collect questions from multiple channels (e.g. support tickets, forms, or chat logs) for ongoing analysis.

## Architecture (PERN)

- Backend: Express + TypeScript; LangChain for LLM orchestration
- Database: PostgreSQL + pgvector (HNSW) for similarity search
- Frontend: React + Vite + Styled Components; Zustand for state
- API: `/api/analyze` (analysis), `/api/faqs` (catalog), `/api/questions` (clusters)

## Data Source

- FAQ content used by this tool is sourced from https://slush.org/faq.
- The dataset is intended for internal analysis and product experiments.

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
- Retrieval-Augmented Generation (RAG): Similar FAQs are retrieved via embeddings with pgvector (see backend/services/clustering/vectorSearch.ts) and used as context for the coverage analysis in [backend/services/ai/coverage.ts](backend/services/ai/coverage.ts).

## Design Decisions

- pgvector in Postgres for semantic grouping
- zod-validated JSON from LangChain for robust parsing
- Threshold-based canonical regeneration as clusters grow
- Lightweight normalization to prevent duplicate inflation

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

## Deploy

- Frontend is hosted on Firebase Hosting.
- Configure `frontend/.env.production` with `VITE_API_BASE_URL` pointing to your deployed backend.

- Backend: deployed on Google Cloud Run as a containerized service. 
  After deployment, the Cloud Run service URL is used as `VITE_API_BASE_URL` 
  for the frontend production build.

## Future Enhancements

- Server-side filtering and advanced sorting for large datasets
- ElasticSearch-powered search track (alternative to pgvector), relevance tuning, and filters
- AI-powered features: improved canonicalization, agentic workflows, and richer RAG-style FAQ augmentation (e.g. generating suggested FAQ updates or drafts based on uncovered clusters)
- Extended CI coverage for frontend builds and automated test execution