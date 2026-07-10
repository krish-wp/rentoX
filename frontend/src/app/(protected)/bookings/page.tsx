"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { getSentRequests, getReceivedRequests, updateRequestStatus, deleteRentalRequest } from "@/services/rental.service";
import { getApiErrorMessage } from "@/types/api";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";

type Tab = "sent" | "received";

const STATUS_LABELS: Record<RentalStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<RentalStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BookingsPage() {
  const [tab, setTab] = useState<Tab>("sent");
  const [sentRequests, setSentRequests] = useState<RentalRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const handleDelete = async (requestId: string) => {
    if (processingId) return;
    setConfirmDeleteId(requestId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId || processingId) return;
    setProcessingId(confirmDeleteId); setActionError(""); setConfirmDeleteId(null);
    try {
      await deleteRentalRequest(confirmDeleteId);
      setSentRequests((prev) => prev.filter((r) => r.id !== confirmDeleteId));
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete request."));
      setTimeout(() => setActionError(""), 5000);
    } finally { setProcessingId(null); }
  };

  const requests = tab === "sent" ? sentRequests : receivedRequests;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div role="tablist" aria-label="Booking requests" className="flex gap-2 mb-6">
        <Button role="tab" aria-selected={tab === "sent"} variant={tab === "sent" ? "default" : "outline"} onClick={() => setTab("sent")}>Sent Requests ({sentRequests.length})</Button>
        <Button role="tab" aria-selected={tab === "received"} variant={tab === "received" ? "default" : "outline"} onClick={() => setTab("received")}>Received Requests ({receivedRequests.length})</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {actionError && <Alert variant="error">{actionError}</Alert>}

      {/* Inline delete confirmation */}
      {confirmDeleteId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alertdialog" aria-label="Confirm delete">
          <p className="text-sm text-yellow-800 mb-3">Are you sure you want to delete this request? This cannot be undone.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={confirmDelete}>Yes, Delete</Button>
            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">Loading bookings...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No {tab === "sent" ? "sent" : "received"} requests yet.</div>
      ) : (
        <div role="tabpanel" className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.vehicle?.brand} {request.vehicle?.model}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[request.status]}`}>{STATUS_LABELS[request.status]}</span>
                    </div>
                    <p className="text-sm text-gray-500">{request.vehicle?.location} · {request.vehicle?.plateNumber}</p>
                    <p className="text-sm text-gray-600">{formatDate(request.startDate)} — {formatDate(request.endDate)}</p>
                    {request.message && <p className="text-sm text-gray-500 italic">&quot;{request.message}&quot;</p>}
                    {tab === "sent" && request.vehicle?.owner && <p className="text-sm text-gray-500">Owner: {request.vehicle.owner.userName}</p>}
                    {tab === "received" && request.sender && <p className="text-sm text-gray-500">Requester: {request.sender.userName}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {tab === "received" && request.status === "PENDING" && (
                      <>
                        <Button size="sm" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}>
                          {processingId === request.id ? "..." : "Accept"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={processingId === request.id} onClick={() => handleStatusUpdate(request.id, "REJECTED")}>
                          {processingId === request.id ? "..." : "Reject"}
                        </Button>
                      </>
                    )}
                    {tab === "sent" && request.status === "PENDING" && (
                      <Button size="sm" variant="destructive" disabled={processingId === request.id || confirmDeleteId === request.id} onClick={() => handleDelete(request.id)}>
                        {processingId === request.id ? "..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>
                <Separator className="my-3" />
                <p className="text-sm text-gray-500">
                  ₹{request.vehicle?.pricePerDay}/day · Total: ₹
                  {request.vehicle?.pricePerDay ? request.vehicle.pricePerDay * calcDays(request.startDate, request.endDate) : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
