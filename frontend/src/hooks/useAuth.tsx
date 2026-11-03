"use client";

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { setAccessToken, getAccessToken } from "@/lib/api";
import * as authService from "@/services/auth.service";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    // During SSR we don't know yet; start loading.
    if (typeof window === "undefined") return true;
    // No token → nothing to load → not loading.
    // Has token → we'll load the profile → loading.
    return !!localStorage.getItem("rentox_access_token");
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAccessToken());

  const fetchUser = useCallback(async () => {
    try {
      const { user } = await authService.getProfile();
      setUser(user);
    } catch (err) {
      setUser(null);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Only fetch the profile if we already have a stored access token.
    // Otherwise (fresh visit, logged out) skip the call entirely so we
    // never trigger an unnecessary 401 / redirect loop on the login page.
    const hasToken =
      typeof window !== "undefined" &&
      localStorage.getItem("rentox_access_token");

    if (!hasToken) {
      // isLoading already initialized to false above; nothing to do.
      return;
    }

    authService.getProfile()
      .then(({ user }) => { if (!cancelled) { setUser(user); } })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        // The token itself is the source of truth for authentication.
        // A profile-fetch failure (network, CORS, 500) must NOT kick the
        // user out — only a 401 means the token is truly invalid.
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setAccessToken(null);
          setIsAuthenticated(false);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.accessToken ?? null);
    setIsAuthenticated(!!data.accessToken);
    // Login succeeded — we have a valid access token. Try to load the
    // profile, but never let a profile-fetch failure undo authentication.
    try {
      await fetchUser();
    } catch {
      /* profile fetch failed; user is still authenticated */
    }
  }, [fetchUser, setIsAuthenticated]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password });
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* server may be down */ }
    finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
  }), [user, isLoading, isAuthenticated, login, register, logout, fetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
