import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from "multer";
import mediaController from "../controllers/media.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images, videos, and documents
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Upload media
router.post(
  "/upload",
  authenticate,
  authorize("super-admin", "editor"),
  upload.single("file"),
  mediaController.uploadMedia,
);

// Get all media
router.get(
  "/",
  authenticate,
  validate([
    query("type").optional().isIn(["image", "video", "document"]),
    query("category")
      .optional()
      .isIn([
        "admissions",
        "academics",
        "events",
        "marketing",
        "branding",
        "other",
      ]),
    query("folderPath").optional().trim(),
    query("tags").optional().trim(),
    query("search").optional().trim(),
    query("minSize").optional().isInt({ min: 0 }),
    query("maxSize").optional().isInt({ min: 0 }),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
    query("sortBy")
      .optional()
      .isIn(["uploadedAt", "size", "filename", "usageCount"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ]),
  mediaController.getAllMedia,
);

// Usage analytics
router.get("/analytics/usage", authenticate, mediaController.getUsageAnalytics);

// Folder management
router.get("/folders", authenticate, mediaController.listFolders);
router.post(
  "/folders",
  authenticate,
  authorize("super-admin", "editor"),
  validate([
    body("name").trim().notEmpty().withMessage("Folder name is required"),
    body("parentPath").optional().trim(),
  ]),
  mediaController.createFolder,
);

router.patch(
  "/folders/:id",
  authenticate,
  authorize("super-admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid folder ID"),
    body("name").optional().trim().notEmpty(),
    body("parentPath").optional().trim(),
  ]),
  mediaController.renameFolder,
);

router.delete(
  "/folders/:id",
  authenticate,
  authorize("super-admin", "editor"),
  validate([param("id").isMongoId().withMessage("Invalid folder ID")]),
  mediaController.deleteFolder,
);

// Bulk actions
router.post(
  "/bulk",
  authenticate,
  authorize("super-admin", "editor"),
  validate([
    body("action")
      .isIn(["compress", "move", "tag", "categorize", "delete", "download-zip"])
      .withMessage("Invalid bulk action"),
    body("mediaIds").isArray({ min: 1 }).withMessage("mediaIds are required"),
    body("mediaIds.*").isMongoId().withMessage("Invalid media ID in mediaIds"),
    body("folderPath").optional().trim(),
    body("tags").optional().isArray(),
    body("category")
      .optional()
      .isIn([
        "admissions",
        "academics",
        "events",
        "marketing",
        "branding",
        "other",
      ]),
    body("forceDelete").optional().isBoolean(),
  ]),
  mediaController.bulkOperation,
);

// Per-item usage and metadata
router.get(
  "/:id/usage",
  authenticate,
  validate([param("id").isMongoId().withMessage("Invalid media ID")]),
  mediaController.getMediaUsage,
);

router.patch(
  "/:id",
  authenticate,
  authorize("super-admin", "editor"),
  validate([
    param("id").isMongoId().withMessage("Invalid media ID"),
    body("tags").optional().isArray(),
    body("category")
      .optional()
      .isIn([
        "admissions",
        "academics",
        "events",
        "marketing",
        "branding",
        "other",
      ]),
    body("altText").optional().trim(),
    body("folderPath").optional().trim(),
  ]),
  mediaController.updateMediaMetadata,
);

// Delete media
router.delete(
  "/:id",
  authenticate,
  authorize("super-admin", "editor"),
  validate([param("id").isMongoId().withMessage("Invalid media ID")]),
  mediaController.deleteMedia,
);

export default router;
