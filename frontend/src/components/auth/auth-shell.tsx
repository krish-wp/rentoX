"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[380px] w-[480px] rounded-full bg-accent/15 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)/0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
      </div>

      {/* Top chrome */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>
        <ThemeToggle />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-border/60 shadow-[0_8px_40px_-12px_hsl(0_0%_0%_/_0.15)] dark:shadow-[0_8px_40px_-12px_hsl(0_0%_0%_/_0.6)]">
          <CardHeader className="items-center space-y-3 pb-2 text-center">
            <div className="flex w-full justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Image src="/logo.png" alt="" width={36} height={36} className="rounded-lg" />
                <span className="text-xl font-bold text-primary">rentoX</span>
              </Link>
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold leading-snug tracking-[-0.01em] text-foreground">
                {title}
              </h1>
              <CardDescription className="mt-1.5">{description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>

        {footer && (
          <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
        )}
      </motion.div>
    </div>
  );
}
