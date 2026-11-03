"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  UserRound,
  Pencil,
  LogOut,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Car,
  Inbox,
  Send,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyVehicles } from "@/services/vehicle.service";
import { getSentRequests, getReceivedRequests, getUserReviews } from "@/services/rental.service";
import type { User } from "@/types/auth";
import type { UserReviewStats } from "@/types/vehicle";

type StatValue = number | string | null;

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
  const [stats, setStats] = useState<{ vehicles: StatValue; sent: StatValue; received: StatValue }>({
    vehicles: null,
    sent: null,
    received: null,
  });
  const [reviewStats, setReviewStats] = useState<UserReviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [vehicles, sent, received, reviews] = await Promise.allSettled([
        getMyVehicles(),
        getSentRequests(),
        getReceivedRequests(),
        getUserReviews(user?.id || ""),
      ]);
      if (cancelled) return;
      setStats({
        vehicles: vehicles.status === "fulfilled" ? vehicles.value.vehicles.length : null,
        sent: sent.status === "fulfilled" ? sent.value.count : null,
        received: received.status === "fulfilled" ? received.value.count : null,
      });
      if (reviews.status === "fulfilled") setReviewStats(reviews.value);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
    } catch {
      /* ignore */
    } finally {
      router.push("/auth/login");
    }
  };

  const initials = (user?.userName || "?")
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const renderField = (
    field: { label: string; key: keyof User; icon: typeof Mail; fallback?: string },
  ) => {
    const value: unknown = user?.[field.key];
    const display =
      typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value ?? "") || field.fallback || "—";
    const Icon = field.icon;
    return (
      <div className="flex items-baseline justify-between gap-6 border-b border-border py-3.5 last:border-b-0">
        <dt className="eyebrow flex items-center gap-2">
          <Icon className="size-3.5" aria-hidden="true" />
          {field.label}
        </dt>
        <dd className="min-w-0 break-all text-right text-sm font-medium">
          {field.key === "email" && typeof value === "string" && value ? (
            <a href={`mailto:${value}`} className="transition-colors hover:text-brand">
              {value}
            </a>
          ) : field.key === "mobileNumber" && typeof value === "string" && value ? (
            <a href={`tel:${value}`} className="tabular-nums transition-colors hover:text-brand">
              {value}
            </a>
          ) : (
            display
          )}
        </dd>
      </div>
    );
  };

  const rating =
    reviewStats && reviewStats.reviewCount > 0 ? reviewStats.averageRating.toFixed(1) : null;

  const statCards = [
    { label: "Vehicles listed", value: stats.vehicles, icon: Car, href: "/me/vehicles" },
    { label: "Requests sent", value: stats.sent, icon: Send, href: "/bookings" },
    { label: "Requests received", value: stats.received, icon: Inbox, href: "/bookings" },
    { label: "Member rating", value: rating, icon: Star, href: "/bookings" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-10">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3">Your profile</h1>
      </header>

      <div className="space-y-8">
        {/* Identity */}
        <Card className="rounded-xl border border-border bg-card shadow-card">
          <CardContent className="flex flex-wrap items-center gap-5 p-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold tracking-tight text-primary-foreground">
              {initials || <UserRound className="size-7" aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="truncate text-xl">{user?.userName || "—"}</h2>
                <Badge variant={user?.isProfileCompleted ? "success" : "warning"}>
                  {user?.isProfileCompleted ? "Verified" : "Incomplete"}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</p>
              {reviewStats && reviewStats.reviewCount > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
                  <span className="font-mono font-semibold text-foreground">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span>
                    from {reviewStats.reviewCount}{" "}
                    {reviewStats.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>
            <Link href="/me/edit">
              <Button variant="outline" size="sm">
                <Pencil aria-hidden="true" /> Edit profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="group">
                <Card className="h-full rounded-xl border border-border bg-card shadow-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/15 group-hover:shadow-lift">
                  <CardContent className="p-5">
                    <Icon className="size-4 text-brand" aria-hidden="true" />
                    {stat.value === null ? (
                      <Skeleton className="mt-4 h-7 w-12" />
                    ) : (
                      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardContent className="p-6">
              <p className="eyebrow mb-3">Account details</p>
              <dl>{IDENTITY_FIELDS.map(renderField)}</dl>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardContent className="p-6">
              <p className="eyebrow mb-3">Address</p>
              <dl>{ADDRESS_FIELDS.map(renderField)}</dl>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <Card className="rounded-xl border border-border bg-card shadow-card">
          <CardContent className="divide-y divide-border p-2">
            {[
              { href: "/me/vehicles", label: "My fleet", description: "Manage the vehicles you have listed" },
              { href: "/bookings", label: "Bookings", description: "Requests you sent and received" },
              { href: "/vehicles/new", label: "List a new vehicle", description: "Put an idle car to work" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{link.description}</p>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Button
          variant="destructive-outline"
          className="w-full justify-center"
          onClick={handleLogout}
        >
          <LogOut aria-hidden="true" /> Log out
        </Button>
      </div>
    </div>
  );
}
