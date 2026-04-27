import { Request, Response } from 'express';
import templateService from '../services/template.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

export class TemplateController {
  // Get all templates
  getAllTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;

    const templates = await templateService.getAllTemplates(
      category as string,
      req.user?.userId
    );

    return sendSuccess(res, templates);
  });

  // Get template by ID
  getTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const template = await templateService.getTemplateById(id);
    
    // Record view
    if (req.user) {
      await templateService.recordView(id);
    }

    return sendSuccess(res, template);
  });

  // Get user's custom templates
  getUserTemplates = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const templates = await templateService.getUserTemplates(req.user.userId);

    return sendSuccess(res, templates);
  });

  // Create template
  createTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { name, description, category, thumbnail, jsonConfig, isPublic, tags, isCustom } = req.body;

    const template = await templateService.createTemplate({
      name,
      description,
      category,
      thumbnail,
      jsonConfig,
      isPublic,
      tags,
      userId: req.user.userId,
      isCustom: isCustom || true,
    });

    return sendSuccess(res, template, 'Template created successfully', 201);
  });

  // Update template
  updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { name, description, thumbnail, jsonConfig, isPublic, tags } = req.body;

    // Verify ownership
    const template = await templateService.getTemplateById(id);
    if (template.createdBy?.toString() !== req.user.userId) {
      return sendError(res, 'Forbidden', 403);
    }

    const updated = await templateService.updateTemplate(id, {
      name,
      description,
      thumbnail,
      jsonConfig,
      isPublic,
      tags,
    });

    return sendSuccess(res, updated, 'Template updated successfully');
  });

  // Delete template
  deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    // Verify ownership
    const template = await templateService.getTemplateById(id);
    if (template.createdBy?.toString() !== req.user.userId) {
      return sendError(res, 'Forbidden', 403);
    }

    await templateService.deleteTemplate(id);

    return sendSuccess(res, null, 'Template deleted successfully');
  });

  // Duplicate template
  duplicateTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { name } = req.body;

    const duplicated = await templateService.duplicateTemplate(
      id,
      req.user.userId,
      name
    );

    return sendSuccess(res, duplicated, 'Template duplicated successfully', 201);
  });

  // Apply template
  applyTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const jsonConfig = await templateService.applyTemplate(
      id,
      req.user?.userId
    );

    return sendSuccess(res, jsonConfig, 'Template applied successfully');
  });

  // Rate template
  rateTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { rating, review } = req.body;

    const templateRating = await templateService.rateTemplate({
      templateId: id,
      userId: req.user.userId,
      rating,
      review,
    });

    return sendSuccess(res, templateRating, 'Rating added successfully');
  });

  // Get template ratings
  getTemplateRatings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const ratings = await templateService.getTemplateRatings(id);

    return sendSuccess(res, ratings);
  });

  // Share template
  shareTemplate = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;
    const { sharedWith, accessLevel, expiresAt } = req.body;

    const share = await templateService.shareTemplate({
      templateId: id,
      ownerId: req.user.userId,
      sharedWith,
      accessLevel,
      expiresAt,
    });

    return sendSuccess(res, share, 'Template shared successfully', 201);
  });

  // Get template shares
  getTemplateShares = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const shares = await templateService.getTemplateShares(id);

    return sendSuccess(res, shares);
  });

  // Get shared template by code
  getSharedTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { shareCode } = req.params;

    const template = await templateService.getSharedTemplate(shareCode);

    return sendSuccess(res, template);
  });

  // Get template analytics
  getTemplateAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { days } = req.query;

    const analytics = await templateService.getTemplateAnalytics(
      id,
      parseInt(days as string) || 30
    );

    return sendSuccess(res, analytics);
  });

  // Get trending templates
  getTrendingTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;

    const templates = await templateService.getTrendingTemplates(
      parseInt(limit as string) || 10
    );

    return sendSuccess(res, templates);
  });

  // Get top-rated templates
  getTopRatedTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;

    const templates = await templateService.getTopRatedTemplates(
      parseInt(limit as string) || 10
    );

    return sendSuccess(res, templates);
  });

  // Search templates
  searchTemplates = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      return sendError(res, 'Search query required', 400);
    }

    const templates = await templateService.searchTemplates(q as string);

    return sendSuccess(res, templates);
  });
}

export default new TemplateController();
