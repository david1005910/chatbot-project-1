'use client';

interface PeriodSelectorProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
}

export function PeriodSelector({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: PeriodSelectorProps) {
  return (
    <fieldset className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        분석 기간
      </legend>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="start-date" className="sr-only">
            시작 날짜
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            aria-label="분석 시작 날짜"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <span className="text-gray-500 dark:text-gray-400" aria-hidden="true">~</span>
        <div className="flex-1">
          <label htmlFor="end-date" className="sr-only">
            종료 날짜
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            aria-label="분석 종료 날짜"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </fieldset>
  );
}
