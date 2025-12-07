'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      style={style}
    />
  );
}

// 카드 스켈레톤
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// 차트 스켈레톤
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <Skeleton className="h-4 w-1/4 mb-4" />
      <div className="h-[300px] flex items-end gap-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// 테이블 스켈레톤
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 p-4 last:border-0">
          <div className="flex gap-4">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 리스트 스켈레톤
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 키워드 분석 결과 스켈레톤
export function KeywordAnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* 테이블 */}
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}

// 대시보드 스켈레톤
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* 메인 차트 */}
      <ChartSkeleton className="h-[400px]" />

      {/* 하단 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <ListSkeleton items={5} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <TableSkeleton rows={5} columns={3} />
        </div>
      </div>
    </div>
  );
}

// 마진 계산기 스켈레톤
export function MarginCalculatorSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 입력 폼 */}
      <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-32 mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-lg mt-4" />
      </div>

      {/* 결과 */}
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// 소싱 검색 결과 스켈레톤
export function SourcingResultSkeleton() {
  return (
    <div className="space-y-4">
      {/* 검색 바 */}
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-lg" />
        <Skeleton className="h-12 w-32 rounded-lg" />
      </div>

      {/* 상품 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
