"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, X, Search, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { VehicleGridSkeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVehicles } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/types/vehicle";

const INITIAL_LIMIT = 10;

function VehiclesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: INITIAL_LIMIT, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [type, setType] = useState(searchParams.get("type") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const loadVehicles = useCallback(async (page: number, overrides?: { type?: string; location?: string; minPrice?: string; maxPrice?: string; q?: string; sort?: string }) => {
    const t = overrides?.type ?? type;
    const l = overrides?.location ?? location;
    const mp = overrides?.minPrice ?? minPrice;
    const xp = overrides?.maxPrice ?? maxPrice;
    const search = overrides?.q ?? q;
    const sortBy = overrides?.sort ?? sort;

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
        q: search || undefined,
        sort: (sortBy as "newest" | "price_asc" | "price_desc") || "newest",
      });
      setVehicles(data.vehicles);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load vehicles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [type, location, minPrice, maxPrice, q, sort]);

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
          q: searchParams.get("q") || undefined,
          sort: (searchParams.get("sort") as "newest" | "price_asc" | "price_desc") || "newest",
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
    if (q) params.set("q", q);
    if (sort && sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/vehicles?${qs}` : "/vehicles", { scroll: false });
    loadVehicles(1);
  };

  const handleClear = () => {
    applyFilters({ type: "", location: "", minPrice: "", maxPrice: "", q: "", sort: "newest" });
  };

  const applyFilters = (next: { type: string; location: string; minPrice: string; maxPrice: string; q: string; sort: string }) => {
    setType(next.type); setLocation(next.location); setMinPrice(next.minPrice); setMaxPrice(next.maxPrice); setQ(next.q); setSort(next.sort);
    const params = new URLSearchParams();
    if (next.type) params.set("type", next.type);
    if (next.location) params.set("location", next.location);
    if (next.minPrice) params.set("minPrice", next.minPrice);
    if (next.maxPrice) params.set("maxPrice", next.maxPrice);
    if (next.q) params.set("q", next.q);
    if (next.sort !== "newest") params.set("sort", next.sort);
    const qs = params.toString();
    router.push(qs ? `/vehicles?${qs}` : "/vehicles", { scroll: false });
    loadVehicles(1, next);
  };

  const removeFilter = (key: "type" | "location" | "minPrice" | "maxPrice" | "q") => {
    applyFilters({
      type: key === "type" ? "" : type,
      location: key === "location" ? "" : location,
      minPrice: key === "minPrice" ? "" : minPrice,
      maxPrice: key === "maxPrice" ? "" : maxPrice,
      q: key === "q" ? "" : q,
      sort,
    });
  };

  const activeChips: { key: "type" | "location" | "minPrice" | "maxPrice" | "q"; label: string }[] = [];
  if (q) activeChips.push({ key: "q", label: `"${q}"` });
  if (type) activeChips.push({ key: "type", label: type });
  if (location) activeChips.push({ key: "location", label: location });
  if (minPrice) activeChips.push({ key: "minPrice", label: `≥ ₹${minPrice}` });
  if (maxPrice) activeChips.push({ key: "maxPrice", label: `≤ ₹${maxPrice}` });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Browse Vehicles</h1>
          {!isLoading && !error && (
            <p className="mt-1 text-sm text-muted-foreground tabular-nums" role="status" aria-live="polite">
              {pagination.total} vehicle{pagination.total === 1 ? "" : "s"} found
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {activeChips.length > 0 && (
            <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5">{activeChips.length}</Badge>
          )}
        </Button>
      </div>

      {/* Type quick chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyFilters({ type: "", location, minPrice, maxPrice, q, sort })}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${!type ? "border-primary/40 bg-primary/10 font-medium text-primary" : "border-border/70 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
        >
          All
        </button>
        {VEHICLE_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => applyFilters({ type: type === t ? "" : t, location, minPrice, maxPrice, q, sort })}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${type === t ? "border-primary/40 bg-primary/10 font-medium text-primary" : "border-border/70 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className={`mb-8 rounded-xl border border-border/60 bg-card p-5 shadow-card lg:block ${filtersOpen ? "block" : "hidden"}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" type="search" placeholder="Brand, model or keyword" value={q} onChange={(e) => setQ(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label id="type-label">Type</Label>
            <Select value={type || null} onValueChange={(v) => setType((v as string) ?? "")}>
              <SelectTrigger aria-labelledby="type-label" className="h-11 w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {VEHICLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label id="location-label">Location</Label>
            <Select value={location || null} onValueChange={(v) => setLocation((v as string) ?? "")}>
              <SelectTrigger aria-labelledby="location-label" className="h-11 w-full">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {SERVICEABLE_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price (₹)</Label>
            <Input id="minPrice" type="number" min={0} max={100000} step={50} placeholder="100" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price (₹)</Label>
            <Input id="maxPrice" type="number" min={0} max={100000} step={50} placeholder="100000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label id="sort-label">Sort By</Label>
            <Select value={sort} onValueChange={(v) => setSort((v as string) || "newest")}>
              <SelectTrigger aria-labelledby="sort-label" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
            <Button type="submit" className="flex-1 sm:flex-none sm:px-8">
              <Search aria-hidden="true" /> Search
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </form>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.key)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X className="size-3 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <div className="mb-6"><Alert variant="error">{error}</Alert></div>}

      {isLoading ? (
        <div role="status" aria-live="polite">
          <span className="sr-only">Loading vehicles…</span>
          <VehicleGridSkeleton count={6} />
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles found"
          description="Try adjusting or clearing your filters to see more results."
          action={<Button variant="outline" onClick={handleClear}>Clear Filters</Button>}
        />
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {vehicles.map((v) => (
              <motion.div
                key={v.id}
                variants={{
                  hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <VehicleCard vehicle={v} showAvailability showOwner />
              </motion.div>
            ))}
          </motion.div>

          {pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" disabled={pagination.page <= 1} onClick={() => loadVehicles(pagination.page - 1)}>Previous</Button>
              <span className="flex items-center px-2 text-sm text-muted-foreground tabular-nums">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => loadVehicles(pagination.page + 1)}>Next</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
          <span className="sr-only">Loading vehicles…</span>
          <VehicleGridSkeleton count={6} />
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  );
}
