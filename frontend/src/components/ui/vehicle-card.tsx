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
    <Link href={`/vehicles/${vehicle.id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl">
      <Card className="group/card h-full overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <VehicleImage
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-500 group-hover/card:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {showAvailability && (
              <Badge variant={vehicle.isAvailable ? "success" : "destructive"} className="shadow-sm backdrop-blur-sm">
                <span
                  className={`size-1.5 rounded-full ${vehicle.isAvailable ? "bg-success" : "bg-destructive"}`}
                  aria-hidden="true"
                />
                {vehicle.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-3 right-3 rounded-full bg-background/95 px-3 py-1.5 text-sm font-semibold tabular-nums text-foreground shadow-md backdrop-blur-sm">
            ₹{vehicle.pricePerDay}
            <span className="text-xs font-normal text-muted-foreground">/day</span>
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-foreground transition-colors group-hover/card:text-primary">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {vehicle.type}
                {vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {vehicle.location}
          </p>
          {vehicle.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{vehicle.description}</p>
          )}
          {showOwner && (
            <p className="text-sm text-muted-foreground">Listed by {vehicle.owner?.userName || "Unknown"}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
