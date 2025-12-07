'use client';

import { useState } from 'react';
import {
  CATEGORY_GROUPS,
  RECOMMENDED_SOURCING_CATEGORIES,
  type CategoryInfo,
} from '@/lib/naver-categories';

interface CategorySelectorProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showRecommended, setShowRecommended] = useState(true);

  const handleToggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else if (selected.length < 5) {
      onChange([...selected, code]);
    }
  };

  const getSelectedNames = (): string[] => {
    const allCategories = CATEGORY_GROUPS.flatMap(g => [
      { code: g.code, name: g.name },
      ...g.children
    ]);
    return selected.map(code => {
      const cat = allCategories.find(c => c.code === code);
      return cat?.name || code;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          카테고리 선택 (최대 5개)
        </h3>
        <button
          type="button"
          onClick={() => setShowRecommended(!showRecommended)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showRecommended ? '전체 보기' : '추천 카테고리'}
        </button>
      </div>

      {/* 선택된 카테고리 표시 */}
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {getSelectedNames().map((name, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full"
            >
              {name}
              <button
                type="button"
                onClick={() => handleToggle(selected[idx])}
                className="hover:text-blue-900 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {showRecommended ? (
        /* 소싱 추천 카테고리 */
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            소싱에 적합한 추천 카테고리 (부피 작고 마진 좋은)
          </p>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_SOURCING_CATEGORIES.map((cat: CategoryInfo) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => handleToggle(cat.code)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selected.includes(cat.code)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* 전체 카테고리 그룹 */
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.code} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
              <button
                type="button"
                onClick={() => setExpandedGroup(expandedGroup === group.code ? null : group.code)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                <span className="flex items-center gap-2">
                  {group.name}
                  {selected.includes(group.code) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${expandedGroup === group.code ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedGroup === group.code && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-2">
                  {/* 대분류 선택 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleToggle(group.code)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      selected.includes(group.code)
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                    }`}
                  >
                    {group.name} 전체
                  </button>
                  {/* 세부 카테고리 */}
                  {group.children.map((child) => (
                    <button
                      key={child.code}
                      type="button"
                      onClick={() => handleToggle(child.code)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selected.includes(child.code)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
