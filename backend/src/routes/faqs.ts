import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../db/client.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT id, category, question, answer FROM faqs ORDER BY category, id'
    );

    const faqs = result.rows.map(row => ({
      id: row.id,
      category: row.category,
      question: row.question,
      answer: row.answer,
    }));

    res.json({ faqs });
  } catch (error) {
    next(error);
  }
});

export default router;
