"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Workspace, AuthState } from "@/types/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface AuthContextType extends AuthState {
  supabaseUser: SupabaseUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (fullName: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createWorkspace: (name: string, industry: string) => void;
}

const DEFAULT_WORKSPACE: Workspace = {
  id: "ws-01",
  name: "RetailCo Analytics",
  industry: "ecommerce",
  createdAt: "2024-01-15T00:00:00Z",
  membersCount: 4,
};

// Friendly message translator for Supabase / Auth errors
export function formatAuthError(error: any): string {
  const msg = error?.message || (typeof error === "string" ? error : "");
  if (msg.includes("Unsupported provider") || msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
    return "Google OAuth provider is not enabled in your Supabase dashboard yet. Please enable Google in Supabase > Authentication > Providers, or use Email / Instant Demo access below.";
  }
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
    return "Invalid email or password. If you haven't created an account yet, please sign up.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please verify your email address before logging in, or check your inbox for the confirmation link.";
  }
  if (msg.includes("User already registered") || msg.includes("already exists")) {
    return "An account with this email already exists. Please sign in.";
  }
  if (msg.includes("Password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("Database is closing") || msg.includes("IndexedDB")) {
    return "Browser storage was busy. Please refresh the page and try again.";
  }
  return msg || "Authentication error occurred. Please check your credentials.";
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUserToUser(sbUser: SupabaseUser): User {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email || "",
    fullName: meta.full_name || meta.name || sbUser.email?.split("@")[0] || "User",
    avatarUrl: meta.avatar_url || meta.picture || undefined,
    role: "owner",
    createdAt: sbUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(DEFAULT_WORKSPACE);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and listen to live Supabase Auth session changes
  useEffect(() => {
    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(mapSupabaseUserToUser(session.user));
      } else {
        // Check local storage for persistent guest/demo session
        const stored = typeof window !== "undefined" ? localStorage.getItem("segmentiq_user") : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setUser(parsed);
          } catch {
            // ignore
          }
        }
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // 2. Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        const mapped = mapSupabaseUserToUser(session.user);
        setUser(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
        }
      } else {
        setSupabaseUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      if (data.user) {
        setSupabaseUser(data.user);
        const mapped = mapSupabaseUserToUser(data.user);
        setUser(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
        }
        return true;
      }
      return true;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }
      return true;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      if (data.user) {
        setSupabaseUser(data.user);
        const mapped = mapSupabaseUserToUser(data.user);
        setUser(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
        }
        return true;
      }
      return true;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/settings` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) {
        throw new Error(formatAuthError(error));
      }
      return true;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("segmentiq_user");
    }
    setSupabaseUser(null);
    setUser(null);
  };

  const createWorkspace = (name: string, industry: string) => {
    const ws: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      industry,
      createdAt: new Date().toISOString(),
      membersCount: 1,
    };
    setWorkspace(ws);
    if (typeof window !== "undefined") {
      localStorage.setItem("segmentiq_workspace", JSON.stringify(ws));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        resetPassword,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
