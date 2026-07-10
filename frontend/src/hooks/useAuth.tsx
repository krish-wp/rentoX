"use client";

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { setAccessToken } from "@/lib/api";
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
  const [isLoading, setIsLoading] = useState(true);

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
    authService.getProfile()
      .then(({ user }) => { if (!cancelled) setUser(user); })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setAccessToken(null);
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.accessToken ?? null);
    try {
      await fetchUser();
    } catch {
      setAccessToken(null);
      throw new Error("Login succeeded but failed to load profile. Please try again.");
    }
  }, [fetchUser]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password });
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* server may be down */ }
    finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
  }), [user, isLoading, login, register, logout, fetchUser]);

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
