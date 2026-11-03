import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">Loading bookings…</span>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-24 w-32 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-24 rounded-[5px]" />
              </div>
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
