'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const pages = useMemo(() => {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const totalNumbers = siblingCount * 2 + 3;
    const totalButtons = totalNumbers + 2;

    if (totalPages <= totalButtons) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [1, 'dots', ...middleRange, 'dots', totalPages];
  }, [currentPage, totalPages, siblingCount]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-lg text-gray-500 transition-colors',
            'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
          )}
          aria-label="첫 페이지"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-lg text-gray-500 transition-colors',
          'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        aria-label="이전 페이지"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((page, index) =>
        page === 'dots' ? (
          <span
            key={`dots-${index}`}
            className="px-2 text-gray-400"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={cn(
              'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-lg text-gray-500 transition-colors',
          'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
        aria-label="다음 페이지"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {showFirstLast && (
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-lg text-gray-500 transition-colors',
            'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
          )}
          aria-label="마지막 페이지"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </nav>
  );
}

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'text-gray-600 hover:bg-gray-100',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        이전
      </button>
      <span className="text-sm text-gray-500">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          'text-gray-600 hover:bg-gray-100',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
      >
        다음
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className,
}: PageSizeSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-500">페이지당</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}개
          </option>
        ))}
      </select>
    </div>
  );
}
