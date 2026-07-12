import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "lineId" | "quantity">, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => void;
};

function createLineId(item: Omit<CartItem, "lineId" | "quantity">) {
  return [item.id, item.variantId ?? "standard", item.color ?? "color", item.size ?? "size"].join(":");
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const lineId = createLineId(item);
          const existing = state.items.find((cartItem) => cartItem.lineId === lineId);

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.lineId === lineId
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem,
              ),
              isOpen: true,
            };
          }

          return {
            items: [...state.items, { ...item, lineId, quantity }],
            isOpen: true,
          };
        }),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((item) => item.lineId !== lineId),
        })),
      replaceItems: (items) => set({ items }),
      clearCart: () => set({ items: [], isOpen: false }),
    }),
    {
      name: "ruzo-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function selectCartTotals(items: CartItem[]) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { quantity, subtotal };
}
