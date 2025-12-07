'use client';

import { cn } from '@/lib/utils';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'solid' | 'dashed' | 'dotted';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  className?: string;
  children?: React.ReactNode;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  className,
  children,
}: DividerProps) {
  const variantStyles: Record<DividerVariant, string> = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  if (children) {
    return (
      <div
        className={cn(
          'flex items-center gap-4',
          orientation === 'vertical' && 'flex-col',
          className
        )}
        role="separator"
      >
        <div
          className={cn(
            'flex-1 border-gray-200',
            variantStyles[variant],
            orientation === 'horizontal' ? 'border-t' : 'border-l h-full'
          )}
        />
        <span className="text-sm text-gray-500 flex-shrink-0">{children}</span>
        <div
          className={cn(
            'flex-1 border-gray-200',
            variantStyles[variant],
            orientation === 'horizontal' ? 'border-t' : 'border-l h-full'
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-gray-200',
        variantStyles[variant],
        orientation === 'horizontal' ? 'border-t w-full my-4' : 'border-l h-full mx-4',
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
}

// 섹션 구분용 더 뚜렷한 디바이더
interface SectionDividerProps {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionDivider({ title, icon, action, className }: SectionDividerProps) {
  return (
    <div className={cn('flex items-center gap-4 py-4', className)}>
      <div className="flex-1 border-t border-gray-200" />
      {(title || icon) && (
        <div className="flex items-center gap-2 text-gray-500">
          {icon}
          {title && <span className="text-sm font-medium">{title}</span>}
        </div>
      )}
      {action && <div className="flex-shrink-0">{action}</div>}
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

// 그래디언트 디바이더
interface GradientDividerProps {
  className?: string;
}

export function GradientDivider({ className }: GradientDividerProps) {
  return (
    <div
      className={cn(
        'h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent',
        className
      )}
      role="separator"
    />
  );
}

// 공간 디바이더 (시각적으로 보이지 않지만 공간을 차지)
interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation?: DividerOrientation;
  className?: string;
}

export function Spacer({ size = 'md', orientation = 'horizontal', className }: SpacerProps) {
  const sizeStyles: Record<string, Record<DividerOrientation, string>> = {
    xs: { horizontal: 'h-2', vertical: 'w-2' },
    sm: { horizontal: 'h-4', vertical: 'w-4' },
    md: { horizontal: 'h-6', vertical: 'w-6' },
    lg: { horizontal: 'h-8', vertical: 'w-8' },
    xl: { horizontal: 'h-12', vertical: 'w-12' },
  };

  return (
    <div
      className={cn(sizeStyles[size][orientation], className)}
      aria-hidden="true"
    />
  );
}
