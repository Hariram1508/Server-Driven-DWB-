import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { sendSuccess } from "../utils/response.util";
import { getMetricsSnapshot } from "../utils/metrics.util";

class SystemController {
  getPerformanceMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const snapshot = getMetricsSnapshot();
    return sendSuccess(res, snapshot);
  });
}

export default new SystemController();
