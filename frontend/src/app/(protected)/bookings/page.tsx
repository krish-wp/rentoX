"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { getSentRequests, getReceivedRequests, updateRequestStatus, deleteRentalRequest } from "@/services/rental.service";
import { getApiErrorMessage } from "@/types/api";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";

const STATUS_VARIANT: Record<RentalStatus, "outline" | "secondary" | "destructive"> = {
  PENDING: "outline",
  ACCEPTED: "secondary",
  REJECTED: "destructive",
};

const STATUS_LABELS: Record<RentalStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BookingsPage() {
  const [sentRequests, setSentRequests] = useState<RentalRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
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
    setProcessingId(requestId); setActionError("");
    try {
      await updateRequestStatus(requestId, status);
      setReceivedRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: status as RentalStatus } : r));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update status."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessingId(null); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || processingId) return;
    setProcessingId(deleteTarget.id); setActionError("");
    try {
      await deleteRentalRequest(deleteTarget.id);
      setSentRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete request."));
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const renderRequestList = (requests: RentalRequest[], type: "sent" | "received") => (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{request.vehicle?.brand} {request.vehicle?.model}</h3>
                  <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABELS[request.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{request.vehicle?.location} · {request.vehicle?.plateNumber}</p>
                <p className="text-sm text-muted-foreground">{formatDate(request.startDate)} — {formatDate(request.endDate)}</p>
                {request.message && <p className="text-sm text-muted-foreground italic">&quot;{request.message}&quot;</p>}
                {type === "sent" && request.vehicle?.owner && <p className="text-sm text-muted-foreground">Owner: {request.vehicle.owner.userName}</p>}
                {type === "received" && request.sender && <p className="text-sm text-muted-foreground">Requester: {request.sender.userName}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {type === "received" && request.status === "PENDING" && (
                  <>
                    <Button size="sm" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}>
                      {processingId === request.id ? "..." : "Accept"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "REJECTED")}>
                      {processingId === request.id ? "..." : "Reject"}
                    </Button>
                  </>
                )}
                {type === "sent" && request.status === "PENDING" && (
                  <Button size="sm" variant="destructive" disabled={processingId === request.id} onClick={() => setDeleteTarget(request)}>
                    {processingId === request.id ? "..." : "Delete"}
                  </Button>
                )}
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">
              ₹{request.vehicle?.pricePerDay}/day · Total: ₹
              {request.vehicle?.pricePerDay ? request.vehicle.pricePerDay * calcDays(request.startDate, request.endDate) : "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] mb-8">My Bookings</h1>

      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

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
        <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">Loading bookings...</div>
      ) : (
        <Tabs defaultValue="sent">
          <TabsList>
            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({receivedRequests.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sent">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No sent requests yet.</div>
            ) : (
              renderRequestList(sentRequests, "sent")
            )}
          </TabsContent>
          <TabsContent value="received">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No received requests yet.</div>
            ) : (
              renderRequestList(receivedRequests, "received")
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
