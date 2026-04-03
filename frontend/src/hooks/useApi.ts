import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

const API_BASE_URL = "http://localhost:3001";

export function useApi() {
  const { user } = useAuth();

  const call = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await user?.getIdToken();
    const headers = {
      ...options.headers,
    } as any;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Set JSON by default if not multi-part
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Something went wrong");
    }

    return res.json();
  }, [user]);

  return { call };
}
