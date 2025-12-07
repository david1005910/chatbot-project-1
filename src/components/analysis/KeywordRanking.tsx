'use client';

import { useCallback } from 'react';
import type { ClaudeAnalyzeResponse } from '@/types';

interface KeywordRankingProps {
  keywords: ClaudeAnalyzeResponse['data']['top10Keywords'];
  onKeywordClick?: (keyword: string) => void;
}

export function KeywordRanking({ keywords, onKeywordClick }: KeywordRankingProps) {
  const getLevelColor = (level: '상' | '중' | '하') => {
    switch (level) {
      case '상':
        return 'text-red-500';
      case '중':
        return 'text-yellow-500';
      case '하':
        return 'text-green-500';
    }
  };

  const getGrowthColor = (level: '상' | '중' | '하') => {
    switch (level) {
      case '상':
        return 'text-green-500';
      case '중':
        return 'text-yellow-500';
      case '하':
        return 'text-red-500';
    }
  };

  /**
   * 키보드 이벤트 핸들러 - Enter 또는 Space 키로 키워드 선택
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, keyword: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onKeywordClick?.(keyword);
      }
    },
    [onKeywordClick]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        TOP 10 유망 키워드
      </h3>

      <ul className="space-y-3" role="list" aria-label="유망 키워드 목록">
        {keywords.map((item) => (
          <li key={item.rank}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onKeywordClick?.(item.keyword)}
              onKeyDown={(e) => handleKeyDown(e, item.keyword)}
              aria-label={`${item.rank}위: ${item.keyword}, 성장 잠재력 ${item.growthPotential}, 경쟁 강도 ${item.competitionLevel}`}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium"
                  aria-hidden="true"
                >
                  {item.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {item.keyword}
                    </span>
                    <span
                      className={`text-xs ${getGrowthColor(item.growthPotential)}`}
                      aria-label={`성장 잠재력: ${item.growthPotential}`}
                    >
                      성장 {item.growthPotential}
                    </span>
                    <span
                      className={`text-xs ${getLevelColor(item.competitionLevel)}`}
                      aria-label={`경쟁 강도: ${item.competitionLevel}`}
                    >
                      경쟁 {item.competitionLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.reason}
                  </p>
                  {item.nicheKeywords.length > 0 && (
                    <div className="flex gap-2 mt-2" aria-label="관련 틈새 키워드">
                      {item.nicheKeywords.slice(0, 3).map((niche, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                        >
                          {niche}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
