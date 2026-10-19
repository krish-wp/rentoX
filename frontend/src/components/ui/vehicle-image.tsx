"use client";

import { useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Fill the parent container instead of using a fixed height */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function VehicleImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  const placeholder = (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-muted via-muted to-accent/50",
        className,
      )}
      aria-hidden="true"
    >
      <Car className="size-12 text-muted-foreground/40" strokeWidth={1} />
    </div>
  );

  if (!showImage) return placeholder;

  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={fill ? (sizes ?? "(max-width: 640px) 100vw, 33vw") : sizes}
        priority={priority}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
