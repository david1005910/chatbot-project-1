'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  action,
  className,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string }> = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
    },
  };

  const defaultIcons: Record<AlertVariant, React.ReactNode> = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0', styles.icon)}>
        {icon || defaultIcons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('text-sm font-semibold mb-1', styles.title)}>{title}</h4>
        )}
        <div className="text-sm text-gray-700">{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors',
            styles.icon
          )}
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface AlertBannerProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const variantStyles: Record<AlertVariant, string> = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 text-sm',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <span className="flex-1 text-center">{children}</span>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

interface InlineAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export function InlineAlert({ variant = 'info', children, className }: InlineAlertProps) {
  const variantStyles: Record<AlertVariant, string> = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const icons: Record<AlertVariant, React.ReactNode> = {
    info: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01"
        />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm', variantStyles[variant], className)}
    >
      {icons[variant]}
      {children}
    </span>
  );
}
