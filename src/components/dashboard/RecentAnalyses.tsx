'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { AnalysisResult } from '@/types';

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const { getAllAnalyses } = await import('@/lib/storage');
        const data = await getAllAnalyses();
        setAnalyses(data.slice(0, 5).reverse());
      } catch (error) {
        console.error('Failed to load analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 분석</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 분석</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">아직 분석 기록이 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">새로운 분석을 시작해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">최근 분석</h3>
        <Link
          href="/history"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          전체 보기
        </Link>
      </div>
      <div className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {analysis.type === 'trend' ? '트렌드 분석' : analysis.type}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(analysis.createdAt)}
              </p>
            </div>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {analysis.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
