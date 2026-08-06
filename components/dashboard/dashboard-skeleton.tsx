import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>

            <Skeleton className="mt-5 h-8 w-20" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>
        ))}
      </section>

      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="divide-y divide-stone-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-5"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>

              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-4 w-20" />
                <Skeleton className="ml-auto h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}