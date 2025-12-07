'use client';

import Link from 'next/link';

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    href: '/',
    label: '트렌드 분석',
    description: 'AI 기반 트렌드 예측',
    icon: '📈',
    color: 'bg-blue-500',
  },
  {
    href: '/calculator',
    label: '마진 계산',
    description: '수익성 분석',
    icon: '💰',
    color: 'bg-green-500',
  },
  {
    href: '/sourcing',
    label: '소싱 검색',
    description: '해외 공급처 찾기',
    icon: '🌏',
    color: 'bg-orange-500',
  },
  {
    href: '/history',
    label: '분석 기록',
    description: '이전 분석 조회',
    icon: '📋',
    color: 'bg-purple-500',
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 실행</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-xl`}
            >
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                {action.label}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
