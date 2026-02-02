import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import faqsRouter from '../routes/faqs.js';
import * as dbClient from '../db/client.js';

const app = express();
app.use(express.json());
app.use('/api/faqs', faqsRouter);

describe('GET /api/faqs - Integration Tests', () => {
  beforeAll(() => {
    // Mock the query function to avoid DB calls
    vi.spyOn(dbClient, 'query').mockResolvedValue({
      rows: [
        {
          id: 1,
          category: 'General',
          question: 'What are your opening hours?',
          answer: 'We are open Monday to Friday, 9am to 5pm.',
        },
        {
          id: 2,
          category: 'Tickets',
          question: 'How much does a ticket cost?',
          answer: 'Adult tickets are $20, children under 12 are $10.',
        },
        {
          id: 3,
          category: 'General',
          question: 'Where are you located?',
          answer: 'We are located at 123 Main Street.',
        },
      ],
      command: 'SELECT',
      rowCount: 3,
      oid: 0,
      fields: [],
    });
  });

  it('should return 200 and list of FAQs', async () => {
    const response = await request(app)
      .get('/api/faqs')
      .expect(200);

    expect(response.body).toHaveProperty('faqs');
    expect(Array.isArray(response.body.faqs)).toBe(true);
    expect(response.body.faqs.length).toBe(3);
  });

  it('should return valid FAQ structure', async () => {
    const response = await request(app)
      .get('/api/faqs')
      .expect(200);

    const faq = response.body.faqs[0];
    expect(faq).toHaveProperty('id');
    expect(faq).toHaveProperty('category');
    expect(faq).toHaveProperty('question');
    expect(faq).toHaveProperty('answer');
    expect(typeof faq.id).toBe('number');
    expect(typeof faq.category).toBe('string');
    expect(typeof faq.question).toBe('string');
    expect(typeof faq.answer).toBe('string');
  });

  it('should not include embedding field in response', async () => {
    const response = await request(app)
      .get('/api/faqs')
      .expect(200);

    const faq = response.body.faqs[0];
    expect(faq).not.toHaveProperty('embedding');
  });
});
