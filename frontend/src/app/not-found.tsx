"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchX, ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="mb-8 flex size-14 items-center justify-center rounded-xl border border-border bg-card">
        <SearchX className="size-6 text-brand" aria-hidden="true" />
      </div>

      <p
        className="font-mono text-7xl font-semibold leading-none tracking-tighter text-border sm:text-8xl"
        aria-hidden="true"
      >
        404
      </p>

      <h1 className="mt-6 text-2xl sm:text-3xl">Wrong turn</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        This page doesn&apos;t exist, or it may have been moved somewhere else in the garage.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => router.back()}>
          <ArrowLeft aria-hidden="true" /> Go back
        </Button>
        <Link href="/vehicles">
          <Button variant="outline">
            <Car aria-hidden="true" /> Browse vehicles
          </Button>
        </Link>
      </div>

      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
      >
        Or return home
      </Link>
    </main>
  );
}
