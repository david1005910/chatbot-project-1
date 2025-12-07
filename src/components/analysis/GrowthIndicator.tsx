'use client';

import { cn } from '@/lib/utils';

interface GrowthIndicatorProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function GrowthIndicator({
  value,
  label,
  size = 'md',
  showIcon = true,
}: GrowthIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const colorClasses = isNeutral
    ? 'bg-gray-100 text-gray-600'
    : isPositive
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        sizeClasses[size],
        colorClasses
      )}
    >
      {showIcon && !isNeutral && (
        <svg
          className={cn('w-3 h-3', isPositive ? '' : 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      )}
      <span>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
      {label && <span className="text-gray-500 font-normal">{label}</span>}
    </span>
  );
}

interface GrowthComparisonProps {
  current: number;
  previous: number;
  label?: string;
}

export function GrowthComparison({ current, previous, label }: GrowthComparisonProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-gray-900">{current.toLocaleString()}</span>
      <GrowthIndicator value={change} size="sm" />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
