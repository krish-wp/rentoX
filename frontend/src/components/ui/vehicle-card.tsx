import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  showAvailability?: boolean;
  showOwner?: boolean;
}

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      </div>
    </div>
  );
}

export function VehicleCard({ vehicle, showAvailability = false, showOwner = false }: VehicleCardProps) {
  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        {vehicle.imageUrl ? (
          <ImageWithFallback src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} />
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-t-xl flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        )}
        <CardContent className="space-y-2">
          {showAvailability && (
            <div className="flex justify-between items-start">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                vehicle.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {vehicle.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-sm text-gray-500">{vehicle.type}{vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}</p>
            </div>
            <span className="text-lg font-bold text-primary">₹{vehicle.pricePerDay}/day</span>
          </div>
          <p className="text-sm text-gray-600">{vehicle.location}</p>
          {vehicle.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{vehicle.description}</p>
          )}
          {showOwner && (
            <p className="text-sm text-gray-500">Listed by {vehicle.owner?.userName || "Unknown"}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
