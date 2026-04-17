import apiClient from "./client";

export interface PublicFormSubmitPayload {
  formType: "contact" | "inquiry" | "feedback";
  recipientEmail: string;
  subject: string;
  pageUrl?: string;
  fields: Record<string, string>;
}

export const submitPublicForm = async (
  payload: PublicFormSubmitPayload,
): Promise<{
  id: string;
  emailDelivered?: boolean;
  emailProvider?: string;
  message?: string;
}> => {
  const response = await apiClient.post("/public/forms/submit", payload);
  return {
    ...response.data.data,
    message: response.data.message,
  };
};

export const testPublicEmailDelivery = async (
  recipientEmail: string,
  subject = "Form delivery test",
): Promise<{
  delivered: boolean;
  provider?: string;
  message?: string;
  reason?: string;
}> => {
  const response = await apiClient.post("/public/forms/test-delivery", {
    recipientEmail,
    subject,
  });

  return {
    delivered: !!response.data?.data?.delivered,
    provider: response.data?.data?.provider,
    reason: response.data?.data?.reason,
    message: response.data?.message,
  };
};
