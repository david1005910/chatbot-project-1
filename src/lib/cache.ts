import { unstable_cache } from 'next/cache';
import { fetchNaverTrend } from './naver-api';
import type { NaverTrendRequest, NaverTrendResponse } from '@/types';

/**
 * Cached Naver trend data fetcher
 * Caches results for 1 hour to reduce API calls
 */
export const getCachedTrendData = unstable_cache(
  async (params: NaverTrendRequest): Promise<NaverTrendResponse> => {
    return await fetchNaverTrend(params);
  },
  ['naver-trend'],
  {
    revalidate: 3600, // 1 hour cache
    tags: ['trend-data'],
  }
);

/**
 * Simple in-memory cache for client-side use
 */
class ClientCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instances for different data types
export const trendCache = new ClientCache<NaverTrendResponse>(60 * 60 * 1000); // 1 hour
export const analysisCache = new ClientCache<unknown>(30 * 60 * 1000); // 30 minutes
export const keywordCache = new ClientCache<unknown>(15 * 60 * 1000); // 15 minutes

/**
 * Generate cache key from request parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
}
