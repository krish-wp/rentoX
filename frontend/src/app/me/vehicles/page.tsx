"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMyVehicles, deleteVehicle } from "@/services/vehicle.service";
import { updateVehicleAvailability } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getMyVehicles();
      setVehicles(data.vehicles);
    } catch {
      setError("Failed to load your vehicles. Make sure the backend supports GET /vehicles/mine.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchVehicles();
    };
    load();
  }, []);

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    if (processingId) return;
    setProcessingId(vehicle.id);
    setActionError("");
    try {
      await updateVehicleAvailability(vehicle.id, !vehicle.isAvailable);
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, isAvailable: !v.isAvailable } : v))
      );
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError?.response?.data?.message || "Failed to update availability.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (processingId) return;
    if (!confirm(`Delete "${vehicle.brand} ${vehicle.model}"? This cannot be undone.`)) return;
    setProcessingId(vehicle.id);
    setActionError("");
    try {
      await deleteVehicle(vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError?.response?.data?.message || "Failed to delete vehicle.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Vehicles</h1>
            <Link href="/vehicles/new">
              <Button>Add Vehicle</Button>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {actionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading your vehicles...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven&apos;t listed any vehicles yet.</p>
              <Link href="/vehicles/new">
                <Button>Add Your First Vehicle</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {vehicle.imageUrl && (
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full sm:w-32 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {vehicle.type} &middot; {vehicle.plateNumber}
                            </p>
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
                      <Link href={`/vehicles/${vehicle.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                      <Link href={`/me/vehicles/${vehicle.id}/edit`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === vehicle.id}
                        onClick={() => handleToggleAvailability(vehicle)}
                      >
                        {processingId === vehicle.id ? "..." : vehicle.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processingId === vehicle.id}
                        onClick={() => handleDelete(vehicle)}
                      >
                        {processingId === vehicle.id ? "..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
