'use client';

import { useState, useCallback } from 'react';
import type { ClaudeAnalyzeRequest, ClaudeAnalyzeResponse } from '@/types';

interface UseClaudeAnalysisReturn {
  analyze: (params: ClaudeAnalyzeRequest) => Promise<ClaudeAnalyzeResponse['data'] | null>;
  data: ClaudeAnalyzeResponse['data'] | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useClaudeAnalysis(): UseClaudeAnalysisReturn {
  const [data, setData] = useState<ClaudeAnalyzeResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (params: ClaudeAnalyzeRequest): Promise<ClaudeAnalyzeResponse['data'] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/claude/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result: ClaudeAnalyzeResponse = await response.json();

      if (!result.success) {
        throw new Error('AI 분석에 실패했습니다.');
      }

      setData(result.data);
      return result.data;
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

  return { analyze, data, isLoading, error, reset };
}
