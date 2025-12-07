import { Skeleton } from '@/components/ui/Skeleton';

export default function SourcingLoading() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Skeleton className="h-10 w-48 mb-6" />

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <Skeleton className="h-40 w-full mb-4 rounded-lg" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
