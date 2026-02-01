CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS faqs_embedding_idx ON faqs 
USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS clusters (
    id TEXT PRIMARY KEY,
    canonical_question TEXT NOT NULL,
    embedding vector(1536),
    coverage_status TEXT CHECK (coverage_status IN ('covered', 'partially_covered', 'not_covered')),
    coverage_explanation TEXT,
    faq_matches JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS clusters_embedding_idx ON clusters 
USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    cluster_id TEXT NOT NULL,
    question TEXT NOT NULL,
    normalized_question TEXT NOT NULL,
    ask_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS questions_cluster_id_idx ON questions(cluster_id);
