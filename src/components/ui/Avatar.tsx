'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  className,
  onClick,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeStyles: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const showFallback = !src || imageError;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gray-200 text-gray-600 font-medium',
        sizeStyles[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {showFallback ? (
        name ? (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center text-white',
              getBackgroundColor(name)
            )}
          >
            {getInitials(name)}
          </div>
        ) : (
          <svg
            className="w-1/2 h-1/2 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapStyles: Record<AvatarSize, string> = {
    xs: '-ml-2',
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  const sizeStyles: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white rounded-full',
            index > 0 && overlapStyles[size]
          )}
        >
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-medium ring-2 ring-white',
            overlapStyles[size],
            sizeStyles[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function AvatarWithStatus({
  status,
  size = 'md',
  ...props
}: AvatarWithStatusProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block">
      <Avatar size={size} {...props} />
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}
