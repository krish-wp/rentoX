"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Car, LayoutGrid, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/me/vehicles", label: "My Vehicles" },
  { href: "/bookings", label: "Bookings" },
] as const;

function UserMenu({
  userName,
  onLogout,
  onNavigate,
}: {
  userName: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-border/60 bg-background py-1 pl-1 pr-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">{userName}</span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border/60 bg-popover p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => go("/me")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <User className="size-4 text-muted-foreground" aria-hidden="true" /> Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => go("/me/vehicles")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Car className="size-4 text-muted-foreground" aria-hidden="true" /> My Vehicles
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => go("/bookings")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <LayoutGrid className="size-4 text-muted-foreground" aria-hidden="true" /> Bookings
          </button>
          <div className="my-1.5 h-px bg-border/60" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setMobileOpen(false);
  };

  const navLinkClass = (href: string) =>
    `relative px-3 py-2 text-sm rounded-lg transition-colors ${
      isActive(href)
        ? "text-primary font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : "shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Image src="/logo.png" alt="rentoX" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-primary">rentoX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                    {isActive(link.href) && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                    {link.label}
                  </Link>
                ))}
                <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <ThemeToggle className="mr-1" />
                <UserMenu userName={user?.userName || "Profile"} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <ThemeToggle className="mr-1" />
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t bg-background sm:hidden animate-in fade-in slide-in-from-top-1 duration-200"
          role="menu"
        >
          <div className="space-y-1 px-4 py-3">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.href)
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/me"
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive("/me")
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Profile
                </Link>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Login</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
