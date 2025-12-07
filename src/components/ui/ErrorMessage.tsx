'use client';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = '오류 발생', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h4 className="font-medium text-red-800 dark:text-red-400">{title}</h4>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
