import { apiClient } from "./client";
import type { AdminOrder, OrderPayload, OrderResponse, OrderStatus } from "../types";

export const ordersApi = {
  async create(payload: OrderPayload) {
    const response = await apiClient.post<OrderResponse>("/orders", {
      ...payload.customer,
      language: payload.language,
      paymentMethod: payload.paymentMethod,
      items: payload.items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    });
    return response.data;
  },

  async getAll() {
    const response = await apiClient.get<AdminOrder[]>("/admin/orders");
    return response.data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const response = await apiClient.patch<AdminOrder>(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/admin/orders/${id}`);
  },
};
