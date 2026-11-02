"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, MapPin, Tag, User2, Star } from "lucide-react";
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
import { StarRating, ReviewCard } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";
import { getVehicle } from "@/services/vehicle.service";
import { getVehicleReviews, createReview } from "@/services/review.service";
import { sendRentalRequest } from "@/services/rental.service";
import { useAuth } from "@/hooks/useAuth";
import { bookingSchema, type BookingFormData, TEXTAREA_CLASS } from "@/lib/form-utils";
import { getApiErrorMessage } from "@/types/api";
import type { Vehicle, Review } from "@/types/vehicle";

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
  const [blockedDates, setBlockedDates] = useState<{ start: Date; end: Date }[]>([]);
  const [vehicleReviews, setVehicleReviews] = useState<Review[]>([]);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState("");
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
    const loadData = async () => {
      try {
        const data = await getVehicle(vehicleId);
        if (!cancelled) {
          setVehicle(data.vehicle);
          setBlockedDates(
            data.blockedDates.map((b) => ({
              start: new Date(b.startDate),
              end: new Date(b.endDate),
            }))
          );
        }
      } catch {
        if (!cancelled) setError("Vehicle not found.");
      }
      try {
        const reviews = await getVehicleReviews(vehicleId);
        if (!cancelled) setVehicleReviews(reviews);
      } catch {
        // reviews are optional; ignore failure
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadData();
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

  const handleReviewSubmit = async () => {
    if (!reviewRating || reviewRating < 1) return;
    setIsReviewSubmitting(true);
    try {
      await createReview(vehicleId, { rating: reviewRating, comment: reviewComment || undefined });
      setSuccess("Thank you for your review!");
      toast.success("Review submitted");
      setReviewRating(0);
      setReviewComment("");
      const updated = await getVehicleReviews(vehicleId);
      setVehicleReviews(updated);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to submit request. Please try again.");
      toast.error(msg);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const isOwner = !!(user && vehicle?.ownerId && user.id === vehicle.ownerId);
  const canBook = !!vehicle && !isOwner && vehicle.isAvailable;

  const averageRating =
    vehicleReviews.length > 0
      ? Math.round((vehicleReviews.reduce((sum, r) => sum + r.rating, 0) / vehicleReviews.length) * 10) / 10
      : 0;
  const userHasReviewed = vehicleReviews.some((r) => r.reviewer.id === user?.id);
  const canReview = !!user && !isOwner && !userHasReviewed;

  if (!vehicleId) {
    return <div className="flex items-center justify-center py-12"><p className="text-destructive">Invalid vehicle ID.</p></div>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
        <span className="sr-only">Loading vehicle details…</span>
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-lg" />
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <button type="button" onClick={() => router.push("/vehicles")} className="inline-flex items-center gap-1 transition-colors hover:text-primary">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Vehicles
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-foreground">{vehicle.brand} {vehicle.model}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column — Hero image + specs */}
        <div className="space-y-8 lg:col-span-2">
          <div className="relative h-[520px] overflow-hidden rounded-lg">
            <VehicleImage
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
              className="object-cover"
            />
            <div className="absolute -inset-0.5 rounded-lg border border-primary/30 pointer-events-none" />
            <div className="absolute top-3 left-3 flex gap-1.5 rounded-md bg-background/90 px-2 py-1 backdrop-blur-md border border-border/60">
              <span
                className={`size-1.5 rounded-full ${vehicle.isAvailable ? "bg-success" : "bg-destructive"}`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium text-foreground">
                {vehicle.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-bold tabular-nums text-foreground shadow-sm backdrop-blur-sm border border-border/60">
              ₹{vehicle.pricePerDay}<span className="text-[10px] font-normal text-muted-foreground">/day</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{vehicle.brand} {vehicle.model}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="size-3.5 text-primary" aria-hidden="true" />
              {vehicle.type}
              {vehicle.plateNumber && <span className="font-mono text-xs">{vehicle.plateNumber}</span>}
            </p>
          </div>

          <Separator />

          {/* Spec grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold text-muted-foreground">Location</p>
              <p className="text-sm text-foreground">{vehicle.location}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold text-muted-foreground">Listed by</p>
              <p className="text-sm text-foreground">{vehicle.owner?.userName || "Unknown"}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold text-muted-foreground">Type</p>
              <p className="text-sm text-foreground">{vehicle.type}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-[10px] font-semibold text-muted-foreground">Plate</p>
              <p className="text-sm font-mono text-foreground">{vehicle.plateNumber || "—"}</p>
            </div>
          </div>

          {vehicle.description && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Description</h3>
                <p className="leading-relaxed text-muted-foreground">{vehicle.description}</p>
              </div>
            </>
          )}

          {/* Reviews */}
          <Separator className="my-6" />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span className="text-xs font-bold text-primary">{vehicleReviews.length}</span>
              Reviews
            </h3>
            {vehicleReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this vehicle.</p>
            ) : (
              <div className="space-y-3">
                {vehicleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>

          {user && !isOwner && canReview && (
            <div className="mt-6">
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Leave a Review</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Rating</label>
                  <StarRating rating={reviewRating} onChange={setReviewRating} size="md" />
                </div>
                <div>
                  <Label htmlFor="reviewComment">Comment (optional)</Label>
                  <textarea
                    id="reviewComment"
                    rows={3}
                    placeholder="Share your experience..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={isReviewSubmitting || !reviewRating}
                  className="w-full"
                >
                  {isReviewSubmitting ? "Submitting…" : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right column — Booking */}
        <div className="lg:col-span-1">
          <Card className="border border-border lg:sticky lg:top-8 lg:shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Book this Vehicle</CardTitle>
              <p className="text-sm tabular-nums text-muted-foreground">₹{vehicle.pricePerDay} per day</p>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <p className="text-sm text-muted-foreground">This is your vehicle. You cannot book it.</p>
              ) : !vehicle.isAvailable ? (
                <p className="text-sm text-muted-foreground">This vehicle is not available for booking.</p>
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
                              "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-left font-normal shadow-xs transition-colors",
                              "hover:border-primary/40 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/20",
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
                          disabled={(date) => {
                            const isBeforeToday = date < new Date();
                            const isBlocked = blockedDates.some((range) => {
                              const start = range.start;
                              const end = range.end;
                              return date >= start && date <= end;
                            });
                            return isBeforeToday || isBlocked;
                          }}
                        />
                        {blockedDates.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground text-center">
                            Grey dates are already booked
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                    {(errors.startDate || errors.endDate) && (
                      <p className="text-[10px] text-destructive" role="alert">
                        {errors.startDate?.message || errors.endDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optional)</Label>
                    <textarea id="message" rows={3} placeholder="Any special requests..." className={TEXTAREA_CLASS} {...register("message")} />
                    {errors.message && <p className="text-[10px] text-destructive" role="alert">{errors.message.message}</p>}
                  </div>

                  {totalDays > 0 && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-3.5">
                      <div className="flex justify-between tabular-nums">
                        <span className="text-[10px] text-muted-foreground">
                          {totalDays} day{totalDays > 1 ? "s" : ""} × ₹{vehicle.pricePerDay}
                        </span>
                        <span className="text-sm font-bold text-primary tabular-nums">
                          ₹{totalDays * vehicle.pricePerDay}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending Request…" : "Send Rental Request"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {canBook && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
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
