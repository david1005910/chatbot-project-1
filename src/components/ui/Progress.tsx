'use client';

import { cn } from '@/lib/utils';

type ProgressVariant = 'default' | 'success' | 'warning' | 'error';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles: Record<ProgressVariant, string> = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || '진행률'}
          </span>
          {showLabel && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantStyles[variant],
            striped && 'bg-stripes',
            animated && 'animate-progress-stripes'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'default',
  showValue = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors: Record<ProgressVariant, string> = {
    default: '#3b82f6',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={variantColors[variant]}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface StepsProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepsProgress({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepsProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted && 'bg-blue-500 text-white',
                    isCurrent && 'bg-blue-500 text-white ring-4 ring-blue-100',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                {labels && labels[index] && (
                  <span
                    className={cn(
                      'mt-2 text-xs text-center',
                      isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                    )}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    stepNumber < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
