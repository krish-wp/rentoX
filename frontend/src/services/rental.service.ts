import api from "@/lib/api";
import type { RentalRequest, SendRentalRequest } from "@/types/vehicle";

interface RentalResponse {
  success: boolean;
  message: string;
  data: RentalRequest;
}

interface RentalListResponse {
  success: boolean;
  count: number;
  data: RentalRequest[];
}

export const sendRentalRequest = async (data: SendRentalRequest): Promise<RentalResponse> => {
  const response = await api.post<RentalResponse>("/rental-requests/sendrequest", data);
  return response.data;
};

export const getSentRequests = async (): Promise<RentalListResponse> => {
  const response = await api.get<RentalListResponse>("/rental-requests/sent");
  return response.data;
};

export const getReceivedRequests = async (): Promise<RentalListResponse> => {
  const response = await api.get<RentalListResponse>("/rental-requests/received");
  return response.data;
};

export const getVehicleRequests = async (vehicleId: string): Promise<RentalListResponse> => {
  const response = await api.get<RentalListResponse>(`/rental-requests/vehicle/${vehicleId}`);
  return response.data;
};

export const updateRequestStatus = async (
  requestId: string,
  status: "ACCEPTED" | "REJECTED",
): Promise<RentalResponse> => {
  const response = await api.put<RentalResponse>(`/rental-requests/${requestId}/status`, { status });
  return response.data;
};

export const deleteRentalRequest = async (requestId: string): Promise<void> => {
  await api.delete(`/rental-requests/${requestId}`);
};
