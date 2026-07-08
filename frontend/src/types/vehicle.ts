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

export interface VehicleFilters {
  page?: number;
  limit?: number;
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
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

export type RentalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

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
}

export interface SendRentalRequest {
  vehicleId: string;
  startDate: string;
  endDate: string;
  message?: string;
}
