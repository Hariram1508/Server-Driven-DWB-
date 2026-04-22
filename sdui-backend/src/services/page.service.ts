import { Page, IPage } from "../models/Page.model";
import { Version } from "../models/Version.model";
import { Template, ITemplate } from "../models/Template.model";
import aiService from "./ai.service";
import { AppError } from "../middleware/error.middleware";
import { PageJSON, PageSEOSettings } from "../types/page.types";

type BatchPageAction = "publish" | "unpublish" | "duplicate" | "delete";

interface BatchOperationInput {
  action: BatchPageAction;
  pageIds: string[];
  userId: string;
  duplicatePrefix?: string;
  duplicateSuffix?: string;
}

interface ScheduleInput {
  publishAt?: string | Date | null;
  unpublishAt?: string | Date | null;
}

interface PageScheduleResult {
  page: IPage;
  scheduleSummary: string;
}

export class PageService {
  private normalizeDateInput(value?: string | Date | null): Date | null {
    if (value === undefined) {
      return null;
    }

    if (value === null) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(
        "Invalid scheduling date",
        400,
        "INVALID_SCHEDULE_DATE",
      );
    }

    return parsed;
  }

  private async applyScheduledTransitions(
    institutionId?: string,
  ): Promise<void> {
    const now = new Date();
    const baseFilter = institutionId ? { institutionId } : {};

    await Page.updateMany(
      {
        ...baseFilter,
        isPublished: false,
        scheduledPublishAt: { $ne: null, $lte: now },
      },
      {
        $set: {
          isPublished: true,
          lastPublishedAt: now,
          scheduledPublishAt: null,
        },
      },
    );

    await Page.updateMany(
      {
        ...baseFilter,
        isPublished: true,
        scheduledUnpublishAt: { $ne: null, $lte: now },
      },
      {
        $set: {
          isPublished: false,
          scheduledUnpublishAt: null,
        },
      },
    );
  }

  private async ensureUniqueSlug(
    institutionId: string,
    requestedSlug: string,
  ): Promise<string> {
    const baseSlug = requestedSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70);

    if (!baseSlug) {
      throw new AppError("Invalid slug", 400, "INVALID_SLUG");
    }

    const initialMatch = await Page.findOne({ institutionId, slug: baseSlug })
      .select("_id")
      .lean();
    if (!initialMatch) {
      return baseSlug;
    }

    let counter = 1;
    while (counter < 9999) {
      const candidate = `${baseSlug}-${counter}`;
      const duplicate = await Page.findOne({ institutionId, slug: candidate })
        .select("_id")
        .lean();

      if (!duplicate) {
        return candidate;
      }

      counter += 1;
    }

    throw new AppError(
      "Could not generate unique slug",
      409,
      "SLUG_GENERATION_FAILED",
    );
  }

  // Get all pages for an institution
  async getAllPages(institutionId: string): Promise<IPage[]> {
    await this.applyScheduledTransitions(institutionId);

    const pages = await Page.find({ institutionId })
      .sort({ orderIndex: -1, updatedAt: -1 })
      .populate("updatedBy", "name email");

    const needsBackfill = pages.some(
      (page) => typeof page.orderIndex !== "number" || page.orderIndex <= 0,
    );

    if (needsBackfill) {
      const totalPages = pages.length;

      await Promise.all(
        pages.map(async (page, index) => {
          const desiredOrderIndex = totalPages - index;
          if (page.orderIndex === desiredOrderIndex) {
            return;
          }

          page.orderIndex = desiredOrderIndex;
          await page.save();
        }),
      );

      return Page.find({ institutionId })
        .sort({ orderIndex: -1, updatedAt: -1 })
        .populate("updatedBy", "name email");
    }

    return pages;
  }

  // Get page by ID
  async getPageById(pageId: string, institutionId: string): Promise<IPage> {
    await this.applyScheduledTransitions(institutionId);

    const page = await Page.findOne({ _id: pageId, institutionId }).populate(
      "updatedBy",
      "name email",
    );

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }

  // Get page by slug
  async getPageBySlug(slug: string, institutionId: string): Promise<IPage> {
    await this.applyScheduledTransitions(institutionId);

    const page = await Page.findOne({ slug, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }

  // Create new page
  async createPage(data: {
    institutionId: string;
    name: string;
    slug: string;
    userId: string;
    useHtml?: boolean;
  }): Promise<IPage> {
    const existingPage = await Page.findOne({
      institutionId: data.institutionId,
      slug: data.slug,
    });

    if (existingPage) {
      throw new AppError(
        "Page with this slug already exists",
        409,
        "DUPLICATE_SLUG",
      );
    }

    const highestOrderPage = await Page.findOne({
      institutionId: data.institutionId,
    })
      .sort({ orderIndex: -1, updatedAt: -1 })
      .select("orderIndex")
      .lean();

    const nextOrderIndex = (highestOrderPage?.orderIndex ?? 0) + 1;

    const page = await Page.create({
      institutionId: data.institutionId,
      name: data.name,
      slug: data.slug,
      jsonConfig: {
        ROOT: {
          type: {
            resolvedName: "Container",
          },
          isCanvas: true,
          props: {
            backgroundColor: "#ffffff",
            padding: "40px",
            minHeight: "800px",
          },
          displayName: "Container",
          custom: {},
          hidden: false,
          nodes: [],
          linkedNodes: {},
        },
      },
      seo: {
        metaTitle: data.name,
        metaDescription: "",
        canonicalUrl: `/${data.slug}`,
      },
      useHtml: !!data.useHtml,
      isPublished: true,
      lastPublishedAt: new Date(),
      orderIndex: nextOrderIndex,
      updatedBy: data.userId,
    });

    await Version.create({
      pageId: page._id,
      versionNumber: 1,
      jsonConfig: page.jsonConfig,
      changes: "Initial version",
      createdBy: data.userId,
    });

    return page;
  }

  // Update page JSON config, HTML content, SEO, or ordering
  async updatePage(
    pageId: string,
    institutionId: string,
    userId: string,
    data: {
      name?: string;
      slug?: string;
      jsonConfig?: PageJSON;
      seo?: PageSEOSettings;
      htmlContent?: string;
      useHtml?: boolean;
      orderIndex?: number;
      scheduledPublishAt?: string | Date | null;
      scheduledUnpublishAt?: string | Date | null;
    },
    changes?: string,
  ): Promise<IPage> {
    const page = await Page.findOne({ _id: pageId, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    if (data.slug && data.slug !== page.slug) {
      const existingPage = await Page.findOne({
        institutionId,
        slug: data.slug,
        _id: { $ne: pageId },
      });

      if (existingPage) {
        throw new AppError(
          "Page with this slug already exists",
          409,
          "DUPLICATE_SLUG",
        );
      }
    }

    if (data.name !== undefined) page.name = data.name;
    if (data.slug !== undefined) page.slug = data.slug;
    if (data.jsonConfig) page.jsonConfig = data.jsonConfig;
    if (data.htmlContent !== undefined) page.htmlContent = data.htmlContent;
    if (data.useHtml !== undefined) page.useHtml = data.useHtml;
    if (data.orderIndex !== undefined) page.orderIndex = data.orderIndex;

    if (data.seo) {
      page.seo = {
        ...page.seo,
        ...data.seo,
      };
    }

    const nextPublishAt =
      data.scheduledPublishAt !== undefined
        ? this.normalizeDateInput(data.scheduledPublishAt)
        : (page.scheduledPublishAt ?? null);
    const nextUnpublishAt =
      data.scheduledUnpublishAt !== undefined
        ? this.normalizeDateInput(data.scheduledUnpublishAt)
        : (page.scheduledUnpublishAt ?? null);

    if (nextPublishAt && nextUnpublishAt && nextUnpublishAt <= nextPublishAt) {
      throw new AppError(
        "Unpublish schedule must be after publish schedule",
        400,
        "INVALID_SCHEDULE_RANGE",
      );
    }

    if (data.scheduledPublishAt !== undefined) {
      page.scheduledPublishAt = nextPublishAt;
    }

    if (data.scheduledUnpublishAt !== undefined) {
      page.scheduledUnpublishAt = nextUnpublishAt;
    }

    page.updatedBy = userId as unknown as IPage["updatedBy"];
    await page.save();

    const latestVersion = await Version.findOne({ pageId }).sort({
      versionNumber: -1,
    });

    const newVersionNumber = latestVersion
      ? latestVersion.versionNumber + 1
      : 1;

    await Version.create({
      pageId: page._id,
      versionNumber: newVersionNumber,
      jsonConfig: page.jsonConfig,
      changes: changes || "Updated page",
      createdBy: userId,
    });

    return page;
  }

  async schedulePage(
    pageId: string,
    institutionId: string,
    userId: string,
    data: ScheduleInput,
  ): Promise<PageScheduleResult> {
    const page = await this.updatePage(
      pageId,
      institutionId,
      userId,
      {
        scheduledPublishAt: data.publishAt,
        scheduledUnpublishAt: data.unpublishAt,
      },
      "Updated publish schedule",
    );

    const publishLabel = page.scheduledPublishAt
      ? `Publish at ${page.scheduledPublishAt.toISOString()}`
      : "No publish schedule";
    const unpublishLabel = page.scheduledUnpublishAt
      ? `Unpublish at ${page.scheduledUnpublishAt.toISOString()}`
      : "No unpublish schedule";

    return {
      page,
      scheduleSummary: `${publishLabel}. ${unpublishLabel}.`,
    };
  }

  // Publish page
  async publishPage(
    pageId: string,
    institutionId: string,
    userId: string,
  ): Promise<IPage> {
    const page = await Page.findOne({ _id: pageId, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    const compliance = await aiService.runComplianceValidation(page.jsonConfig);

    await aiService.recordComplianceAudit({
      institutionId,
      pageId: page._id.toString(),
      pageName: page.name,
      pageSlug: page.slug,
      eventType: compliance.canPublish ? "validation" : "publish-blocked",
      severity: compliance.canPublish ? "info" : "critical",
      message: compliance.canPublish
        ? `Compliance check passed for ${page.name}.`
        : `Publish blocked for ${page.name} because critical compliance issues remain.`,
      details: {
        score: compliance.score,
        summary: compliance.summary,
        checks: compliance.checks,
      },
      createdBy: userId,
    });

    if (!compliance.canPublish) {
      throw new AppError(
        "Page has critical compliance issues and cannot be published yet.",
        422,
        "COMPLIANCE_BLOCKED",
      );
    }

    page.isPublished = true;
    page.lastPublishedAt = new Date();
    page.scheduledPublishAt = null;
    await page.save();

    await aiService.recordComplianceAudit({
      institutionId,
      pageId: page._id.toString(),
      pageName: page.name,
      pageSlug: page.slug,
      eventType: "publish",
      severity: "info",
      message: `Page published: ${page.name}`,
      details: { score: compliance.score },
      createdBy: userId,
    });

    return page;
  }

  // Unpublish page
  async unpublishPage(
    pageId: string,
    institutionId: string,
    userId: string,
  ): Promise<IPage> {
    const page = await Page.findOne({ _id: pageId, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    page.isPublished = false;
    page.scheduledUnpublishAt = null;
    await page.save();

    await aiService.recordComplianceAudit({
      institutionId,
      pageId: page._id.toString(),
      pageName: page.name,
      pageSlug: page.slug,
      eventType: "unpublish",
      severity: "warning",
      message: `Page unpublished: ${page.name}`,
      createdBy: userId,
    });

    return page;
  }

  async batchOperation(
    institutionId: string,
    input: BatchOperationInput,
  ): Promise<{ action: BatchPageAction; affected: number; pages?: IPage[] }> {
    if (!input.pageIds.length) {
      throw new AppError("No pages selected", 400, "NO_PAGE_SELECTION");
    }

    const scopedPages = await Page.find({
      _id: { $in: input.pageIds },
      institutionId,
    });

    if (!scopedPages.length) {
      throw new AppError("No matching pages found", 404, "PAGES_NOT_FOUND");
    }

    switch (input.action) {
      case "publish": {
        await Promise.all(
          scopedPages.map((page) =>
            this.publishPage(page._id.toString(), institutionId, input.userId),
          ),
        );
        return { action: input.action, affected: scopedPages.length };
      }
      case "unpublish": {
        await Promise.all(
          scopedPages.map((page) =>
            this.unpublishPage(
              page._id.toString(),
              institutionId,
              input.userId,
            ),
          ),
        );
        return { action: input.action, affected: scopedPages.length };
      }
      case "delete": {
        await Promise.all(
          scopedPages.map((page) =>
            this.deletePage(page._id.toString(), institutionId),
          ),
        );
        return { action: input.action, affected: scopedPages.length };
      }
      case "duplicate": {
        const duplicates: IPage[] = [];

        for (const page of scopedPages) {
          const requestedName = `${input.duplicatePrefix?.trim() || "Copy"} ${page.name}${input.duplicateSuffix?.trim() ? ` ${input.duplicateSuffix.trim()}` : ""}`;
          const requestedSlug = await this.ensureUniqueSlug(
            institutionId,
            `${page.slug}-copy`,
          );

          const duplicate = await this.duplicatePage(
            page._id.toString(),
            institutionId,
            input.userId,
            requestedName,
            requestedSlug,
          );

          duplicates.push(duplicate);
        }

        return {
          action: input.action,
          affected: duplicates.length,
          pages: duplicates,
        };
      }
      default:
        throw new AppError("Invalid batch action", 400, "INVALID_BATCH_ACTION");
    }
  }

  async savePageAsTemplate(data: {
    pageId: string;
    institutionId: string;
    userId: string;
    name: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }): Promise<ITemplate> {
    const page = await Page.findOne({
      _id: data.pageId,
      institutionId: data.institutionId,
    });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    const template = await Template.create({
      name: data.name,
      description: data.description || `Saved from page ${page.name}`,
      category: data.category || "custom",
      thumbnail: "",
      jsonConfig: page.jsonConfig,
      isPublic: !!data.isPublic,
      createdBy: data.userId,
    });

    return template;
  }

  // Delete page
  async deletePage(pageId: string, institutionId: string): Promise<void> {
    const page = await Page.findOne({ _id: pageId, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    await Version.deleteMany({ pageId });
    await page.deleteOne();
  }

  // Duplicate page
  async duplicatePage(
    pageId: string,
    institutionId: string,
    userId: string,
    newName: string,
    newSlug: string,
  ): Promise<IPage> {
    const originalPage = await Page.findOne({ _id: pageId, institutionId });

    if (!originalPage) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    const existingPage = await Page.findOne({
      institutionId,
      slug: newSlug,
    });

    if (existingPage) {
      throw new AppError(
        "Page with this slug already exists",
        409,
        "DUPLICATE_SLUG",
      );
    }

    const duplicatePage = await Page.create({
      institutionId,
      name: newName,
      slug: newSlug,
      jsonConfig: originalPage.jsonConfig,
      seo: {
        ...originalPage.seo,
        canonicalUrl: `/${newSlug}`,
      },
      isPublished: false,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      orderIndex:
        ((
          await Page.findOne({ institutionId })
            .sort({ orderIndex: -1, updatedAt: -1 })
            .select("orderIndex")
            .lean()
        )?.orderIndex ?? 0) + 1,
      updatedBy: userId,
    });

    await Version.create({
      pageId: duplicatePage._id,
      versionNumber: 1,
      jsonConfig: duplicatePage.jsonConfig,
      changes: `Duplicated from ${originalPage.name}`,
      createdBy: userId,
    });

    return duplicatePage;
  }

  // Get published pages (public)
  async getPublishedPages(institutionId?: string): Promise<IPage[]> {
    await this.applyScheduledTransitions(institutionId);

    const query = institutionId
      ? { institutionId, isPublished: true }
      : { isPublished: true };

    return Page.find(query)
      .select("name slug jsonConfig seo htmlContent useHtml institutionId")
      .sort({ orderIndex: -1, updatedAt: -1 });
  }

  // Get published page by slug (public)
  async getPublishedPageBySlug(
    slug: string,
    institutionId: string,
  ): Promise<IPage> {
    await this.applyScheduledTransitions(institutionId);

    const page = await Page.findOne({
      slug,
      institutionId,
      isPublished: true,
    }).select("name slug jsonConfig seo htmlContent useHtml");

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }

  // Get any published page by slug globally (cross-institution lookup)
  async getPageBySlugGlobal(slug: string): Promise<IPage> {
    await this.applyScheduledTransitions();

    const page = await Page.findOne({ slug, isPublished: true }).select(
      "name slug jsonConfig seo htmlContent useHtml institutionId",
    );

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }
}

export default new PageService();
