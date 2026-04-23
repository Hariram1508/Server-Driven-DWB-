import { NextFunction, Request, Response } from "express";
import { recordRequestMetric } from "../utils/metrics.util";

const normalizeRoute = (req: Request): string => {
  const routePath = req.route?.path;
  if (typeof routePath === "string") {
    return `${req.baseUrl || ""}${routePath}`;
  }
  return req.path;
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    if (req.path.startsWith("/health")) {
      return;
    }

    recordRequestMetric({
      ts: Date.now(),
      durationMs,
      statusCode: res.statusCode,
      route: normalizeRoute(req),
      method: req.method,
    });
  });

  next();
};
