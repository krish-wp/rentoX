"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, MapPin, Star, Tag, User2 } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
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

  const totalCost = totalDays * (vehicle?.pricePerDay ?? 0);

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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" role="status" aria-live="polite">
        <span className="sr-only">Loading vehicle details…</span>
        <Skeleton className="mb-8 h-4 w-40" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
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

  const specs = [
    { label: "Body type", value: vehicle.type },
    { label: "Registration", value: vehicle.plateNumber || "—" },
    { label: "Location", value: vehicle.location },
    { label: "Listed by", value: vehicle.owner?.userName || "Unknown" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <li>
            <Link href="/vehicles" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Fleet
            </Link>
          </li>
          <li aria-hidden="true" className="text-border">—</li>
          <li className="truncate text-foreground">{vehicle.brand} {vehicle.model}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* LEFT */}
        <div className="min-w-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
            <VehicleImage
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
              className="object-cover"
            />
            <span
              className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-md ${
                vehicle.isAvailable
                  ? "border-success/30 bg-background/85 text-success"
                  : "border-destructive/30 bg-background/85 text-destructive"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${vehicle.isAvailable ? "bg-success" : "bg-destructive"}`}
                aria-hidden="true"
              />
              {vehicle.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          {/* Header */}
          <header className="mt-8">
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-brand" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {vehicle.type}
                {vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <h1>{vehicle.brand} {vehicle.model}</h1>
              {vehicleReviews.length > 0 && (
                <a
                  href="#reviews"
                  className="flex items-center gap-1.5 text-sm transition-colors hover:text-brand"
                >
                  <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
                  <span className="font-mono font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({vehicleReviews.length} {vehicleReviews.length === 1 ? "review" : "reviews"})
                  </span>
                </a>
              )}
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {vehicle.location}
            </div>
          </header>

          {/* Spec sheet */}
          <dl className="mt-10 grid border-t border-border sm:grid-cols-2 sm:gap-x-10">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-6 border-b border-border py-4"
              >
                <dt className="eyebrow">{spec.label}</dt>
                <dd className="text-sm font-medium">{spec.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6 border-b border-border py-4">
              <dt className="eyebrow">Daily rate</dt>
              <dd className="font-mono text-sm font-semibold">
                ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-border py-4">
              <dt className="eyebrow">Owner</dt>
              <dd className="flex items-center gap-1.5 text-sm font-medium">
                <User2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                {vehicle.owner?.userName || "Unknown"}
              </dd>
            </div>
          </dl>

          {vehicle.description && (
            <section className="mt-12">
              <p className="eyebrow">Description</p>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                {vehicle.description}
              </p>
            </section>
          )}

          {/* Reviews */}
          <section id="reviews" className="mt-14 scroll-mt-24">
            <div className="flex items-baseline gap-3">
              <p className="eyebrow">Reviews</p>
              <span className="font-mono text-xs text-muted-foreground">{vehicleReviews.length}</span>
            </div>

            {vehicleReviews.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                No reviews yet. Be the first to review this vehicle.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {vehicleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}

            {user && !isOwner && canReview && (
              <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6">
                <h2 className="text-base">Leave a review</h2>
                <div className="mt-5 space-y-2">
                  <Label>Your rating</Label>
                  <StarRating rating={reviewRating} onChange={setReviewRating} size="md" />
                </div>
                <div className="mt-5">
                  <Label htmlFor="reviewComment">Comment (optional)</Label>
                  <textarea
                    id="reviewComment"
                    rows={3}
                    placeholder="Share your experience..."
                    className={cn(TEXTAREA_CLASS, "mt-2")}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={isReviewSubmitting || !reviewRating}
                  className="mt-5"
                >
                  {isReviewSubmitting ? "Submitting…" : "Submit review"}
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — booking */}
        <aside className="lg:col-start-2">
          <div id="booking-card" className="lg:sticky lg:top-24">
            <Card className="rounded-xl border border-border bg-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <p className="eyebrow">Daily rate</p>
                    <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">
                      ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">per day</span>
                </div>

                {isOwner ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    This is your vehicle. You cannot book it.
                  </p>
                ) : !vehicle.isAvailable ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    This vehicle is not currently available for booking.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="error">{error}</Alert>}

                    <div className="space-y-2">
                      <Label>Select dates</Label>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <button
                              type="button"
                              className={cn(
                                "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-sm text-left font-normal transition-colors",
                                "hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
                                !dateRange && "text-muted-foreground"
                              )}
                            />
                          }
                        >
                          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          {dateRange?.from && dateRange?.to ? (
                            <span className="text-foreground">
                              {format(dateRange.from, "MMM d, yyyy")} — {format(dateRange.to, "MMM d, yyyy")}
                            </span>
                          ) : dateRange?.from ? (
                            <span className="text-foreground">
                              {format(dateRange.from, "MMM d, yyyy")} — pick end date
                            </span>
                          ) : (
                            <span>Pick a date range</span>
                          )}
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
                            <p className="mt-2 text-center text-xs text-muted-foreground">
                              Greyed-out dates are already booked
                            </p>
                          )}
                        </PopoverContent>
                      </Popover>
                      {(errors.startDate || errors.endDate) && (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.startDate?.message || errors.endDate?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (optional)</Label>
                      <textarea
                        id="message"
                        rows={3}
                        placeholder="Any special requests..."
                        className={TEXTAREA_CLASS}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive" role="alert">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {totalDays > 0 && (
                      <div className="rounded-md border border-border bg-muted/40 p-4">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-xs text-muted-foreground">
                            {totalDays} {totalDays === 1 ? "day" : "days"} × ₹
                            {vehicle.pricePerDay.toLocaleString("en-IN")}
                          </span>
                          <span className="font-mono text-base font-semibold">
                            ₹{totalCost.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button type="submit" size="lg" className="w-full justify-center" disabled={isSubmitting}>
                      {isSubmitting ? "Sending request…" : "Send rental request"}
                    </Button>
                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                      You are not charged until the owner accepts your request.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      {canBook && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-base font-semibold">
                ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/day</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
            <Button
              onClick={() => {
                document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 px-6"
            >
              Book now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
