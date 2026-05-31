import { create } from 'zustand';

export interface RenderLog {
  id: string;
  timestamp: string;
  componentName: string;
  renderTime: number;
  reason: string;
}

export interface ObservabilityState {
  globalRenders: number;
  logs: RenderLog[];
  flashingComponents: Record<string, boolean>;
  optimizationScore: number;
  
  // React Query Lab State
  useReactQuery: boolean;
  staleTime: number; // in ms
  simulatedLatency: number; // in ms
  rqCacheHits: number;
  rqCacheMisses: number;
  
  // State Management Lab State
  stateMode: 'prop-drilling' | 'context-api' | 'zustand';
  
  // Image Lab State
  imageMode: 'raw' | 'medium' | 'optimized';
  
  // Actions
  incrementGlobalRenders: () => void;
  addLog: (componentName: string, renderTime: number, reason?: string) => void;
  clearLogs: () => void;
  triggerFlash: (componentName: string) => void;
  setOptimizationScore: (score: number) => void;
  
  setUseReactQuery: (val: boolean) => void;
  setStaleTime: (val: number) => void;
  setSimulatedLatency: (val: number) => void;
  incrementCacheHits: () => void;
  incrementCacheMisses: () => void;
  
  setStateMode: (mode: 'prop-drilling' | 'context-api' | 'zustand') => void;
  setImageMode: (mode: 'raw' | 'medium' | 'optimized') => void;
}

export const useObservabilityStore = create<ObservabilityState>((set, get) => ({
  globalRenders: 0,
  logs: [],
  flashingComponents: {},
  optimizationScore: 85,
  
  // React Query Lab
  useReactQuery: true,
  staleTime: 5000,
  simulatedLatency: 500,
  rqCacheHits: 0,
  rqCacheMisses: 0,
  
  // State Lab
  stateMode: 'zustand',
  
  // Image Lab
  imageMode: 'optimized',

  incrementGlobalRenders: () => set((state) => ({ globalRenders: state.globalRenders + 1 })),
  
  addLog: (componentName, renderTime, reason = 'State/Prop Change') => set((state) => {
    const newLog: RenderLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      componentName,
      renderTime,
      reason,
    };
    
    // Limit logs list to 100 entries to prevent memory leak
    const updatedLogs = [newLog, ...state.logs].slice(0, 100);
    return { 
      logs: updatedLogs,
      globalRenders: state.globalRenders + 1
    };
  }),
  
  clearLogs: () => set({ logs: [], globalRenders: 0 }),
  
  triggerFlash: (componentName) => {
    set((state) => ({
      flashingComponents: {
        ...state.flashingComponents,
        [componentName]: true
      }
    }));
    
    // Clear flash after 300ms
    setTimeout(() => {
      set((state) => ({
        flashingComponents: {
          ...state.flashingComponents,
          [componentName]: false
        }
      }));
    }, 300);
  },
  
  setOptimizationScore: (score) => set({ optimizationScore: score }),
  
  setUseReactQuery: (val) => set({ useReactQuery: val }),
  setStaleTime: (val) => set({ staleTime: val }),
  setSimulatedLatency: (val) => set({ simulatedLatency: val }),
  incrementCacheHits: () => set((state) => ({ rqCacheHits: state.rqCacheHits + 1 })),
  incrementCacheMisses: () => set((state) => ({ rqCacheMisses: state.rqCacheMisses + 1 })),
  
  setStateMode: (mode) => set({ stateMode: mode }),
  setImageMode: (mode) => set({ imageMode: mode }),
}));
