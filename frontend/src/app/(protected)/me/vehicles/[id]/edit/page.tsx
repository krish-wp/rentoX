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
import { FormSelect } from "@/components/ui/form-select";
import { getVehicle, updateVehicle } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_BRANDS, VEHICLE_TYPES } from "@/lib/constants";
import { vehicleSchema, type VehicleFormData, handlePlateInput, formatPlateNumber, SELECT_CLASS } from "@/lib/form-utils";
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

  if (!vehicleId) return <div className="flex items-center justify-center py-12"><p className="text-red-600">Invalid vehicle ID.</p></div>;
  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading vehicle...</div>;
  if (error && !vehicle) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>Edit Vehicle</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="brand">Brand</Label>
                <select id="brand" className={SELECT_CLASS} onChange={handleBrandChange} value={selectedBrand || ""}>
                  <option value="">Select brand</option>
                  {Object.keys(VEHICLE_BRANDS).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.brand && <p className="text-sm text-red-500">{errors.brand.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="model">Model</Label>
                <select id="model" className={SELECT_CLASS} disabled={!selectedBrand} {...register("model")}>
                  <option value="">{selectedBrand ? "Select model" : "Select brand first"}</option>
                  {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect id="type" label="Type" placeholder="Select type" options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))} error={errors.type?.message} registration={register("type")} />
              <div className="space-y-1">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input id="plateNumber" placeholder="MH 01 AB 1234" maxLength={13} onInput={handlePlateInput} {...register("plateNumber")} />
                {errors.plateNumber && <p className="text-sm text-red-500">{errors.plateNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                <Input id="pricePerDay" type="number" min={100} max={100000} step={50} {...register("pricePerDay", { valueAsNumber: true })} />
                {errors.pricePerDay && <p className="text-sm text-red-500">{errors.pricePerDay.message}</p>}
              </div>
              <FormSelect id="location" label="Location" placeholder="Select city" options={SERVICEABLE_CITIES.map((c) => ({ label: c, value: c }))} error={errors.location?.message} registration={register("location")} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input id="imageUrl" {...register("imageUrl")} />
              {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description (optional)</Label>
              <textarea id="description" rows={3} className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm" {...register("description")} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
