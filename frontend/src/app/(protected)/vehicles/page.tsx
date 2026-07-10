"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { getVehicles } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/types/vehicle";

const INITIAL_LIMIT = 10;

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: INITIAL_LIMIT, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const loadVehicles = useCallback(async (page: number, overrides?: { type?: string; location?: string; minPrice?: string; maxPrice?: string }) => {
    const t = overrides?.type ?? type;
    const l = overrides?.location ?? location;
    const mp = overrides?.minPrice ?? minPrice;
    const xp = overrides?.maxPrice ?? maxPrice;

    const parsedMin = mp ? Number(mp) : undefined;
    const parsedMax = xp ? Number(xp) : undefined;

    if (mp && (parsedMin === undefined || isNaN(parsedMin) || parsedMin < 0)) {
      setError("Min price must be a valid positive number.");
      return;
    }
    if (xp && (parsedMax === undefined || isNaN(parsedMax) || parsedMax < 0)) {
      setError("Max price must be a valid positive number.");
      return;
    }
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setError("Min price cannot exceed max price.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const data = await getVehicles({
        page, limit: INITIAL_LIMIT,
        type: t || undefined, location: l || undefined,
        minPrice: parsedMin, maxPrice: parsedMax,
      });
      setVehicles(data.vehicles);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [type, location, minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        const data = await getVehicles({
          page: 1,
          limit: INITIAL_LIMIT,
          type: searchParams.get("type") || undefined,
          location: searchParams.get("location") || undefined,
          minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
          maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        });
        if (!cancelled) { setVehicles(data.vehicles); setPagination(data.pagination); }
      } catch {
        if (!cancelled) setError("Failed to load vehicles. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchInitial();
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
    const qs = params.toString();
    router.push(qs ? `/vehicles?${qs}` : "/vehicles", { scroll: false });
    loadVehicles(1);
  };

  const handleClear = () => {
    setType(""); setLocation(""); setMinPrice(""); setMaxPrice("");
    router.push("/vehicles", { scroll: false });
    loadVehicles(1, { type: "", location: "", minPrice: "", maxPrice: "" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Vehicles</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label htmlFor="type">Type</Label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm">
              <option value="">All Types</option>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm">
              <option value="">All Cities</option>
              {SERVICEABLE_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="minPrice">Min Price (₹)</Label>
            <Input id="minPrice" type="number" min={0} max={100000} step={50} placeholder="100" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="maxPrice">Max Price (₹)</Label>
            <Input id="maxPrice" type="number" min={0} max={100000} step={50} placeholder="100000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">Search</Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </form>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No vehicles found matching your filters.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} showAvailability showOwner />)}
          </div>

          {pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => loadVehicles(pagination.page - 1)}>Previous</Button>
              <span className="flex items-center px-4 text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => loadVehicles(pagination.page + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return <Suspense fallback={<div className="text-center py-12 text-gray-500" role="status" aria-live="polite">Loading...</div>}><VehiclesContent /></Suspense>;
}
