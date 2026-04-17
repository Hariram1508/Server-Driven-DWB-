import apiClient from "./client";

export const processCommand = async (
  command: string,
  context?: any,
): Promise<any> => {
  const response = await apiClient.post("/ai/command", { command, context });
  return response.data;
};

export const generateContent = async (
  type: string,
  params: any,
): Promise<any> => {
  const response = await apiClient.post("/ai/generate-content", {
    type,
    params,
  });
  return response.data;
};

export const getSuggestions = async (pageJSON: any): Promise<any> => {
  const response = await apiClient.post("/ai/suggest", { pageJSON });
  return response.data;
};

export const validateDesign = async (pageJSON: any): Promise<any> => {
  const response = await apiClient.post("/ai/validate", { pageJSON });
  return response.data;
};

export const generateComponent = async (prompt: string): Promise<any> => {
  const response = await apiClient.post("/ai/generate-component", { prompt });
  return response.data;
};

export const getCustomComponents = async (): Promise<any> => {
  const response = await apiClient.get("/ai/custom-components");
  return response.data;
};

export const planSite = async (prompt: string): Promise<any> => {
  const response = await apiClient.post("/ai/plan-site", { prompt });
  return response.data;
};

export const generatePageHTML = async (
  prompt: string,
  currentSlug?: string,
  templateType?: string,
): Promise<any> => {
  const response = await apiClient.post("/ai/generate-html", {
    prompt,
    currentSlug,
    templateType,
  });
  return response.data;
};

export const modifyPageHTML = async (
  prompt: string,
  currentHtml: string,
  currentSlug?: string,
): Promise<any> => {
  const response = await apiClient.post("/ai/modify-html", {
    prompt,
    currentHtml,
    currentSlug,
  });
  return response.data;
};

export const chatWithMemory = async (
  message: string,
  threadId?: string,
  model?: string,
): Promise<any> => {
  const response = await apiClient.post("/ai/chat", {
    message,
    threadId,
    model,
  });
  return response.data;
};

export const getConversationHistory = async (): Promise<any> => {
  const response = await apiClient.get("/ai/conversations");
  return response.data;
};

export const getConversationThread = async (threadId: string): Promise<any> => {
  const response = await apiClient.get(`/ai/conversations/${threadId}`);
  return response.data;
};

export const runNlpBenchmark = async (): Promise<any> => {
  const response = await apiClient.post("/ai/benchmark");
  return response.data;
};

export const validateCompliance = async (pageJSON: any): Promise<any> => {
  const response = await apiClient.post("/ai/compliance-validate", {
    pageJSON,
  });
  return response.data;
};

export const getLiveSuggestions = async (pageJSON: any): Promise<any> => {
  const response = await apiClient.post("/ai/suggest-live", { pageJSON });
  return response.data;
};

export const applySuggestion = async (
  pageJSON: any,
  operation: any,
): Promise<any> => {
  const response = await apiClient.post("/ai/apply-suggestion", {
    pageJSON,
    operation,
  });
  return response.data;
};

export const getUsageSummary = async (
  from?: string,
  to?: string,
): Promise<any> => {
  const response = await apiClient.get("/ai/usage-summary", {
    params: {
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  });
  return response.data;
};

export const generateImage = async (
  prompt: string,
  size: "1024x1024" | "1024x1536" | "1536x1024" = "1024x1024",
): Promise<any> => {
  const response = await apiClient.post("/ai/generate-image", { prompt, size });
  return response.data;
};

export const executeJsx = async (jsxCode: string): Promise<any> => {
  const response = await apiClient.post("/ai/execute-jsx", { jsxCode });
  return response.data;
};
