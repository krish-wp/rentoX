"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/ui/vehicle-card";
import Navbar from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import { getVehicles } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

const STEPS = [
  { title: "Browse", desc: "Search through available vehicles by type, location, and price." },
  { title: "Book", desc: "Select your dates and send a rental request to the owner." },
  { title: "Drive", desc: "Once approved, pick up your vehicle and hit the road." },
];

const STEP_ICONS = [Search, Calendar, Car] as const;

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const isNotLoading = !isAuthenticated || featuredLoaded;

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getVehicles({ limit: 6 })
      .then((data) => { if (!cancelled) setFeaturedVehicles(data.vehicles); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFeaturedLoaded(true); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-background to-background" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/10">
              India&apos;s trusted vehicle rental platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-foreground tracking-[-0.02em] leading-[1.1] mb-8">
              Rent a Vehicle,<br />Anytime, Anywhere
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Find the perfect vehicle for your next trip. Browse hundreds of cars, bikes, and SUVs from trusted owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles">
                <Button size="lg" className="px-10 text-base w-full sm:w-auto">Browse Vehicles</Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="px-10 text-base w-full sm:w-auto">List Your Vehicle</Button>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-[-0.02em] mb-3">How It Works</h2>
              <p className="text-muted-foreground text-lg">Three simple steps to get on the road</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
              {STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <div key={step.title} className="text-center p-8">
                    <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                      <Icon className="size-6 text-primary" />
                      <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground text-background text-[0.625rem] font-bold flex items-center justify-center">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-base text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Vehicles - Loading */}
        {isAuthenticated && !featuredLoaded && (
          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-[-0.02em] mb-12">Featured Vehicles</h2>
              <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">Loading featured vehicles...</div>
            </div>
          </section>
        )}

        {/* Featured Vehicles - Loaded */}
        {isNotLoading && featuredVehicles.length > 0 && (
          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-[-0.02em] mb-2">Featured Vehicles</h2>
                  <p className="text-muted-foreground">Handpicked vehicles available now</p>
                </div>
                <Link
                  href="/vehicles"
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors hidden sm:inline-flex items-center gap-1"
                  aria-label="View all vehicles"
                >
                  View All <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/vehicles"><Button variant="outline">View All Vehicles</Button></Link>
              </div>
            </div>
          </section>
        )}

        {/* Featured Vehicles - Empty (authenticated) */}
        {isAuthenticated && isNotLoading && featuredVehicles.length === 0 && (
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl border border-dashed border-border bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Car className="size-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">No vehicles listed yet.</p>
              <Link href="/vehicles/new"><Button variant="outline">Add Your First Vehicle</Button></Link>
            </div>
          </section>
        )}

        {/* Sign in prompt (unauthenticated) */}
        {!isAuthenticated && isNotLoading && (
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl border border-dashed border-border bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Car className="size-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">Sign in to see featured vehicles from trusted owners.</p>
              <Link href="/auth/login"><Button variant="outline">Sign In</Button></Link>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="py-24 px-4 bg-foreground text-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-6">Ready to Get Started?</h2>
            <p className="text-lg opacity-80 mb-10 max-w-xl mx-auto">
              Join thousands of users renting and listing vehicles on rentoX.
            </p>
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="px-8 text-base">Create Free Account</Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-4 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={24} height={24} className="rounded" />
              <span className="text-sm font-semibold text-foreground">rentoX</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/vehicles" className="hover:text-foreground transition-colors">Browse</Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">List Vehicle</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
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
