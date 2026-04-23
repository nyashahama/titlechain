"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  display_name: string;
  firm_name: string;
  role: "owner" | "member";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
};

type SignUpData = {
  email: string;
  password: string;
  display_name: string;
  firm_name: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS_KEY = "titlechain_mock_users";
const MOCK_SESSION_KEY = "titlechain_mock_session";

function getStoredUsers(): Record<string, { password: string; user: User }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function storeUsers(users: Record<string, { password: string; user: User }>) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(user: User | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
}

function seedDemoUser() {
  if (typeof window === "undefined") return;
  const users = getStoredUsers();
  if (Object.keys(users).length === 0) {
    const demoUser: User = {
      id: "usr_demo_001",
      email: "demo@titlechain.co.za",
      display_name: "Nyasha Hama",
      firm_name: "Hama & Associates Inc",
      role: "owner",
    };
    users["demo@titlechain.co.za"] = { password: "demo1234", user: demoUser };
    storeUsers(users);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    seedDemoUser();
    const session = getSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStoredUsers();
    const record = users[email.toLowerCase()];
    if (!record || record.password !== password) {
      throw new Error("Invalid email or password");
    }
    setUser(record.user);
    setSession(record.user);
  }

  async function signUp(data: SignUpData) {
    await new Promise((r) => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users[data.email.toLowerCase()]) {
      throw new Error("An account with this email already exists");
    }
    const user: User = {
      id: `usr_${Date.now()}`,
      email: data.email.toLowerCase(),
      display_name: data.display_name,
      firm_name: data.firm_name,
      role: "owner",
    };
    users[data.email.toLowerCase()] = { password: data.password, user };
    storeUsers(users);
    setUser(user);
    setSession(user);
  }

  function signOut() {
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
