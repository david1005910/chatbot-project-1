'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AnalysisResult } from '@/types';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        // Dynamic import to avoid SSR issues with IndexedDB
        const { getAllAnalyses } = await import('@/lib/storage');
        const data = await getAllAnalyses();
        setAnalyses(data.reverse()); // 최신순 정렬
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('이 분석 기록을 삭제하시겠습니까?')) return;

    try {
      const { deleteAnalysis } = await import('@/lib/storage');
      await deleteAnalysis(id);
      setAnalyses(analyses.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trend':
        return '트렌드 분석';
      case 'competition':
        return '경쟁강도 분석';
      case 'niche':
        return '틈새 키워드';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            분석 히스토리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            이전에 수행한 분석 결과를 확인하세요
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              아직 저장된 분석 기록이 없습니다.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              새 분석 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded mb-2">
                      {getTypeLabel(analysis.type)}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(analysis.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    입력 조건
                  </h3>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                    {JSON.stringify(analysis.input, null, 2)}
                  </pre>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    분석 결과
                  </h3>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-x-auto max-h-48">
                    {JSON.stringify(analysis.output, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
