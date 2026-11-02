"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Car, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/ui/vehicle-card";
import Navbar from "@/components/navbar";
import { getVehicles } from "@/services/vehicle.service";
import { VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/types/vehicle";

const STEPS = [
  { number: "01", title: "Browse", desc: "Search by type, location, and price." },
  { number: "02", title: "Book", desc: "Select dates and send a request." },
  { number: "03", title: "Drive", desc: "Pick up the vehicle and go." },
];

const TRUST = [
  { title: "Verified owners", desc: "Every lister completes profile verification." },
  { title: "Transparent pricing", desc: "Clear per-day rates, no hidden fees." },
  { title: "Instant requests", desc: "Send a request and get a reply fast." },
];

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getVehicles({ limit: 6 })
      .then((data) => { if (!cancelled) setVehicles(data.vehicles); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const fade = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero — editorial, image-left, text-right */}
        <section className="relative overflow-hidden px-4 pb-16 pt-20 md:pb-24 md:pt-32 lg:pt-40">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 gap-12 lg:items-center">
              <div className="relative group h-72 lg:h-[520px]">
                <Image
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-lg object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                  priority
                />
                <div className="absolute -inset-0.5 rounded-lg border border-primary/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 backdrop-blur-sm border border-border/60">
                  <span className="text-[10px] font-bold text-primary">₹4,500/day</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] font-semibold text-foreground">Delhi, India</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                  <span className="text-[10px]">rentoX</span>
                  <span className="h-3 w-px bg-primary" />
                  <span className="text-[10px]">Peer-to-peer vehicle rental</span>
                </div>

                <div className="flex flex-col gap-3">
                  <h1 className="text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
                    Rent a vehicle,<br />
                    <span className="text-primary">anytime.</span>
                  </h1>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Browse cars, bikes, and SUVs listed by verified owners. Book by the day, pay per trip.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
                  <Link href="/vehicles">
                    <Button size="lg" className="w-full sm:w-auto px-8 font-bold">
                      Browse Vehicles
                      <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 font-bold">
                      List Your Vehicle
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2">
                  {VEHICLE_TYPES.map((type) => (
                    <Link
                      key={type}
                      href={`/vehicles?type=${encodeURIComponent(type)}`}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {type}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust — minimal */}
        <section className="border-y border-border/60 px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-6">
              {TRUST.map((item, i) => (
                <div key={item.title} className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Vehicles */}
        {!isLoading && (
          <section className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-4 mb-12">
                <div>
                  <h2 className="mb-1 text-3xl font-bold text-foreground">Featured Vehicles</h2>
                  <p className="text-sm text-muted-foreground">Ready to book today</p>
                </div>
                <Link
                  href="/vehicles"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:inline-flex"
                >
                  View all <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle, i) => (
                  <motion.div key={vehicle.id} {...fade(Number(i) * 0.05)}>
                    <VehicleCard vehicle={vehicle} />
                  </motion.div>
                ))}
              </div>

              {vehicles.length > 0 && (
                <div className="mt-8 text-center sm:hidden">
                  <Link href="/vehicles"><Button variant="outline">View All Vehicles</Button></Link>
                </div>
              )}
            </div>
          </section>
        )}

        {isLoading && (
          <section className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-48 w-full rounded-lg bg-muted" />
                    <div className="h-4 w-1/3 bg-muted" />
                    <div className="h-4 w-2/3 bg-muted" />
                    <div className="h-3 w-1/2 bg-muted/50" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={22} height={22} className="rounded-sm" />
              <span className="text-sm font-semibold text-foreground">rentoX</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/vehicles" className="transition-colors hover:text-foreground">Browse</Link>
              <Link href="/auth/register" className="transition-colors hover:text-foreground">List Vehicle</Link>
              <Link href="/auth/login" className="transition-colors hover:text-foreground">Sign In</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} rentoX
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
