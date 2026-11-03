import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/vehicles", label: "Browse vehicles" },
      { href: "/vehicles?type=Car", label: "Cars" },
      { href: "/vehicles?type=Bike", label: "Motorcycles" },
      { href: "/vehicles?type=EV", label: "Electric" },
    ],
  },
  {
    title: "List a vehicle",
    links: [
      { href: "/me/vehicles/new", label: "Add your vehicle" },
      { href: "/me/vehicles", label: "Manage listings" },
      { href: "/auth/register", label: "Create account" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/me", label: "Profile" },
      { href: "/bookings", label: "Bookings" },
      { href: "/auth/login", label: "Sign in" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo.png" alt="" width={28} height={28} className="rounded-[6px]" />
              <span className="font-display text-lg font-semibold tracking-[-0.03em]">rentoX</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A peer-to-peer marketplace for renting vehicles from verified owners across India.
              Transparent daily rates, no hidden fees.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                { href: "https://github.com/krish-wp/rentoX", label: "GitHub" },
                { href: "https://www.linkedin.com/in/krish-wp", label: "LinkedIn" },
                { href: "https://x.com", label: "X" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="eyebrow">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} rentoX. Built for car people.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Peer-to-peer · Verified owners · India
          </p>
        </div>
      </div>
    </footer>
  );
}
