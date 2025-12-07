import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
