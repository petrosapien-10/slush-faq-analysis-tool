export enum CoverageStatus {
  COVERED = 'covered',
  PARTIALLY_COVERED = 'partially_covered',
  NOT_COVERED = 'not_covered'
}

export const API_ROUTES = {
  ANALYZE: '/api/analyze',
  FAQS: '/api/faqs',
  QUESTIONS: '/api/questions',
} as const;

export const AI_MODELS = {
  EMBEDDING: 'text-embedding-3-small',
  CHAT: 'gpt-4o-mini',
  EMBEDDING_DIMENSIONS: 1536,
} as const;

export const LLM_CONFIG = {
  TEMPERATURE: 0,
  MODEL: AI_MODELS.CHAT,
} as const;

export const SIMILARITY_THRESHOLD = 0.80;
export const DEFAULT_FAQ_LIMIT = 3;

export const SIMILARITY_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
} as const;

export const REGENERATION_THRESHOLDS = [2, 5, 10, 25, 50, 100];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  AI_SERVICE_UNAVAILABLE: 'AI Service Unavailable',
  AI_SERVICE_MESSAGE: 'Failed to communicate with AI service. Please try again later.',
  DATABASE_ERROR: 'Database Error',
  DATABASE_MESSAGE: 'An error occurred while processing your request.',
  INTERNAL_ERROR: 'Internal Server Error',
  UNEXPECTED_ERROR: 'An unexpected error occurred.',
} as const;
