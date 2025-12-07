'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TrendChart } from '@/components/analysis/TrendChart';
import {
  SeasonalityCard,
  SeasonalityBadge,
  classifySeasonality,
  type SeasonalityInfo
} from '@/components/analysis/SeasonalityIndicator';
import type { CoupangCompetitionResponse, NicheKeywordResponse } from '@/types';

export default function KeywordAnalysisPage() {
  const params = useParams();
  const keyword = decodeURIComponent(params.keyword as string);

  const [competitionData, setCompetitionData] = useState<CoupangCompetitionResponse['data'] | null>(null);
  const [nicheKeywords, setNicheKeywords] = useState<NicheKeywordResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<{
    predictions: number[];
    confidenceLower: number[];
    confidenceUpper: number[];
  } | null>(null);

  // Mock trend data for demonstration (2년 730일 데이터 + 미래 7일 예측)
  const [historicalData] = useState(() => {
    const data: { date: string; value: number }[] = [];
    const now = new Date();

    // 과거 2년간 데이터 생성
    for (let i = 730; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // 계절성 시뮬레이션 (1월, 12월 성수기 / 6-7월 비수기)
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      const month = date.getMonth();

      // 계절 효과: 겨울(11-2월) 높음, 여름(6-8월) 낮음
      let seasonalEffect = 1;
      if (month === 11 || month === 0 || month === 1) {
        seasonalEffect = 1.4; // 겨울 성수기
      } else if (month >= 5 && month <= 7) {
        seasonalEffect = 0.7; // 여름 비수기
      }

      const baseValue = 60;
      const noise = (Math.random() - 0.5) * 20;
      const weeklyPattern = Math.sin((dayOfYear / 7) * Math.PI * 2) * 5;

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(10, baseValue * seasonalEffect + noise + weeklyPattern),
      });
    }
    return data;
  });

  // 앙상블 모델로 미래 30일(한 달) 예측
  useEffect(() => {
    async function runPrediction() {
      try {
        const { forecastTrend } = await import('@/lib/ensemble-forecast-model');
        const values = historicalData.map(d => d.value);
        const result = forecastTrend(values, 30); // 30일 예측

        setPredictionData({
          predictions: result.predictions,
          confidenceLower: result.confidenceLower,
          confidenceUpper: result.confidenceUpper,
        });
      } catch (err) {
        console.error('Prediction error:', err);
      }
    }

    runPrediction();
  }, [historicalData]);

  // 과거 데이터 + 미래 예측 데이터 결합
  const trendData = useMemo(() => {
    const now = new Date();
    const combinedData: {
      date: string;
      value: number;
      predicted?: number;
      confidenceLower?: number;
      confidenceUpper?: number;
      isFuture?: boolean;
    }[] = [];

    // 과거 데이터 추가
    historicalData.forEach(d => {
      combinedData.push({
        date: d.date,
        value: d.value,
      });
    });

    // 미래 예측 데이터 추가 (30일)
    if (predictionData) {
      for (let i = 1; i <= 30; i++) {
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + i);

        combinedData.push({
          date: futureDate.toISOString().split('T')[0],
          value: predictionData.predictions[i - 1], // 예측값을 value에도 넣어서 라인 연결
          predicted: predictionData.predictions[i - 1],
          confidenceLower: predictionData.confidenceLower[i - 1],
          confidenceUpper: predictionData.confidenceUpper[i - 1],
          isFuture: true,
        });
      }
    }

    return combinedData;
  }, [historicalData, predictionData]);

  // 계절성 분석
  const seasonalityInfo = useMemo(() => {
    const values = trendData.map(d => d.value);
    return classifySeasonality(values);
  }, [trendData]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // 경쟁강도 분석
        const competitionRes = await fetch('/api/coupang/competition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        });
        const competitionJson = await competitionRes.json();
        if (competitionJson.success) {
          setCompetitionData(competitionJson.data);
        }

        // 틈새 키워드 추천
        const nicheRes = await fetch('/api/keyword/niche', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mainKeyword: keyword, maxResults: 5 }),
        });
        const nicheJson = await nicheRes.json();
        if (nicheJson.success) {
          setNicheKeywords(nicheJson.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [keyword]);

  const getCompetitionColor = (level: '상' | '중' | '하') => {
    switch (level) {
      case '상':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case '중':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '하':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {keyword} 상세 분석
            </h1>
            <SeasonalityBadge
              type={seasonalityInfo.type}
              strength={seasonalityInfo.strength}
              size="md"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 트렌드 차트 */}
          <div className="lg:col-span-2">
            <TrendChart data={trendData} title={`${keyword} 검색량 트렌드`} />
          </div>

          {/* 계절성 분석 카드 */}
          <div className="lg:col-span-2">
            <SeasonalityCard
              data={trendData.map(d => d.value)}
              dates={trendData.map(d => d.date)}
              seasonalStrength={seasonalityInfo.strength}
            />
          </div>

          {/* 경쟁강도 분석 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              쿠팡 경쟁강도 분석
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : competitionData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">경쟁 강도:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${getCompetitionColor(
                      competitionData.competitionLevel
                    )}`}
                  >
                    {competitionData.competitionLevel} ({competitionData.competitionScore}/100)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 상품 수</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {competitionData.totalProducts.toLocaleString()}개
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">평균 리뷰 수</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {competitionData.avgReviewCount.toLocaleString()}개
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">평균 가격</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {competitionData.avgPrice.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">로켓배송 비율</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {competitionData.rocketDeliveryRatio}%
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {competitionData.insights}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">데이터 없음</p>
            )}
          </div>

          {/* 틈새 키워드 추천 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              틈새 키워드 추천
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : nicheKeywords?.nicheKeywords && nicheKeywords.nicheKeywords.length > 0 ? (
              <div className="space-y-3">
                {nicheKeywords.nicheKeywords.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.keyword}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${getCompetitionColor(
                          item.competition
                        )}`}
                      >
                        경쟁 {item.competition}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      월 검색량: {item.searchVolume.toLocaleString()}회
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      추천 제품명: {item.recommendedTitle}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Claude API 키가 설정되지 않았거나 데이터가 없습니다.
              </p>
            )}
          </div>

          {/* 빠른 액션 */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              빠른 액션
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/calculator"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                마진 계산하기
              </Link>
              <button
                onClick={() => window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`, '_blank')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                쿠팡에서 검색
              </button>
              <button
                onClick={() => window.open(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keyword)}`, '_blank')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                1688에서 검색
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
