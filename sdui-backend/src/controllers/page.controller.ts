import { Request, Response } from "express";
import pageService from "../services/page.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { asyncHandler } from "../middleware/error.middleware";

export class PageController {
  // Get all pages
  getAllPages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const pages = await pageService.getAllPages(req.user.institutionId);

    return sendSuccess(res, pages);
  });

  // Get page by ID
  getPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const page = await pageService.getPageById(id, req.user.institutionId);

    return sendSuccess(res, page);
  });

  // Create page
  createPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { name, slug, useHtml } = req.body;

    const page = await pageService.createPage({
      institutionId: req.user.institutionId,
      name,
      slug,
      userId: req.user.userId,
      useHtml: !!useHtml,
    });

    return sendSuccess(res, page, "Page created successfully", 201);
  });

  // Update page
  updatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const {
      name,
      slug,
      jsonConfig,
      htmlContent,
      useHtml,
      orderIndex,
      changes,
    } = req.body;

    const page = await pageService.updatePage(
      id,
      req.user.institutionId,
      req.user.userId,
      { name, slug, jsonConfig, htmlContent, useHtml, orderIndex },
      changes,
    );

    return sendSuccess(res, page, "Page updated successfully");
  });

  // Publish page
  publishPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const page = await pageService.publishPage(id, req.user.institutionId);

    return sendSuccess(res, page, "Page published successfully");
  });

  // Unpublish page
  unpublishPage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const page = await pageService.unpublishPage(id, req.user.institutionId);

    return sendSuccess(res, page, "Page unpublished successfully");
  });

  // Delete page
  deletePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    await pageService.deletePage(id, req.user.institutionId);

    return sendSuccess(res, null, "Page deleted successfully");
  });

  // Duplicate page
  duplicatePage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const { name, slug } = req.body;

    const page = await pageService.duplicatePage(
      id,
      req.user.institutionId,
      req.user.userId,
      name,
      slug,
    );

    return sendSuccess(res, page, "Page duplicated successfully", 201);
  });

  // Get all published pages (public)
  getPublishedPages = asyncHandler(async (req: Request, res: Response) => {
    const institutionId = req.query.institutionId as string | undefined;
    const pages = await pageService.getPublishedPages(institutionId);
    return sendSuccess(res, pages);
  });

  // Get published page by slug (public/authenticated)
  getPublishedPage = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    let institutionId =
      (req.query.institutionId as string) ||
      (req.headers["x-institution-id"] as string);

    // If authenticated, we use the user's institutionId
    if (req.user) {
      institutionId = req.user.institutionId;

      // Admins and editors can see unpublished pages
      if (req.user.role !== "viewer") {
        const page = await pageService.getPageBySlug(slug, institutionId);
        return sendSuccess(res, page);
      }
    }

    if (!institutionId) {
      return sendError(
        res,
        "Page not found in this project. Create this page in your dashboard.",
        404,
        "PROJECT_PAGE_NOT_FOUND",
      );
    }

    const page = await pageService.getPublishedPageBySlug(slug, institutionId);

    return sendSuccess(res, page);
  });
}

export default new PageController();
