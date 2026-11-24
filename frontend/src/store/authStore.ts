import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, setAuthToken } from "../api/client";

type AuthState = {
  token?: string;
  email?: string;
  setToken: (token: string, email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: undefined,
      setToken: (token, email) => {
        setAuthToken(token);
        set({ token, email });
      },
      logout: () => {
        setAuthToken(undefined);
        set({ token: undefined, email: undefined });
      },
    }),
    {
      name: "ruzo-admin-session",
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token);
      },
    },
  ),
);

apiClient.interceptors.response.use(undefined, (error) => {
  const { token, logout } = useAuthStore.getState();
  if (error.response?.status === 401 && error.config?.url?.startsWith("/admin/")
      && token && error.config?.headers?.get("Authorization") === `Bearer ${token}`) {
    logout();
  }
  return Promise.reject(error);
});
