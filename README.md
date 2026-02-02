# FAQ Coverage Assistant

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
DATABASE_URL=postgresql://username:password@localhost:5432/faq_analysis
PORT=3001
```

Initialize and seed:

```bash
npm run init-db
npm run seed
```

Start development:

```bash
npm run dev            # frontend + backend
# Or
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:5173
```

## Usage

- Open http://localhost:5173
- Enter a question and click Analyze
- Review clusters, coverage status, explanations, and FAQ matches

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

## Development

```bash
npm run test          # backend tests
npm run lint          # check lint
npm run lint:fix      # auto-fix lint
```



## License

MIT
