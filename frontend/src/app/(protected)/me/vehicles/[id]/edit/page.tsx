"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getVehicle, updateVehicle } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_BRANDS, VEHICLE_TYPES } from "@/lib/constants";
import { vehicleSchema, type VehicleFormData, handlePlateInput, formatPlateNumber, TEXTAREA_CLASS } from "@/lib/form-utils";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const selectedBrand = watch("brand");
  const availableModels = useMemo(() => selectedBrand ? VEHICLE_BRANDS[selectedBrand] || [] : [], [selectedBrand]);

  useEffect(() => {
    if (!vehicleId) return;
    let cancelled = false;
    getVehicle(vehicleId)
      .then((data) => {
        if (cancelled) return;
        if (user && data.vehicle.ownerId !== user.id) {
          setError("You do not have permission to edit this vehicle.");
          return;
        }
        setVehicle(data.vehicle);
        reset({
          brand: data.vehicle.brand, model: data.vehicle.model, type: data.vehicle.type,
          plateNumber: formatPlateNumber(data.vehicle.plateNumber),
          pricePerDay: data.vehicle.pricePerDay, location: data.vehicle.location,
          description: data.vehicle.description || "", imageUrl: data.vehicle.imageUrl || "",
        });
      })
      .catch(() => { if (!cancelled) setError("Vehicle not found."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [vehicleId, reset, user]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("brand", e.target.value, { shouldValidate: true });
    setValue("model", "", { shouldValidate: true });
  };

  const onSubmit = async (data: VehicleFormData) => {
    setError(""); setIsSubmitting(true);
    try {
      await updateVehicle(vehicleId, {
        brand: data.brand, model: data.model, type: data.type,
        plateNumber: data.plateNumber, pricePerDay: data.pricePerDay,
        location: data.location, description: data.description || "", imageUrl: data.imageUrl || "",
      });
      router.push(`/vehicles/${vehicleId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update vehicle."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicleId) return <div className="flex items-center justify-center py-12"><p className="text-destructive">Invalid vehicle ID.</p></div>;
  if (isLoading) return <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">Loading vehicle...</div>;
  if (error && !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4 sm:px-6">
      <Card>
        <CardHeader><CardTitle>Edit Vehicle</CardTitle></CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <NativeSelect id="brand" value={selectedBrand || ""} onChange={handleBrandChange} className="w-full">
                  <NativeSelectOption value="">Select brand</NativeSelectOption>
                  {Object.keys(VEHICLE_BRANDS).map((b) => <NativeSelectOption key={b} value={b}>{b}</NativeSelectOption>)}
                </NativeSelect>
                {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <NativeSelect id="model" disabled={!selectedBrand} {...register("model")} className="w-full">
                  <NativeSelectOption value="">{selectedBrand ? "Select model" : "Select brand first"}</NativeSelectOption>
                  {availableModels.map((m) => <NativeSelectOption key={m} value={m}>{m}</NativeSelectOption>)}
                </NativeSelect>
                {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <NativeSelect id="type" {...register("type")} className="w-full">
                  <NativeSelectOption value="">Select type</NativeSelectOption>
                  {VEHICLE_TYPES.map((t) => <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>)}
                </NativeSelect>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input id="plateNumber" placeholder="MH 01 AB 1234" maxLength={13} onInput={handlePlateInput} {...register("plateNumber")} />
                {errors.plateNumber && <p className="text-sm text-destructive">{errors.plateNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                <Input id="pricePerDay" type="number" min={100} max={100000} step={50} {...register("pricePerDay", { valueAsNumber: true })} />
                {errors.pricePerDay && <p className="text-sm text-destructive">{errors.pricePerDay.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <NativeSelect id="location" {...register("location")} className="w-full">
                  <NativeSelectOption value="">Select city</NativeSelectOption>
                  {SERVICEABLE_CITIES.map((c) => <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>)}
                </NativeSelect>
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" {...register("imageUrl")} />
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea id="description" rows={3} className={TEXTAREA_CLASS} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
