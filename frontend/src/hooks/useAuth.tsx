"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/auth";
import { setAccessToken } from "@/lib/api";
import * as authService from "@/services/auth.service";

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
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      await fetchUser();
    };
    loadUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.accessToken ?? null);
    await fetchUser();
  };

  const register = async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Server may be down — clear client state anyway
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        fetchUser,
      }}
    >
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
