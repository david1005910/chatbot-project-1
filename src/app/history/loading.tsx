import { Skeleton } from '@/components/ui/Skeleton';

export default function HistoryLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Skeleton className="h-10 w-48 mb-6" />

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
