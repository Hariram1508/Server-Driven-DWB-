import apiClient from "./client";
import {
  Page,
  CreatePageData,
  UpdatePageData,
  BatchPagePayload,
} from "../types/page.types";

export const getAllPages = async (): Promise<Page[]> => {
  const response = await apiClient.get("/pages");
  return response.data.data;
};

export const getPage = async (id: string): Promise<Page> => {
  const response = await apiClient.get(`/pages/${id}`);
  return response.data.data;
};

export const createPage = async (data: CreatePageData): Promise<Page> => {
  const response = await apiClient.post("/pages", data);
  return response.data.data;
};

export const updatePage = async (
  id: string,
  data: UpdatePageData,
): Promise<Page> => {
  const response = await apiClient.put(`/pages/${id}`, data);
  return response.data.data;
};

export const publishPage = async (id: string): Promise<Page> => {
  const response = await apiClient.post(`/pages/${id}/publish`);
  return response.data.data;
};

export const unpublishPage = async (id: string): Promise<Page> => {
  const response = await apiClient.post(`/pages/${id}/unpublish`);
  return response.data.data;
};

export const deletePage = async (id: string): Promise<void> => {
  await apiClient.delete(`/pages/${id}`);
};

export const duplicatePage = async (
  id: string,
  name: string,
  slug: string,
): Promise<Page> => {
  const response = await apiClient.post(`/pages/${id}/duplicate`, {
    name,
    slug,
  });
  return response.data.data;
};

export const schedulePage = async (
  id: string,
  payload: { publishAt?: string | null; unpublishAt?: string | null },
): Promise<{ page: Page; scheduleSummary: string }> => {
  const response = await apiClient.post(`/pages/${id}/schedule`, payload);
  return response.data.data;
};

export const savePageAsTemplate = async (
  id: string,
  payload: {
    name: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  },
) => {
  const response = await apiClient.post(`/pages/${id}/save-template`, payload);
  return response.data.data;
};

export const batchPageOperation = async (payload: BatchPagePayload) => {
  const response = await apiClient.post("/pages/batch", payload);
  return response.data.data;
};

export const getPageBySlug = async (
  slug: string,
  institutionId: string,
): Promise<Page> => {
  const response = await apiClient.get(`/pages/slug/${slug}`, {
    headers: { "x-institution-id": institutionId },
  });
  return response.data.data;
};

export const getPublishedPages = async (
  institutionId?: string,
): Promise<Page[]> => {
  const params = new URLSearchParams();
  if (institutionId && institutionId !== "undefined") {
    params.append("institutionId", institutionId);
  }

  const queryString = params.toString();
  const url = `/public/pages${queryString ? `?${queryString}` : ""}`;

  console.log(`Fetching published pages: ${url}`);
  const response = await apiClient.get(url);
  return response.data.data;
};

export const getPublishedPageBySlug = async (
  slug: string,
  institutionId?: string,
): Promise<Page> => {
  const url = institutionId
    ? `/public/pages/${slug}?institutionId=${institutionId}`
    : `/public/pages/${slug}`;
  const response = await apiClient.get(url);
  return response.data.data;
};
