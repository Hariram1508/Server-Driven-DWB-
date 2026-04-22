import { Router } from "express";
import { body, param } from "express-validator";
import pageController from "../controllers/page.controller";
import { validate } from "../middleware/validate.middleware";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

// Get all pages
router.get("/", authenticate, pageController.getAllPages);

// Get page by ID
router.get(
  "/:id",
  authenticate,
  validate([param("id").isMongoId().withMessage("Invalid page ID")]),
  pageController.getPage,
);

// Create page
router.post(
  "/",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
  ]),
  pageController.createPage,
);

// Update page
router.put(
  "/:id",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid page ID"),
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("slug")
      .optional()
      .trim()
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    body("jsonConfig").optional(),
    body("seo").optional().isObject(),
    body("seo.metaTitle").optional().trim().isLength({ max: 120 }),
    body("seo.metaDescription").optional().trim().isLength({ max: 320 }),
    body("seo.canonicalUrl").optional().trim().isString(),
    body("htmlContent").optional(),
    body("useHtml").optional().isBoolean(),
    body("orderIndex").optional().isInt(),
    body("scheduledPublishAt").optional({ nullable: true }).isISO8601(),
    body("scheduledUnpublishAt").optional({ nullable: true }).isISO8601(),
  ]),
  pageController.updatePage,
);

// Schedule publish/unpublish
router.post(
  "/:id/schedule",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid page ID"),
    body("publishAt").optional({ nullable: true }).isISO8601(),
    body("unpublishAt").optional({ nullable: true }).isISO8601(),
  ]),
  pageController.schedulePage,
);

// Publish page
router.post(
  "/:id/publish",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([param("id").isMongoId().withMessage("Invalid page ID")]),
  pageController.publishPage,
);

// Unpublish page
router.post(
  "/:id/unpublish",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([param("id").isMongoId().withMessage("Invalid page ID")]),
  pageController.unpublishPage,
);

// Delete page
router.delete(
  "/:id",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([param("id").isMongoId().withMessage("Invalid page ID")]),
  pageController.deletePage,
);

// Duplicate page
router.post(
  "/:id/duplicate",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid page ID"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
  ]),
  pageController.duplicatePage,
);

// Save a page as template
router.post(
  "/:id/save-template",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid page ID"),
    body("name").trim().notEmpty().withMessage("Template name is required"),
    body("description").optional().trim(),
    body("category").optional().trim(),
    body("isPublic").optional().isBoolean(),
  ]),
  pageController.saveAsTemplate,
);

// Batch page operations
router.post(
  "/batch",
  authenticate,
  authorize("super-admin", "admin", "editor"),
  validate([
    body("action")
      .isIn(["publish", "unpublish", "duplicate", "delete"])
      .withMessage("Invalid batch action"),
    body("pageIds")
      .isArray({ min: 1 })
      .withMessage("At least one page ID is required"),
    body("pageIds.*").isMongoId().withMessage("Invalid page ID in selection"),
    body("duplicatePrefix").optional().trim(),
    body("duplicateSuffix").optional().trim(),
  ]),
  pageController.batchOperation,
);

// Get published page by slug (public/authenticated)
router.get(
  "/slug/:slug",
  optionalAuthenticate,
  validate([param("slug").trim().notEmpty().withMessage("Slug is required")]),
  pageController.getPublishedPage,
);

export default router;
