import apiClient from "./client";
import { Media, MediaFolder, MediaUsage } from "../types/media.types";

export const uploadMedia = async (
  file: File,
  options?: {
    folderPath?: string;
    tags?: string[];
    category?: string;
    altText?: string;
  },
): Promise<Media> => {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.folderPath) formData.append("folderPath", options.folderPath);
  if (options?.category) formData.append("category", options.category);
  if (options?.altText) formData.append("altText", options.altText);
  if (options?.tags?.length)
    formData.append("tags", JSON.stringify(options.tags));

  const response = await apiClient.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const getAllMedia = async (
  params?: Record<string, string | number | undefined>,
): Promise<Media[]> => {
  const response = await apiClient.get("/media", { params });
  return response.data.data;
};

export const updateMediaMetadata = async (
  id: string,
  payload: {
    tags?: string[];
    category?: string;
    altText?: string;
    folderPath?: string;
  },
): Promise<Media> => {
  const response = await apiClient.patch(`/media/${id}`, payload);
  return response.data.data;
};

export const getMediaUsage = async (id: string): Promise<MediaUsage[]> => {
  const response = await apiClient.get(`/media/${id}/usage`);
  return response.data.data;
};

export const getMediaUsageAnalytics = async () => {
  const response = await apiClient.get("/media/analytics/usage");
  return response.data.data;
};

export const listMediaFolders = async (): Promise<MediaFolder[]> => {
  const response = await apiClient.get("/media/folders");
  return response.data.data;
};

export const createMediaFolder = async (payload: {
  name: string;
  parentPath?: string;
}): Promise<MediaFolder> => {
  const response = await apiClient.post("/media/folders", payload);
  return response.data.data;
};

export const renameMediaFolder = async (
  id: string,
  payload: { name?: string; parentPath?: string },
): Promise<MediaFolder> => {
  const response = await apiClient.patch(`/media/folders/${id}`, payload);
  return response.data.data;
};

export const deleteMediaFolder = async (id: string): Promise<void> => {
  await apiClient.delete(`/media/folders/${id}`);
};

export const bulkMediaOperation = async (payload: {
  action:
    | "compress"
    | "move"
    | "tag"
    | "categorize"
    | "delete"
    | "download-zip";
  mediaIds: string[];
  folderPath?: string;
  tags?: string[];
  category?: string;
  forceDelete?: boolean;
}) => {
  if (payload.action === "download-zip") {
    const response = await apiClient.post("/media/bulk", payload, {
      responseType: "blob",
    });
    return response.data;
  }

  const response = await apiClient.post("/media/bulk", payload);
  return response.data.data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await apiClient.delete(`/media/${id}`);
};
