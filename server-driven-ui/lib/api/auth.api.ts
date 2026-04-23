import apiClient from "./client";
import { LoginResponse, RegisterResponse, User } from "../types/auth.types";

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  subdomain: string;
}): Promise<RegisterResponse> => {
  const response = await apiClient.post("/auth/register", data);
  return response.data.data;
};

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data;
};

export const refreshToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const response = await apiClient.post("/auth/refresh", { refreshToken });
  return response.data.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get("/auth/me");
  return response.data.data;
};

export const verifyToken = async (token: string): Promise<User> => {
  const response = await apiClient.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};
