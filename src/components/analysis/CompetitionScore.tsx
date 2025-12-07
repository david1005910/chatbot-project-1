'use client';

interface CompetitionScoreProps {
  score: number; // 0-100
  level: '상' | '중' | '하';
  details?: {
    totalProducts: number;
    avgReviewCount: number;
    avgPrice: number;
    rocketDeliveryRatio: number;
  };
}

export function CompetitionScore({ score, level, details }: CompetitionScoreProps) {
  const getScoreColor = () => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = () => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevelBadgeColor = () => {
    switch (level) {
      case '상':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case '중':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '하':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getRecommendation = () => {
    if (score >= 70) {
      return '경쟁이 매우 치열합니다. 틈새 키워드를 찾거나 차별화된 제품을 고려하세요.';
    }
    if (score >= 40) {
      return '적당한 경쟁 수준입니다. 적절한 가격과 마케팅 전략으로 진입 가능합니다.';
    }
    return '경쟁이 낮아 진입 기회가 좋습니다. 빠른 시장 진입을 권장합니다.';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          경쟁강도
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor()}`}>
          {level}
        </span>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-4xl font-bold ${getScoreColor()}`}>{score}</div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ 100</div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      {details && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">총 상품 수</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {details.totalProducts.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">평균 리뷰</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {details.avgReviewCount.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">평균 가격</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {details.avgPrice.toLocaleString()}원
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">로켓배송</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {details.rocketDeliveryRatio}%
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>분석:</strong> {getRecommendation()}
        </div>
      </div>
    </div>
  );
}
