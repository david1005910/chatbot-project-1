'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions<T> {
  initialData?: T;
  cacheKey?: string;
  cacheTTL?: number; // milliseconds
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T) => void;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    initialData,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const [data, setData] = useState<T | null>(() => {
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return cached.data as T;
      }
    }
    return initialData ?? null;
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isValidating, setIsValidating] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (isRevalidation = false) => {
    if (isRevalidation) {
      setIsValidating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await fetcherRef.current();
      setData(result);

      if (cacheKey) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [cacheKey]);

  const mutate = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
      if (cacheKey) {
        cache.set(cacheKey, { data: newData, timestamp: Date.now() });
      }
    } else {
      fetchData(true);
    }
  }, [cacheKey, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      fetchData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, fetchData]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      fetchData(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidateOnReconnect, fetchData]);

  return { data, error, isLoading, isValidating, mutate, refetch };
}

/**
 * Hook for lazy fetching (manual trigger)
 */
export function useLazyFetch<T, P = void>(
  fetcher: (params: P) => Promise<T>
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (params: P) => Promise<T | null>;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (params: P): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}
