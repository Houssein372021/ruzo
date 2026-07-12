import { apiClient } from "./client";
import type { Category } from "../types";

export const categoriesApi = {
  async getAll() {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },
};
