import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError } from './customErrors.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, {
    name: error.name,
    message: error.message,
    stack: !isProduction ? error.stack : undefined,
  });

  if (error instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    message: isProduction 
      ? ERROR_MESSAGES.UNEXPECTED_ERROR 
      : error.message || ERROR_MESSAGES.UNEXPECTED_ERROR,
  });
}
