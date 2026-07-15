"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setMobileOpen(false);
  };

  return (
    <nav aria-label="Main navigation" className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="rentoX" width={32} height={32} className="rounded" />
            <span className="text-xl font-bold text-primary">rentoX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900">{link.label}</Link>
                ))}
                <Link href="/me" className="text-sm text-gray-600 hover:text-gray-900">{user?.userName || "Profile"}</Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
                <Link href="/auth/register"><Button size="sm">Sign Up</Button></Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t bg-white" role="menu" onKeyDown={(e) => { if (e.key === "Escape") setMobileOpen(false); }}>
          <div className="px-4 py-3 space-y-2">
            {isAuthenticated ? (
              <>
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">{link.label}</Link>
                ))}
                <Link href="/me" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">{user?.userName || "Profile"}</Link>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">Login</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-600 hover:text-gray-900">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
