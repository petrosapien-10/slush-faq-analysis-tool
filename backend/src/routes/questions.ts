import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAllClusters } from '../services/clustering/clusterService.js';
import { PAGINATION } from '../config/constants.js';

const router = Router();

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
  sortBy: z.enum(['createdAt', 'totalAsks']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * GET /api/questions
 * Retrieve question clusters with pagination
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sortBy: Sort field - 'createdAt' | 'totalAsks' (default: 'createdAt')
 * - order: Sort order - 'asc' | 'desc' (default: 'desc')
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = querySchema.parse(req.query);
    
    const result = await getAllClusters(params);
    
    res.json({
      clusters: result.clusters,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
