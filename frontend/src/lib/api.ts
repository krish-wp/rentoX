import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const PUBLIC_AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/verify-otp"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Please complete your profile first"
    ) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/me/edit")) {
        window.location.href = "/me/edit";
      }
      return Promise.reject(error);
    }

    if (!(error.response?.status === 401 && !originalRequest._retry)) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    const isPublicEndpoint = PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
      requestUrl.startsWith(endpoint) || requestUrl.endsWith(endpoint),
    );

    if (isPublicEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (refreshPromise) {
      try {
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    refreshPromise = (async () => {
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      } catch {
        setAccessToken(null);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
          window.location.href = "/auth/login";
        }
        throw new Error("Token refresh failed");
      } finally {
        refreshPromise = null;
      }
    })();

    try {
      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default api;
