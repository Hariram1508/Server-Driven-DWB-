import { Router } from 'express';
import { body, param, query } from 'express-validator';
import templateController from '../controllers/template.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';

const router = Router();

// Get all templates (public)
router.get(
  '/',
  validate([
    query('category').optional().trim(),
  ]),
  templateController.getAllTemplates
);

// Search templates
router.get(
  '/search',
  validate([
    query('q').notEmpty().withMessage('Search query is required'),
  ]),
  templateController.searchTemplates
);

// Get trending templates
router.get(
  '/trending',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  templateController.getTrendingTemplates
);

// Get top-rated templates
router.get(
  '/top-rated',
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ]),
  templateController.getTopRatedTemplates
);

// Get user's custom templates
router.get(
  '/my-templates',
  authenticate,
  templateController.getUserTemplates
);

// Get template by ID (public)
router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.getTemplate
);

// Get template ratings
router.get(
  '/:id/ratings',
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.getTemplateRatings
);

// Get template shares
router.get(
  '/:id/shares',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.getTemplateShares
);

// Get template analytics
router.get(
  '/:id/analytics',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
    query('days').optional().isInt({ min: 1, max: 365 }),
  ]),
  templateController.getTemplateAnalytics
);

// Get shared template by share code
router.get(
  '/share/:shareCode',
  validate([
    param('shareCode').notEmpty().withMessage('Share code is required'),
  ]),
  templateController.getSharedTemplate
);

// Create template (authenticated)
router.post(
  '/',
  authenticate,
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('category')
      .isIn(['homepage', 'about', 'courses', 'departments', 'contact', 'blog', 'events', 'custom'])
      .withMessage('Invalid category'),
    body('thumbnail').optional().trim(),
    body('jsonConfig').isObject().withMessage('JSON config is required'),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray(),
  ]),
  templateController.createTemplate
);

// Update template (authenticated)
router.put(
  '/:id',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('thumbnail').optional().trim(),
    body('jsonConfig').optional().isObject(),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray(),
  ]),
  templateController.updateTemplate
);

// Delete template (authenticated)
router.delete(
  '/:id',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.deleteTemplate
);

// Duplicate template
router.post(
  '/:id/duplicate',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('name').optional().trim(),
  ]),
  templateController.duplicateTemplate
);

// Apply template
router.post(
  '/:id/apply',
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
  ]),
  templateController.applyTemplate
);

// Rate template
router.post(
  '/:id/rate',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim().isLength({ max: 500 }),
  ]),
  templateController.rateTemplate
);

// Share template
router.post(
  '/:id/share',
  authenticate,
  validate([
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('sharedWith').isArray().withMessage('sharedWith must be an array'),
    body('accessLevel')
      .isIn(['view', 'use', 'edit'])
      .withMessage('Invalid access level'),
    body('expiresAt').optional().isISO8601(),
  ]),
  templateController.shareTemplate
);

export default router;
