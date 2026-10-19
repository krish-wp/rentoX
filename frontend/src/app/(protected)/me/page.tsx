"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UserRound, Pencil, LogOut, Mail, Phone, MapPin, BadgeCheck, Car, Inbox, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyVehicles } from "@/services/vehicle.service";
import { getSentRequests, getReceivedRequests } from "@/services/rental.service";
import type { User } from "@/types/auth";

interface Stats {
  vehicles: number | null;
  sent: number | null;
  received: number | null;
}

const IDENTITY_FIELDS = [
  { label: "Username", key: "userName" as const, icon: UserRound },
  { label: "Email", key: "email" as const, icon: Mail },
  { label: "Phone", key: "mobileNumber" as const, icon: Phone, fallback: "Not set" },
];

const ADDRESS_FIELDS = [
  { label: "State", key: "state" as const, icon: MapPin, fallback: "Not set" },
  { label: "District", key: "district" as const, icon: MapPin, fallback: "Not set" },
  { label: "Pincode", key: "pincode" as const, icon: MapPin, fallback: "Not set" },
];

export default function MePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats>({ vehicles: null, sent: null, received: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [vehicles, sent, received] = await Promise.allSettled([
        getMyVehicles(),
        getSentRequests(),
        getReceivedRequests(),
      ]);
      if (cancelled) return;
      setStats({
        vehicles: vehicles.status === "fulfilled" ? vehicles.value.vehicles.length : null,
        sent: sent.status === "fulfilled" ? sent.value.count : null,
        received: received.status === "fulfilled" ? received.value.count : null,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
    } catch { /* ignore */ }
    finally { router.push("/auth/login"); }
  };

  const initials = (user?.userName || "?")
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const renderField = (
    field: { label: string; key: keyof User; icon: typeof Mail; fallback?: string },
    last: boolean
  ) => {
    const value: unknown = user?.[field.key];
    const display =
      typeof value === "boolean"
        ? value ? "Yes" : "No"
        : String(value ?? "") || field.fallback || "—";
    const Icon = field.icon;
    return (
      <div key={field.key} className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-border/40"}`}>
        <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-muted-foreground">{field.label}</span>
        <span className="ml-auto break-all text-right font-medium">
          {field.key === "email" && typeof value === "string" && value ? (
            <a href={`mailto:${value}`} className="transition-colors hover:text-primary">{value}</a>
          ) : field.key === "mobileNumber" && typeof value === "string" && value ? (
            <a href={`tel:${value}`} className="tabular-nums transition-colors hover:text-primary">{value}</a>
          ) : (
            display
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details</p>
      </div>

      <div className="space-y-6">
        {/* Identity card */}
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/8 to-accent/20" aria-hidden="true" />
          <CardContent className="-mt-10 pb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-background bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                {initials || <UserRound className="size-8" aria-hidden="true" />}
              </div>
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-semibold">{user?.userName || "—"}</h2>
                  <Badge variant={user?.isProfileCompleted ? "success" : "warning"} className="gap-1">
                    <BadgeCheck className="size-3" aria-hidden="true" />
                    {user?.isProfileCompleted ? "Complete" : "Incomplete"}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Link href="/me/edit" className="ml-auto pb-1">
                <Button variant="outline" size="sm"><Pencil aria-hidden="true" /> Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(
            [
              { label: "Vehicles Listed", value: stats.vehicles, icon: Car, href: "/me/vehicles" },
              { label: "Requests Sent", value: stats.sent, icon: Send, href: "/bookings" },
              { label: "Requests Received", value: stats.received, icon: Inbox, href: "/bookings" },
            ] as const
          ).map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      {stat.value === null ? (
                        <Skeleton className="h-7 w-10" />
                      ) : (
                        <p className="text-2xl font-bold tabular-nums leading-none">{stat.value}</p>
                      )}
                      <p className="mt-1.5 truncate text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-primary" aria-hidden="true" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {IDENTITY_FIELDS.map((f, i) => renderField(f, i === IDENTITY_FIELDS.length - 1))}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" aria-hidden="true" /> Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {ADDRESS_FIELDS.map((f, i) => renderField(f, i === ADDRESS_FIELDS.length - 1))}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardContent className="space-y-1 pt-6">
            <Link
              href="/me/vehicles"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Car className="size-4 text-primary" aria-hidden="true" />
              My Vehicles
              <span className="ml-auto text-muted-foreground">→</span>
            </Link>
            <Separator />
            <Link
              href="/bookings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              My Bookings
              <span className="ml-auto text-muted-foreground">→</span>
            </Link>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
          <LogOut aria-hidden="true" /> Logout
        </Button>
      </div>
    </div>
  );
}
