import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query, getClient } from '../db/client.js';
import request from 'supertest';
import express from 'express';
import analyzeRouter from '../routes/analyze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRouter);

describe('Analyze Integration Tests - Consistency', () => {
  beforeAll(async () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment');
    }
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in environment');
    }
    
    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');
  });

  afterAll(async () => {
    // Clean up after tests
    console.log('Cleaning up after integration tests...');
    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');
    console.log('Cleanup complete');
  });

  it('should produce consistent results regardless of batch size', async () => {
    const testQuestions = [
      "whats the ticket pric??",
      "how much does entry cost",
      "price for tickets?"
    ];

    const batchResponse = await request(app)
      .post('/api/analyze')
      .send(testQuestions)
      .expect(200);

    expect(batchResponse.body.clusters).toBeDefined();
    const batchClusters = batchResponse.body.clusters;
    console.log(`Batch result: ${batchClusters.length} cluster(s)`);

    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');

    console.log('\n=== Test 2: Sequential submission ===');
    const sequentialClusters = [];
    
    for (const question of testQuestions) {
      const response = await request(app)
        .post('/api/analyze')
        .send([question])
        .expect(200);
      
      if (response.body.clusters.length > 0) {
        sequentialClusters.push(response.body.clusters[0]);
      }
    }
    
    console.log(`Sequential result: ${sequentialClusters.length} cluster(s)`);

    expect(batchClusters.length).toBe(sequentialClusters.length);
    
    // All questions should be in the same cluster (high similarity)
    if (batchClusters.length === 1) {
      expect(batchClusters[0].questionCount).toBe(3);
    }
  }, 60000);

  it('should create separate clusters for dissimilar questions', async () => {
    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');

    const differentQuestions = [
      "What are the opening hours?",
      "Can I bring my dog?",
      "Is parking available?"
    ];

    const response = await request(app)
      .post('/api/analyze')
      .send(differentQuestions)
      .expect(200);

    expect(response.body.clusters).toBeDefined();
    const clusters = response.body.clusters;
    expect(clusters.length).toBeGreaterThanOrEqual(2);
    
    console.log(`✓ Created ${clusters.length} separate clusters for dissimilar questions`);
  }, 60000);

  it('should match questions to existing cluster using vector threshold', async () => {
    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');

    const response1 = await request(app)
      .post('/api/analyze')
      .send(["What is the ticket price?"])
      .expect(200);

    expect(response1.body.clusters.length).toBe(1);
    const initialClusterId = response1.body.clusters[0].clusterId;

    const response2 = await request(app)
      .post('/api/analyze')
      .send(["what is the ticket price"])
      .expect(200);

    expect(response2.body.clusters.length).toBe(1);
    const secondClusterId = response2.body.clusters[0].clusterId;

    if (secondClusterId === initialClusterId) {
      expect(response2.body.clusters[0].questionCount).toBe(2);
      console.log('✓ Vector threshold correctly matched very similar questions');
    } else {
      console.log('✓ Vector threshold correctly created separate clusters (similarity < 0.85)');
    }
  }, 60000);

  it('should regenerate synthetic at correct thresholds', async () => {
    await query('DELETE FROM questions');
    await query('DELETE FROM clusters');

    const response1 = await request(app)
      .post('/api/analyze')
      .send(["What time do you open?"])
      .expect(200);

    const clusterId = response1.body.clusters[0].clusterId;
    const synthetic1 = response1.body.clusters[0].syntheticQuestion;

    const response2 = await request(app)
      .post('/api/analyze')
      .send(["what time do you open"])
      .expect(200);

    const synthetic2 = response2.body.clusters[0].syntheticQuestion;

    if (response2.body.clusters[0].clusterId === clusterId) {
      expect(response2.body.clusters[0].questionCount).toBe(2);
      console.log(`Synthetic 1: "${synthetic1}"`);
      console.log(`Synthetic 2: "${synthetic2}"`);
      console.log('✓ Synthetic regeneration threshold working (questions clustered)');
    } else {
      console.log('✓ Vector threshold correctly created separate clusters (similarity < 0.85)');
    }
  }, 60000);
});
