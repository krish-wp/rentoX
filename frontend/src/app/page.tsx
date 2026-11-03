"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/ui/vehicle-card";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getVehicles } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

const CATEGORIES = [
  { label: "SUV & 4x4", href: "/vehicles?type=SUV", image: "/images/suv.webp" },
  { label: "City cars", href: "/vehicles?type=Car", image: "/images/city.webp" },
  { label: "Performance", href: "/vehicles?type=Car", image: "/images/sport.webp" },
  { label: "Luxury", href: "/vehicles?type=Car", image: "/images/luxury.webp" },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Find your car",
    body: "Filter by city, body type and daily budget. Every listing shows the plate, the rate and the owner.",
    Icon: MapPin,
  },
  {
    n: "02",
    title: "Send a request",
    body: "Pick your dates. The owner gets your request instantly — no back-and-forth over email threads.",
    Icon: CalendarCheck,
  },
  {
    n: "03",
    title: "Collect the keys",
    body: "Once the owner accepts, the trip is confirmed and you can rate each other after the drive.",
    Icon: BadgeCheck,
  },
] as const;

const PROMISES = [
  {
    title: "Clear daily rates",
    body: "One price per day, shown upfront. What you see is what you pay.",
    Icon: IndianRupee,
  },
  {
    title: "Verified owners",
    body: "Every lister completes email and phone verification before listing a vehicle.",
    Icon: ShieldCheck,
  },
  {
    title: "Two-way ratings",
    body: "Owners and renters rate each other, so the community stays accountable.",
    Icon: BadgeCheck,
  },
] as const;

export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getVehicles({ limit: 6 })
      .then((data) => {
        if (cancelled) return;
        setVehicles(data.vehicles);
        setTotal(data.pagination?.total ?? data.vehicles.length);
      })
      .catch(() => {
        if (!cancelled) setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { label: "Vehicles listed", value: total === null ? null : total },
    { label: "Cities covered", value: 120 },
    { label: "Avg. rating", value: "4.8" },
    { label: "Response time", value: "< 2h" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-neutral-950">
          <div className="absolute inset-0">
            <Image
              src="/images/hero.webp"
              alt="Sports car driving on an open highway at dusk"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[60%_center]"
            />
            <div className="scrim-left absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/40" />
          </div>

          <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 lg:min-h-[660px] lg:pb-20 lg:pt-36 lg:px-8">
            <Reveal trigger="mount" className="max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="size-1.5 bg-brand" aria-hidden="true" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Peer-to-peer vehicle rental · India
                </span>
              </div>

              <h1 className="mt-6 text-white">
                Rent the car
                <br />
                you actually want.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Cars, bikes and EVs from verified owners across India. Book by the day,
                pay a clear rate, and get back on the road.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/vehicles" className="sm:w-auto">
                  <Button size="lg" variant="brand" className="w-full justify-center sm:w-auto">
                    Browse the fleet
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/auth/register" className="sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full justify-center border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    List your vehicle
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Stat strip */}
          <div className="relative border-t border-white/10 bg-black/35 backdrop-blur-md">
            <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-5 first:pl-0 lg:py-6">
                  <div className="font-mono text-xl font-medium tracking-tight text-white sm:text-2xl">
                    {stat.value === null ? (
                      <Skeleton className="h-7 w-16 bg-white/10" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="eyebrow">The fleet</p>
                <h2 className="mt-3">Something for every road</h2>
                <p className="mt-4 text-muted-foreground">
                  From a runabout for the weekend to a flagship for the long drive.
                </p>
              </div>
              <Link
                href="/vehicles"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-brand"
              >
                See all vehicles
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {CATEGORIES.map((category, i) => (
                <StaggerItem key={category.label} delay={i * 70}>
                  <Link
                    href={category.href}
                    className="group relative block overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
                      <Image
                        src={category.image}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/15 to-transparent" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-sm font-semibold tracking-[-0.02em] text-white sm:text-base">
                        {category.label}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* FEATURED VEHICLES */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Available now</p>
                <h2 className="mt-3">Freshly listed</h2>
              </div>
              <Link
                href="/vehicles"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-brand"
              >
                Browse all
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>

            {isLoading ? (
              <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : vehicles.length > 0 ? (
              <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle, i) => (
                  <StaggerItem key={vehicle.id} delay={i * 60}>
                    <VehicleCard vehicle={vehicle} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No vehicles listed yet. Be the first to publish one.
                </p>
                <Link href="/auth/register" className="mt-5 inline-block">
                  <Button>List your vehicle</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-y border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
            <Reveal className="relative overflow-hidden rounded-xl border border-border">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/drive.webp"
                  alt="Driver holding the steering wheel with city lights out of focus"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/45 p-5 backdrop-blur-md">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
                  Average confirmation in under 2 hours
                </p>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow">How it works</p>
                <h2 className="mt-3">Three steps, no paperwork</h2>
              </Reveal>

              <Stagger className="mt-10 divide-y divide-border">
                {STEPS.map((step, i) => (
                  <StaggerItem key={step.n} as="div" delay={i * 80}>
                    <div className="flex gap-5 py-6 first:pt-0 last:pb-0">
                      <span className="font-mono text-xs font-medium text-brand">{step.n}</span>
                      <div>
                        <h3 className="flex items-center gap-2.5 text-base">
                          <step.Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* PROMISES */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-xl">
              <p className="eyebrow">Why rentoX</p>
              <h2 className="mt-3">Built on trust, not luck</h2>
            </Reveal>

            <Stagger className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              {PROMISES.map((promise, i) => (
                <StaggerItem key={promise.title} className="bg-card p-7" delay={i * 80}>
                  <promise.Icon className="size-5 text-brand" aria-hidden="true" />
                  <h3 className="mt-5 text-base">{promise.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {promise.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="relative isolate overflow-hidden rounded-2xl border border-border">
              <Image
                src="/images/showroom.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-neutral-950/75" />
              <div className="relative px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">
                    For owners
                  </p>
                  <h2 className="mt-5 text-white">
                    Your car is worth more than it costs you.
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
                    List it once and set your own daily rate. You approve every request,
                    so you decide when and who it goes to.
                  </p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link href="/auth/register" className="sm:w-auto">
                      <Button size="lg" variant="brand" className="w-full justify-center sm:w-auto">
                        Start listing
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </Link>
                    <Link href="/vehicles" className="sm:w-auto">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full justify-center border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white sm:w-auto"
                      >
                        Explore listings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
