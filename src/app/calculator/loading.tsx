import { Skeleton } from '@/components/ui/Skeleton';

export default function CalculatorLoading() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Skeleton className="h-10 w-48 mb-6" />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
