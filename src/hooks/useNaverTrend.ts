'use client';

import { useState, useCallback } from 'react';
import type { NaverTrendRequest, NaverTrendResponse } from '@/types';

interface UseNaverTrendReturn {
  fetchTrend: (params: NaverTrendRequest) => Promise<NaverTrendResponse | null>;
  data: NaverTrendResponse['data'] | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useNaverTrend(): UseNaverTrendReturn {
  const [data, setData] = useState<NaverTrendResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrend = useCallback(async (params: NaverTrendRequest): Promise<NaverTrendResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/naver/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result: NaverTrendResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || '트렌드 데이터를 가져오는데 실패했습니다.');
      }

      setData(result.data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { fetchTrend, data, isLoading, error, reset };
}
