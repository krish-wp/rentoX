"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { getMyVehicles, deleteVehicle, updateVehicleAvailability } from "@/services/vehicle.service";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
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
    setProcessingId(vehicle.id); setActionError("");
    try {
      await updateVehicleAvailability(vehicle.id);
      setVehicles((prev) => prev.map((v) => v.id === vehicle.id ? { ...v, isAvailable: !v.isAvailable } : v));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update availability."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || processingId) return;
    setProcessingId(deleteTarget.id); setActionError("");
    try {
      await deleteVehicle(deleteTarget.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete vehicle."));
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em]">My Vehicles</h1>
        <Link href="/vehicles/new"><Button>Add Vehicle</Button></Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

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
        <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" /><p>Loading your vehicles...</p></div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t listed any vehicles yet.</p>
          <Link href="/vehicles/new"><Button>Add Your First Vehicle</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-32 h-24 bg-muted rounded-xl overflow-hidden shrink-0">
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 pointer-events-none">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.type} · {vehicle.plateNumber}</p>
                      </div>
                      <Badge variant={vehicle.isAvailable ? "secondary" : "destructive"}>
                        {vehicle.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{vehicle.location}</p>
                    <p className="text-sm font-medium mt-1">₹{vehicle.pricePerDay}/day</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t">
                  <Link href={`/vehicles/${vehicle.id}`}><Button size="sm" variant="outline">View</Button></Link>
                  <Link href={`/me/vehicles/${vehicle.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                  <Button size="sm" variant="ghost" disabled={processingId === vehicle.id} onClick={() => handleToggleAvailability(vehicle)}>
                    {processingId === vehicle.id ? "..." : vehicle.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <div className="flex-1" />
                  <Button size="sm" variant="destructive" disabled={processingId === vehicle.id} onClick={() => setDeleteTarget(vehicle)}>
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
