"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout failed locally
    }
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            rentoX
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/vehicles" className="text-sm text-gray-600 hover:text-gray-900">
                  Vehicles
                </Link>
                <Link href="/me/vehicles" className="text-sm text-gray-600 hover:text-gray-900">
                  My Vehicles
                </Link>
                <Link href="/bookings" className="text-sm text-gray-600 hover:text-gray-900">
                  Bookings
                </Link>
                <Link href="/me" className="text-sm text-gray-600 hover:text-gray-900">
                  {user?.userName || "Profile"}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
