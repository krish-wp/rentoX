"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/constants";
import { profileSchema, type ProfileFormData, SELECT_CLASS } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, control, formState: { errors } } = useForm<ProfileFormData>({
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

  useEffect(() => {
    if (selectedState && selectedState !== user?.state) {
      setValue("district", "");
    }
  }, [selectedState, user?.state, setValue]);

  const availableDistricts = selectedState ? DISTRICTS_BY_STATE[selectedState] || [] : [];

  const onSubmit = async (data: ProfileFormData) => {
    setError(""); setSuccess(""); setIsSubmitting(true);
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
      setError(getApiErrorMessage(err, "Failed to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center py-12"><p className="text-gray-500" role="status" aria-live="polite">Loading profile...</p></div>;

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent>
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <p><span className="text-gray-500">Username:</span> {user.userName}</p>
            <p><span className="text-gray-500">Email:</span> {user.email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="mobileNumber">Phone Number</Label>
              <Controller
                name="mobileNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="+91 98765 43210"
                    maxLength={13}
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^+\d]/g, "");
                      if (value.includes("+")) value = "+" + value.replace(/\+/g, "");
                      field.onChange(value);
                    }}
                  />
                )}
              />
              {errors.mobileNumber && <p className="text-sm text-red-500" role="alert">{errors.mobileNumber.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <select id="state" className={SELECT_CLASS} {...register("state")}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="district">District</Label>
              <select id="district" className={SELECT_CLASS} disabled={!selectedState} {...register("district")}>
                <option value="">{selectedState ? "Select District" : "Select state first"}</option>
                {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pincode">Pincode</Label>
              <Controller
                name="pincode"
                control={control}
                render={({ field }) => (
                  <Input
                    id="pincode"
                    placeholder="400001"
                    maxLength={6}
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      field.onChange(value);
                    }}
                  />
                )}
              />
              {errors.pincode && <p className="text-sm text-red-500" role="alert">{errors.pincode.message}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/me")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
