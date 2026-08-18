"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, browserPopupRedirectResolver } from "@/lib/firebase";
import { User, Workspace, AuthState } from "@/types/auth";

export interface AuthContextType extends AuthState {
  firebaseUser: FirebaseUser | null;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (fullName: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (fullName: string, email?: string) => Promise<boolean>;
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

// Friendly message translator for Firebase auth errors
export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || "";
  const msg = error?.message || "";

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please check or sign up.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups for this site.";
    case "auth/unauthorized-domain":
      return "Domain not authorized in Firebase. Ensure localhost is in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
      return "This provider is not enabled in Firebase Console. Enable it under Authentication > Sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      if (msg.includes("Database is closing") || msg.includes("closing/hidden") || msg.includes("IndexedDB")) {
        return "Browser storage was busy. Please try signing in again.";
      }
      return msg || "Authentication error occurred. Please try again.";
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapFirebaseUserToUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    fullName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    avatarUrl: fbUser.photoURL || undefined,
    role: "owner",
    createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(DEFAULT_WORKSPACE);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const mapped = mapFirebaseUserToUser(fbUser);
        setUser(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
        }
      } else {
        const stored = typeof window !== "undefined" ? localStorage.getItem("segmentiq_user") : null;
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setFirebaseUser(res.user);
      const mapped = mapFirebaseUserToUser(res.user);
      setUser(mapped);
      if (typeof window !== "undefined") {
        localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
      }
      return true;
    } catch (error: any) {
      throw new Error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      const res = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      setFirebaseUser(res.user);
      const mapped = mapFirebaseUserToUser(res.user);
      setUser(mapped);
      if (typeof window !== "undefined") {
        localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
      }
      return true;
    } catch (error: any) {
      throw new Error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (fullName.trim()) {
        try {
          await updateProfile(res.user, { displayName: fullName.trim() });
        } catch {
          // ignore
        }
      }
      setFirebaseUser(res.user);
      const mapped = {
        ...mapFirebaseUserToUser(res.user),
        fullName: fullName.trim() || res.user.email?.split("@")[0] || "User",
      };
      setUser(mapped);
      if (typeof window !== "undefined") {
        localStorage.setItem("segmentiq_user", JSON.stringify(mapped));
      }
      return true;
    } catch (error: any) {
      throw new Error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (fullName: string, newEmail?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (auth.currentUser && fullName.trim()) {
        await updateProfile(auth.currentUser, { displayName: fullName.trim() });
      }
      const updatedUser: User = {
        ...(user || {
          id: auth.currentUser?.uid || "usr-01",
          role: "owner",
          createdAt: new Date().toISOString(),
        }),
        fullName: fullName.trim(),
        email: newEmail?.trim() || user?.email || auth.currentUser?.email || "",
      };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("segmentiq_user", JSON.stringify(updatedUser));
      }
      return true;
    } catch (error: any) {
      throw new Error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error: any) {
      throw new Error(formatFirebaseAuthError(error));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("segmentiq_user");
    }
    setFirebaseUser(null);
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
        firebaseUser,
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        resetPassword,
        updateUserProfile,
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
