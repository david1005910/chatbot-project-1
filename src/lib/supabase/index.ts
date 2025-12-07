// Supabase 클라이언트
export { createClient } from './client';
export { createClient as createServerClient } from './server';
export { updateSession } from './middleware';

// 타입
export type { Database, Tables, InsertTables, UpdateTables } from './types';

// 스토리지 함수
export {
  // 분석 결과
  saveAnalysis,
  getAnalysis,
  getAllAnalyses,
  deleteAnalysis,
  // 히스토리
  saveHistory,
  getHistory,
  getAllHistory,
  deleteHistory,
  // 설정
  saveSettings,
  getSettings,
  // 즐겨찾기
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  // 캐시
  cacheKeywordTrend,
  getCachedKeywordTrend,
} from './storage';
