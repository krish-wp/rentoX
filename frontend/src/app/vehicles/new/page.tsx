"use client";

import { useState } from "react";
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

const VEHICLE_TYPES = ["Car", "Bike", "SUV", "Van", "Truck", "Auto"];

const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required").max(50, "Brand too long"),
  model: z.string().min(1, "Model is required").max(50, "Model too long"),
  type: z.string().min(1, "Type is required"),
  plateNumber: z.string().min(1, "Plate number is required").max(20, "Plate number too long"),
  pricePerDay: z.coerce.number().min(1, "Price must be at least ₹1"),
  location: z.string().min(1, "Location is required").max(100, "Location too long"),
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

export default function AddVehiclePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

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
                    <Input id="brand" placeholder="Toyota" {...register("brand")} />
                    {errors.brand && <p className="text-sm text-red-500">{errors.brand.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="Innova" {...register("model")} />
                    {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                      {...register("type")}
                    >
                      <option value="">Select type</option>
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="plateNumber">Plate Number</Label>
                    <Input id="plateNumber" placeholder="MH 01 AB 1234" {...register("plateNumber")} />
                    {errors.plateNumber && <p className="text-sm text-red-500">{errors.plateNumber.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="pricePerDay">Price per Day (₹)</Label>
                    <Input id="pricePerDay" type="number" placeholder="1500" {...register("pricePerDay")} />
                    {errors.pricePerDay && <p className="text-sm text-red-500">{errors.pricePerDay.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Mumbai" {...register("location")} />
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
