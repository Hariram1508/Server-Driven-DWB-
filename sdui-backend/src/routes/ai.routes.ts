import { Router } from "express";
import { body, param } from "express-validator";
import aiController from "../controllers/ai.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { aiLimiter } from "../middleware/rateLimit.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

// Process command
router.post(
  "/command",
  authenticate,
  aiLimiter,
  validate([
    body("command").trim().notEmpty().withMessage("Command is required"),
    body("context").optional(),
    body("model").optional().isString().withMessage("Model must be a string"),
  ]),
  aiController.processCommand,
);

// Generate content
router.post(
  "/generate-content",
  authenticate,
  aiLimiter,
  validate([
    body("type").trim().notEmpty().withMessage("Content type is required"),
    body("params").isObject().withMessage("Params must be an object"),
  ]),
  aiController.generateContent,
);

// Get suggestions
router.post(
  "/suggest",
  authenticate,
  aiLimiter,
  validate([body("pageJSON").isObject().withMessage("Page JSON is required")]),
  aiController.getSuggestions,
);

// Validate design
router.post(
  "/validate",
  authenticate,
  aiLimiter,
  validate([body("pageJSON").isObject().withMessage("Page JSON is required")]),
  aiController.validateDesign,
);

// Generate custom component
router.post(
  "/generate-component",
  authenticate,
  aiLimiter,
  validate([
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
    body("model").optional().isString().withMessage("Model must be a string"),
  ]),
  aiController.generateCustomComponent,
);

// Get custom components
router.get(
  "/custom-components",
  authenticate,
  aiController.getCustomComponents,
);

// Plan a full multi-page website (returns page name/slug/purpose list)
router.post(
  "/plan-site",
  authenticate,
  aiLimiter,
  validate([
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  ]),
  aiController.planSite,
);

// Generate full page HTML
router.post(
  "/generate-html",
  authenticate,
  aiLimiter,
  validate([
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
    body("currentSlug").optional().trim(),
    body("templateType").optional().trim(),
  ]),
  aiController.generatePageHTML,
);

// Modify existing full page HTML
router.post(
  "/modify-html",
  authenticate,
  aiLimiter,
  validate([
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
    body("currentHtml")
      .trim()
      .notEmpty()
      .withMessage("Current HTML is required"),
    body("currentSlug").optional().trim(),
  ]),
  aiController.modifyPageHTML,
);

// Multi-turn chat with persisted memory
router.post(
  "/chat",
  authenticate,
  aiLimiter,
  validate([
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("threadId")
      .optional()
      .isString()
      .withMessage("Thread ID must be a string"),
    body("model").optional().isString().withMessage("Model must be a string"),
  ]),
  aiController.chatWithMemory,
);

router.get("/conversations", authenticate, aiController.getConversationHistory);

router.get(
  "/conversations/:threadId",
  authenticate,
  validate([
    param("threadId").trim().notEmpty().withMessage("Thread ID is required"),
  ]),
  aiController.getConversationThread,
);

// NLP command benchmark
router.post(
  "/benchmark",
  authenticate,
  aiLimiter,
  aiController.runNlpBenchmark,
);

// Compliance checks (AICTE/UGC/WCAG/SEO)
router.post(
  "/compliance-validate",
  authenticate,
  aiLimiter,
  validate([body("pageJSON").isObject().withMessage("Page JSON is required")]),
  aiController.validateCompliance,
);

router.get(
  "/compliance-report",
  authenticate,
  aiController.getComplianceReport,
);

router.get(
  "/compliance-audit-trail",
  authenticate,
  aiController.getComplianceAuditTrail,
);

// Live suggestions + one-click apply
router.post(
  "/suggest-live",
  authenticate,
  aiLimiter,
  validate([body("pageJSON").isObject().withMessage("Page JSON is required")]),
  aiController.getLiveSuggestions,
);

router.post(
  "/apply-suggestion",
  authenticate,
  aiLimiter,
  validate([
    body("pageJSON").isObject().withMessage("Page JSON is required"),
    body("operation").isObject().withMessage("Operation is required"),
  ]),
  aiController.applySuggestion,
);

// Usage and cost dashboard API (super-admin only)
router.get(
  "/usage-summary",
  authenticate,
  authorize("super-admin"),
  aiController.getUsageSummary,
);

// AI image generation
router.post(
  "/generate-image",
  authenticate,
  aiLimiter,
  validate([
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
    body("size")
      .optional()
      .isIn(["1024x1024", "1024x1536", "1536x1024"])
      .withMessage("Invalid image size"),
  ]),
  aiController.generateImage,
);

// Execute AI-generated JSX into live render payload
router.post(
  "/execute-jsx",
  authenticate,
  aiLimiter,
  validate([
    body("jsxCode").trim().notEmpty().withMessage("JSX code is required"),
  ]),
  aiController.executeJsx,
);

export default router;
