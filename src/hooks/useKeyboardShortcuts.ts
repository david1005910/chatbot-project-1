'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

const defaultShortcuts: ShortcutConfig[] = [
  {
    key: '1',
    altKey: true,
    action: () => {},
    description: '대시보드로 이동',
  },
  {
    key: '2',
    altKey: true,
    action: () => {},
    description: '마진 계산기로 이동',
  },
  {
    key: '3',
    altKey: true,
    action: () => {},
    description: '소싱 검색으로 이동',
  },
  {
    key: '4',
    altKey: true,
    action: () => {},
    description: '분석 히스토리로 이동',
  },
  {
    key: '5',
    altKey: true,
    action: () => {},
    description: '설정으로 이동',
  },
];

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
  const router = useRouter();

  const shortcuts = useCallback((): ShortcutConfig[] => {
    const navigationShortcuts: ShortcutConfig[] = [
      {
        key: '1',
        altKey: true,
        action: () => router.push('/'),
        description: '대시보드로 이동',
      },
      {
        key: '2',
        altKey: true,
        action: () => router.push('/calculator'),
        description: '마진 계산기로 이동',
      },
      {
        key: '3',
        altKey: true,
        action: () => router.push('/sourcing'),
        description: '소싱 검색으로 이동',
      },
      {
        key: '4',
        altKey: true,
        action: () => router.push('/history'),
        description: '분석 히스토리로 이동',
      },
      {
        key: '5',
        altKey: true,
        action: () => router.push('/settings'),
        description: '설정으로 이동',
      },
    ];

    return [...navigationShortcuts, ...(customShortcuts || [])];
  }, [router, customShortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const activeShortcuts = shortcuts();

      for (const shortcut of activeShortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return shortcuts();
}

export function useGlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Alt + number for navigation
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            router.push('/');
            break;
          case '2':
            event.preventDefault();
            router.push('/calculator');
            break;
          case '3':
            event.preventDefault();
            router.push('/sourcing');
            break;
          case '4':
            event.preventDefault();
            router.push('/history');
            break;
          case '5':
            event.preventDefault();
            router.push('/settings');
            break;
        }
      }

      // Ctrl/Cmd + K for search (placeholder)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // TODO: Could open a command palette here
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}

export const shortcutDescriptions = [
  { keys: 'Alt + 1', description: '대시보드로 이동' },
  { keys: 'Alt + 2', description: '마진 계산기로 이동' },
  { keys: 'Alt + 3', description: '소싱 검색으로 이동' },
  { keys: 'Alt + 4', description: '분석 히스토리로 이동' },
  { keys: 'Alt + 5', description: '설정으로 이동' },
  { keys: 'Ctrl/Cmd + K', description: '검색' },
];
