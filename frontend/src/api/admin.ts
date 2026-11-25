import { apiClient } from "./client";
import type {
  AdminCustomer,
  AdminDashboard,
  AdminLoginResponse,
  Category,
  HeroMedia,
  HeroMediaType,
  HomepageAdminSettings,
  Product,
} from "../types";

export const adminApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post<AdminLoginResponse>("/auth/login", { email, password });
    return response.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async forgotPassword(email: string) {
    await apiClient.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string) {
    await apiClient.post("/auth/reset-password", { token, password });
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

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{
      url: string;
      mediaType: HeroMediaType;
      originalFileName: string;
    }>("/admin/uploads/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async homepageSettings() {
    const response = await apiClient.get<HomepageAdminSettings>("/admin/homepage");
    return response.data;
  },

  async deleteHeroMedia(id: string) {
    await apiClient.delete(`/admin/homepage/media/${id}`);
  },

  async updateHomepageSettings(payload: { discoverUrl: string; activeHeroMediaId?: string }) {
    const response = await apiClient.put<HomepageAdminSettings>("/admin/homepage", payload);
    return response.data;
  },

  async updateSecondaryHero(payload: { discoverUrl: string; activeHeroMediaId?: string; enabled: boolean }) {
    const response = await apiClient.put<HomepageAdminSettings>("/admin/homepage/secondary", payload);
    return response.data;
  },

  async createHeroMedia(payload: {
    mediaType: HeroMediaType;
    mediaUrl: string;
    posterUrl?: string;
    originalFileName?: string;
  }) {
    const response = await apiClient.post<HeroMedia>("/admin/homepage/media", payload);
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

  async updateHomeSections(sections: {
    bestSellers: string[];
    newArrivals: string[];
    discoverCollections: string[];
    featuredPieces: string[];
  }) {
    await apiClient.put("/admin/products/home-sections", sections);
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
