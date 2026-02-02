import axios from 'axios';
import { API_CONFIG, CoverageStatus } from './constants';

export interface FAQMatch {
  question: string;
  answer: string;
  category: string;
  similarity: number;
}

export interface Coverage {
  status: CoverageStatus;
  explanation: string;
}

export interface ClusterResult {
  clusterId: string;
  canonicalQuestion: string;
  questionCount: number;
  questions: string[];
  faqMatches: FAQMatch[];
  coverage: Coverage;
}

export interface AnalyzeResponse {
  clusters: ClusterResult[];
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface FAQsResponse {
  faqs: FAQ[];
}

export interface ClusterQuestion {
  id: number;
  question: string;
  normalizedQuestion: string;
  askCount: number;
  createdAt: string;
}

export interface StoredCluster {
  clusterId: string;
  canonicalQuestion: string;
  totalAsks: number;
  questions: ClusterQuestion[];
  faqMatches: FAQMatch[];
  coverage: Coverage;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClustersResponse {
  clusters: StoredCluster[];
  pagination: Pagination;
}

export interface GetClustersParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAsks';
  order?: 'asc' | 'desc';
}

export const analyzeQuestions = async (
  questions: string[]
): Promise<AnalyzeResponse> => {
  const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ROUTES.ANALYZE}`, questions);
  return response.data;
};

export const getFAQs = async (): Promise<FAQsResponse> => {
  const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ROUTES.FAQS}`);
  return response.data;
};

export const getClusters = async (params?: GetClustersParams): Promise<ClustersResponse> => {
  const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ROUTES.QUESTIONS}`, { params });
  return response.data;
};
