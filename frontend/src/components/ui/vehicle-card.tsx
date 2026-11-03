import Link from "next/link";
import { Card } from "@/components/ui/card";
import { VehicleImage } from "@/components/ui/vehicle-image";
import { MapPin } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  showAvailability?: boolean;
  showOwner?: boolean;
}

export function VehicleCard({ vehicle, showAvailability = false, showOwner = false }: VehicleCardProps) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Card className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-foreground/15 group-hover:shadow-lift">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <VehicleImage
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {showAvailability && (
            <span
              className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-md ${
                vehicle.isAvailable
                  ? "border-success/30 bg-background/85 text-success"
                  : "border-destructive/30 bg-background/85 text-destructive"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${vehicle.isAvailable ? "bg-success" : "bg-destructive"}`}
                aria-hidden="true"
              />
              {vehicle.isAvailable ? "Available" : "Unavailable"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[0.9375rem] font-semibold tracking-[-0.02em] text-foreground">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {vehicle.type}
              {vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}
            </p>
          </div>

          {showOwner && vehicle.owner && (
            <p className="text-xs text-muted-foreground">Listed by {vehicle.owner.userName}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{vehicle.location}</span>
            </span>
            <span className="shrink-0 font-mono text-[0.9375rem] font-semibold tracking-tight text-foreground">
              ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
              <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">/day</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
