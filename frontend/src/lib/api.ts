import axios from "axios";

const api = axios.create({
  baseURL:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "") + "/api/v1"
      : "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("rentox_access_token", token);
    } else {
      localStorage.removeItem("rentox_access_token");
    }
  }
};

export const getAccessToken = () => {
  return accessToken;
};

// Restore token from localStorage on module load
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("rentox_access_token");
  if (stored) {
    accessToken = stored;
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/me",
];

const PROTECTED_PATHS = ["/vehicles", "/bookings", "/me"];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Please complete your profile first"
    ) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/me/edit") &&
        isProtectedPath(window.location.pathname)
      ) {
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
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth/") &&
          isProtectedPath(window.location.pathname)
        ) {
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
