"use client";

import { useState, useMemo } from "react";
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
import { createVehicle } from "@/services/vehicle.service";
import { SERVICEABLE_CITIES, VEHICLE_BRANDS, VEHICLE_TYPES } from "@/lib/constants";

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

export default function AddVehiclePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
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
    setError("");
    setIsSubmitting(true);
    try {
      const vehicle = await createVehicle({
        brand: data.brand,
        model: data.model,
        type: data.type,
        plateNumber: data.plateNumber,
        pricePerDay: data.pricePerDay,
        location: data.location,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
      });
      router.push(`/vehicles/${vehicle.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      const msg = apiError?.response?.data?.details?.join(", ") || apiError?.response?.data?.message || "Failed to create vehicle.";
      setError(msg);
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
              <CardTitle>Add New Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="1500"
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
                  <Input id="imageUrl" placeholder="https://example.com/car.jpg" {...register("imageUrl")} />
                  {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Description (optional)</Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Describe your vehicle..."
                    className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                    {...register("description")}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Add Vehicle"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
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
