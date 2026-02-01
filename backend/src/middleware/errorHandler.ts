import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (error.message?.includes('OpenAI') || error.message?.includes('API')) {
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      error: ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE,
      message: ERROR_MESSAGES.AI_SERVICE_MESSAGE,
    });
  }

  if (error.message?.includes('database') || error.message?.includes('query')) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.DATABASE_ERROR,
      message: ERROR_MESSAGES.DATABASE_MESSAGE,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    message: error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
  });
}
