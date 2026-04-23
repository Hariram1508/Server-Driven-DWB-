import { Router } from "express";
import systemController from "../controllers/system.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

router.get(
  "/performance",
  authenticate,
  authorize("super-admin", "admin"),
  systemController.getPerformanceMetrics,
);

export default router;
