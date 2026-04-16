import axios from "axios";

const publicClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

export const getPublishedPages = async (
  institutionId?: string,
): Promise<any[]> => {
  const response = await publicClient.get("/public/pages", {
    params: institutionId ? { institutionId } : undefined,
    headers: institutionId ? { "x-institution-id": institutionId } : undefined,
  });
  return response.data.data;
};

export const getPublishedPageBySlug = async (
  slug: string,
  institutionId?: string,
): Promise<any> => {
  const response = await publicClient.get(`/public/pages/${slug}`, {
    params: institutionId ? { institutionId } : undefined,
    headers: institutionId ? { "x-institution-id": institutionId } : undefined,
  });
  return response.data.data;
};
