import { Request, Response } from "express";
import mediaService from "../services/media.service";
import { sendSuccess, sendError } from "../utils/response.util";
import { asyncHandler } from "../middleware/error.middleware";

export class MediaController {
  // Upload media
  uploadMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    let tags: string[] | undefined;
    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags;
    } else if (typeof req.body.tags === "string" && req.body.tags.trim()) {
      try {
        const parsed = JSON.parse(req.body.tags);
        if (Array.isArray(parsed)) {
          tags = parsed.map((tag) => String(tag));
        }
      } catch {
        tags = req.body.tags.split(",").map((tag: string) => tag.trim());
      }
    }

    const media = await mediaService.uploadFile(
      req.file,
      req.user.institutionId,
      req.user.userId,
      {
        folderPath: req.body.folderPath,
        tags,
        category: req.body.category,
        altText: req.body.altText,
      },
    );

    return sendSuccess(res, media, "File uploaded successfully", 201);
  });

  // Get all media
  getAllMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const tags =
      typeof req.query.tags === "string"
        ? req.query.tags.split(",")
        : undefined;
    const media = await mediaService.getAllMedia(req.user.institutionId, {
      type: req.query.type as any,
      category: req.query.category as any,
      folderPath: req.query.folderPath as string | undefined,
      tags,
      search: req.query.search as string | undefined,
      minSize: req.query.minSize ? Number(req.query.minSize) : undefined,
      maxSize: req.query.maxSize ? Number(req.query.maxSize) : undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    });

    return sendSuccess(res, media);
  });

  // Update media metadata
  updateMediaMetadata = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const updated = await mediaService.updateMediaMetadata(
      id,
      req.user.institutionId,
      {
        tags: req.body.tags,
        category: req.body.category,
        altText: req.body.altText,
        folderPath: req.body.folderPath,
      },
    );

    return sendSuccess(res, updated, "Media updated successfully");
  });

  // Get media usage
  getMediaUsage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const usage = await mediaService.getMediaUsage(id, req.user.institutionId);

    return sendSuccess(res, usage);
  });

  // Get media usage analytics
  getUsageAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const analytics = await mediaService.getUsageAnalytics(
      req.user.institutionId,
    );
    return sendSuccess(res, analytics);
  });

  // Create folder
  createFolder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const folder = await mediaService.createFolder(
      req.user.institutionId,
      req.user.userId,
      {
        name: req.body.name,
        parentPath: req.body.parentPath,
      },
    );

    return sendSuccess(res, folder, "Folder created", 201);
  });

  // List folders
  listFolders = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const folders = await mediaService.listFolders(req.user.institutionId);
    return sendSuccess(res, folders);
  });

  // Rename or move folder
  renameFolder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const folder = await mediaService.renameFolder(id, req.user.institutionId, {
      name: req.body.name,
      parentPath: req.body.parentPath,
    });

    return sendSuccess(res, folder, "Folder updated");
  });

  // Delete folder
  deleteFolder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    await mediaService.deleteFolder(id, req.user.institutionId);
    return sendSuccess(res, null, "Folder deleted");
  });

  // Bulk media operations
  bulkOperation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await mediaService.bulkOperation(req.user.institutionId, {
      action: req.body.action,
      mediaIds: req.body.mediaIds,
      folderPath: req.body.folderPath,
      tags: req.body.tags,
      category: req.body.category,
      forceDelete: req.body.forceDelete,
    });

    if (
      result.action === "download-zip" &&
      result.zipBuffer &&
      result.zipName
    ) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.zipName}"`,
      );
      res.status(200).send(result.zipBuffer);
      return;
    }

    return sendSuccess(res, result, "Bulk operation completed");
  });

  // Delete media
  deleteMedia = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { id } = req.params;
    const forceDelete = String(req.query.force || "").toLowerCase() === "true";
    await mediaService.deleteMedia(id, req.user.institutionId, forceDelete);

    return sendSuccess(res, null, "Media deleted successfully");
  });
}

export default new MediaController();
