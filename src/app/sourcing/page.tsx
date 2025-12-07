'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SourcingSearchResponse } from '@/types';
import { CoupangSearch } from '@/components/sourcing/CoupangSearch';
import { ExportButton } from '@/components/ExportButton';
import { exportSourcingProducts } from '@/lib/supabase/export';

type TabType = 'china' | 'coupang';

export default function SourcingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('china');
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState<'1688' | 'taobao' | 'aliexpress'>('1688');
  const [sortBy, setSortBy] = useState<'price' | 'sales' | 'rating'>('sales');
  const [results, setResults] = useState<SourcingSearchResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sourcing/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          platform,
          sortBy,
          maxResults: 20,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number, currency: string = 'KRW') => {
    if (currency === 'CNY') {
      return `¥${value.toLocaleString()}`;
    } else if (currency === 'USD') {
      return `$${value.toLocaleString()}`;
    }
    return `${value.toLocaleString()}원`;
  };

  const getPlatformColor = (p: string) => {
    switch (p) {
      case '1688':
        return 'bg-orange-500';
      case 'taobao':
        return 'bg-red-500';
      case 'aliexpress':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            소싱처 검색
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            다양한 플랫폼에서 소싱 제품을 검색하세요
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('china')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'china'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              중국 소싱
            </span>
          </button>
          <button
            onClick={() => setActiveTab('coupang')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'coupang'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              쿠팡 검색
            </span>
          </button>
        </div>

        {/* Coupang Tab Content */}
        {activeTab === 'coupang' && (
          <CoupangSearch />
        )}

        {/* China Sourcing Tab Content */}
        {activeTab === 'china' && (
          <>
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                검색 키워드
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="예: 실리콘 주걱, 접이식 바구니"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  플랫폼
                </label>
                <div className="flex gap-2">
                  {(['1688', 'taobao', 'aliexpress'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        platform === p
                          ? `${getPlatformColor(p)} text-white`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {p === '1688' ? '1688' : p === 'taobao' ? '타오바오' : '알리익스프레스'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  정렬
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'sales' | 'rating')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="sales">판매량순</option>
                  <option value="price">가격순</option>
                  <option value="rating">평점순</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? '검색 중...' : '검색하기'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            {/* API 상태 알림 */}
            {results.notice && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{results.notice}</p>
                </div>
              </div>
            )}

            {/* API 소스 배지 */}
            {results.apiSource && (
              <div className="flex justify-end mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  results.apiSource === 'simulation'
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {results.apiSource === 'simulation' ? '시뮬레이션 데이터' : 'API 연동'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                검색 결과 ({results.totalResults.toLocaleString()}개)
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  환율: 1 {results.platform === 'aliexpress' ? 'USD' : 'CNY'} = {results.exchangeRate.toLocaleString()}원
                </span>
                <ExportButton
                  onExport={async () => {
                    const productsData = results.products.map(p => ({
                      id: p.id,
                      title: p.title,
                      titleKo: p.titleKo,
                      price: p.price,
                      originalPrice: p.originalPrice,
                      currency: p.currency,
                      moq: p.moq,
                      salesCount: p.salesCount,
                      rating: p.rating,
                      supplierRating: p.supplierRating,
                      shippingEstimate: p.shippingEstimate,
                      imageUrl: p.imageUrl,
                      productUrl: p.productUrl,
                      specifications: p.specifications,
                    }));
                    return exportSourcingProducts(
                      productsData as any,
                      results.platform as '1688' | 'taobao' | 'aliexpress',
                      results.keyword
                    );
                  }}
                  disabled={results.products.length === 0}
                  label="Supabase 저장"
                  successMessage="상품이 저장되었습니다"
                />
              </div>
            </div>

            {results.products.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  검색 결과가 없습니다. 이 기능은 현재 플레이스홀더입니다.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  실제 구현을 위해서는 해당 플랫폼의 API 연동이 필요합니다.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                        {product.titleKo || product.title}
                      </h3>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">원가</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(product.originalPrice, product.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">환산가</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">MOQ</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {product.moq}개
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">판매량</span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {product.salesCount.toLocaleString()}개
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <a
                          href={product.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded text-center transition-colors"
                        >
                          상품 보기
                        </a>
                        <Link
                          href="/calculator"
                          className="py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded transition-colors"
                        >
                          마진 계산
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            직접 검색하기
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.open(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keyword || '생활용품')}`, '_blank')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              1688에서 검색
            </button>
            <button
              onClick={() => window.open(`https://s.taobao.com/search?q=${encodeURIComponent(keyword || '生活用品')}`, '_blank')}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              타오바오에서 검색
            </button>
            <button
              onClick={() => window.open(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(keyword || 'household')}`, '_blank')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              알리익스프레스에서 검색
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
