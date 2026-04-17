import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { sendError, sendSuccess } from "../utils/response.util";
import { FormSubmission } from "../models/FormSubmission.model";
import logger from "../utils/logger.util";
import nodemailer from "nodemailer";

type FormType = "contact" | "inquiry" | "feedback";

const buildTextBody = (
  formType: FormType,
  subject: string,
  pageUrl: string | undefined,
  fields: Record<string, string>,
): string => {
  const lines = [
    `Form Type: ${formType}`,
    `Subject: ${subject}`,
    pageUrl ? `Page URL: ${pageUrl}` : "",
    "",
    "Submitted Fields:",
  ].filter(Boolean);

  Object.entries(fields).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });

  return lines.join("\n");
};

const sendViaResendIfConfigured = async (
  toEmail: string,
  subject: string,
  textBody: string,
): Promise<{ delivered: boolean; reason?: string }> => {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESENT_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || process.env.RESENT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return {
      delivered: false,
      reason: "Resend provider is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text: textBody,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend delivery failed: ${response.status} ${errorText}`);
  }

  return { delivered: true };
};

const sendViaSmtpIfConfigured = async (
  toEmail: string,
  subject: string,
  textBody: string,
): Promise<{ delivered: boolean; reason?: string }> => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number.parseInt(
    process.env.SMTP_PORT || process.env.MAIL_PORT || "587",
    10,
  );
  const user =
    process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER;
  const pass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.MAIL_PASS ||
    process.env.MAIL_PASSWORD;
  const fromEmail =
    process.env.SMTP_FROM_EMAIL || process.env.MAIL_FROM || user;
  const service = process.env.SMTP_SERVICE || process.env.MAIL_SERVICE;

  if (!host || !user || !pass || !fromEmail) {
    return {
      delivered: false,
      reason: "SMTP provider is not configured.",
    };
  }

  const transporter = nodemailer.createTransport(
    service
      ? {
          service,
          auth: {
            user,
            pass,
          },
        }
      : {
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        },
  );

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    text: textBody,
  });

  return { delivered: true };
};

class FormController {
  testEmailDelivery = asyncHandler(async (req: Request, res: Response) => {
    const recipientEmail = (req.body.recipientEmail as string).trim();
    const subject = (
      (req.body.subject as string) || "Form delivery test"
    ).trim();

    let deliveryResult: {
      delivered: boolean;
      reason?: string;
      provider?: string;
    } = {
      delivered: false,
    };

    try {
      const testBody = [
        "This is a test email from SDUI form delivery checker.",
        `Recipient: ${recipientEmail}`,
        `Timestamp: ${new Date().toISOString()}`,
      ].join("\n");

      const resendResult = await sendViaResendIfConfigured(
        recipientEmail,
        subject,
        testBody,
      );

      if (resendResult.delivered) {
        deliveryResult = { ...resendResult, provider: "resend" };
      } else {
        const smtpResult = await sendViaSmtpIfConfigured(
          recipientEmail,
          subject,
          testBody,
        );

        if (smtpResult.delivered) {
          deliveryResult = { ...smtpResult, provider: "smtp" };
        } else {
          deliveryResult = {
            delivered: false,
            reason: `${resendResult.reason} ${smtpResult.reason}`.trim(),
            provider: "none",
          };
        }
      }
    } catch (error) {
      logger.error("Email test delivery failed", error);
      return sendError(
        res,
        error instanceof Error ? error.message : "Email test failed",
        502,
        "EMAIL_TEST_FAILED",
      );
    }

    if (!deliveryResult.delivered) {
      return sendSuccess(
        res,
        {
          delivered: false,
          provider: "none",
          reason: "Email service is not configured in backend .env.",
        },
        "Email test completed: delivery skipped because provider is not configured.",
      );
    }

    return sendSuccess(
      res,
      {
        delivered: true,
        provider: deliveryResult.provider || "unknown",
      },
      `Test email sent successfully via ${deliveryResult.provider || "provider"}`,
    );
  });

  submitPublicForm = asyncHandler(async (req: Request, res: Response) => {
    const formType = req.body.formType as FormType;
    const recipientEmail = (req.body.recipientEmail as string).trim();
    const subject = (req.body.subject as string).trim();
    const pageUrl = (req.body.pageUrl as string | undefined)?.trim();
    const incomingFields = req.body.fields as Record<string, unknown>;

    const fields = Object.entries(incomingFields || {}).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      const safeKey = key.trim();
      if (!safeKey) {
        return acc;
      }

      acc[safeKey] = value == null ? "" : String(value).trim();
      return acc;
    }, {});

    if (Object.keys(fields).length === 0) {
      return sendError(
        res,
        "At least one form field is required",
        400,
        "INVALID_FIELDS",
      );
    }

    if (!/^\d{10}$/.test(fields.phone || "")) {
      return sendError(
        res,
        "Phone number must be exactly 10 digits",
        400,
        "INVALID_PHONE",
      );
    }

    const submission = await FormSubmission.create({
      formType,
      recipientEmail,
      subject,
      pageUrl,
      fields,
    });

    const textBody = buildTextBody(formType, subject, pageUrl, fields);

    let deliveryResult: {
      delivered: boolean;
      reason?: string;
      provider?: string;
    } = {
      delivered: false,
    };

    try {
      const resendResult = await sendViaResendIfConfigured(
        recipientEmail,
        subject,
        textBody,
      );

      if (resendResult.delivered) {
        deliveryResult = { ...resendResult, provider: "resend" };
      } else {
        const smtpResult = await sendViaSmtpIfConfigured(
          recipientEmail,
          subject,
          textBody,
        );

        if (smtpResult.delivered) {
          deliveryResult = { ...smtpResult, provider: "smtp" };
        } else {
          deliveryResult = {
            delivered: false,
            reason: `${resendResult.reason} ${smtpResult.reason}`,
            provider: "none",
          };
        }
      }
    } catch (emailError) {
      logger.error("Form email forwarding failed", emailError);
      return sendError(
        res,
        emailError instanceof Error
          ? emailError.message
          : "Email delivery failed. Please try again.",
        502,
        "EMAIL_DELIVERY_FAILED",
        {
          submissionId: submission._id,
        },
      );
    }

    if (!deliveryResult.delivered && deliveryResult.reason) {
      logger.warn("Form submitted but email delivery skipped", {
        reason: deliveryResult.reason,
        formType,
        recipientEmail,
        submissionId: submission._id,
      });
    }

    logger.info("Public form submitted", {
      formType,
      recipientEmail,
      submissionId: submission._id,
      pageUrl,
    });

    return sendSuccess(
      res,
      {
        id: submission._id,
        emailDelivered: deliveryResult.delivered,
        emailProvider: deliveryResult.provider || "none",
      },
      deliveryResult.delivered
        ? "Form submitted successfully"
        : "Form submitted successfully. Email delivery is currently disabled.",
      201,
    );
  });
}

export default new FormController();
