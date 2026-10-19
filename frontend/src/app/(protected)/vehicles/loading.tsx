import { VehicleGridSkeleton } from "@/components/ui/skeleton";

export default function VehiclesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
      <span className="sr-only">Loading vehicles…</span>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-md bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>
      <div className="mb-8 h-11 w-full rounded-xl border border-border/60 bg-card" />
      <VehicleGridSkeleton count={6} />
    </div>
  );
}
