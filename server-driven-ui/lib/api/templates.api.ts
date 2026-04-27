import apiClient from "./client";

export interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  jsonConfig: any;
  isPublic: boolean;
  isCustom?: boolean;
  tags?: string[];
  createdBy?: string;
  viewCount: number;
  shareCount: number;
  ratingScore: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRating {
  _id: string;
  templateId: string;
  userId: string;
  rating: number;
  review: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateShare {
  _id: string;
  templateId: string;
  ownerId: string;
  sharedWith: string[];
  uniqueShareCode: string;
  accessLevel: 'view' | 'use' | 'edit';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAnalytics {
  _id: string;
  templateId: string;
  date: string;
  views: number;
  uses: number;
  shares: number;
  averageRating: number;
  saveCount: number;
  duplicateCount: number;
  performanceMetrics?: {
    avgLoadTime: number;
    avgRenderTime: number;
  };
}

// Get all templates
export const getAllTemplates = async (category?: string): Promise<Template[]> => {
  const params = category ? { category } : {};
  const response = await apiClient.get("/templates", { params });
  return response.data.data;
};

// Get template by ID
export const getTemplate = async (id: string): Promise<Template> => {
  const response = await apiClient.get(`/templates/${id}`);
  return response.data.data;
};

// Get user's custom templates
export const getUserTemplates = async (): Promise<Template[]> => {
  const response = await apiClient.get("/templates/my-templates");
  return response.data.data;
};

// Create template
export const createTemplate = async (data: {
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  jsonConfig: any;
  isPublic: boolean;
  tags?: string[];
  isCustom?: boolean;
}): Promise<Template> => {
  const response = await apiClient.post("/templates", data);
  return response.data.data;
};

// Update template
export const updateTemplate = async (
  id: string,
  data: Partial<Template>
): Promise<Template> => {
  const response = await apiClient.put(`/templates/${id}`, data);
  return response.data.data;
};

// Delete template
export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/templates/${id}`);
};

// Duplicate template
export const duplicateTemplate = async (
  id: string,
  name?: string
): Promise<Template> => {
  const response = await apiClient.post(`/templates/${id}/duplicate`, { name });
  return response.data.data;
};

// Apply template
export const applyTemplate = async (id: string): Promise<any> => {
  const response = await apiClient.post(`/templates/${id}/apply`);
  return response.data.data;
};

// Rate template
export const rateTemplate = async (
  id: string,
  rating: number,
  review?: string
): Promise<TemplateRating> => {
  const response = await apiClient.post(`/templates/${id}/rate`, {
    rating,
    review,
  });
  return response.data.data;
};

// Get template ratings
export const getTemplateRatings = async (id: string): Promise<TemplateRating[]> => {
  const response = await apiClient.get(`/templates/${id}/ratings`);
  return response.data.data;
};

// Share template
export const shareTemplate = async (
  id: string,
  sharedWith: string[],
  accessLevel: 'view' | 'use' | 'edit',
  expiresAt?: string
): Promise<TemplateShare> => {
  const response = await apiClient.post(`/templates/${id}/share`, {
    sharedWith,
    accessLevel,
    expiresAt,
  });
  return response.data.data;
};

// Get template shares
export const getTemplateShares = async (id: string): Promise<TemplateShare[]> => {
  const response = await apiClient.get(`/templates/${id}/shares`);
  return response.data.data;
};

// Get shared template by code
export const getSharedTemplate = async (shareCode: string): Promise<Template> => {
  const response = await apiClient.get(`/templates/share/${shareCode}`);
  return response.data.data;
};

// Get template analytics
export const getTemplateAnalytics = async (
  id: string,
  days?: number
): Promise<TemplateAnalytics[]> => {
  const params = days ? { days } : {};
  const response = await apiClient.get(`/templates/${id}/analytics`, { params });
  return response.data.data;
};

// Get trending templates
export const getTrendingTemplates = async (limit?: number): Promise<Template[]> => {
  const params = limit ? { limit } : {};
  const response = await apiClient.get("/templates/trending", { params });
  return response.data.data;
};

// Get top-rated templates
export const getTopRatedTemplates = async (limit?: number): Promise<Template[]> => {
  const params = limit ? { limit } : {};
  const response = await apiClient.get("/templates/top-rated", { params });
  return response.data.data;
};

// Search templates
export const searchTemplates = async (query: string): Promise<Template[]> => {
  const response = await apiClient.get("/templates/search", { params: { q: query } });
  return response.data.data;
};
