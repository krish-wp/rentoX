"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createVehicle } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_BRANDS, VEHICLE_TYPES } from "@/lib/constants";
import { vehicleSchema, type VehicleFormData, handlePlateInput, TEXTAREA_CLASS } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";

export default function AddVehiclePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const selectedBrand = watch("brand");
  const availableModels = useMemo(() => selectedBrand ? VEHICLE_BRANDS[selectedBrand] || [] : [], [selectedBrand]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("brand", e.target.value, { shouldValidate: true });
    setValue("model", "", { shouldValidate: true });
  };

  const onSubmit = async (data: VehicleFormData) => {
    setError(""); setIsSubmitting(true);
    try {
      const vehicle = await createVehicle({
        brand: data.brand, model: data.model, type: data.type,
        plateNumber: data.plateNumber, pricePerDay: data.pricePerDay,
        location: data.location, description: data.description || "", imageUrl: data.imageUrl || "",
      });
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create vehicle."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4 sm:px-6">
      <Card>
        <CardHeader><CardTitle>Add New Vehicle</CardTitle></CardHeader>
        <CardContent className="pt-6">
          {error && <Alert variant="error">{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <Input id="pricePerDay" type="number" min={100} max={100000} step={50} placeholder="1500" {...register("pricePerDay", { valueAsNumber: true })} />
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
              <Input id="imageUrl" placeholder="https://example.com/car.jpg" {...register("imageUrl")} />
              {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea id="description" rows={3} placeholder="Describe your vehicle..." className={TEXTAREA_CLASS} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Add Vehicle"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
