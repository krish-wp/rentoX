"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FIELDS: readonly { label: string; key: string; fallback?: string; format?: (v: unknown) => string }[] = [
  { label: "Username", key: "userName" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "mobileNumber", fallback: "Not set" },
  { label: "State", key: "state", fallback: "Not set" },
  { label: "District", key: "district", fallback: "Not set" },
  { label: "Pincode", key: "pincode", fallback: "Not set" },
  { label: "Profile Completed", key: "isProfileCompleted", format: (v) => (v as boolean) ? "Yes" : "No" },
];

export default function MePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    finally { router.push("/auth/login"); }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-xl font-bold tracking-[-0.02em]">My Profile</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-0">
            {FIELDS.map((field, i) => (
              <div key={field.key} className={`flex justify-between py-2.5 ${i < FIELDS.length - 1 ? "border-b border-border/40" : ""}`}>
                <span className="text-muted-foreground">{field.label}</span>
                <span className="font-medium text-right">
                  {field.format
                    ? field.format(user?.[field.key as keyof typeof user])
                    : String(user?.[field.key as keyof typeof user] ?? "") || field.fallback || "—"}
                </span>
              </div>
            ))}
          </div>
          <Link href="/me/edit"><Button className="w-full">Edit Profile</Button></Link>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
