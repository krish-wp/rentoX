"use client";

import { useState } from "react";
import Image from "next/image";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Fill the nearest positioned ancestor instead of using intrinsic dimensions */
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

  if (!showImage) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted",
          fill && "absolute inset-0",
          className,
        )}
        aria-hidden="true"
      >
        <Car className="size-10 text-muted-foreground/35" strokeWidth={1} />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 100vw, 33vw"}
        priority={priority}
        className={cn(
          "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]",
          className,
        )}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <Image
        src={src}
        alt={alt}
        width={900}
        height={675}
        sizes={sizes}
        priority={priority}
        className={cn(
          "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]",
          className,
        )}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
