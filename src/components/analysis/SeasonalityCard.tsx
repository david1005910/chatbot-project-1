'use client';

interface SeasonalityCardProps {
  pattern: string;
  peakMonths: number[];
  lowMonths: number[];
  recommendation?: string;
}

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export function SeasonalityCard({
  pattern,
  peakMonths,
  lowMonths,
  recommendation,
}: SeasonalityCardProps) {
  const getMonthColor = (month: number) => {
    if (peakMonths.includes(month)) {
      return 'bg-green-500 text-white';
    }
    if (lowMonths.includes(month)) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        계절성 패턴
      </h3>

      {/* Pattern Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4">{pattern}</p>

      {/* Month Calendar */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {MONTH_NAMES.map((name, index) => (
          <div
            key={name}
            className={`p-2 rounded text-center text-sm font-medium ${getMonthColor(index + 1)}`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">성수기</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">비수기</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">보통</span>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>추천:</strong> {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
