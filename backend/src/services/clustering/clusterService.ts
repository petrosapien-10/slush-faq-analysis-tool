import { query, getClient } from '../../db/client.js';
import { generateClusterId } from '../../utils/clusterId.js';
import type { FAQMatch } from './vectorSearch.js';
import { findSimilarFAQs } from './vectorSearch.js';
import { determineCoverage } from '../ai/coverage.js';
import { generateCanonicalForm } from '../ai/canonicalization.js';
import { generateEmbedding } from '../ai/embedding.js';
import { DEFAULT_FAQ_LIMIT, PAGINATION, CoverageStatus } from '../../config/constants.js';

export interface Coverage {
  status: CoverageStatus;
  explanation: string;
}

export interface QuestionCluster {
  clusterId: string;
  canonicalQuestion: string;
  totalAsks: number;
  questions: ClusterQuestion[];
  faqMatches: FAQMatch[];
  coverage: Coverage;
  createdAt: Date;
}

export interface BasicCluster {
  clusterId: string;
  canonicalQuestion: string;
  totalAsks: number;
  questions: ClusterQuestion[];
  createdAt: Date;
}

export interface ClusterQuestion {
  id: number;
  question: string;
  normalizedQuestion: string;
  askCount: number;
  createdAt: Date;
}

export async function createCluster(
  canonicalQuestion: string,
  canonicalEmbedding: number[],
  questions: Array<{ question: string; normalizedQuestion: string }>,
  coverage: Coverage,
  faqMatches: FAQMatch[]
): Promise<BasicCluster> {
  const client = await getClient();
  const clusterId = generateClusterId();

  try {
    await client.query('BEGIN');

    const embeddingString = `[${canonicalEmbedding.join(',')}]`;
    const faqMatchesJson = JSON.stringify(faqMatches);
    
    await client.query(
      `INSERT INTO clusters (id, canonical_question, embedding, coverage_status, coverage_explanation, faq_matches)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [clusterId, canonicalQuestion, embeddingString, coverage.status, coverage.explanation, faqMatchesJson]
    );

    // 2. Insert all original questions in the cluster (without embeddings)
    const questionRecords: ClusterQuestion[] = [];
    for (const q of questions) {
      const questionResult = await client.query(
        `INSERT INTO questions (cluster_id, question, normalized_question, ask_count)
         VALUES ($1, $2, $3, 1)
         RETURNING id, question, normalized_question, ask_count, created_at`,
        [clusterId, q.question, q.normalizedQuestion]
      );
      
      const qRow = questionResult.rows[0];
      questionRecords.push({
        id: qRow.id,
        question: qRow.question,
        normalizedQuestion: qRow.normalized_question,
        askCount: qRow.ask_count,
        createdAt: qRow.created_at,
      });
    }

    await client.query('COMMIT');

    const clusterResult = await query(
      `SELECT created_at FROM clusters WHERE id = $1`,
      [clusterId]
    );

    return {
      clusterId,
      canonicalQuestion: canonicalQuestion,
      totalAsks: questions.length,
      questions: questionRecords,
      createdAt: clusterResult.rows[0].created_at,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAsks';
  order?: 'asc' | 'desc';
}

export interface PaginatedClusters {
  clusters: QuestionCluster[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAllClusters(options: PaginationOptions = {}): Promise<PaginatedClusters> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc'
  } = options;

  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), PAGINATION.MAX_LIMIT);
  const offset = (validPage - 1) * validLimit;

  const countResult = await query('SELECT COUNT(*) as total FROM clusters');
  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / validLimit);

  const sortColumn = sortBy === 'totalAsks' ? 'created_at' : 'created_at';
  const orderClause = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const result = await query(
    `SELECT 
      id,
      canonical_question,
      embedding,
      coverage_status,
      coverage_explanation,
      faq_matches,
      created_at
     FROM clusters
     ORDER BY ${sortColumn} ${orderClause}
     LIMIT $1 OFFSET $2`,
    [validLimit, offset]
  );

  const clusters: QuestionCluster[] = [];

  for (const row of result.rows) {
    const questionsResult = await query(
      `SELECT id, question, normalized_question, ask_count, created_at
       FROM questions
       WHERE cluster_id = $1
       ORDER BY ask_count DESC`,
      [row.id]
    );

    const questions: ClusterQuestion[] = questionsResult.rows.map(q => ({
      id: q.id,
      question: q.question,
      normalizedQuestion: q.normalized_question,
      askCount: q.ask_count,
      createdAt: q.created_at,
    }));

    const totalAsks = questions.reduce((sum, q) => sum + q.askCount, 0);

    const faqMatches: FAQMatch[] = row.faq_matches || [];
    const coverage: Coverage = {
      status: row.coverage_status || CoverageStatus.NOT_COVERED,
      explanation: row.coverage_explanation || 'No coverage information available',
    };

    clusters.push({
      clusterId: row.id,
      canonicalQuestion: row.canonical_question,
      totalAsks,
      questions,
      faqMatches,
      coverage,
      createdAt: row.created_at,
    });
  }

  if (sortBy === 'totalAsks') {
    clusters.sort((a, b) => {
      const diff = a.totalAsks - b.totalAsks;
      return order === 'asc' ? diff : -diff;
    });
  }

  return {
    clusters,
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages,
    },
  };
}

export async function addQuestionsToCluster(
  clusterId: string,
  questions: Array<{ question: string; normalizedQuestion: string }>
): Promise<BasicCluster> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const questionRecords: ClusterQuestion[] = [];

    for (const q of questions) {
      const existingQuestion = await client.query(
        `SELECT id, question, normalized_question, ask_count, created_at
         FROM questions
         WHERE cluster_id = $1 AND normalized_question = $2`,
        [clusterId, q.normalizedQuestion]
      );

      if (existingQuestion.rows.length > 0) {
        const updated = await client.query(
          `UPDATE questions
           SET ask_count = ask_count + 1
           WHERE id = $1
           RETURNING id, question, normalized_question, ask_count, created_at`,
          [existingQuestion.rows[0].id]
        );
        
        const row = updated.rows[0];
        questionRecords.push({
          id: row.id,
          question: row.question,
          normalizedQuestion: row.normalized_question,
          askCount: row.ask_count,
          createdAt: row.created_at,
        });
      } else {
        const inserted = await client.query(
          `INSERT INTO questions (cluster_id, question, normalized_question, ask_count)
           VALUES ($1, $2, $3, 1)
           RETURNING id, question, normalized_question, ask_count, created_at`,
          [clusterId, q.question, q.normalizedQuestion]
        );
        
        const row = inserted.rows[0];
        questionRecords.push({
          id: row.id,
          question: row.question,
          normalizedQuestion: row.normalized_question,
          askCount: row.ask_count,
          createdAt: row.created_at,
        });
      }
    }

    await client.query('COMMIT');

    const clusterResult = await query(
      `SELECT id, canonical_question, created_at
       FROM clusters
       WHERE id = $1`,
      [clusterId]
    );

    const allQuestions = await query(
      `SELECT id, question, normalized_question, ask_count, created_at
       FROM questions
       WHERE cluster_id = $1
       ORDER BY ask_count DESC`,
      [clusterId]
    );

    const allQuestionRecords: ClusterQuestion[] = allQuestions.rows.map(q => ({
      id: q.id,
      question: q.question,
      normalizedQuestion: q.normalized_question,
      askCount: q.ask_count,
      createdAt: q.created_at,
    }));

    const totalAsks = allQuestionRecords.reduce((sum, q) => sum + q.askCount, 0);

    const cluster = clusterResult.rows[0];
    return {
      clusterId: cluster.id,
      canonicalQuestion: cluster.canonical_question,
      totalAsks,
      questions: allQuestionRecords,
      createdAt: cluster.created_at,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function regenerateCanonicalQuestion(
  clusterId: string
): Promise<{ canonicalQuestion: string; embedding: number[]; coverage: Coverage; faqMatches: FAQMatch[] }> {
  const questionsResult = await query(
    `SELECT question FROM questions WHERE cluster_id = $1 ORDER BY ask_count DESC`,
    [clusterId]
  );

  const questions: string[] = questionsResult.rows.map(row => row.question);

  const canonicalQuestion = await generateCanonicalForm(questions);
  
  const embedding = await generateEmbedding(canonicalQuestion);
  
  const faqMatches = await findSimilarFAQs(embedding, DEFAULT_FAQ_LIMIT);
  
  const coverage = await determineCoverage(canonicalQuestion, faqMatches);
  
  const embeddingString = `[${embedding.join(',')}]`;
  const faqMatchesJson = JSON.stringify(faqMatches);
  
  await query(
    `UPDATE clusters 
     SET canonical_question = $1, embedding = $2, coverage_status = $3, coverage_explanation = $4, faq_matches = $5
     WHERE id = $6`,
    [canonicalQuestion, embeddingString, coverage.status, coverage.explanation, faqMatchesJson, clusterId]
  );
  
  return { canonicalQuestion, embedding, coverage, faqMatches };
}
