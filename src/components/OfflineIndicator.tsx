'use client';

import { useOnlineStatus } from '@/hooks/useServiceWorker';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left duration-300">
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        </span>
        <span className="text-sm font-medium text-yellow-800">
          오프라인 모드
        </span>
      </div>
    </div>
  );
}
