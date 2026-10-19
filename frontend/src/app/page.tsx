"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  Calendar,
  Car,
  ArrowRight,
  ShieldCheck,
  Clock3,
  BadgeIndianRupee,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/ui/vehicle-card";
import Navbar from "@/components/navbar";
import { getVehicles } from "@/services/vehicle.service";
import { VEHICLE_TYPES } from "@/lib/constants";
import type { Vehicle } from "@/types/vehicle";

const STEPS = [
  { title: "Browse", desc: "Search through available vehicles by type, location, and price." },
  { title: "Book", desc: "Select your dates and send a rental request to the owner." },
  { title: "Drive", desc: "Once approved, pick up your vehicle and hit the road." },
];

const STEP_ICONS = [Search, Calendar, Car] as const;

const STATS = [
  { value: "8", label: "Vehicle types" },
  { value: "400+", label: "Cities covered" },
  { value: "60+", label: "Brands available" },
  { value: "24/7", label: "Book anytime" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Verified owners", desc: "Every lister completes their profile before listing." },
  { icon: Clock3, title: "Instant requests", desc: "Send a rental request in seconds, get a reply fast." },
  { icon: BadgeIndianRupee, title: "Transparent pricing", desc: "Clear per-day rates with no hidden charges." },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [featuredFailed, setFeaturedFailed] = useState(false);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 90]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.15]);

  useEffect(() => {
    let cancelled = false;
    getVehicles({ limit: 6 })
      .then((data) => { if (!cancelled) setFeaturedVehicles(data.vehicles); })
      .catch(() => { if (!cancelled) setFeaturedFailed(true); })
      .finally(() => { if (!cancelled) setFeaturedLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const fade = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: easeOut },
        };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-24 md:pb-28 md:pt-32">
          {/* Gradient mesh backdrop */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-info/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)",
                backgroundSize: "32px 32px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
              }}
            />
          </div>

          <motion.div
            className="relative mx-auto max-w-4xl text-center"
            style={reduceMotion ? undefined : { y: heroY, opacity: heroOpacity }}
          >
            <motion.div
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: easeOut } })}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              India&apos;s trusted vehicle rental platform
            </motion.div>

            <motion.h1
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.08, ease: easeOut } })}
              className="mb-7 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl md:text-6xl"
            >
              Rent a Vehicle,
              <br />
              <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">
                Anytime, Anywhere
              </span>
            </motion.h1>

            <motion.p
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.16, ease: easeOut } })}
              className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            >
              Find the perfect vehicle for your next trip. Browse hundreds of cars, bikes, and SUVs from trusted owners.
            </motion.p>

            <motion.div
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.24, ease: easeOut } })}
              className="flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link href="/vehicles">
                <Button size="lg" className="w-full px-10 text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 sm:w-auto">
                  Browse Vehicles
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="w-full px-10 text-base sm:w-auto">
                  List Your Vehicle
                </Button>
              </Link>
            </motion.div>

            {/* Category chips */}
            <motion.div
              {...(reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.34, ease: easeOut } })}
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              {VEHICLE_TYPES.map((type) => (
                <Link
                  key={type}
                  href={`/vehicles?type=${encodeURIComponent(type)}`}
                  className="rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  {type}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border/60 bg-muted/40 px-4 py-10">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} className="text-center" {...fade(i * 0.06)}>
                <div className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div className="mb-14 text-center" {...fade()}>
              <h2 className="mb-3 text-3xl font-bold sm:text-4xl">How It Works</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to get on the road</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <motion.div
                    key={step.title}
                    {...fade(i * 0.1)}
                    className="group relative rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    <div className="relative mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6 text-primary transition-colors group-hover:text-primary-foreground" aria-hidden="true" />
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-border/60 bg-muted/40 px-4 py-16">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {TRUST.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} className="flex gap-4" {...fade(i * 0.08)}>
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Featured Vehicles - Loading */}
        {!featuredLoaded && (
          <section className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
              <Skeleton className="mb-3 h-8 w-56" />
              <Skeleton className="mb-12 h-5 w-72" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                    <Skeleton className="h-48 w-full rounded-none" />
                    <div className="space-y-2.5 p-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Vehicles - Loaded */}
        {featuredLoaded && featuredVehicles.length > 0 && (
          <section className="px-4 py-24">
            <div className="mx-auto max-w-7xl">
              <motion.div className="mb-12 flex items-end justify-between gap-4" {...fade()}>
                <div>
                  <h2 className="mb-2 text-3xl font-bold">Featured Vehicles</h2>
                  <p className="text-muted-foreground">Handpicked vehicles available now</p>
                </div>
                <Link
                  href="/vehicles"
                  className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:inline-flex"
                  aria-label="View all vehicles"
                >
                  View All <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </motion.div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredVehicles.map((vehicle, i) => (
                  <motion.div key={vehicle.id} {...fade(i * 0.07)}>
                    <VehicleCard vehicle={vehicle} />
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/vehicles"><Button variant="outline">View All Vehicles</Button></Link>
              </div>
            </div>
          </section>
        )}

        {/* Featured Vehicles - Empty or signed-out */}
        {featuredLoaded && featuredVehicles.length === 0 && (
          <section className="px-4 py-24">
            <motion.div className="mx-auto max-w-4xl text-center" {...fade()}>
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50">
                <Car className="size-10 text-muted-foreground" />
              </div>
              {featuredFailed ? (
                <>
                  <p className="mb-4 text-lg text-muted-foreground">Sign in to see featured vehicles from trusted owners.</p>
                  <Link href="/auth/login"><Button>Sign In</Button></Link>
                </>
              ) : (
                <>
                  <p className="mb-4 text-lg text-muted-foreground">No vehicles listed yet.</p>
                  <Link href="/vehicles/new"><Button>Be the first to list a vehicle</Button></Link>
                </>
              )}
            </motion.div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="relative overflow-hidden bg-foreground px-4 py-24 text-background">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          </div>
          <motion.div className="relative mx-auto max-w-3xl text-center" {...fade()}>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Get Started?</h2>
            <p className="mx-auto mb-10 max-w-xl text-lg opacity-80">
              Join thousands of users renting and listing vehicles on rentoX.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="px-8 text-base">Create Free Account</Button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="" width={24} height={24} className="rounded" />
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
