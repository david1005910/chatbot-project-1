'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteButton } from '@/components/FavoriteButton';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favorites, isLoaded, removeFavorite, updateNotes } = useFavorites();

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">즐겨찾기</h1>
        <p className="text-gray-600 mt-1">
          저장한 키워드를 관리하고 빠르게 접근하세요
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            즐겨찾기가 비어있습니다
          </h2>
          <p className="text-gray-600 mb-6">
            관심있는 키워드를 즐겨찾기에 추가해보세요
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            트렌드 분석 시작하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {favorites.length}개의 키워드
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.keyword}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/analysis/${encodeURIComponent(favorite.keyword)}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {favorite.keyword}
                  </Link>
                  <FavoriteButton keyword={favorite.keyword} size="sm" />
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  추가일: {formatDate(favorite.addedAt)}
                </p>

                {favorite.notes ? (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {favorite.notes}
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      const notes = prompt('메모를 입력하세요:');
                      if (notes) updateNotes(favorite.keyword, notes);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 메모 추가
                  </button>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <Link
                    href={`/analysis/${encodeURIComponent(favorite.keyword)}`}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg text-center transition-colors"
                  >
                    상세 분석
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('즐겨찾기에서 삭제하시겠습니까?')) {
                        removeFavorite(favorite.keyword);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
