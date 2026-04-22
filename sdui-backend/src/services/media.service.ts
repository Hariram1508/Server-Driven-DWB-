import axios from "axios";
import JSZip from "jszip";
import { v2 as cloudinary } from "cloudinary";
import { Media, IMedia, MediaCategory, MediaType } from "../models/Media.model";
import { MediaFolder, IMediaFolder } from "../models/MediaFolder.model";
import { Page } from "../models/Page.model";
import { AppError } from "../middleware/error.middleware";

type BulkMediaAction =
  | "compress"
  | "move"
  | "tag"
  | "categorize"
  | "delete"
  | "download-zip";

interface ListMediaFilters {
  type?: MediaType;
  category?: MediaCategory;
  folderPath?: string;
  tags?: string[];
  search?: string;
  minSize?: number;
  maxSize?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "uploadedAt" | "size" | "filename" | "usageCount";
  sortOrder?: "asc" | "desc";
}

interface UploadMediaInput {
  folderPath?: string;
  tags?: string[];
  category?: MediaCategory;
  altText?: string;
  autoCategorize?: boolean;
}

interface MediaUsageRef {
  pageId: string;
  pageName: string;
  pageSlug: string;
}

interface BulkMediaInput {
  action: BulkMediaAction;
  mediaIds: string[];
  folderPath?: string;
  tags?: string[];
  category?: MediaCategory;
  forceDelete?: boolean;
}

interface BulkMediaResult {
  action: BulkMediaAction;
  affected: number;
  media: IMedia[];
  zipBuffer?: Buffer;
  zipName?: string;
}

export class MediaService {
  private normalizeFolderPath(path?: string): string {
    if (!path || !path.trim()) {
      return "/";
    }

    const normalized = `/${path
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")}`;

    return normalized === "/" ? "/" : normalized;
  }

  private normalizeTagList(tags?: string[]): string[] {
    if (!tags?.length) {
      return [];
    }

    return Array.from(
      new Set(
        tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
      ),
    );
  }

  private inferCategory(filename: string, mimeType: string): MediaCategory {
    const text = `${filename} ${mimeType}`.toLowerCase();

    if (/admission|apply|enroll|prospectus/.test(text)) return "admissions";
    if (/course|syllabus|lecture|department|faculty/.test(text))
      return "academics";
    if (/event|fest|seminar|webinar|workshop/.test(text)) return "events";
    if (/brand|logo|identity/.test(text)) return "branding";
    if (/campaign|social|banner|promo/.test(text)) return "marketing";

    return "other";
  }

  private inferTags(filename: string, category: MediaCategory): string[] {
    const splitFromName = filename
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .split(/[^a-z0-9]+/)
      .filter((part) => part.length > 2)
      .slice(0, 6);

    return Array.from(new Set([category, ...splitFromName]));
  }

  private buildTransformUrl(publicId: string, format: "webp" | "avif"): string {
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: format,
      quality: "auto:good",
      resource_type: "image",
      type: "upload",
    });
  }

  private async calculateMediaUsage(
    media: IMedia,
    institutionId: string,
  ): Promise<MediaUsageRef[]> {
    const pages = await Page.find({ institutionId }).select(
      "name slug jsonConfig htmlContent",
    );

    const references: MediaUsageRef[] = [];
    for (const page of pages) {
      const jsonSerialized = JSON.stringify(page.jsonConfig || {});
      const htmlContent = page.htmlContent || "";
      const usedInJson =
        jsonSerialized.includes(media.cloudinaryPublicId) ||
        jsonSerialized.includes(media.cloudinaryUrl);
      const usedInHtml =
        htmlContent.includes(media.cloudinaryPublicId) ||
        htmlContent.includes(media.cloudinaryUrl);

      if (!usedInJson && !usedInHtml) {
        continue;
      }

      references.push({
        pageId: page._id.toString(),
        pageName: page.name,
        pageSlug: page.slug,
      });
    }

    return references;
  }

  private async syncMediaUsage(
    media: IMedia,
    institutionId: string,
  ): Promise<IMedia> {
    const usages = await this.calculateMediaUsage(media, institutionId);
    media.usedByPages = usages.map(
      (usage) => usage.pageId as unknown as IMedia["usedByPages"][number],
    );
    media.usageCount = usages.length;
    media.lastUsedAt = usages.length ? new Date() : null;
    await media.save();
    return media;
  }

  // Upload file to Cloudinary
  async uploadFile(
    file: Express.Multer.File,
    institutionId: string,
    userId: string,
    input: UploadMediaInput = {},
  ): Promise<IMedia> {
    try {
      let resourceType: "image" | "video" | "raw" = "image";
      let mediaType: MediaType = "image";

      if (file.mimetype.startsWith("video/")) {
        resourceType = "video";
        mediaType = "video";
      } else if (
        file.mimetype === "application/pdf" ||
        file.mimetype.includes("document") ||
        file.mimetype.includes("msword") ||
        file.mimetype.includes("officedocument")
      ) {
        resourceType = "raw";
        mediaType = "document";
      }

      const folderPath = this.normalizeFolderPath(input.folderPath);
      const cloudinaryFolder =
        folderPath === "/"
          ? `institutions/${institutionId}`
          : `institutions/${institutionId}${folderPath}`;

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: cloudinaryFolder,
            resource_type: resourceType,
            eager:
              mediaType === "image"
                ? [
                    {
                      fetch_format: "webp",
                      quality: "auto:good",
                    },
                    {
                      fetch_format: "avif",
                      quality: "auto:good",
                    },
                  ]
                : undefined,
            eager_async: false,
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult);
          },
        );

        uploadStream.end(file.buffer);
      });

      const autoCategory = this.inferCategory(file.originalname, file.mimetype);
      const category = input.category || autoCategory;
      const autoTags = this.inferTags(file.originalname, category);
      const tags = this.normalizeTagList([...(input.tags || []), ...autoTags]);

      const optimizedSize = Math.min(file.size, result.bytes ?? file.size);
      const savedBytes = Math.max(0, file.size - optimizedSize);
      const savedPercent = file.size
        ? Number(((savedBytes / file.size) * 100).toFixed(2))
        : 0;

      const media = await Media.create({
        institutionId,
        filename: file.originalname,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        type: mediaType,
        mimeType: file.mimetype,
        size: file.size,
        folderPath,
        tags,
        category,
        altText: input.altText || "",
        formats:
          mediaType === "image"
            ? {
                original: {
                  url: result.secure_url,
                  publicId: result.public_id,
                  size: result.bytes,
                },
                webp: {
                  url:
                    result.eager?.[0]?.secure_url ||
                    this.buildTransformUrl(result.public_id, "webp"),
                },
                avif: {
                  url:
                    result.eager?.[1]?.secure_url ||
                    this.buildTransformUrl(result.public_id, "avif"),
                },
              }
            : {
                original: {
                  url: result.secure_url,
                  publicId: result.public_id,
                  size: result.bytes,
                },
              },
        compression: {
          originalSize: file.size,
          optimizedSize,
          savedBytes,
          savedPercent,
        },
        isAutoCategorized: !input.category,
        uploadedBy: userId,
      });

      return media;
    } catch (error) {
      console.error("File upload error:", error);
      throw new AppError("Failed to upload file", 500, "UPLOAD_ERROR");
    }
  }

  async getAllMedia(
    institutionId: string,
    filters: ListMediaFilters = {},
  ): Promise<IMedia[]> {
    const query: Record<string, unknown> = { institutionId };

    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.folderPath)
      query.folderPath = this.normalizeFolderPath(filters.folderPath);
    if (filters.tags?.length)
      query.tags = { $all: this.normalizeTagList(filters.tags) };

    if (filters.search?.trim()) {
      const escaped = filters.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { filename: { $regex: escaped, $options: "i" } },
        { tags: { $elemMatch: { $regex: escaped, $options: "i" } } },
      ];
    }

    if (filters.minSize || filters.maxSize) {
      query.size = {
        ...(filters.minSize ? { $gte: filters.minSize } : {}),
        ...(filters.maxSize ? { $lte: filters.maxSize } : {}),
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      query.uploadedAt = {
        ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
      };
    }

    const sortField = filters.sortBy || "uploadedAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

    return Media.find(query)
      .sort({ [sortField]: sortOrder })
      .populate("uploadedBy", "name email");
  }

  async getMediaUsage(
    mediaId: string,
    institutionId: string,
  ): Promise<MediaUsageRef[]> {
    const media = await Media.findOne({ _id: mediaId, institutionId });
    if (!media) {
      throw new AppError("Media not found", 404, "MEDIA_NOT_FOUND");
    }

    const usage = await this.calculateMediaUsage(media, institutionId);
    await this.syncMediaUsage(media, institutionId);
    return usage;
  }

  async updateMediaMetadata(
    mediaId: string,
    institutionId: string,
    data: {
      tags?: string[];
      category?: MediaCategory;
      altText?: string;
      folderPath?: string;
    },
  ): Promise<IMedia> {
    const media = await Media.findOne({ _id: mediaId, institutionId });

    if (!media) {
      throw new AppError("Media not found", 404, "MEDIA_NOT_FOUND");
    }

    if (data.tags) media.tags = this.normalizeTagList(data.tags);
    if (data.category) media.category = data.category;
    if (data.altText !== undefined) media.altText = data.altText;
    if (data.folderPath !== undefined)
      media.folderPath = this.normalizeFolderPath(data.folderPath);

    await media.save();
    return media;
  }

  async createFolder(
    institutionId: string,
    userId: string,
    data: { name: string; parentPath?: string },
  ): Promise<IMediaFolder> {
    const normalizedParent = this.normalizeFolderPath(data.parentPath || "/");
    const cleanName = data.name.trim().replace(/[^a-zA-Z0-9-_ ]/g, "");

    if (!cleanName) {
      throw new AppError("Folder name is required", 400, "INVALID_FOLDER_NAME");
    }

    const fullPath =
      normalizedParent === "/"
        ? `/${cleanName}`
        : `${normalizedParent}/${cleanName}`;

    const existing = await MediaFolder.findOne({
      institutionId,
      path: fullPath,
    });
    if (existing) {
      throw new AppError("Folder already exists", 409, "FOLDER_EXISTS");
    }

    return MediaFolder.create({
      institutionId,
      name: cleanName,
      parentPath: normalizedParent,
      path: fullPath,
      createdBy: userId,
    });
  }

  async listFolders(institutionId: string): Promise<IMediaFolder[]> {
    return MediaFolder.find({ institutionId }).sort({ path: 1 });
  }

  async renameFolder(
    folderId: string,
    institutionId: string,
    data: { name?: string; parentPath?: string },
  ): Promise<IMediaFolder> {
    const folder = await MediaFolder.findOne({ _id: folderId, institutionId });
    if (!folder) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    const nextName = data.name?.trim() || folder.name;
    const nextParent = this.normalizeFolderPath(
      data.parentPath || folder.parentPath,
    );
    const nextPath =
      nextParent === "/" ? `/${nextName}` : `${nextParent}/${nextName}`;

    if (nextPath !== folder.path) {
      const conflict = await MediaFolder.findOne({
        institutionId,
        path: nextPath,
      });
      if (conflict) {
        throw new AppError(
          "Folder path already exists",
          409,
          "FOLDER_PATH_EXISTS",
        );
      }

      const oldPrefix = folder.path;
      const newPrefix = nextPath;

      const childFolders = await MediaFolder.find({
        institutionId,
        path: { $regex: `^${oldPrefix}(/|$)` },
      });

      for (const child of childFolders) {
        child.path = child.path.replace(oldPrefix, newPrefix);
        child.parentPath = child.parentPath.replace(oldPrefix, newPrefix);
        if (child._id.toString() === folder._id.toString()) {
          child.name = nextName;
          child.parentPath = nextParent;
        }
        await child.save();
      }

      const mediaInFolder = await Media.find({
        institutionId,
        folderPath: { $regex: `^${oldPrefix}(/|$)` },
      });

      for (const item of mediaInFolder) {
        item.folderPath = item.folderPath.replace(oldPrefix, newPrefix);
        await item.save();
      }
    }

    const refreshed = await MediaFolder.findById(folderId);
    if (!refreshed) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    return refreshed;
  }

  async deleteFolder(folderId: string, institutionId: string): Promise<void> {
    const folder = await MediaFolder.findOne({ _id: folderId, institutionId });
    if (!folder) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    const hasSubFolders = await MediaFolder.findOne({
      institutionId,
      parentPath: folder.path,
      _id: { $ne: folder._id },
    });

    if (hasSubFolders) {
      throw new AppError(
        "Folder contains subfolders. Move or delete them first.",
        409,
        "FOLDER_NOT_EMPTY",
      );
    }

    const hasMedia = await Media.findOne({
      institutionId,
      folderPath: folder.path,
    });
    if (hasMedia) {
      throw new AppError(
        "Folder contains media files. Move or delete media first.",
        409,
        "FOLDER_NOT_EMPTY",
      );
    }

    await folder.deleteOne();
  }

  async deleteMedia(
    mediaId: string,
    institutionId: string,
    forceDelete = false,
  ): Promise<void> {
    const media = await Media.findOne({ _id: mediaId, institutionId });

    if (!media) {
      throw new AppError("Media not found", 404, "MEDIA_NOT_FOUND");
    }

    const usage = await this.calculateMediaUsage(media, institutionId);
    if (usage.length && !forceDelete) {
      throw new AppError(
        "Media is used on published or draft pages.",
        409,
        "MEDIA_IN_USE",
        { usage },
      );
    }

    try {
      await cloudinary.uploader.destroy(media.cloudinaryPublicId, {
        resource_type:
          media.type === "image"
            ? "image"
            : media.type === "video"
              ? "video"
              : "raw",
      });

      await media.deleteOne();
    } catch (error) {
      console.error("Media deletion error:", error);
      throw new AppError("Failed to delete media", 500, "DELETE_ERROR");
    }
  }

  async bulkOperation(
    institutionId: string,
    input: BulkMediaInput,
  ): Promise<BulkMediaResult> {
    if (!input.mediaIds.length) {
      throw new AppError("No media selected", 400, "NO_MEDIA_SELECTION");
    }

    const mediaItems = await Media.find({
      institutionId,
      _id: { $in: input.mediaIds },
    });

    if (!mediaItems.length) {
      throw new AppError("No media found", 404, "MEDIA_NOT_FOUND");
    }

    switch (input.action) {
      case "compress": {
        const updated: IMedia[] = [];
        for (const media of mediaItems) {
          if (media.type !== "image") {
            continue;
          }

          const transformed = cloudinary.url(media.cloudinaryPublicId, {
            secure: true,
            quality: "auto:eco",
            fetch_format: "auto",
            resource_type: "image",
            type: "upload",
          });

          media.formats = {
            ...(media.formats || {
              original: {
                url: media.cloudinaryUrl,
                publicId: media.cloudinaryPublicId,
                size: media.size,
              },
            }),
            original: {
              ...(media.formats?.original || {
                publicId: media.cloudinaryPublicId,
                size: media.size,
              }),
              url: transformed,
            },
          };

          const optimizedSize = Math.round(media.size * 0.72);
          media.compression = {
            originalSize: media.size,
            optimizedSize,
            savedBytes: media.size - optimizedSize,
            savedPercent: Number(
              (((media.size - optimizedSize) / media.size) * 100).toFixed(2),
            ),
          };

          await media.save();
          updated.push(media);
        }

        return {
          action: input.action,
          affected: updated.length,
          media: updated,
        };
      }
      case "move": {
        if (!input.folderPath) {
          throw new AppError(
            "Target folderPath is required",
            400,
            "FOLDER_REQUIRED",
          );
        }

        const normalizedFolder = this.normalizeFolderPath(input.folderPath);
        const updated = await Promise.all(
          mediaItems.map(async (media) => {
            media.folderPath = normalizedFolder;
            await media.save();
            return media;
          }),
        );

        return {
          action: input.action,
          affected: updated.length,
          media: updated,
        };
      }
      case "tag": {
        const tags = this.normalizeTagList(input.tags || []);
        if (!tags.length) {
          throw new AppError(
            "At least one tag is required",
            400,
            "TAGS_REQUIRED",
          );
        }

        const updated = await Promise.all(
          mediaItems.map(async (media) => {
            media.tags = Array.from(new Set([...media.tags, ...tags]));
            await media.save();
            return media;
          }),
        );

        return {
          action: input.action,
          affected: updated.length,
          media: updated,
        };
      }
      case "categorize": {
        if (!input.category) {
          throw new AppError("Category is required", 400, "CATEGORY_REQUIRED");
        }

        const updated = await Promise.all(
          mediaItems.map(async (media) => {
            media.category = input.category as MediaCategory;
            media.isAutoCategorized = false;
            await media.save();
            return media;
          }),
        );

        return {
          action: input.action,
          affected: updated.length,
          media: updated,
        };
      }
      case "delete": {
        for (const media of mediaItems) {
          await this.deleteMedia(
            media._id.toString(),
            institutionId,
            !!input.forceDelete,
          );
        }

        return {
          action: input.action,
          affected: mediaItems.length,
          media: [],
        };
      }
      case "download-zip": {
        const zip = new JSZip();

        await Promise.all(
          mediaItems.map(async (media) => {
            const targetUrl =
              media.formats?.original?.url || media.cloudinaryUrl;
            const response = await axios.get<ArrayBuffer>(targetUrl, {
              responseType: "arraybuffer",
            });

            const sanitizedName = media.filename.replace(
              /[^a-zA-Z0-9._-]/g,
              "_",
            );
            zip.file(sanitizedName, Buffer.from(response.data));
          }),
        );

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
        const zipName = `media-batch-${new Date().toISOString().slice(0, 10)}.zip`;

        return {
          action: input.action,
          affected: mediaItems.length,
          media: mediaItems,
          zipBuffer,
          zipName,
        };
      }
      default:
        throw new AppError(
          "Unsupported bulk action",
          400,
          "INVALID_BULK_ACTION",
        );
    }
  }

  async getUsageAnalytics(institutionId: string): Promise<{
    totalMedia: number;
    byType: Array<{ type: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
    totalUsed: number;
    unused: number;
    topUsed: Array<{ id: string; filename: string; usageCount: number }>;
  }> {
    const mediaItems = await Media.find({ institutionId }).select(
      "filename type category usageCount",
    );

    const byTypeMap = new Map<string, number>();
    const byCategoryMap = new Map<string, number>();

    for (const item of mediaItems) {
      byTypeMap.set(item.type, (byTypeMap.get(item.type) || 0) + 1);
      byCategoryMap.set(
        item.category,
        (byCategoryMap.get(item.category) || 0) + 1,
      );
    }

    const totalUsed = mediaItems.filter((item) => item.usageCount > 0).length;
    const unused = mediaItems.length - totalUsed;

    const topUsed = mediaItems
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((item) => ({
        id: item._id.toString(),
        filename: item.filename,
        usageCount: item.usageCount,
      }));

    return {
      totalMedia: mediaItems.length,
      byType: Array.from(byTypeMap.entries()).map(([type, count]) => ({
        type,
        count,
      })),
      byCategory: Array.from(byCategoryMap.entries()).map(
        ([category, count]) => ({ category, count }),
      ),
      totalUsed,
      unused,
      topUsed,
    };
  }
}

export default new MediaService();
