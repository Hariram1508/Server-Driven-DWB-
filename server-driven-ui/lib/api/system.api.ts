import apiClient from "./client";
import { SystemPerformanceMetrics } from "../types/settings.types";

export const getSystemPerformance =
  async (): Promise<SystemPerformanceMetrics> => {
    const response = await apiClient.get("/system/performance");
    return response.data.data;
  };
