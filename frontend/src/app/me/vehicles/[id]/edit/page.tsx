"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVehicle, updateVehicle } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_BRANDS, VEHICLE_TYPES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import type { Vehicle } from "@/types/vehicle";

const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  plateNumber: z
    .string()
    .regex(/^[A-Z]{2}\s?\d{2}\s?[A-Z]{2}\s?\d{4}$/, "Format: MH 01 AB 1234"),
  pricePerDay: z.number({ message: "Price must be a number" }).min(100, "Minimum ₹100/day").max(100000, "Maximum ₹1,00,000/day"),
  location: z.string().min(1, "Location is required"),
  description: z.string().max(500, "Description too long").optional(),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: string[];
    };
  };
}

const selectClass = "flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm";

function formatPlateNumber(raw: string): string {
  const stripped = raw.replace(/\s/g, "").toUpperCase();
  if (stripped.length <= 2) return stripped;
  if (stripped.length <= 4) return stripped.slice(0, 2) + " " + stripped.slice(2);
  if (stripped.length <= 6) return stripped.slice(0, 2) + " " + stripped.slice(2, 4) + " " + stripped.slice(4);
  return stripped.slice(0, 2) + " " + stripped.slice(2, 4) + " " + stripped.slice(4, 6) + " " + stripped.slice(6);
}

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id;
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const selectedBrand = watch("brand");

  const availableModels = useMemo(() => {
    return selectedBrand ? VEHICLE_BRANDS[selectedBrand] || [] : [];
  }, [selectedBrand]);

  useEffect(() => {
    if (!vehicleId || typeof vehicleId !== "string") return;

    const load = async () => {
      try {
        const data = await getVehicle(vehicleId);
        if (user && data.vehicle.ownerId !== user.id) {
          setError("You do not have permission to edit this vehicle.");
          setVehicle(null);
          return;
        }
        setVehicle(data.vehicle);
        reset({
          brand: data.vehicle.brand,
          model: data.vehicle.model,
          type: data.vehicle.type,
          plateNumber: formatPlateNumber(data.vehicle.plateNumber),
          pricePerDay: data.vehicle.pricePerDay,
          location: data.vehicle.location,
          description: data.vehicle.description || "",
          imageUrl: data.vehicle.imageUrl || "",
        });
      } catch {
        setError("Vehicle not found.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [vehicleId, reset, user]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setValue("brand", brand, { shouldValidate: true });
    setValue("model", "", { shouldValidate: true });
  };

  const handlePlateInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    // Format: XX 00 XX 0000
    let formatted = value;
    if (value.length > 4) formatted = value.slice(0, 2) + " " + value.slice(2, 4) + " " + value.slice(4);
    else if (value.length > 2) formatted = value.slice(0, 2) + " " + value.slice(2);
    if (value.length > 6) formatted = value.slice(0, 2) + " " + value.slice(2, 4) + " " + value.slice(4, 6) + " " + value.slice(6);
    target.value = formatted;
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (!vehicleId || typeof vehicleId !== "string") return;
    setError("");
    setIsSubmitting(true);
    try {
      await updateVehicle(vehicleId, {
        brand: data.brand,
        model: data.model,
        type: data.type,
        plateNumber: data.plateNumber,
        pricePerDay: data.pricePerDay,
        location: data.location,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
      });
      router.push(`/vehicles/${vehicleId}`);
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.details?.join(", ") || apiError?.response?.data?.message || "Failed to update vehicle.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicleId || typeof vehicleId !== "string") {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600">Invalid vehicle ID.</p>
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
              <CardTitle>Edit Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading vehicle...</div>
              ) : error && !vehicle ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="brand">Brand</Label>
                      <select id="brand" className={selectClass} onChange={handleBrandChange} value={selectedBrand || ""}>
                        <option value="">Select brand</option>
                        {Object.keys(VEHICLE_BRANDS).map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {errors.brand && <p className="text-sm text-red-500">{errors.brand.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="model">Model</Label>
                      <select
                        id="model"
                        className={selectClass}
                        disabled={!selectedBrand}
                        {...register("model")}
                      >
                        <option value="">{selectedBrand ? "Select model" : "Select brand first"}</option>
                        {availableModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="type">Type</Label>
                      <select id="type" className={selectClass} {...register("type")}>
                        <option value="">Select type</option>
                        {VEHICLE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="plateNumber">Plate Number</Label>
                      <Input
                        id="plateNumber"
                        placeholder="MH 01 AB 1234"
                        maxLength={13}
                        onInput={handlePlateInput}
                        {...register("plateNumber")}
                      />
                      {errors.plateNumber && <p className="text-sm text-red-500">{errors.plateNumber.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                      <Input
                        id="pricePerDay"
                        type="number"
                        min={100}
                        max={100000}
                        step={50}
                        {...register("pricePerDay", { valueAsNumber: true })}
                      />
                      {errors.pricePerDay && <p className="text-sm text-red-500">{errors.pricePerDay.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="location">Location</Label>
                      <select id="location" className={selectClass} {...register("location")}>
                        <option value="">Select city</option>
                        {SERVICEABLE_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input id="imageUrl" {...register("imageUrl")} />
                    {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="description">Description (optional)</Label>
                    <textarea
                      id="description"
                      rows={3}
                      className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                      {...register("description")}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
