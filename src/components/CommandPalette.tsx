'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'home',
      label: '대시보드',
      description: '트렌드 분석 대시보드로 이동',
      icon: '📊',
      action: () => router.push('/'),
      keywords: ['dashboard', 'home', '홈', '메인'],
    },
    {
      id: 'calculator',
      label: '마진 계산기',
      description: '수익성 분석 계산기',
      icon: '🧮',
      action: () => router.push('/calculator'),
      keywords: ['margin', 'profit', '수익', '마진'],
    },
    {
      id: 'sourcing',
      label: '소싱 검색',
      description: '해외 소싱처 검색',
      icon: '🔍',
      action: () => router.push('/sourcing'),
      keywords: ['search', 'alibaba', '1688', '알리바바'],
    },
    {
      id: 'history',
      label: '분석 히스토리',
      description: '이전 분석 결과 조회',
      icon: '📜',
      action: () => router.push('/history'),
      keywords: ['history', 'past', '기록', '이전'],
    },
    {
      id: 'settings',
      label: '설정',
      description: '앱 설정 관리',
      icon: '⚙️',
      action: () => router.push('/settings'),
      keywords: ['settings', 'config', '환경설정'],
    },
    {
      id: 'new-analysis',
      label: '새 분석 시작',
      description: '새로운 트렌드 분석 시작',
      icon: '✨',
      action: () => {
        router.push('/');
        // Could trigger analysis start
      },
      keywords: ['new', 'start', 'analyze', '새로운', '시작'],
    },
    {
      id: 'export',
      label: '데이터 내보내기',
      description: '분석 결과 CSV 내보내기',
      icon: '📥',
      action: () => {
        // Trigger export
        window.dispatchEvent(new CustomEvent('export-data'));
      },
      keywords: ['export', 'download', 'csv', '내보내기', '다운로드'],
    },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) => {
        const searchText = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchText) ||
          cmd.description?.toLowerCase().includes(searchText) ||
          cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchText))
        );
      })
    : commands;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open command palette with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
        }}
      />

      {/* Command Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="명령어 검색..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    selectedIndex === index
                      ? 'bg-blue-50 text-blue-900'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <span className="text-xl">{cmd.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {selectedIndex === index && (
                    <kbd className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                      Enter
                    </kbd>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                검색 결과가 없습니다
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑↓</kbd>
              이동
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Enter</kbd>
              선택
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">ESC</kbd>
              닫기
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
