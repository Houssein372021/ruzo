import { apiClient } from "./client";
import type { AdminReview, Review, ReviewInvitation, ReviewPayload, ReviewStatus } from "../types";

export const reviewsApi = {
  async getForProduct(productId: string) {
    const response = await apiClient.get<Review[]>(`/products/${productId}/reviews`);
    return response.data;
  },

  async getInvitation(token: string) {
    const response = await apiClient.get<ReviewInvitation>(`/reviews/token/${token}`);
    return response.data;
  },

  async createVerified(token: string, payload: ReviewPayload) {
    const response = await apiClient.post<Review>(`/reviews/token/${token}`, payload);
    return response.data;
  },

  async getAdminReviews() {
    const response = await apiClient.get<AdminReview[]>("/admin/reviews");
    return response.data;
  },

  async updateStatus(id: string, status: ReviewStatus) {
    const response = await apiClient.patch<AdminReview>(`/admin/reviews/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/admin/reviews/${id}`);
  },
};
