"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/me/vehicles", label: "My Vehicles" },
  { href: "/bookings", label: "Bookings" },
] as const;

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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setMobileOpen(false);
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : "shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="rentoX" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold tracking-[-0.02em] text-primary">rentoX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-foreground font-medium bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/me"
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive("/me")
                      ? "text-foreground font-medium bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {user?.userName || "Profile"}
                </Link>
                <div className="w-px h-5 bg-border mx-1" aria-hidden="true" />
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/auth/register"><Button size="sm">Sign Up</Button></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden border-t bg-background animate-in fade-in slide-in-from-top-1 duration-200"
          role="menu"
          onKeyDown={(e) => { if (e.key === "Escape") setMobileOpen(false); }}
        >
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2.5 px-3 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-foreground font-medium bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/me"
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2.5 px-3 text-sm rounded-lg transition-colors ${
                    isActive("/me")
                      ? "text-foreground font-medium bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {user?.userName || "Profile"}
                </Link>
                <div className="py-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">Login</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
