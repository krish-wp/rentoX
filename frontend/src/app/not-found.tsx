"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden bg-background px-4 py-16 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-15%] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <SearchX className="size-7 text-primary" aria-hidden="true" />
      </div>

      <p className="font-heading text-7xl font-bold leading-none text-muted-foreground/25 tabular-nums" aria-hidden="true">
        404
      </p>

      <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist, or it may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => router.back()}>
          <ArrowLeft aria-hidden="true" /> Go Back
        </Button>
        <Link href="/vehicles">
          <Button variant="outline">
            <Car aria-hidden="true" /> Browse Vehicles
          </Button>
        </Link>
      </div>

      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        Or return home
      </Link>
    </main>
  );
}
