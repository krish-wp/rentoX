import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="w-full max-w-[400px] space-y-6">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-56" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
