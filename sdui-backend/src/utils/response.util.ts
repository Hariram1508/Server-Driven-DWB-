import { Response } from "express";

interface SuccessResponse {
  success: true;
  data?: any;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200,
): Response => {
  const response: SuccessResponse = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any,
): Response => {
  const normalizedDetails =
    code === "VALIDATION_ERROR" && details && !Array.isArray(details)
      ? typeof details === "string"
        ? [{ field: "general", message: details }]
        : [{ field: "general", message: "Validation failed", details }]
      : details;

  const response: ErrorResponse = {
    success: false,
    error: {
      message,
    },
  };

  if (code) {
    response.error.code = code;
  }

  if (normalizedDetails) {
    response.error.details = normalizedDetails;
  }

  return res.status(statusCode).json(response);
};
