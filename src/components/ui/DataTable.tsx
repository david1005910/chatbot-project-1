'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = '데이터가 없습니다',
  isLoading = false,
  onRowClick,
  className,
  striped = true,
  hoverable = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const getValue = (row: T, key: string): unknown => {
    return key.split('.').reduce((obj: unknown, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, row);
  };

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 border-b border-gray-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 border-b border-gray-100 flex items-center px-4 gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  className={cn(
                    'border-b border-gray-100 transition-colors',
                    striped && index % 2 === 1 && 'bg-gray-50/50',
                    hoverable && 'hover:bg-blue-50/50',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {columns.map((column) => {
                    const value = getValue(row, String(column.key));
                    return (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-700',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(value, row, index)
                          : String(value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
