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
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/constants";

const profileSchema = z.object({
  mobileNumber: z.string().regex(/^\+?\d{10,13}$/, "Enter a valid phone number (10-13 digits)").or(z.literal("")),
  state: z.string().optional(),
  district: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits").or(z.literal("")),
}).refine(
  (data) => !data.district || data.state,
  { message: "State is required when district is selected", path: ["state"] }
).refine(
  (data) => !data.state || !data.district || (DISTRICTS_BY_STATE[data.state]?.includes(data.district) ?? false),
  { message: "District does not belong to selected state", path: ["district"] }
);

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
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const selectedState = watch("state");

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

  // Clear district when state changes (but not on initial load)
  useEffect(() => {
    if (selectedState && selectedState !== user?.state) {
      setValue("district", "");
    }
  }, [selectedState, user?.state, setValue]);

  const availableDistricts = selectedState ? DISTRICTS_BY_STATE[selectedState] || [] : [];

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.replace(/[^+\d]/g, "");
    if (value.includes("+")) {
      value = "+" + value.replace(/\+/g, "");
    }
    target.value = value;
  };

  const handlePincodeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.replace(/\D/g, "").slice(0, 6);
  };

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

  if (!user) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

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
                    maxLength={13}
                    inputMode="numeric"
                    onInput={handlePhoneInput}
                    {...register("mobileNumber")}
                  />
                  {errors.mobileNumber && (
                    <p className="text-sm text-red-500">{errors.mobileNumber.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                    {...register("state")}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                    disabled={!selectedState}
                    {...register("district")}
                  >
                    <option value="">
                      {selectedState ? "Select District" : "Select state first"}
                    </option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    maxLength={6}
                    inputMode="numeric"
                    onInput={handlePincodeInput}
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
