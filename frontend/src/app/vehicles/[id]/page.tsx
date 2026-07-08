"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { getVehicle } from "@/services/vehicle.service";
import { sendRentalRequest } from "@/services/rental.service";
import { useAuth } from "@/hooks/useAuth";
import type { Vehicle } from "@/types/vehicle";

const bookingSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  message: z.string().max(500, "Message too long").optional(),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "Start date must be before end date",
  path: ["endDate"],
}).refine((data) => new Date(data.startDate) >= new Date(), {
  message: "Start date must be in the future",
  path: ["startDate"],
}).refine((data) => {
  const days = (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 30;
}, {
  message: "Booking cannot exceed 30 days",
  path: ["endDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehicleId = params.id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  useEffect(() => {
    if (!vehicleId || typeof vehicleId !== "string") {
      setError("Invalid vehicle ID.");
      setIsLoading(false);
      return;
    }

    const loadVehicle = async () => {
      try {
        const data = await getVehicle(vehicleId);
        setVehicle(data.vehicle);
      } catch {
        setError("Vehicle not found.");
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicle();
  }, [vehicleId]);

  const onSubmit = async (data: BookingFormData) => {
    if (!vehicleId || typeof vehicleId !== "string") return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await sendRentalRequest({
        vehicleId,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        message: data.message,
      });
      setSuccess("Rental request sent! The owner will review your request.");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message || "Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = user?.id === vehicle?.ownerId;
  const today = new Date().toISOString().split("T")[0];

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading vehicle details...</div>
          ) : error && !vehicle ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => router.push("/vehicles")}>
                Back to Vehicles
              </Button>
            </div>
          ) : vehicle ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {vehicle.imageUrl && (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-64 sm:h-80 object-cover rounded-xl"
                  />
                )}

                <div>
                  <h1 className="text-3xl font-bold">{vehicle.brand} {vehicle.model}</h1>
                  <p className="text-gray-500 mt-1">{vehicle.type} &middot; {vehicle.plateNumber}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{vehicle.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price per Day</p>
                    <p className="font-medium text-lg">₹{vehicle.pricePerDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Listed by</p>
                    <p className="font-medium">{vehicle.owner?.userName || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className={`font-medium ${vehicle.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {vehicle.isAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>

                {vehicle.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-600">{vehicle.description}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>Book this Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isOwner ? (
                      <p className="text-sm text-gray-500">This is your vehicle. You cannot book it.</p>
                    ) : !vehicle.isAvailable ? (
                      <p className="text-sm text-gray-500">This vehicle is currently not available for booking.</p>
                    ) : (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {success && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600" role="status">
                            {success}
                          </div>
                        )}
                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
                            {error}
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            min={today}
                            {...register("startDate")}
                          />
                          {errors.startDate && (
                            <p className="text-sm text-red-500">{errors.startDate.message}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            min={startDate || today}
                            {...register("endDate")}
                          />
                          {errors.endDate && (
                            <p className="text-sm text-red-500">{errors.endDate.message}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="message">Message (optional)</Label>
                          <textarea
                            id="message"
                            rows={3}
                            placeholder="Any special requests..."
                            className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm"
                            {...register("message")}
                          />
                          {errors.message && (
                            <p className="text-sm text-red-500">{errors.message.message}</p>
                          )}
                        </div>

                        {totalDays > 0 && (
                          <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="flex justify-between">
                              <span>{totalDays} day{totalDays > 1 ? "s" : ""} x ₹{vehicle.pricePerDay}</span>
                              <span className="font-bold">₹{totalDays * vehicle.pricePerDay}</span>
                            </div>
                          </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? "Sending Request..." : "Send Rental Request"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
