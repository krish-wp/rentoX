"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { VehicleImage } from "@/components/ui/vehicle-image";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Plus } from "lucide-react";
import { toast } from "sonner";
import { getMyVehicles, deleteVehicle, updateVehicleAvailability } from "@/services/vehicle.service";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyVehicles()
      .then((data) => { if (!cancelled) setVehicles(data.vehicles); })
      .catch(() => { if (!cancelled) setError("Failed to load your vehicles."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    if (processingId) return;
    setProcessingId(vehicle.id);
    try {
      await updateVehicleAvailability(vehicle.id);
      setVehicles((prev) => prev.map((v) => v.id === vehicle.id ? { ...v, isAvailable: !v.isAvailable } : v));
      toast.success(vehicle.isAvailable ? "Vehicle marked unavailable" : "Vehicle marked available");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update availability."));
    } finally { setProcessingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || processingId) return;
    setProcessingId(deleteTarget.id);
    try {
      await deleteVehicle(deleteTarget.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      toast.success("Vehicle deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete vehicle."));
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Garage</p>
          <h1 className="mt-3">My fleet</h1>
        </div>
        <Link href="/vehicles/new"><Button><Plus aria-hidden="true" /> Add vehicle</Button></Link>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{deleteTarget?.brand} {deleteTarget?.model}&quot;? This cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!!processingId} onClick={confirmDelete}>
              {processingId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-4" role="status" aria-live="polite">
          <span className="sr-only">Loading your vehicles…</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border/60 bg-card p-5">
              <Skeleton className="h-24 w-full shrink-0 rounded-xl sm:w-32" />
              <div className="min-w-0 flex-1 space-y-2.5">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="You haven't listed any vehicles yet"
          description="List your first vehicle to start earning from it."
          action={<Link href="/vehicles/new"><Button>Add Your First Vehicle</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-32">
                    <VehicleImage
                      src={vehicle.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      sizes="128px"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-semibold tracking-[-0.02em]">{vehicle.brand} {vehicle.model}</h3>
                        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{vehicle.type} · {vehicle.plateNumber}</p>
                      </div>
                      <Badge variant={vehicle.isAvailable ? "success" : "destructive"} className="shrink-0">
                        {vehicle.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{vehicle.location}</p>
                    <p className="mt-1.5 font-mono text-sm font-semibold">₹{vehicle.pricePerDay.toLocaleString("en-IN")}<span className="ml-1 text-xs font-normal text-muted-foreground">/day</span></p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Link href={`/vehicles/${vehicle.id}`}><Button size="sm" variant="outline">View</Button></Link>
                  <Link href={`/me/vehicles/${vehicle.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                  <Button size="sm" variant="ghost" disabled={processingId === vehicle.id} onClick={() => handleToggleAvailability(vehicle)}>
                    {processingId === vehicle.id ? "..." : vehicle.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <div className="flex-1" />
                  <Button size="sm" variant="destructive-outline" disabled={processingId === vehicle.id} onClick={() => setDeleteTarget(vehicle)}>
                    {processingId === vehicle.id ? "..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
