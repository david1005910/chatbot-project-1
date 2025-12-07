'use client';

import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onCopy?: () => void;
}

export function CopyButton({
  text,
  className,
  size = 'md',
  showLabel = false,
  onCopy,
}: CopyButtonProps) {
  const { copy, copied } = useClipboard({
    timeout: 2000,
    onSuccess: onCopy,
  });

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={() => copy(text)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg transition-colors',
        sizeClasses[size],
        copied
          ? 'text-green-600 bg-green-50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        className
      )}
      title={copied ? '복사됨!' : '클립보드에 복사'}
    >
      {copied ? (
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        </svg>
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {copied ? '복사됨!' : '복사'}
        </span>
      )}
    </button>
  );
}
