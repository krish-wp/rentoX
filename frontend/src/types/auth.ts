export interface User {
  id: string;
  userName: string;
  email: string;
  mobileNumber?: string;
  state?: string;
  district?: string;
  pincode?: string;
  isProfileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
}
