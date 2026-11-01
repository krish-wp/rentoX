import api from "@/lib/api";
import type { Review, UserReviewStats } from "@/types/vehicle";

export const createReview = async (
  rentalRequestId: string,
  data: { rating: number; comment?: string }
) => {
  const response = await api.post(`/rental-requests/${rentalRequestId}/review`, data);
  return response.data;
};

export const getUserReviews = async (userId: string) => {
  const response = await api.get<UserReviewStats>(`/users/${userId}/reviews`);
  return response.data;
};

export const getVehicleReviews = async (vehicleId: string) => {
  const response = await api.get<Review[]>(`/vehicles/${vehicleId}/reviews`);
  return response.data;
};
