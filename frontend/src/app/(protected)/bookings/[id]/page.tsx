"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  getRequestById,
  updateRequestStatus,
  cancelRentalRequest,
} from "@/services/rental.service";
import { getApiErrorMessage } from "@/types/api";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";

const STATUS_VARIANT: Record<RentalStatus, "outline" | "secondary" | "destructive"> = {
  PENDING: "outline",
  ACCEPTED: "secondary",
  REJECTED: "destructive",
  CANCELLED: "destructive",
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
  const [actionError, setActionError] = useState("");
  const [processing, setProcessing] = useState(false);

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
    setProcessing(true); setActionError("");
    try {
      await updateRequestStatus(request.id, status);
      setRequest({ ...request, status: status as RentalStatus });
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update status."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessing(false); }
  };

  const runCancel = async () => {
    if (!request || processing) return;
    setProcessing(true); setActionError("");
    try {
      await cancelRentalRequest(request.id);
      setRequest({ ...request, status: "CANCELLED" });
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to cancel request."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessing(false); }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">
          Loading booking...
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em]">Booking Details</h1>
        <Button variant="outline" onClick={() => router.push("/bookings")}>Back</Button>
      </div>

      {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}
      {actionError && <div className="mb-4"><Alert variant="error">{actionError}</Alert></div>}

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {request.vehicle?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={request.vehicle.imageUrl} alt={`${request.vehicle.brand} ${request.vehicle.model}`} className="h-16 w-24 rounded-lg object-cover border border-border/60" />
              )}
              <div>
                <h2 className="text-lg font-semibold">{request.vehicle?.brand} {request.vehicle?.model}</h2>
                <p className="text-sm text-muted-foreground">{request.vehicle?.location} · {request.vehicle?.plateNumber}</p>
              </div>
            </div>
            <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABELS[request.status]}</Badge>
          </div>

          <Separator />

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
              <dd className="font-medium">₹{request.vehicle?.pricePerDay}/day</dd>
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
            <div>
              <p className="text-sm text-muted-foreground mb-1">Message</p>
              <p className="text-sm italic">&quot;{request.message}&quot;</p>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total !== null ? <>Total: <span className="font-semibold text-foreground">₹{total}</span></> : "Total unavailable"}
            </p>
            <div className="flex gap-2">
              {request.status === "PENDING" && (
                <>
                  <Button size="sm" variant="outline" disabled={processing} onClick={() => runStatus("ACCEPTED")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" disabled={processing} onClick={() => runStatus("REJECTED")}>
                    Reject
                  </Button>
                </>
              )}
              {(request.status === "PENDING" || request.status === "ACCEPTED") && (
                <Button size="sm" variant="destructive" disabled={processing} onClick={runCancel}>
                  Cancel Request
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
