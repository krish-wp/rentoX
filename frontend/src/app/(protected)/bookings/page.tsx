"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import { VehicleImage } from "@/components/ui/vehicle-image";
import { getSentRequests, getReceivedRequests, updateRequestStatus, deleteRentalRequest, cancelRentalRequest } from "@/services/rental.service";
import { getApiErrorMessage } from "@/types/api";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";
import { MapPin, Send, Inbox, CalendarDays, Star } from "lucide-react";

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

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sentRequests, setSentRequests] = useState<RentalRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RentalRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSentRequests(), getReceivedRequests()])
      .then(([sent, received]) => {
        if (!cancelled) { setSentRequests(sent.data); setReceivedRequests(received.data); }
      })
      .catch(() => { if (!cancelled) setError("Failed to load bookings."); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleStatusUpdate = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    if (processingId) return;
    setProcessingId(requestId);
    try {
      await updateRequestStatus(requestId, status);
      setReceivedRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: status as RentalStatus } : r));
      toast.success(status === "ACCEPTED" ? "Request accepted" : "Request rejected");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status."));
    } finally { setProcessingId(null); }
  };

  const handleCancel = async (requestId: string) => {
    if (processingId) return;
    setProcessingId(requestId);
    try {
      await cancelRentalRequest(requestId);
      setSentRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: "CANCELLED" as RentalStatus } : r));
      toast.success("Request cancelled");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel request."));
    } finally { setProcessingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || processingId) return;
    const target = deleteTarget;
    setProcessingId(target.id);
    try {
      await deleteRentalRequest(target.id);
      setSentRequests((prev) => prev.filter((r) => r.id !== target.id));
      toast.success("Request deleted");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete request."));
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const renderRequestList = (requests: RentalRequest[], type: "sent" | "received") => (
    <div className="space-y-4">
      {requests.map((request, index) => (
        <Card key={request.id} className="group overflow-hidden transition-shadow hover:shadow-md" style={{ animationDelay: `${index * 40}ms` }}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:w-28 group-hover:[&>div_img]:scale-105">
                <VehicleImage
                  src={request.vehicle?.imageUrl}
                  alt={`${request.vehicle?.brand ?? "Vehicle"} ${request.vehicle?.model ?? ""}`}
                  fill
                  sizes="112px"
                  className="rounded-lg"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold text-foreground">{request.vehicle?.brand} {request.vehicle?.model}</h3>
                  <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABELS[request.status]}</Badge>
                  {request.status === "ACCEPTED" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
                      {type === "sent" && request.ownerAverageRating ? (
                        <span className="font-mono font-semibold text-foreground">
                          {request.ownerAverageRating.toFixed(1)}
                        </span>
                      ) : type === "received" && request.senderAverageRating ? (
                        <span className="font-mono font-semibold text-foreground">
                          {request.senderAverageRating.toFixed(1)}
                        </span>
                      ) : null}
                      {((type === "sent" && request.ownerReviewCount) ||
                        (type === "received" && request.senderReviewCount)) && (
                        <span>
                          ({type === "sent" ? request.ownerReviewCount : request.senderReviewCount})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  {request.vehicle?.location}
                  {request.vehicle?.plateNumber ? ` · ${request.vehicle.plateNumber}` : ""}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                  {formatDate(request.startDate)} — {formatDate(request.endDate)}
                  <span className="text-muted-foreground/70">· {calcDays(request.startDate, request.endDate)}d</span>
                </p>
                {request.message && <p className="text-sm text-muted-foreground italic line-clamp-2">&quot;{request.message}&quot;</p>}
                <p className="text-sm text-muted-foreground">
                  {type === "sent" && request.vehicle?.owner ? `Owner: ${request.vehicle.owner.userName}` : ""}
                  {type === "received" && request.sender ? `Requester: ${request.sender.userName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                {type === "received" && request.status === "PENDING" && user?.id && request.senderId !== user.id && (
                  <>
                    <Button size="sm" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}>
                      {processingId === request.id ? "..." : "Accept"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "REJECTED")}>
                      Reject
                    </Button>
                  </>
                )}
                {type === "sent" && request.status === "PENDING" && (
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={processingId === request.id} onClick={() => setDeleteTarget(request)}>
                    Delete
                  </Button>
                )}
                {type === "sent" && (request.status === "PENDING" || request.status === "ACCEPTED") && (
                  <Button size="sm" variant="outline" disabled={processingId === request.id} onClick={() => handleCancel(request.id)}>
                    Cancel
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-brand hover:text-brand/80" onClick={() => router.push(`/bookings/${request.id}`)}>
                  View
                </Button>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-sm font-semibold">
                ₹{request.vehicle?.pricePerDay?.toLocaleString("en-IN")}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/day</span>
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                Total ₹
                {request.vehicle?.pricePerDay
                  ? (request.vehicle.pricePerDay * calcDays(request.startDate, request.endDate)).toLocaleString("en-IN")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-9">
        <p className="eyebrow">Trips</p>
        <h1 className="mt-3">Your bookings</h1>
      </header>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogTitle>Delete Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this rental request? This cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!!processingId} onClick={confirmDelete}>
              {processingId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div role="status" aria-live="polite">
          <span className="sr-only">Loading bookings…</span>
          <ListSkeleton rows={4} />
        </div>
      ) : (
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedRequests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            {sentRequests.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No sent requests yet"
                description="Browse vehicles and send a rental request to get started."
                action={<Button onClick={() => router.push("/vehicles")}>Browse Vehicles</Button>}
              />
            ) : (
              renderRequestList(sentRequests, "sent")
            )}
          </TabsContent>
          <TabsContent value="received">
            {receivedRequests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No received requests yet"
                description="List your vehicles to start receiving rental requests."
                action={<Button onClick={() => router.push("/vehicles/new")}>Add a Vehicle</Button>}
              />
            ) : (
              renderRequestList(receivedRequests, "received")
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
