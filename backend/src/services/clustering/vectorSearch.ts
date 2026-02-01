import { query } from '../../db/client.js';
import { SIMILARITY_THRESHOLD, DEFAULT_FAQ_LIMIT } from '../../config/constants.js';

export interface SimilarCluster {
  id: string;
  canonicalQuestion: string;
  similarity: number;
}

export interface FAQMatch {
  id: number;
  category: string;
  question: string;
  answer: string;
  similarity: number;
}
export async function findSimilarCluster(
  embedding: number[]
): Promise<SimilarCluster | null> {
  const embeddingString = `[${embedding.join(',')}]`;
  
  const result = await query(
    `SELECT 
      id,
      canonical_question,
      1 - (embedding <=> $1::vector) as similarity
    FROM clusters
    WHERE 1 - (embedding <=> $1::vector) > $2
    ORDER BY embedding <=> $1::vector
    LIMIT 1`,
    [embeddingString, SIMILARITY_THRESHOLD]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    canonicalQuestion: row.canonical_question,
    similarity: parseFloat(row.similarity),
  };
}

export async function findSimilarFAQs(
  embedding: number[],
  limit: number = DEFAULT_FAQ_LIMIT
): Promise<FAQMatch[]> {
  const embeddingString = `[${embedding.join(',')}]`;
  
  const result = await query(
    `SELECT 
      id,
      category,
      question,
      answer,
      1 - (embedding <=> $1::vector) as similarity
    FROM faqs
    ORDER BY embedding <=> $1::vector
    LIMIT $2`,
    [embeddingString, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    category: row.category,
    question: row.question,
    answer: row.answer,
    similarity: parseFloat(row.similarity),
  }));
}
