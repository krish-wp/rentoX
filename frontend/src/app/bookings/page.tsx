"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSentRequests, getReceivedRequests, updateRequestStatus, deleteRentalRequest } from "@/services/rental.service";
import type { RentalRequest, RentalStatus } from "@/types/vehicle";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

type Tab = "sent" | "received";

export default function BookingsPage() {
  const [tab, setTab] = useState<Tab>("sent");
  const [sentRequests, setSentRequests] = useState<RentalRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [sent, received] = await Promise.all([getSentRequests(), getReceivedRequests()]);
        if (!cancelled) {
          setSentRequests(sent.data);
          setReceivedRequests(received.data);
        }
      } catch {
        if (!cancelled) setError("Failed to load bookings.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleStatusUpdate = async (requestId: string, status: "ACCEPTED" | "REJECTED") => {
    if (processingId) return;
    setProcessingId(requestId);
    setActionError("");
    try {
      await updateRequestStatus(requestId, status);
      setReceivedRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: status as RentalStatus } : r))
      );
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError?.response?.data?.message || "Failed to update status.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (processingId) return;
    if (!confirm("Are you sure you want to delete this request?")) return;
    setProcessingId(requestId);
    setActionError("");
    try {
      await deleteRentalRequest(requestId);
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError?.response?.data?.message || "Failed to delete request.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });

  const statusColor: Record<RentalStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const requests = tab === "sent" ? sentRequests : receivedRequests;

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

          <div className="flex gap-2 mb-6">
            <Button
              variant={tab === "sent" ? "default" : "outline"}
              onClick={() => setTab("sent")}
            >
              Sent Requests ({sentRequests.length})
            </Button>
            <Button
              variant={tab === "received" ? "default" : "outline"}
              onClick={() => setTab("received")}
            >
              Received Requests ({receivedRequests.length})
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          {actionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600" role="alert">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading bookings...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No {tab} requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {request.vehicle?.brand} {request.vehicle?.model}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[request.status]}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.vehicle?.location} &middot; {request.vehicle?.plateNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.startDate)} — {formatDate(request.endDate)}
                        </p>
                        {request.message && (
                          <p className="text-sm text-gray-500 italic">&quot;{request.message}&quot;</p>
                        )}
                        {tab === "sent" && request.vehicle?.owner && (
                          <p className="text-sm text-gray-500">
                            Owner: {request.vehicle.owner.userName}
                          </p>
                        )}
                        {tab === "received" && request.sender && (
                          <p className="text-sm text-gray-500">
                            Requester: {request.sender.userName}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {tab === "received" && request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              disabled={processingId === request.id}
                              onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                            >
                              {processingId === request.id ? "..." : "Accept"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processingId === request.id}
                              onClick={() => handleStatusUpdate(request.id, "REJECTED")}
                            >
                              {processingId === request.id ? "..." : "Reject"}
                            </Button>
                          </>
                        )}
                        {tab === "sent" && request.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processingId === request.id}
                            onClick={() => handleDelete(request.id)}
                          >
                            {processingId === request.id ? "..." : "Delete"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-sm text-gray-500">
                      ₹{request.vehicle?.pricePerDay}/day &middot; Total: ₹
                      {request.vehicle?.pricePerDay
                        ? request.vehicle.pricePerDay * Math.max(1, Math.ceil(
                            (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)
                          ))
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
