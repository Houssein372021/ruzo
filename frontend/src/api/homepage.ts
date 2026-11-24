import { apiClient } from "./client";
import type { HomepageSettings } from "../types";

export const homepageApi = {
  async getSettings() {
    const response = await apiClient.get<HomepageSettings>("/homepage");
    return response.data;
  },
};
