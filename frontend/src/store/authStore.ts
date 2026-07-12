import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken } from "../api/client";

type AuthState = {
  token?: string;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: undefined,
      setToken: (token) => {
        setAuthToken(token);
        set({ token });
      },
      logout: () => {
        setAuthToken(undefined);
        set({ token: undefined });
      },
    }),
    {
      name: "ruzo-admin-auth",
      onRehydrateStorage: () => (state) => {
        setAuthToken(state?.token);
      },
    },
  ),
);
