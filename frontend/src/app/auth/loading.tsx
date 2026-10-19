import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-background px-4" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border/60 bg-card p-6 shadow-card">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
