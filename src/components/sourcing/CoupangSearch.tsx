'use client';

import { useState } from 'react';
import { formatKRW, formatNumber } from '@/lib/utils';
import { ExportButton } from '@/components/ExportButton';
import { exportCoupangProducts } from '@/lib/supabase/export';

interface CoupangProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  isRocketDelivery: boolean;
  isRocketWow: boolean;
  isFreeShipping: boolean;
  imageUrl: string;
  productUrl: string;
  seller: string;
  category: string;
}

interface SearchResult {
  keyword: string;
  totalCount: number;
  products: CoupangProduct[];
  priceStats: {
    min: number;
    max: number;
    avg: number;
  };
  rocketDeliveryRatio: number;
  apiSource?: string;
  notice?: string;
}

type SortOption = 'popular' | 'recent' | 'price_low' | 'price_high' | 'review';

export function CoupangSearch() {
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!keyword.trim()) {
      setError('검색어를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupang/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), sortBy }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '검색 실패');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = async (newSortBy: SortOption) => {
    setSortBy(newSortBy);
    if (result) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/coupang/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: keyword.trim(), sortBy: newSortBy }),
        });
        const data = await response.json();
        if (data.success) {
          setResult(data.data);
        }
      } catch {
        // 정렬 실패 시 무시
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="쿠팡에서 검색할 상품명을 입력하세요"
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                검색 중
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                쿠팡 검색
              </>
            )}
          </button>
        </div>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {result && (
        <div className="space-y-6">
          {/* API 상태 알림 */}
          {result.notice && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{result.notice}</p>
                  {result.apiSource === 'simulation' && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      Coupang Partners API 키를 발급받아 .env.local 파일에 COUPANG_ACCESS_KEY와 COUPANG_SECRET_KEY를 설정하세요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* API 소스 배지 */}
          {result.apiSource && (
            <div className="flex justify-end">
              <span className={`text-xs px-2 py-1 rounded ${
                result.apiSource === 'coupang_partners'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {result.apiSource === 'coupang_partners' ? 'Coupang Partners API' : '시뮬레이션 데이터'}
              </span>
            </div>
          )}

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">검색 결과</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(result.totalCount)}개
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">평균 가격</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatKRW(result.priceStats.avg)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">가격 범위</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatKRW(result.priceStats.min)} ~ {formatKRW(result.priceStats.max)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">로켓배송 비율</p>
              <p className="text-2xl font-bold text-red-600">
                {result.rocketDeliveryRatio}%
              </p>
            </div>
          </div>

          {/* 정렬 옵션 및 내보내기 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &quot;{result.keyword}&quot; 검색 결과
            </p>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="popular">인기순</option>
                <option value="recent">최신순</option>
                <option value="price_low">가격 낮은순</option>
                <option value="price_high">가격 높은순</option>
                <option value="review">리뷰 많은순</option>
              </select>
              <ExportButton
                onExport={async () => {
                  return exportCoupangProducts(result.products, result.keyword);
                }}
                disabled={result.products.length === 0}
                label="Supabase 저장"
                successMessage="상품이 저장되었습니다"
              />
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* 상품 이미지 영역 */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {/* 배지 */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {product.isRocketWow && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
                        로켓와우
                      </span>
                    )}
                    {product.isRocketDelivery && !product.isRocketWow && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                        로켓배송
                      </span>
                    )}
                    {product.discountRate > 0 && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
                        {product.discountRate}%
                      </span>
                    )}
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                    {product.name}
                  </h3>

                  {/* 가격 */}
                  <div className="mb-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatKRW(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {formatKRW(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* 평점 & 리뷰 */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({formatNumber(product.reviewCount)}개 리뷰)
                    </span>
                  </div>

                  {/* 판매자 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    판매자: {product.seller}
                  </p>

                  {/* 배송 정보 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.isFreeShipping && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        무료배송
                      </span>
                    )}
                  </div>

                  {/* 버튼 */}
                  <a
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-red-600 hover:bg-red-700 text-white text-center font-medium rounded-lg transition-colors"
                  >
                    쿠팡에서 보기
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 초기 상태 */}
      {!result && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            쿠팡 상품 검색
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            검색어를 입력하여 쿠팡 상품을 검색해보세요
          </p>
        </div>
      )}
    </div>
  );
}
