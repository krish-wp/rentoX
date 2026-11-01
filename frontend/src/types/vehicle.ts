export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  brand: string;
  model: string;
  type: string;
  pricePerDay: number;
  location: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    userName: string;
    email: string;
    mobileNumber: string | null;
  };
}

export interface BlockedDateRange {
  startDate: string;
  endDate: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    userName: string;
  };
}

export interface UserReviewStats {
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}

export interface VehicleDetailResponse {
  vehicle: Vehicle;
  blockedDates: BlockedDateRange[];
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
}

export interface PaginatedVehicles {
  success: boolean;
  message: string;
  vehicles: Vehicle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type RentalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export interface RentalRequest {
  id: string;
  senderId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  message: string | null;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    userName: string;
    email: string;
    mobileNumber: string | null;
  };
  vehicle?: Vehicle;
  senderAverageRating?: number;
  senderReviewCount?: number;
  ownerAverageRating?: number;
  ownerReviewCount?: number;
}

export interface SendRentalRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
  message?: string;
}
