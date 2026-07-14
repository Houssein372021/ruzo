import { apiClient } from "./client";
import type {
  AdminCustomer,
  AdminDashboard,
  AdminLoginResponse,
  Category,
  Product,
} from "../types";

export const adminApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post<AdminLoginResponse>("/auth/login", { email, password });
    return response.data;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>("/admin/uploads/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async dashboard() {
    const response = await apiClient.get<AdminDashboard>("/admin/dashboard");
    return response.data;
  },

  async products() {
    const response = await apiClient.get<Product[]>("/admin/products");
    return response.data;
  },

  async categories() {
    const response = await apiClient.get<Category[]>("/admin/categories");
    return response.data;
  },

  async customers() {
    const response = await apiClient.get<AdminCustomer[]>("/admin/customers");
    return response.data;
  },

  async deleteCustomer(id: string) {
    await apiClient.delete(`/admin/customers/${id}`);
  },

  async createProduct(payload: Record<string, unknown>) {
    const response = await apiClient.post<Product>("/admin/products", payload);
    return response.data;
  },

  async updateProduct(id: string, payload: Record<string, unknown>) {
    const response = await apiClient.put<Product>(`/admin/products/${id}`, payload);
    return response.data;
  },

  async updateFeaturedMenu(productIds: string[]) {
    const response = await apiClient.put<Product[]>("/admin/products/featured-menu", { productIds });
    return response.data;
  },

  async deleteProduct(id: string) {
    await apiClient.delete(`/admin/products/${id}`);
  },

  async createCategory(payload: Record<string, unknown>) {
    const response = await apiClient.post<Category>("/admin/categories", payload);
    return response.data;
  },

  async updateCategory(id: string, payload: Record<string, unknown>) {
    const response = await apiClient.put<Category>(`/admin/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: string) {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};
