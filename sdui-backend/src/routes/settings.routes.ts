import { Router } from "express";
import { body } from "express-validator";
import settingsController from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);

router.put(
  "/",
  authenticate,
  authorize("super-admin", "admin"),
  validate([
    body("settings")
      .optional()
      .isObject()
      .withMessage("settings must be an object"),
    body("settings.analytics.googleAnalyticsId")
      .optional()
      .isString()
      .withMessage("Google Analytics ID must be a string"),
    body("settings.email.smtpPort")
      .optional()
      .isInt({ min: 1, max: 65535 })
      .withMessage("SMTP port must be between 1 and 65535"),
    body("settings.email.notificationsEnabled")
      .optional()
      .isBoolean()
      .withMessage("notificationsEnabled must be boolean"),
    body("settings.customDomain.sslEnabled")
      .optional()
      .isBoolean()
      .withMessage("sslEnabled must be boolean"),
    body("settings.customDomain.sslAutoRenew")
      .optional()
      .isBoolean()
      .withMessage("sslAutoRenew must be boolean"),
  ]),
  settingsController.updateSettings,
);

export default router;
