import { create } from 'zustand';
import { analyzeQuestions, getClusters, type StoredCluster, type Pagination } from '../api';

interface AppState {
  clusters: StoredCluster[];
  selectedCluster: StoredCluster | null;
  pagination: Pagination | null;
  
  isAnalyzing: boolean;
  isLoadingClusters: boolean;
  
  error: string;
  
  analyzeBatch: (questions: string[]) => Promise<void>;
  loadClusters: (limit?: number) => Promise<void>;
  selectCluster: (cluster: StoredCluster | null) => void;
  clearError: () => void;
}

let analyzingPromise: Promise<void> | null = null;
let loadingPromise: Promise<void> | null = null;

export const useAppStore = create<AppState>((set) => ({
  clusters: [],
  selectedCluster: null,
  pagination: null,
  isAnalyzing: false,
  isLoadingClusters: false,
  error: '',
  
  analyzeBatch: async (questions: string[]) => {
    if (questions.length === 0) {
      set({ error: 'Please enter at least one question' });
      return;
    }
    
    // Prevent duplicate requests
    if (analyzingPromise) return analyzingPromise;
    
    set({ isAnalyzing: true, error: '' });
    
    analyzingPromise = (async () => {
      try {
        await analyzeQuestions(questions);
        
        const response = await getClusters({ limit: 100, sortBy: 'totalAsks', order: 'desc' });
        set({ clusters: response.clusters, pagination: response.pagination, isAnalyzing: false });
      } catch (err: unknown) {
        const errorMessage = (err as {response?: {data?: {message?: string}}; message?: string}).response?.data?.message || (err as {message?: string}).message || 'Failed to analyze questions';
        set({ error: errorMessage, isAnalyzing: false });
      } finally {
        analyzingPromise = null;
      }
    })();
    
    return analyzingPromise;
  },
  
  loadClusters: async (limit = 100) => {
    // Prevent duplicate requests
    if (loadingPromise) return loadingPromise;
    
    set({ isLoadingClusters: true, error: '' });
    
    loadingPromise = (async () => {
      try {
        const response = await getClusters({ 
          limit, 
          sortBy: 'totalAsks', 
          order: 'desc' 
        });
        set({ clusters: response.clusters, pagination: response.pagination, isLoadingClusters: false });
      } catch (err: unknown) {
        const errorMessage = (err as {response?: {data?: {message?: string}}; message?: string}).response?.data?.message || (err as {message?: string}).message || 'Failed to load clusters';
        set({ error: errorMessage, isLoadingClusters: false });
      } finally {
        loadingPromise = null;
      }
    })();
    
    return loadingPromise;
  },
  
  selectCluster: (cluster: StoredCluster | null) => {
    set({ selectedCluster: cluster });
  },
  
  clearError: () => {
    set({ error: '' });
  },
}));
