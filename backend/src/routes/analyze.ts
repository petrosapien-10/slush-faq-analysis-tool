import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../db/client.js';
import { generateEmbeddings } from '../services/ai/embedding.js';
import { findSimilarFAQs, findSimilarCluster, type FAQMatch } from '../services/clustering/vectorSearch.js';
import { determineCoverage } from '../services/ai/coverage.js';
import { canonicalizeQuestion } from '../services/ai/canonicalization.js';
import { createCluster, addQuestionsToCluster, regenerateCanonicalQuestion } from '../services/clustering/clusterService.js';
import { normalizeQuestion } from '../utils/normalizeQuestion.js';
import { DEFAULT_FAQ_LIMIT, REGENERATION_THRESHOLDS, CoverageStatus } from '../config/constants.js';

const router = Router();

const analyzeRequestSchema = z.array(
  z.string().min(1, 'Question cannot be empty')
).min(1, 'At least one question is required');

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = analyzeRequestSchema.parse(req.body);

    const trimmedQuestions = questions
      .filter(q => q && q.trim().length > 0)
      .map(q => q.trim());

    if (trimmedQuestions.length === 0) {
      return res.json({ clusters: [] });
    }

    const questionEmbeddings = await generateEmbeddings(trimmedQuestions);

    const newClusterData: Array<{
      question: string;
      embedding: number[];
    }> = [];
    const clusterUpdates = new Map<string, Array<{
      question: string;
      normalizedQuestion: string;
      previousUniqueCount: number;
    }>>();

    for (let i = 0; i < trimmedQuestions.length; i++) {
      const question = trimmedQuestions[i];
      const embedding = questionEmbeddings[i];
      
      const similarCluster = await findSimilarCluster(embedding);
      
      if (similarCluster) {
        const normalizedQuestion = normalizeQuestion(question);
        
        const countResult = await query(
          'SELECT COUNT(DISTINCT normalized_question) as unique_count FROM questions WHERE cluster_id = $1',
          [similarCluster.id]
        );
        const previousUniqueCount = parseInt(countResult.rows[0].unique_count);
        
        await addQuestionsToCluster(similarCluster.id, [{
          question,
          normalizedQuestion,
        }]);
        
        if (!clusterUpdates.has(similarCluster.id)) {
          clusterUpdates.set(similarCluster.id, []);
        }
        const updates = clusterUpdates.get(similarCluster.id);
        if (updates) {
          updates.push({
            question,
            normalizedQuestion,
            previousUniqueCount,
          });
        }
      } else {
        newClusterData.push({
          question,
          embedding,
        });
      }
    }

    const newClusterIds: string[] = [];
    
    for (const item of newClusterData) {
      const canonicalQuestion = await canonicalizeQuestion(item.question);
      
      const faqMatches = await findSimilarFAQs(item.embedding, DEFAULT_FAQ_LIMIT);
      
      const coverage = await determineCoverage(canonicalQuestion, faqMatches);
      
      const normalizedQuestion = normalizeQuestion(item.question);
      const storedCluster = await createCluster(
        canonicalQuestion,
        item.embedding,
        [{ question: item.question, normalizedQuestion }],
        coverage,
        faqMatches
      );
      
      newClusterIds.push(storedCluster.clusterId);
    }

    for (const [clusterId, updates] of clusterUpdates.entries()) {
      const previousUniqueCount = updates[0].previousUniqueCount;
      
      const uniqueNormalizedQuestions = new Set(updates.map(u => u.normalizedQuestion));
      const newUniqueCount = previousUniqueCount + uniqueNormalizedQuestions.size;
      
      if (newUniqueCount === previousUniqueCount) {
        continue;
      }
      
      const shouldRegenerate = shouldRegenerateCanonical(previousUniqueCount, newUniqueCount);
      
      if (shouldRegenerate) {
        await regenerateCanonicalQuestion(clusterId);
      }
    }

    const allClusterIds = [...Array.from(clusterUpdates.keys()), ...newClusterIds];
    
    const clusterResults = [];
    
    for (const clusterId of allClusterIds) {
      const clusterData = await query(
        `SELECT id, canonical_question, coverage_status, coverage_explanation, faq_matches FROM clusters WHERE id = $1`,
        [clusterId]
      );
      
      if (clusterData.rows.length === 0) continue;
      
      const cluster = clusterData.rows[0];
      
      const questionsData = await query(
        `SELECT question FROM questions WHERE cluster_id = $1 ORDER BY created_at`,
        [clusterId]
      );
      const clusterQuestions = questionsData.rows.map(r => r.question);
      
      const faqMatches = cluster.faq_matches || [];
      const coverage = {
        status: cluster.coverage_status || CoverageStatus.NOT_COVERED,
        explanation: cluster.coverage_explanation || 'No coverage information available',
      };
      
      clusterResults.push({
        clusterId: cluster.id,
        canonicalQuestion: cluster.canonical_question,
        questionCount: clusterQuestions.length,
        questions: clusterQuestions,
        faqMatches: faqMatches.map((faq: FAQMatch) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          similarity: parseFloat(faq.similarity.toFixed(4)),
        })),
        coverage: {
          status: coverage.status,
          explanation: coverage.explanation,
        },
      });
    }

    res.json({ clusters: clusterResults });
  } catch (error) {
    next(error);
  }
});

function shouldRegenerateCanonical(previousUniqueCount: number, newUniqueCount: number): boolean {
  for (const threshold of REGENERATION_THRESHOLDS) {
    if (previousUniqueCount < threshold && newUniqueCount >= threshold) {
      return true;
    }
  }
  
  return false;
}

export default router;
