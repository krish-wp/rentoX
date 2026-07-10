import axios from "axios";

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: string[];
    };
  };
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const details = err.response?.data?.details;
    if (Array.isArray(details) && details.length) return details.join(", ");
    if (err.response?.data?.message) return err.response.data.message;
  }
  return fallback;
}
