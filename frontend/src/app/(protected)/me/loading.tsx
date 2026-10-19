import { Skeleton } from "@/components/ui/skeleton";

export default function MeLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">Loading profile…</span>
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mt-8 space-y-6">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Skeleton className="h-20 w-full rounded-none" />
          <div className="flex items-end gap-4 p-6">
            <Skeleton className="size-20 rounded-2xl" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
