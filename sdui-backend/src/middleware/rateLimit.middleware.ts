import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { sendError } from "../utils/response.util";
import { verifyAccessToken } from "../utils/jwt.util";

const getRateLimitKey = (req: Request): string => {
  const authHeader = req.headers.authorization;
  let userId = "anonymous";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = verifyAccessToken(token);
      userId = decoded.userId;
    } catch {
      userId = "anonymous";
    }
  }

  return `${req.ip}:${userId}`;
};

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: getRateLimitKey,
  message: "Too many requests from this IP, please try again later",
  handler: (_req: Request, res: Response) => {
    sendError(
      res,
      "Too many requests, please try again later",
      429,
      "RATE_LIMIT_EXCEEDED",
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 30 : 5, // More permissive in local dev
  keyGenerator: (req: Request) => req.ip || "unknown-ip",
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later",
  handler: (_req: Request, res: Response) => {
    sendError(
      res,
      "Too many login attempts, please try again after 15 minutes",
      429,
      "AUTH_RATE_LIMIT",
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI command rate limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 AI requests per hour
  keyGenerator: getRateLimitKey,
  message: "AI request limit exceeded",
  handler: (_req: Request, res: Response) => {
    sendError(
      res,
      "AI request limit exceeded, please try again later",
      429,
      "AI_RATE_LIMIT",
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});
