"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const POINTS = [
  "Verified owners on every listing",
  "Clear daily rates, no hidden fees",
  "Two-way ratings after every trip",
];

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-neutral-950 lg:block">
        <Image
          src="/images/hero.webp"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover object-[60%_center]"
        />
        <div className="scrim-left absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-neutral-950/50" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Image src="/logo.png" alt="" width={32} height={32} className="rounded-[7px]" />
            <span className="font-display text-lg font-semibold tracking-[-0.035em] text-white">
              rento<span className="text-brand">X</span>
            </span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-white">
              Get behind the wheel
              <br />
              in minutes.
            </h2>
            <ul className="mt-8 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="size-1.5 shrink-0 bg-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            Peer-to-peer · India · Est. 2024
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          className="w-full max-w-[400px]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
          >
            <Image src="/logo.png" alt="" width={30} height={30} className="rounded-[7px]" />
            <span className="font-display text-base font-semibold tracking-[-0.035em]">
              rento<span className="text-brand">X</span>
            </span>
          </Link>

          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-[1.75rem] leading-tight">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-7 flex items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export function AuthArrow() {
  return <ArrowRight className="size-4" aria-hidden="true" />;
}
