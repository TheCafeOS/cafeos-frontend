import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="hidden md:block">
        <div className="divide-y divide-stone-200">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 items-center gap-6 px-6 py-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="h-4 w-48" />

              <Skeleton className="h-8 w-24 rounded-full" />

              <Skeleton className="h-8 w-20 rounded-full" />

              <Skeleton className="h-4 w-28" />

              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-stone-200 p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>

            <Skeleton className="mt-5 h-4 w-24" />
            <Skeleton className="mt-3 h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}