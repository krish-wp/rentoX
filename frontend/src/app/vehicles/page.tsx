"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicles } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/types/vehicle";

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const fetchVehicles = async (page = 1) => {
    setIsLoading(true);
    setError("");

    const parsedMin = minPrice ? Number(minPrice) : undefined;
    const parsedMax = maxPrice ? Number(maxPrice) : undefined;

    if (minPrice && (parsedMin === undefined || isNaN(parsedMin) || parsedMin < 0)) {
      setError("Min price must be a valid positive number.");
      setIsLoading(false);
      return;
    }
    if (maxPrice && (parsedMax === undefined || isNaN(parsedMax) || parsedMax < 0)) {
      setError("Max price must be a valid positive number.");
      setIsLoading(false);
      return;
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setError("Min price cannot exceed max price.");
      setIsLoading(false);
      return;
    }

    try {
      const data = await getVehicles({
        page,
        limit: 10,
        type: type || undefined,
        location: location || undefined,
        minPrice: parsedMin,
        maxPrice: parsedMax,
      });
      setVehicles(data.vehicles);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const parsedMin = minPrice ? Number(minPrice) : undefined;
        const parsedMax = maxPrice ? Number(maxPrice) : undefined;
        const data = await getVehicles({
          page: 1,
          limit: 10,
          type: type || undefined,
          location: location || undefined,
          minPrice: parsedMin,
          maxPrice: parsedMax,
        });
        if (!cancelled) {
          setVehicles(data.vehicles);
          setPagination(data.pagination);
        }
      } catch {
        if (!cancelled) setError("Failed to load vehicles. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (location) params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/vehicles?${params.toString()}`);
    fetchVehicles(1);
  };

  const handleClear = () => {
    setType("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/vehicles");
    // Refetch without filters since useEffect won't re-run
    getVehicles({ page: 1, limit: 10 }).then((data) => {
      setVehicles(data.vehicles);
      setPagination(data.pagination);
    }).catch(() => {
      setError("Failed to load vehicles.");
    });
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Browse Vehicles</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
            >
              <option value="">All Types</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <select
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
            >
              <option value="">All Cities</option>
              {SERVICEABLE_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="minPrice">Min Price (₹)</Label>
            <Input
              id="minPrice"
              type="number"
              min={0}
              max={100000}
              step={50}
              placeholder="100"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxPrice">Max Price (₹)</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              max={100000}
              step={50}
              placeholder="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">Search</Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No vehicles found matching your filters.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {vehicle.imageUrl && (
                    <img
                      src={vehicle.imageUrl}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-48 object-cover rounded-t-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        vehicle.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {vehicle.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
                        <p className="text-sm text-gray-500">{vehicle.type} &middot; {vehicle.plateNumber}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">₹{vehicle.pricePerDay}/day</span>
                    </div>
                    <p className="text-sm text-gray-600">{vehicle.location}</p>
                    {vehicle.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{vehicle.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Listed by {vehicle.owner?.userName || "Unknown"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchVehicles(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchVehicles(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function VehiclesPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
            <VehiclesContent />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}
