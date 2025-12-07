import { create } from 'zustand';
import type { ClaudeAnalyzeResponse, UserSettings } from '@/types';

interface AnalysisState {
  // 분석 조건
  period: {
    start: string;
    end: string;
  };
  categories: string[];
  device: 'pc' | 'mo' | '';
  gender: 'm' | 'f' | '';
  ages: string[];

  // 분석 결과
  isLoading: boolean;
  error: string | null;
  analysisResult: ClaudeAnalyzeResponse['data'] | null;

  // 사용자 설정
  settings: UserSettings;

  // 액션
  setPeriod: (start: string, end: string) => void;
  setCategories: (categories: string[]) => void;
  setDevice: (device: 'pc' | 'mo' | '') => void;
  setGender: (gender: 'm' | 'f' | '') => void;
  setAges: (ages: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalysisResult: (result: ClaudeAnalyzeResponse['data'] | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
}

const defaultSettings: UserSettings = {
  defaultCategory: ['50000004'],
  defaultPeriod: { months: 12 },
  excludeClothing: true,
  maxVolume: '택배 가능 크기',
  targetPlatform: '쿠팡',
};

const initialState = {
  period: { start: '', end: '' },
  categories: [],
  device: '' as const,
  gender: '' as const,
  ages: [],
  isLoading: false,
  error: null,
  analysisResult: null,
  settings: defaultSettings,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,

  setPeriod: (start, end) => set({ period: { start, end } }),
  setCategories: (categories) => set({ categories }),
  setDevice: (device) => set({ device }),
  setGender: (gender) => set({ gender }),
  setAges: (ages) => set({ ages }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  reset: () => set(initialState),
}));
