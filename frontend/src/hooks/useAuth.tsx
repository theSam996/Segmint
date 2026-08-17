"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Workspace, AuthState } from "@/types/auth";

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  signup: (fullName: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  createWorkspace: (name: string, industry: string) => void;
}

const DEFAULT_USER: User = {
  id: "usr-01",
  email: "alex.morgan@retailco.com",
  fullName: "Alex Morgan",
  role: "owner",
  createdAt: "2024-01-15T00:00:00Z",
};

const DEFAULT_WORKSPACE: Workspace = {
  id: "ws-01",
  name: "RetailCo Analytics",
  industry: "ecommerce",
  createdAt: "2024-01-15T00:00:00Z",
  membersCount: 4,
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [workspace, setWorkspace] = useState<Workspace | null>(DEFAULT_WORKSPACE);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _pass: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setUser({
      id: "usr-01",
      email,
      fullName: email.split("@")[0] || "User",
      role: "owner",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setUser({
      id: "usr-google",
      email: "google.user@company.com",
      fullName: "Google Demo User",
      role: "owner",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
  };

  const signup = async (fullName: string, email: string, _pass: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setUser({
      id: `usr-${Date.now()}`,
      email,
      fullName,
      role: "owner",
      createdAt: new Date().toISOString(),
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setWorkspace(null);
  };

  const createWorkspace = (name: string, industry: string) => {
    setWorkspace({
      id: `ws-${Date.now()}`,
      name,
      industry,
      createdAt: new Date().toISOString(),
      membersCount: 1,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
        createWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if not inside provider
    return {
      user: DEFAULT_USER,
      workspace: DEFAULT_WORKSPACE,
      isAuthenticated: true,
      isLoading: false,
      login: async () => true,
      loginWithGoogle: async () => {},
      signup: async () => true,
      logout: () => {},
      createWorkspace: () => {},
    };
  }
  return context;
}
