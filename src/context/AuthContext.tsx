"use client"

import api from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function loadUser(){
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
        const res = await api.get("/api/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Load /api/me error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}