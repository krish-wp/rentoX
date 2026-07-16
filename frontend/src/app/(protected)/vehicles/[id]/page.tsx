"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getVehicle } from "@/services/vehicle.service";
import { sendRentalRequest } from "@/services/rental.service";
import { useAuth } from "@/hooks/useAuth";
import { bookingSchema, type BookingFormData, TEXTAREA_CLASS } from "@/lib/form-utils";
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

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const formStartDate = watch("startDate");
  const formEndDate = watch("endDate");

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formStartDate ? new Date(formStartDate) : undefined,
    to: formEndDate ? new Date(formEndDate) : undefined,
  });

  const totalDays = useMemo(() => {
    if (!formStartDate || !formEndDate) return 0;
    const start = new Date(formStartDate).getTime();
    const end = new Date(formEndDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [formStartDate, formEndDate]);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      setValue("startDate", format(range.from, "yyyy-MM-dd"), { shouldValidate: true });
    }
    if (range?.to) {
      setValue("endDate", format(range.to, "yyyy-MM-dd"), { shouldValidate: true });
    }
  };

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
      setDateRange(undefined);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = !!(user && vehicle?.ownerId && user.id === vehicle.ownerId);

  if (!vehicleId) {
    return <div className="flex items-center justify-center py-12"><p className="text-destructive">Invalid vehicle ID.</p></div>;
  }

  if (isLoading) return <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">Loading vehicle details...</div>;

  if (error && !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push("/vehicles")}>Back to Vehicles</Button>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {vehicle.imageUrl ? (
            <div className="relative w-full h-64 sm:h-80 bg-muted rounded-xl overflow-hidden">
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 pointer-events-none">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 sm:h-80 bg-muted rounded-xl flex items-center justify-center text-muted-foreground/40">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em]">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-muted-foreground mt-1">{vehicle.type} · {vehicle.plateNumber}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{vehicle.location}</p></div>
            <div><p className="text-sm text-muted-foreground">Price per Day</p><p className="font-medium text-lg">₹{vehicle.pricePerDay}</p></div>
            <div><p className="text-sm text-muted-foreground">Listed by</p><p className="font-medium">{vehicle.owner?.userName || "Unknown"}</p></div>
            <div><p className="text-sm text-muted-foreground">Availability</p><Badge variant={vehicle.isAvailable ? "secondary" : "destructive"}>{vehicle.isAvailable ? "Available" : "Not Available"}</Badge></div>
          </div>
          {vehicle.description && (<><Separator /><div><h3 className="font-semibold mb-2">Description</h3><p className="text-muted-foreground">{vehicle.description}</p></div></>)}
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-8">
            <CardHeader><CardTitle>Book this Vehicle</CardTitle></CardHeader>
            <CardContent>
              {isOwner ? (
                <p className="text-sm text-muted-foreground">This is your vehicle. You cannot book it.</p>
              ) : !vehicle.isAvailable ? (
                <p className="text-sm text-muted-foreground">This vehicle is currently not available for booking.</p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="error">{error}</Alert>}

                  <div className="space-y-2">
                    <Label>Select Dates</Label>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            className={cn(
                              "flex h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-transparent px-2.5 py-1 text-sm text-left font-normal transition-[color,box-shadow,border-color] duration-150",
                              "hover:border-ring focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
                              !dateRange && "text-muted-foreground/70"
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="mr-2 size-4 shrink-0 opacity-50" />
                        {dateRange?.from && dateRange?.to ? (
                          <span className="text-foreground">
                            {format(dateRange.from, "MMM d, yyyy")} — {format(dateRange.to, "MMM d, yyyy")}
                          </span>
                        ) : dateRange?.from ? (
                          <span className="text-foreground">
                            {format(dateRange.from, "MMM d, yyyy")} — Select end date
                          </span>
                        ) : (
                          <span>Pick a date range</span>
                        )}
                        <CalendarIcon className="ml-auto size-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={handleDateRangeSelect}
                          numberOfMonths={2}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                    {(errors.startDate || errors.endDate) && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.startDate?.message || errors.endDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optional)</Label>
                    <textarea id="message" rows={3} placeholder="Any special requests..." className={TEXTAREA_CLASS} {...register("message")} />
                    {errors.message && <p className="text-sm text-destructive" role="alert">{errors.message.message}</p>}
                  </div>

                  {totalDays > 0 && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
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
