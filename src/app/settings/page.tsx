'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { UserSettings } from '@/types';
import { RECOMMENDED_SOURCING_CATEGORIES, CATEGORY_GROUPS, type CategoryInfo } from '@/lib/naver-categories';

const defaultSettings: UserSettings = {
  defaultCategory: ['50000449'], // 생활잡화
  defaultPeriod: { months: 12 },
  excludeClothing: true,
  maxVolume: '택배 가능 크기',
  targetPlatform: '쿠팡',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { getSettings } = await import('@/lib/storage');
        const savedSettings = await getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const { saveSettings } = await import('@/lib/storage');
      await saveSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleCategoryToggle = (code: string) => {
    if (settings.defaultCategory.includes(code)) {
      setSettings({
        ...settings,
        defaultCategory: settings.defaultCategory.filter((c) => c !== code),
      });
    } else if (settings.defaultCategory.length < 3) {
      setSettings({
        ...settings,
        defaultCategory: [...settings.defaultCategory, code],
      });
    }
  };

  const handleReset = () => {
    if (confirm('기본 설정으로 초기화하시겠습니까?')) {
      setSettings(defaultSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            설정
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            분석 기본 설정을 관리하세요
          </p>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Default Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              기본 카테고리
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              분석 시 기본으로 선택될 카테고리를 설정하세요 (최대 3개)
            </p>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_SOURCING_CATEGORIES.map((cat: CategoryInfo) => (
                <button
                  key={cat.code}
                  onClick={() => handleCategoryToggle(cat.code)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.defaultCategory.includes(cat.code)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Default Period */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              기본 분석 기간
            </h2>
            <select
              value={settings.defaultPeriod.months}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultPeriod: { months: Number(e.target.value) },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={3}>최근 3개월</option>
              <option value={6}>최근 6개월</option>
              <option value={12}>최근 12개월</option>
              <option value={24}>최근 24개월</option>
              <option value={36}>최근 36개월</option>
            </select>
          </div>

          {/* Analysis Criteria */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              분석 기준
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.excludeClothing}
                  onChange={(e) =>
                    setSettings({ ...settings, excludeClothing: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  의류 카테고리 제외
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  최대 부피 기준
                </label>
                <select
                  value={settings.maxVolume}
                  onChange={(e) =>
                    setSettings({ ...settings, maxVolume: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="소형 (30cm 이하)">소형 (30cm 이하)</option>
                  <option value="택배 가능 크기">택배 가능 크기</option>
                  <option value="대형 포함">대형 포함</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  타겟 플랫폼
                </label>
                <select
                  value={settings.targetPlatform}
                  onChange={(e) =>
                    setSettings({ ...settings, targetPlatform: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="쿠팡">쿠팡</option>
                  <option value="스마트스토어">스마트스토어</option>
                  <option value="11번가">11번가</option>
                  <option value="G마켓/옥션">G마켓/옥션</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {isSaved ? '저장됨!' : '설정 저장'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
