export enum CoverageStatus {
  COVERED = 'covered',
  PARTIALLY_COVERED = 'partially_covered',
  NOT_COVERED = 'not_covered'
}

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  ROUTES: {
    ANALYZE: '/api/analyze',
    FAQS: '/api/faqs',
    QUESTIONS: '/api/questions',
  },
} as const;

export const SIMILARITY_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
} as const;

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_ASKED: 'mostAsked',
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

export const FILTER_OPTIONS = {
  ALL: 'all',
  COVERED: CoverageStatus.COVERED,
  PARTIALLY_COVERED: CoverageStatus.PARTIALLY_COVERED,
  NOT_COVERED: CoverageStatus.NOT_COVERED,
} as const;

export type FilterOption = typeof FILTER_OPTIONS[keyof typeof FILTER_OPTIONS];

export const STATUS_LABELS = {
  [CoverageStatus.COVERED]: 'Covered',
  [CoverageStatus.PARTIALLY_COVERED]: 'Partially Covered',
  [CoverageStatus.NOT_COVERED]: 'Not Covered',
} as const;

export const CLUSTER_CARD = {
  ROW_SPAN_THRESHOLDS: {
    TINY: 2,
    SMALL: 5,
    MEDIUM: 10,
    LARGE: 20,
  },
  ROW_SPANS: {
    TINY: 1,
    SMALL: 2,
    MEDIUM: 3,
    LARGE: 4,
    XLARGE: 5,
  },
} as const;

export const UI_TEXT = {
  STATUS_ICONS: {
    [CoverageStatus.COVERED]: 'OK',
    [CoverageStatus.PARTIALLY_COVERED]: 'PARTIAL',
    [CoverageStatus.NOT_COVERED]: 'NO',
  },
  EMPTY_STATE: 'No question clusters yet. Submit questions above to get started.',
  NO_FILTER_MATCH: 'No clusters match the selected filter.',
  LOADING: 'Loading clusters...',
} as const;
