import { createClient } from './client';
import type { Tables, InsertTables, UpdateTables } from './types';
import type { AnalysisResult, AnalysisHistory, UserSettings } from '@/types';

// ============================================
// 분석 결과 CRUD
// ============================================

export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase as any).from('analyses').insert({
    id: analysis.id,
    type: analysis.type,
    input: analysis.input,
    output: analysis.output,
    created_at: analysis.createdAt,
  });

  if (error) {
    console.error('Failed to save analysis:', error);
    throw error;
  }
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Failed to get analysis:', error);
    throw error;
  }

  return data ? transformAnalysis(data) : null;
}

export async function getAllAnalyses(): Promise<AnalysisResult[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get analyses:', error);
    throw error;
  }

  return (data || []).map(transformAnalysis);
}

export async function deleteAnalysis(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete analysis:', error);
    throw error;
  }
}

// ============================================
// 분석 히스토리 CRUD
// ============================================

export async function saveHistory(history: AnalysisHistory): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase as any).from('analysis_history').upsert({
    id: history.id,
    name: history.name,
    analyses: history.analyses,
    created_at: history.createdAt,
    updated_at: history.updatedAt,
  });

  if (error) {
    console.error('Failed to save history:', error);
    throw error;
  }
}

export async function getHistory(id: string): Promise<AnalysisHistory | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Failed to get history:', error);
    throw error;
  }

  return data ? transformHistory(data) : null;
}

export async function getAllHistory(): Promise<AnalysisHistory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to get all history:', error);
    throw error;
  }

  return (data || []).map(transformHistory);
}

export async function deleteHistory(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('analysis_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete history:', error);
    throw error;
  }
}

// ============================================
// 사용자 설정 CRUD
// ============================================

export async function saveSettings(settings: UserSettings): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // 비로그인 사용자는 로컬 스토리지 사용
    localStorage.setItem('user-settings', JSON.stringify(settings));
    return;
  }

  const { error } = await (supabase as any).from('user_settings').upsert({
    user_id: user.id,
    default_category: settings.defaultCategory,
    default_period_months: settings.defaultPeriod.months,
    exclude_clothing: settings.excludeClothing,
    max_volume: settings.maxVolume,
    target_platform: settings.targetPlatform,
  });

  if (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // 비로그인 사용자는 로컬 스토리지에서 가져오기
    const stored = localStorage.getItem('user-settings');
    return stored ? JSON.parse(stored) : null;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Failed to get settings:', error);
    throw error;
  }

  return data ? transformSettings(data) : null;
}

// ============================================
// 즐겨찾기 CRUD
// ============================================

export async function addFavorite(keyword: string, category: string, memo?: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다');

  const { error } = await (supabase as any).from('favorites').insert({
    user_id: user.id,
    keyword,
    category,
    memo,
  });

  if (error) {
    console.error('Failed to add favorite:', error);
    throw error;
  }
}

export async function removeFavorite(keyword: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('keyword', keyword);

  if (error) {
    console.error('Failed to remove favorite:', error);
    throw error;
  }
}

export async function getFavorites(): Promise<Tables<'favorites'>[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get favorites:', error);
    throw error;
  }

  return data || [];
}

export async function isFavorite(keyword: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('keyword', keyword)
    .single();

  return !!data;
}

// ============================================
// 키워드 트렌드 캐시
// ============================================

export async function cacheKeywordTrend(
  keyword: string,
  category: string,
  periodStart: string,
  periodEnd: string,
  dataPoints: { date: string; value: number }[],
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase as any).from('keyword_trends').upsert({
    keyword,
    category,
    period_start: periodStart,
    period_end: periodEnd,
    data_points: dataPoints,
    metadata: metadata || {},
  });

  if (error) {
    console.error('Failed to cache keyword trend:', error);
    // 캐시 실패는 무시
  }
}

export async function getCachedKeywordTrend(
  keyword: string,
  category: string,
  periodStart: string,
  periodEnd: string
): Promise<{ dataPoints: { date: string; value: number }[]; metadata: Record<string, unknown> } | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('keyword_trends')
    .select('data_points, metadata')
    .eq('keyword', keyword)
    .eq('category', category)
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd)
    .single();

  if (error || !data) return null;

  return {
    dataPoints: (data as any).data_points as { date: string; value: number }[],
    metadata: (data as any).metadata as Record<string, unknown>,
  };
}

// ============================================
// 변환 헬퍼 함수
// ============================================

function transformAnalysis(data: Tables<'analyses'>): AnalysisResult {
  return {
    id: data.id,
    type: data.type,
    input: data.input as Record<string, unknown>,
    output: data.output as Record<string, unknown>,
    createdAt: data.created_at,
  };
}

function transformHistory(data: Tables<'analysis_history'>): AnalysisHistory {
  return {
    id: data.id,
    name: data.name,
    analyses: data.analyses as unknown as AnalysisResult[],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformSettings(data: Tables<'user_settings'>): UserSettings {
  return {
    defaultCategory: data.default_category,
    defaultPeriod: { months: data.default_period_months },
    excludeClothing: data.exclude_clothing,
    maxVolume: data.max_volume,
    targetPlatform: data.target_platform,
  };
}
