"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, MapPin, Tag, User2 } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VehicleImage } from "@/components/ui/vehicle-image";
import { cn } from "@/lib/utils";
import { getVehicle } from "@/services/vehicle.service";
import { sendRentalRequest } from "@/services/rental.service";
import { useAuth } from "@/hooks/useAuth";
import { bookingSchema, type BookingFormData, TEXTAREA_CLASS } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
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
      toast.success("Rental request sent", { description: "The owner will review your request." });
      reset();
      setDateRange(undefined);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to send request. Please try again.");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = !!(user && vehicle?.ownerId && user.id === vehicle.ownerId);
  const canBook = !!vehicle && !isOwner && vehicle.isAvailable;

  if (!vehicleId) {
    return <div className="flex items-center justify-center py-12"><p className="text-destructive">Invalid vehicle ID.</p></div>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
        <span className="sr-only">Loading vehicle details…</span>
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full sm:h-80" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/vehicles")}>Back to Vehicles</Button>
      </div>
    );
  }

  if (!vehicle) return null;

  const bookingForm = (
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
                  "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1 text-sm text-left font-normal shadow-xs transition-[color,box-shadow,border-color] duration-150",
                  "hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
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
              numberOfMonths={isDesktop ? 2 : 1}
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
        <div className="rounded-lg bg-primary/10 p-3.5 text-sm">
          <div className="flex justify-between tabular-nums">
            <span className="text-muted-foreground">{totalDays} day{totalDays > 1 ? "s" : ""} × ₹{vehicle.pricePerDay}</span>
            <span className="font-bold text-primary">₹{totalDays * vehicle.pricePerDay}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending Request..." : "Send Rental Request"}
      </Button>
    </form>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 pb-32 sm:px-6 lg:px-8 lg:pb-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <button type="button" onClick={() => router.push("/vehicles")} className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Vehicles
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-foreground">{vehicle.brand} {vehicle.model}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          <div className="group relative h-64 w-full overflow-hidden rounded-xl sm:h-80">
            <VehicleImage
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
              className="rounded-xl"
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge variant={vehicle.isAvailable ? "success" : "destructive"} className="shadow-sm backdrop-blur-sm">
                {vehicle.isAvailable ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{vehicle.brand} {vehicle.model}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Tag className="size-3.5" aria-hidden="true" />{vehicle.type}</span>
              {vehicle.plateNumber && <span className="tabular-nums">{vehicle.plateNumber}</span>}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><MapPin className="size-4 text-primary" aria-hidden="true" /></div>
              <div><p className="text-sm text-muted-foreground">Location</p><p className="font-medium">{vehicle.location}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Tag className="size-4 text-primary" aria-hidden="true" /></div>
              <div><p className="text-sm text-muted-foreground">Price per Day</p><p className="text-lg font-semibold tabular-nums">₹{vehicle.pricePerDay}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><User2 className="size-4 text-primary" aria-hidden="true" /></div>
              <div><p className="text-sm text-muted-foreground">Listed by</p><p className="font-medium">{vehicle.owner?.userName || "Unknown"}</p></div>
            </div>
          </div>

          {vehicle.description && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Description</h3>
                <p className="leading-relaxed text-muted-foreground">{vehicle.description}</p>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card id="booking-card" className="scroll-mt-24 lg:sticky lg:top-8 lg:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Book this Vehicle</CardTitle>
              <p className="text-sm tabular-nums text-muted-foreground">₹{vehicle.pricePerDay} per day</p>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <p className="text-sm text-muted-foreground">This is your vehicle. You cannot book it.</p>
              ) : !vehicle.isAvailable ? (
                <p className="text-sm text-muted-foreground">This vehicle is currently not available for booking.</p>
              ) : (
                bookingForm
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {canBook && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium tabular-nums">₹{vehicle.pricePerDay}<span className="text-muted-foreground">/day</span></p>
              <p className="truncate text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
            </div>
            <Button
              onClick={() => {
                document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 px-6"
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
