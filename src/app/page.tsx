'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { CategorySelector } from '@/components/dashboard/CategorySelector';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { KeywordRanking } from '@/components/analysis/KeywordRanking';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { NaverTrendResponse } from '@/types';

/**
 * HTTP 상태 코드별 에러 메시지 생성
 * 네트워크 오류와 비즈니스 로직 오류를 구분하여 사용자 친화적인 메시지 제공
 */
function getErrorMessage(status: number, defaultMessage: string): string {
  switch (status) {
    case 400:
      return '요청 데이터가 올바르지 않습니다. 입력 값을 확인해주세요.';
    case 401:
      return '인증에 실패했습니다. 다시 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 429:
      return 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 502:
    case 503:
    case 504:
      return '서버가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return defaultMessage;
  }
}

export default function Dashboard() {
  useGlobalShortcuts();

  const {
    period,
    categories,
    device,
    gender,
    ages,
    isLoading,
    error,
    analysisResult,
    setPeriod,
    setCategories,
    setDevice,
    setGender,
    setAges,
    setLoading,
    setError,
    setAnalysisResult,
  } = useAnalysisStore();

  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    if (!period.start || !period.end || categories.length === 0) {
      setError('분석 기간과 카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 네이버 트렌드 데이터 수집
      const trendResponse = await fetch('/api/naver/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: period.start,
          endDate: period.end,
          timeUnit: 'month',
          category: categories,
          device,
          gender,
          ages,
        }),
      });

      // HTTP 상태 코드 체크
      if (!trendResponse.ok) {
        throw new Error(getErrorMessage(trendResponse.status, '트렌드 데이터 수집 실패'));
      }

      const trendData: NaverTrendResponse = await trendResponse.json();
      if (!trendData.success) {
        throw new Error(trendData.error || '트렌드 데이터 수집 실패');
      }

      // 2. Claude AI 분석
      const analyzeResponse = await fetch('/api/claude/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendData: trendData.data.map((item) => ({
            keyword: item.title,
            historicalTrend: item.data.map((d) => ({
              date: d.period,
              value: d.ratio,
            })),
            lstmPrediction: [],
            growthRate: 0,
          })),
          userCriteria: {
            excludeClothing: true,
            maxVolume: '택배 가능 크기',
            targetPlatform: '쿠팡',
          },
          analysisType: 'ranking',
        }),
      });

      // HTTP 상태 코드 체크
      if (!analyzeResponse.ok) {
        throw new Error(getErrorMessage(analyzeResponse.status, 'AI 분석 실패'));
      }

      const analysisData = await analyzeResponse.json();
      if (!analysisData.success) {
        throw new Error(analysisData.error || 'AI 분석 실패');
      }

      setAnalysisResult(analysisData.data);

      // 분석 결과 IndexedDB에 저장
      try {
        const { saveAnalysis } = await import('@/lib/storage');
        await saveAnalysis({
          id: `analysis-${Date.now()}`,
          type: 'trend',
          input: {
            period,
            categories,
            device,
            gender,
            ages,
          },
          output: analysisData.data,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // 저장 실패는 사용자에게 표시하지 않음 (분석 결과는 정상 표시)
      }
    } catch (err) {
      // 네트워크 오류 구분
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('네트워크 연결을 확인해주세요.');
      } else {
        setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword(keyword);
    router.push(`/analysis/${encodeURIComponent(keyword)}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">트렌드 분석</h1>
        <p className="text-gray-600 mt-1">
          AI 기반 트렌드 예측으로 유망 상품을 발굴하세요
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <PeriodSelector
          startDate={period.start}
          endDate={period.end}
          onStartChange={(date) => setPeriod(date, period.end)}
          onEndChange={(date) => setPeriod(period.start, date)}
        />
        <CategorySelector selected={categories} onChange={setCategories} />
        <FilterPanel
          device={device}
          gender={gender}
          ages={ages}
          onDeviceChange={setDevice}
          onGenderChange={setGender}
          onAgesChange={setAges}
        />
      </div>

      {/* Analyze Button */}
      <div className="mb-8">
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !period.start || !period.end || categories.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              분석 중...
            </>
          ) : (
            '분석 시작'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={handleAnalyze} />
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <>
          {/* Export Button */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={async () => {
                const { exportKeywordRanking } = await import('@/lib/export');
                exportKeywordRanking(analysisResult.top10Keywords);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV 내보내기
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <KeywordRanking
              keywords={analysisResult.top10Keywords}
              onKeywordClick={handleKeywordClick}
            />

            {/* Analysis Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                분석 인사이트
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {analysisResult.analysisInsights}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Selected Keyword Detail */}
      {selectedKeyword && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700">
            선택된 키워드: <strong>{selectedKeyword}</strong>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            상세 분석 페이지로 이동 중...
          </p>
        </div>
      )}
    </div>
  );
}
