import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import questionsRouter from '../routes/questions.js';
import * as clusterService from '../services/clustering/clusterService.js';
import { CoverageStatus } from '../config/constants.js';
import { errorHandler } from '../middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api/questions', questionsRouter);
app.use(errorHandler);

describe('GET /api/questions - Integration Tests', () => {
  beforeAll(() => {
    // Mock the getAllClusters function to avoid DB calls
    vi.spyOn(clusterService, 'getAllClusters').mockResolvedValue({
      clusters: [
        {
          clusterId: 'cluster-1',
          canonicalQuestion: 'What is the ticket price?',
          totalAsks: 5,
          questions: [
            {
              id: 1,
              question: 'How much is a ticket?',
              normalizedQuestion: 'how much is a ticket',
              askCount: 3,
              createdAt: new Date('2024-01-01'),
            },
            {
              id: 2,
              question: 'What is the price?',
              normalizedQuestion: 'what is the price',
              askCount: 2,
              createdAt: new Date('2024-01-02'),
            },
          ],
          faqMatches: [],
          coverage: {
            status: CoverageStatus.NOT_COVERED,
            explanation: 'Not covered',
          },
          createdAt: new Date('2024-01-01'),
        },
        {
          clusterId: 'cluster-2',
          canonicalQuestion: 'What are the opening hours?',
          totalAsks: 2,
          questions: [
            {
              id: 3,
              question: 'When do you open?',
              normalizedQuestion: 'when do you open',
              askCount: 2,
              createdAt: new Date('2024-01-03'),
            },
          ],
          faqMatches: [],
          coverage: {
            status: CoverageStatus.COVERED,
            explanation: 'Covered',
          },
          createdAt: new Date('2024-01-02'),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      },
    });
  });

  it('should return 200 and clusters with default pagination', async () => {
    const response = await request(app)
      .get('/api/questions')
      .expect(200);

    expect(response.body).toHaveProperty('clusters');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.clusters)).toBe(true);
    expect(response.body.clusters.length).toBe(2);
  });

  it('should return valid cluster structure', async () => {
    const response = await request(app)
      .get('/api/questions')
      .expect(200);

    const cluster = response.body.clusters[0];
    expect(cluster).toHaveProperty('clusterId');
    expect(cluster).toHaveProperty('canonicalQuestion');
    expect(cluster).toHaveProperty('totalAsks');
    expect(cluster).toHaveProperty('questions');
    expect(cluster).toHaveProperty('faqMatches');
    expect(cluster).toHaveProperty('coverage');
    expect(cluster).toHaveProperty('createdAt');
  });

  it('should return valid pagination structure', async () => {
    const response = await request(app)
      .get('/api/questions?page=1&limit=10')
      .expect(200);

    const { pagination } = response.body;
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('totalPages');
    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.total).toBe('number');
    expect(typeof pagination.totalPages).toBe('number');
  });

  it('should accept query parameters for pagination', async () => {
    const response = await request(app)
      .get('/api/questions?page=2&limit=5&sortBy=totalAsks&order=asc')
      .expect(200);

    expect(response.body).toHaveProperty('clusters');
    expect(response.body).toHaveProperty('pagination');
  });

  it('should return 400 for invalid query parameters', async () => {
    await request(app)
      .get('/api/questions?page=-1')
      .expect(400);
  });

  it('should return 400 for limit exceeding max', async () => {
    await request(app)
      .get('/api/questions?limit=999')
      .expect(400);
  });
});
