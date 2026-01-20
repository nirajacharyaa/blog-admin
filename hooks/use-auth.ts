"use client";

import { AuthFormValues } from "@/schema/auth";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const {
    user,
    isLoading,
    isInitialized,
    setUser,
    setLoading,
    logout: clearAuth,
  } = useAuthStore();
  const router = useRouter();

  const login = async (data: AuthFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      const meResponse = await fetch(`/api/auth/me`);
      if (meResponse.ok) {
        const userData = await meResponse.json();
        setUser(userData);
        toast.success("login successful!!");
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: AuthFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "signup error!");
      }

      const meResponse = await fetch(`/api/auth/me`);
      if (meResponse.ok) {
        const userData = await meResponse.json();
        setUser(userData);
        toast.success("account created successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "signup error!";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`/api/auth/logout`, {
        method: "POST",
      });

      clearAuth();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("logout failed!!");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initializeAuth = async () => {
    try {
      const response = await fetch(`/api/auth/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("failed to initialize auth:", error);
    }
  };

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    initializeAuth,
  };
}
