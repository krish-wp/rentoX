"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { getVehicle } from "@/services/vehicle.service";
import { sendRentalRequest } from "@/services/rental.service";
import { useAuth } from "@/hooks/useAuth";
import { bookingSchema, type BookingFormData } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehicleId = typeof params.id === "string" ? params.id : "";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  useEffect(() => {
    if (!vehicleId) { setError("Invalid vehicle ID."); setIsLoading(false); return; }
    let cancelled = false;
    getVehicle(vehicleId)
      .then((data) => { if (!cancelled) setVehicle(data.vehicle); })
      .catch(() => { if (!cancelled) setError("Vehicle not found."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [vehicleId]);

  const onSubmit = async (data: BookingFormData) => {
    setError(""); setSuccess(""); setIsSubmitting(true);
    try {
      await sendRentalRequest({
        vehicleId,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        message: data.message,
      });
      setSuccess("Rental request sent! The owner will review your request.");
      reset();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = !!(user && vehicle?.ownerId && user.id === vehicle.ownerId);
  const today = new Date().toISOString().split("T")[0];

  if (!vehicleId) {
    return <div className="flex items-center justify-center py-12"><p className="text-red-600">Invalid vehicle ID.</p></div>;
  }

  if (isLoading) return <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">Loading vehicle details...</div>;

  if (error && !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/vehicles")}>Back to Vehicles</Button>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {vehicle.imageUrl ? (
            <div className="relative w-full h-64 sm:h-80 bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 sm:h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-gray-500 mt-1">{vehicle.type} · {vehicle.plateNumber}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{vehicle.location}</p></div>
            <div><p className="text-sm text-gray-500">Price per Day</p><p className="font-medium text-lg">₹{vehicle.pricePerDay}</p></div>
            <div><p className="text-sm text-gray-500">Listed by</p><p className="font-medium">{vehicle.owner?.userName || "Unknown"}</p></div>
            <div><p className="text-sm text-gray-500">Availability</p><p className={`font-medium ${vehicle.isAvailable ? "text-green-600" : "text-red-600"}`}>{vehicle.isAvailable ? "Available" : "Not Available"}</p></div>
          </div>
          {vehicle.description && (<><Separator /><div><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-600">{vehicle.description}</p></div></>)}
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-8">
            <CardHeader><CardTitle>Book this Vehicle</CardTitle></CardHeader>
            <CardContent>
              {isOwner ? (
                <p className="text-sm text-gray-500">This is your vehicle. You cannot book it.</p>
              ) : !vehicle.isAvailable ? (
                <p className="text-sm text-gray-500">This vehicle is currently not available for booking.</p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="error">{error}</Alert>}
                  <div className="space-y-1">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" min={today} {...register("startDate")} />
                    {errors.startDate && <p className="text-sm text-red-500" role="alert">{errors.startDate.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" min={startDate || today} {...register("endDate")} />
                    {errors.endDate && <p className="text-sm text-red-500" role="alert">{errors.endDate.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="message">Message (optional)</Label>
                    <textarea id="message" rows={3} placeholder="Any special requests..." className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm" {...register("message")} />
                    {errors.message && <p className="text-sm text-red-500" role="alert">{errors.message.message}</p>}
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
    </div>
  );
}
