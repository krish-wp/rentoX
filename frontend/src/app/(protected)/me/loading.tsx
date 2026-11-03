import { Skeleton } from "@/components/ui/skeleton";

export default function MeLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">Loading profile…</span>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2 pb-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
