'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon || (
        <svg
          className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
