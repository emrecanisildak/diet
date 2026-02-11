"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import React from "react";
import { users, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userData = await users.me();
      setUser(userData);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.href = "/login";
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, logout, refetch: fetchUser } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
