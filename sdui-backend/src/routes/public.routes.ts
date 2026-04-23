import { Router } from "express";
import { body, param, query } from "express-validator";
import pageController from "../controllers/page.controller";
import authController from "../controllers/auth.controller";
import formController from "../controllers/form.controller";
import settingsController from "../controllers/settings.controller";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "online", timestamp: new Date().toISOString() });
});

// Get all institutions
router.get("/institutions", authController.getInstitutions);

router.get(
  "/settings",
  validate([
    query("institutionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid institution ID"),
  ]),
  settingsController.getPublicSettings,
);

// Get all published pages
router.get(
  "/pages",
  validate([
    query("institutionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid institution ID"),
  ]),
  pageController.getPublishedPages,
);

// Get published page by slug
router.get(
  "/pages/:slug",
  validate([
    param("slug").trim().notEmpty().withMessage("Slug is required"),
    query("institutionId")
      .optional()
      .isMongoId()
      .withMessage("Invalid institution ID"),
  ]),
  pageController.getPublishedPage,
);

// Public form submit endpoint
router.post(
  "/forms/submit",
  validate([
    body("formType")
      .isIn(["contact", "inquiry", "feedback"])
      .withMessage("Form type must be contact, inquiry, or feedback"),
    body("recipientEmail")
      .isEmail()
      .withMessage("A valid recipient email is required"),
    body("subject")
      .trim()
      .notEmpty()
      .withMessage("Subject is required")
      .isLength({ max: 200 })
      .withMessage("Subject must be 200 characters or fewer"),
    body("fields").isObject().withMessage("Fields must be a key-value object"),
    body("fields.email")
      .trim()
      .isEmail()
      .withMessage("A valid sender email is required"),
    body("fields.countryCode")
      .trim()
      .matches(/^\+\d{1,4}$/)
      .withMessage("A valid country code is required"),
    body("fields.phone")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),
    body("pageUrl")
      .optional()
      .isString()
      .withMessage("Page URL must be a string"),
  ]),
  formController.submitPublicForm,
);

router.post(
  "/forms/test-delivery",
  validate([
    body("recipientEmail")
      .trim()
      .isEmail()
      .withMessage("A valid recipient email is required"),
    body("subject")
      .optional()
      .isString()
      .withMessage("Subject must be a string"),
  ]),
  formController.testEmailDelivery,
);

export default router;
