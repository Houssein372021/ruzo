import { apiClient } from "./client";
import type { Product } from "../types";

export const productsApi = {
  async getAll() {
    const response = await apiClient.get<Product[]>("/products");
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await apiClient.get<Product>(`/products/${slug}`);
    return response.data;
  },
};
