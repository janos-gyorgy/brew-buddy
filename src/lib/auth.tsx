import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

export interface AuthUser {
  id: string;
  username: string;
  onboarded: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string, inviteCode: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  markOnboarded: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AuthUser>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    const onUnauthorized = () => setUser(null);
    window.addEventListener("bb:unauthorized", onUnauthorized);
    return () => window.removeEventListener("bb:unauthorized", onUnauthorized);
  }, []);

  const login = async (username: string, password: string) => {
    const u = await api.post<AuthUser>("/auth/login", { username, password });
    setUser(u);
    return u;
  };

  const register = async (username: string, password: string, inviteCode: string) => {
    const u = await api.post<AuthUser>("/auth/register", { username, password, inviteCode });
    setUser(u);
    return u;
  };

  const logout = async () => {
    await api.post("/auth/logout", {});
    setUser(null);
  };

  const markOnboarded = async () => {
    await api.post("/auth/onboarded", {});
    setUser((u) => (u ? { ...u, onboarded: true } : u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, markOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
