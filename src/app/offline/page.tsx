'use client';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          오프라인 상태입니다
        </h1>
        <p className="text-gray-600 mb-6">
          인터넷 연결이 끊어진 것 같습니다.
          일부 기능은 오프라인에서도 사용할 수 있지만,
          트렌드 분석과 같은 기능은 인터넷 연결이 필요합니다.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            다시 시도
          </button>
          <p className="text-sm text-gray-500">
            연결이 복구되면 자동으로 새로고침됩니다
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            오프라인에서 사용 가능한 기능
          </h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              저장된 분석 결과 조회
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              마진 계산기 사용
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              설정 변경
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              새로운 트렌드 분석
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              소싱처 검색
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
