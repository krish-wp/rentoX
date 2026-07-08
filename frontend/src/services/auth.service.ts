import api from '@/lib/api';
import type {
  RegisterRequest,
  LoginRequest,
  OtpRequest,
  AuthResponse,
  User,
} from '@/types/auth';

export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const verifyOtp = async (data: OtpRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/verify-otp', data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const getProfile = async (): Promise<{ user: User }> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data;
};

export const logout = async (): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/logout');
  return response.data;
};
