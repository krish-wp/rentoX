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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { INDIAN_STATES, DISTRICTS_BY_STATE } from "@/lib/constants";
import { profileSchema, type ProfileFormData } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, control, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      mobileNumber: "",
      state: "",
      district: "",
      pincode: "",
    },
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

  if (!user) return <div className="flex items-center justify-center py-12"><p className="text-muted-foreground" role="status" aria-live="polite">Loading profile...</p></div>;

  return (
    <div className="max-w-lg mx-auto py-12 px-4 sm:px-6">
      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent className="pt-6">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="mb-5 p-4 bg-muted rounded-lg text-sm space-y-2">
            <p><span className="text-muted-foreground">Username:</span> {user.userName}</p>
            <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
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
              {errors.mobileNumber && <p className="text-sm text-destructive" role="alert">{errors.mobileNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <NativeSelect id="state" {...register("state")} className="w-full">
                <NativeSelectOption value="">Select State</NativeSelectOption>
                {INDIAN_STATES.map((s) => <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>)}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <NativeSelect id="district" disabled={!selectedState} {...register("district")} className="w-full">
                <NativeSelectOption value="">{selectedState ? "Select District" : "Select state first"}</NativeSelectOption>
                {availableDistricts.map((d) => <NativeSelectOption key={d} value={d}>{d}</NativeSelectOption>)}
              </NativeSelect>
            </div>

            <div className="space-y-2">
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
              {errors.pincode && <p className="text-sm text-destructive" role="alert">{errors.pincode.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/me")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
