import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerInfo } from "../types";

type CheckoutState = {
  customer?: CustomerInfo;
  setCustomer: (customer: CustomerInfo) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customer: undefined,
      setCustomer: (customer) => set({ customer }),
    }),
    { name: "ruzo-checkout-customer" },
  ),
);
