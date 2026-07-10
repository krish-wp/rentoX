import api from "@/lib/api";
import type { Vehicle, VehicleFilters, PaginatedVehicles } from "@/types/vehicle";

export const getMyVehicles = async (): Promise<{ vehicles: Vehicle[] }> => {
  const response = await api.get<{ vehicles: Vehicle[] }>("/vehicles/mine");
  return response.data;
};

export const getVehicles = async (filters: VehicleFilters = {}): Promise<PaginatedVehicles> => {
  const params = new URLSearchParams();
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.type) params.set("type", filters.type);
  if (filters.location) params.set("location", filters.location);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

  const response = await api.get<PaginatedVehicles>(`/vehicles?${params.toString()}`);
  return response.data;
};

export const getVehicle = async (id: string): Promise<{ vehicle: Vehicle }> => {
  const response = await api.get<{ vehicle: Vehicle }>(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (data: Omit<Vehicle, "id" | "ownerId" | "isAvailable" | "createdAt" | "updatedAt" | "owner">): Promise<Vehicle> => {
  const response = await api.post<Vehicle>("/vehicles", data);
  return response.data;
};

export const updateVehicle = async (id: string, data: Omit<Vehicle, "id" | "ownerId" | "isAvailable" | "createdAt" | "updatedAt" | "owner">): Promise<Vehicle> => {
  const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
  return response.data;
};

export const updateVehicleAvailability = async (id: string): Promise<Vehicle> => {
  const response = await api.patch<Vehicle>(`/vehicles/${id}/availability`);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
