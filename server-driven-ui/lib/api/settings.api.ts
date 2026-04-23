import apiClient from "./client";
import {
  InstitutionSettingsResponse,
  PublicSettingsResponse,
  SiteSettings,
} from "../types/settings.types";

export const getSiteSettings =
  async (): Promise<InstitutionSettingsResponse> => {
    const response = await apiClient.get("/settings");
    return response.data.data;
  };

export const updateSiteSettings = async (
  settings: Partial<SiteSettings>,
): Promise<InstitutionSettingsResponse> => {
  const response = await apiClient.put("/settings", { settings });
  return response.data.data;
};

export const getPublicSiteSettings = async (
  institutionId: string,
): Promise<PublicSettingsResponse> => {
  const response = await apiClient.get(
    `/public/settings?institutionId=${institutionId}`,
  );
  return response.data.data;
};
