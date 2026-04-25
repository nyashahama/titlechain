"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  active: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch("/api/pilot/me", { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  async function signIn(email: string, password: string) {
    const res = await fetch("/api/pilot/auth/sign-in", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Invalid email or password");
    }
    const user = await res.json();
    setUser(user);
  }

  function signOut() {
    fetch("/api/pilot/auth/sign-out", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
