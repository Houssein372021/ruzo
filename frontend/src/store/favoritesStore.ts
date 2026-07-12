import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FavoriteItem } from "../types";

type FavoritesState = {
  items: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  removeFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (item) =>
        set((state) => {
          const exists = state.items.some((favorite) => favorite.slug === item.slug);
          return {
            items: exists
              ? state.items.filter((favorite) => favorite.slug !== item.slug)
              : [...state.items, item],
          };
        }),
      removeFavorite: (slug) =>
        set((state) => ({ items: state.items.filter((item) => item.slug !== slug) })),
      isFavorite: (slug) => get().items.some((item) => item.slug === slug),
    }),
    { name: "ruzo-favorites" },
  ),
);
