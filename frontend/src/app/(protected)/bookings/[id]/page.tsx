"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleImage } from "@/components/ui/vehicle-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getRequestById,
  updateRequestStatus,
  cancelRentalRequest,
} from "@/services/rental.service";
import { getApiErrorMessage } from "@/types/api";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";

const STATUS_VARIANT: Record<RentalStatus, "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

const STATUS_LABELS: Record<RentalStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [request, setRequest] = useState<RentalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRequestById(id)
      .then((res) => { if (!cancelled) setRequest(res.data); })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err, "Failed to load booking.")); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const runStatus = async (status: "ACCEPTED" | "REJECTED") => {
    if (!request || processing) return;
    setProcessing(true);
    try {
      await updateRequestStatus(request.id, status);
      setRequest({ ...request, status: status as RentalStatus });
      toast.success(status === "ACCEPTED" ? "Request accepted" : "Request rejected");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status."));
    } finally { setProcessing(false); }
  };

  const runCancel = async () => {
    if (!request || processing) return;
    setProcessing(true);
    try {
      await cancelRentalRequest(request.id);
      setRequest({ ...request, status: "CANCELLED" });
      setConfirmCancel(false);
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel request."));
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10" role="status" aria-live="polite">
        <span className="sr-only">Loading booking…</span>
        <Skeleton className="mb-8 h-9 w-56" />
        <div className="space-y-4 rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error ? <Alert variant="error">{error}</Alert> : <div className="text-center py-12 text-muted-foreground">Booking not found.</div>}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push("/bookings")}>Back to Bookings</Button>
        </div>
      </div>
    );
  }

  const days = calcDays(request.startDate, request.endDate);
  const total = request.vehicle?.pricePerDay ? request.vehicle.pricePerDay * days : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/bookings")} aria-label="Back to bookings">
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Booking Details</h1>
        </div>
        <Badge variant={STATUS_VARIANT[request.status]} className="h-6 px-3 text-xs">{STATUS_LABELS[request.status]}</Badge>
      </div>

      {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
              <VehicleImage
                src={request.vehicle?.imageUrl}
                alt={`${request.vehicle?.brand ?? "Vehicle"} ${request.vehicle?.model ?? ""}`}
                fill
                sizes="176px"
                priority
                className="rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{request.vehicle?.brand} {request.vehicle?.model}</h2>
              <p className="text-sm text-muted-foreground">{request.vehicle?.location} · {request.vehicle?.plateNumber}</p>
              <p className="mt-2 text-sm font-medium tabular-nums text-primary">₹{request.vehicle?.pricePerDay}/day</p>
            </div>
          </div>

          <Separator />

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Start Date</dt>
              <dd className="font-medium">{formatDate(request.startDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">End Date</dt>
              <dd className="font-medium">{formatDate(request.endDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium">{days} {days === 1 ? "day" : "days"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rate</dt>
              <dd className="font-medium tabular-nums">₹{request.vehicle?.pricePerDay}/day</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Requester</dt>
              <dd className="font-medium">{request.sender?.userName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-medium">{request.vehicle?.owner?.userName ?? "—"}</dd>
            </div>
          </dl>

          {request.message && (
            <div className="rounded-lg bg-muted/50 p-3.5">
              <p className="mb-1 text-sm text-muted-foreground">Message</p>
              <p className="text-sm italic">&quot;{request.message}&quot;</p>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total !== null ? (
                <>Total: <span className="text-lg font-semibold tabular-nums text-foreground">₹{total}</span></>
              ) : "Total unavailable"}
            </p>
            <div className="flex flex-wrap gap-2">
              {request.status === "PENDING" && (
                <>
                  <Button size="sm" disabled={processing} onClick={() => runStatus("ACCEPTED")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" disabled={processing} onClick={() => runStatus("REJECTED")}>
                    Reject
                  </Button>
                </>
              )}
              {(request.status === "PENDING" || request.status === "ACCEPTED") && (
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={processing} onClick={() => setConfirmCancel(true)}>
                  Cancel Request
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogTitle>Cancel this request?</DialogTitle>
          <DialogDescription>
            This will cancel your {request.status === "ACCEPTED" ? "accepted booking" : "rental request"} for{" "}
            {request.vehicle ? `${request.vehicle.brand} ${request.vehicle.model}` : "this vehicle"}. This cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)} disabled={processing}>
              Keep Request
            </Button>
            <Button variant="destructive" onClick={runCancel} disabled={processing}>
              {processing ? "Cancelling…" : "Yes, Cancel It"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
