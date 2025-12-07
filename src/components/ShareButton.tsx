'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface ShareButtonProps {
  data: ShareData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
}

export function ShareButton({
  data,
  className,
  size = 'md',
  variant = 'icon',
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { copy, copied } = useClipboard({ timeout: 2000 });

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share(data);
      } catch {
        // User cancelled or share error - no action needed
      }
    }
  };

  const handleCopyLink = () => {
    const url = data.url || window.location.href;
    copy(url);
    setShowMenu(false);
  };

  const shareOptions = [
    {
      name: '링크 복사',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      ),
      action: handleCopyLink,
    },
    {
      name: '카카오톡',
      icon: <span className="text-lg">💬</span>,
      action: () => {
        const url = `https://story.kakao.com/share?url=${encodeURIComponent(data.url || window.location.href)}`;
        window.open(url, '_blank');
        setShowMenu(false);
      },
    },
    {
      name: '트위터',
      icon: <span className="text-lg">🐦</span>,
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text || data.title || '')}&url=${encodeURIComponent(data.url || window.location.href)}`;
        window.open(url, '_blank');
        setShowMenu(false);
      },
    },
    {
      name: '페이스북',
      icon: <span className="text-lg">📘</span>,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url || window.location.href)}`;
        window.open(url, '_blank');
        setShowMenu(false);
      },
    },
  ];

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={canShare ? handleNativeShare : () => setShowMenu(!showMenu)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors',
          className
        )}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        공유하기
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={canShare ? handleNativeShare : () => setShowMenu(!showMenu)}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors',
          sizeClasses[size],
          'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
          className
        )}
        title="공유하기"
      >
        <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {showMenu && !canShare && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
              >
                {option.icon}
                {option.name}
                {option.name === '링크 복사' && copied && (
                  <span className="ml-auto text-green-600 text-xs">복사됨!</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
