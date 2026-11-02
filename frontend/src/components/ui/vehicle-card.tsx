import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md cursor-pointer"
    >
      <Card className="h-full overflow-hidden border border-border transition-colors hover:border-primary/50 hover:shadow-card">
        <div className="relative h-48 overflow-hidden">
          <VehicleImage
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute -inset-0.5 rounded-md border border-primary/30 pointer-events-none" />
          {showAvailability && (
            <div className="absolute top-3 left-3 flex gap-1.5 rounded-md bg-background/90 px-2 py-1 backdrop-blur-md border border-border/60">
              <span
                className={`size-1.5 rounded-full ${vehicle.isAvailable ? "bg-success" : "bg-destructive"}`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium text-foreground">
                {vehicle.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-bold tabular-nums text-foreground shadow-sm backdrop-blur-sm border border-border/60">
            ₹{vehicle.pricePerDay}<span className="text-[10px] font-normal text-muted-foreground">/day</span>
          </div>
        </div>
        <CardContent className="space-y-2 p-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {vehicle.type}
                {vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {vehicle.location}
          </div>
          {showOwner && vehicle.owner && (
            <p className="text-[10px] text-muted-foreground">Listed by {vehicle.owner.userName}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
