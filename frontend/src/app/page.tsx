"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getVehicles } from "@/services/vehicle.service";
import type { Vehicle } from "@/types/vehicle";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVehicles({ limit: 6 });
        setFeaturedVehicles(data.vehicles);
      } catch {
        // Not logged in or API error — show empty state
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link href="/" className="text-xl font-bold text-primary">rentoX</Link>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/vehicles"><Button variant="outline" size="sm">Browse Vehicles</Button></Link>
                  <Link href="/me"><Button size="sm">Profile</Button></Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>
                  <Link href="/auth/register"><Button size="sm">Sign Up</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Rent a Vehicle,<br />Anytime, Anywhere
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find the perfect vehicle for your next trip. Browse hundreds of cars, bikes, and SUVs from trusted owners.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/vehicles">
              <Button size="lg">Browse Vehicles</Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button size="lg" variant="outline">List Your Vehicle</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse</h3>
              <p className="text-gray-600">Search through available vehicles by type, location, and price.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Book</h3>
              <p className="text-gray-600">Select your dates and send a rental request to the owner.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Drive</h3>
              <p className="text-gray-600">Once approved, pick up your vehicle and hit the road.</p>
            </div>
          </div>
        </div>
      </section>

      {featuredVehicles.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Vehicles</h2>
              <Link href="/vehicles" className="text-primary hover:underline text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    {vehicle.imageUrl && (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.brand} {vehicle.model}</h3>
                          <p className="text-sm text-gray-500">{vehicle.type}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">₹{vehicle.pricePerDay}/day</span>
                      </div>
                      <p className="text-sm text-gray-600">{vehicle.location}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 mb-6">
            Join thousands of users renting and listing vehicles on rentoX.
          </p>
          {!isAuthenticated && (
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">Create Free Account</Button>
            </Link>
          )}
        </div>
      </section>

      <footer className="py-8 px-4 border-t bg-white">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          © 2026 rentoX. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
