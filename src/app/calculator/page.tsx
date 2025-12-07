'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MarginCalculatorResponse } from '@/types';

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    purchasePrice: '',
    sellingPrice: '',
    shippingCost: '',
    coupangFeeRate: '10.8',
    adCostPerUnit: '',
    returnRate: '3',
    quantity: '1',
  });

  const [result, setResult] = useState<MarginCalculatorResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calculator/margin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice: Number(formData.purchasePrice),
          sellingPrice: Number(formData.sellingPrice),
          shippingCost: Number(formData.shippingCost) || 0,
          coupangFeeRate: Number(formData.coupangFeeRate),
          adCostPerUnit: Number(formData.adCostPerUnit) || 0,
          returnRate: Number(formData.returnRate),
          quantity: Number(formData.quantity),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계산 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            마진 계산기
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            쿠팡 판매 마진을 계산하고 최적 판매가를 확인하세요
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 입력 폼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              비용 입력
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  원가 (원) *
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  판매가 (원) *
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  배송비 (원)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="2500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    쿠팡 수수료율 (%)
                  </label>
                  <input
                    type="number"
                    name="coupangFeeRate"
                    value={formData.coupangFeeRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    반품률 (%)
                  </label>
                  <input
                    type="number"
                    name="returnRate"
                    value={formData.returnRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    단위당 광고비 (원)
                  </label>
                  <input
                    type="number"
                    name="adCostPerUnit"
                    value={formData.adCostPerUnit}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    판매 수량
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? '계산 중...' : '마진 계산하기'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* 결과 표시 */}
          {result && (
            <div className="space-y-4">
              {/* 단위당 수익 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  단위당 수익
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">매출</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(result.perUnit.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">쿠팡 수수료</span>
                    <span className="text-red-600">-{formatCurrency(result.perUnit.coupangFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">배송비</span>
                    <span className="text-red-600">-{formatCurrency(result.perUnit.shippingCost)}</span>
                  </div>
                  {result.perUnit.adCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">광고비</span>
                      <span className="text-red-600">-{formatCurrency(result.perUnit.adCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">반품 비용</span>
                    <span className="text-red-600">-{formatCurrency(result.perUnit.returnCost)}</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">순이익</span>
                    <span className={result.perUnit.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(result.perUnit.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">마진율</span>
                    <span className={`font-semibold ${result.perUnit.marginRate >= 20 ? 'text-green-600' : result.perUnit.marginRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {result.perUnit.marginRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 총계 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  총계 ({formData.quantity}개 판매 시)
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">총 매출</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(result.total.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">총 비용</span>
                    <span className="text-red-600">-{formatCurrency(result.total.totalCost)}</span>
                  </div>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-gray-100">총 순이익</span>
                    <span className={result.total.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(result.total.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 권장 판매가 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  목표 마진율별 권장 판매가
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">20% 마진 시</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.recommendedPrices.margin20 === Infinity
                        ? '계산 불가'
                        : formatCurrency(result.recommendedPrices.margin20)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">30% 마진 시</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.recommendedPrices.margin30 === Infinity
                        ? '계산 불가'
                        : formatCurrency(result.recommendedPrices.margin30)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">40% 마진 시</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.recommendedPrices.margin40 === Infinity
                        ? '계산 불가'
                        : formatCurrency(result.recommendedPrices.margin40)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
