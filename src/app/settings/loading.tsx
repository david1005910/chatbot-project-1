import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Skeleton className="h-10 w-24 mb-6" />

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
