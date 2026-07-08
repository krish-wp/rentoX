"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";

const profileSchema = z.object({
  mobileNumber: z.string().regex(/^\+?\d{10,15}$/, "Invalid phone number").or(z.literal("")),
  state: z.string().max(100, "State too long").or(z.literal("")),
  district: z.string().max(100, "District too long").or(z.literal("")),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits").or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        mobileNumber: user.mobileNumber || "",
        state: user.state || "",
        district: user.district || "",
        pincode: user.pincode || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await api.put("/auth/me", {
        mobileNumber: data.mobileNumber || null,
        state: data.state || null,
        district: data.district || null,
        pincode: data.pincode || null,
      });
      await fetchUser();
      setSuccess("Profile updated successfully!");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600" role="status">
                  {success}
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <p><span className="text-gray-500">Username:</span> {user?.userName}</p>
                <p><span className="text-gray-500">Email:</span> {user?.email}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="mobileNumber">Phone Number</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register("mobileNumber")}
                  />
                  {errors.mobileNumber && (
                    <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    {...register("state")}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="Mumbai"
                    {...register("district")}
                  />
                  {errors.district && (
                    <p className="text-sm text-red-500">{errors.district.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    {...register("pincode")}
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500">{errors.pincode.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/me")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
