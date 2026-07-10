"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getMyVehicles, deleteVehicle, updateVehicleAvailability } from "@/services/vehicle.service";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDeleteVehicle, setConfirmDeleteVehicle] = useState<Vehicle | null>(null);

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

  const handleDelete = (vehicle: Vehicle) => {
    if (processingId) return;
    setConfirmDeleteVehicle(vehicle);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteVehicle || processingId) return;
    setProcessingId(confirmDeleteVehicle.id); setActionError("");
    const vehicleToDelete = confirmDeleteVehicle;
    setConfirmDeleteVehicle(null);
    try {
      await deleteVehicle(vehicleToDelete.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete vehicle."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessingId(null); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Vehicles</h1>
        <Link href="/vehicles/new"><Button>Add Vehicle</Button></Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      {confirmDeleteVehicle && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alertdialog" aria-label="Confirm delete">
          <p className="text-sm text-yellow-800 mb-3">Delete &quot;{confirmDeleteVehicle.brand} {confirmDeleteVehicle.model}&quot;? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteVehicle(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading your vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven&apos;t listed any vehicles yet.</p>
          <Link href="/vehicles/new"><Button>Add Your First Vehicle</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-gray-500">{vehicle.type} · {vehicle.plateNumber}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${vehicle.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {vehicle.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{vehicle.location}</p>
                    <p className="text-sm font-medium mt-1">₹{vehicle.pricePerDay}/day</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Link href={`/vehicles/${vehicle.id}`}><Button size="sm" variant="outline">View</Button></Link>
                  <Link href={`/me/vehicles/${vehicle.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                  <Button size="sm" variant="outline" disabled={processingId === vehicle.id} onClick={() => handleToggleAvailability(vehicle)}>
                    {processingId === vehicle.id ? "..." : vehicle.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={processingId === vehicle.id} onClick={() => handleDelete(vehicle)}>
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
