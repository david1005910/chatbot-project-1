'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        rounded ? 'rounded-full' : 'rounded',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({ status, showLabel = true, className }: StatusBadgeProps) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: '온라인' },
    offline: { color: 'bg-gray-400', label: '오프라인' },
    busy: { color: 'bg-red-500', label: '바쁨' },
    away: { color: 'bg-yellow-500', label: '자리비움' },
  };

  const { color, label } = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full', color)} />
      {showLabel && <span className="text-sm text-gray-600">{label}</span>}
    </span>
  );
}

interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full',
        className
      )}
    >
      {displayCount}
    </span>
  );
}
