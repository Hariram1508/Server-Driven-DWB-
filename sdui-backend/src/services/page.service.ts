import { Page, IPage } from "../models/Page.model";
import { Version } from "../models/Version.model";
import aiService from "./ai.service";
import { AppError } from "../middleware/error.middleware";
import { PageJSON } from "../types/page.types";

export class PageService {
  // Get all pages for an institution
  async getAllPages(institutionId: string): Promise<IPage[]> {
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
    // Check if slug already exists
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

    // Create page with default config
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
      useHtml: !!data.useHtml,
      isPublished: true,
      orderIndex: nextOrderIndex,
      updatedBy: data.userId,
    });

    // Create initial version
    await Version.create({
      pageId: page._id,
      versionNumber: 1,
      jsonConfig: page.jsonConfig,
      changes: "Initial version",
      createdBy: data.userId,
    });

    return page;
  }

  // Update page JSON config or HTML content
  async updatePage(
    pageId: string,
    institutionId: string,
    userId: string,
    data: {
      name?: string;
      slug?: string;
      jsonConfig?: PageJSON;
      htmlContent?: string;
      useHtml?: boolean;
      orderIndex?: number;
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

    // Update page
    if (data.name !== undefined) page.name = data.name;
    if (data.slug !== undefined) page.slug = data.slug;
    if (data.jsonConfig) page.jsonConfig = data.jsonConfig;
    if (data.htmlContent !== undefined) page.htmlContent = data.htmlContent;
    if (data.useHtml !== undefined) page.useHtml = data.useHtml;
    if (data.orderIndex !== undefined) page.orderIndex = data.orderIndex;

    page.updatedBy = userId as any;
    await page.save();

    // Create new version
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

  // Delete page
  async deletePage(pageId: string, institutionId: string): Promise<void> {
    const page = await Page.findOne({ _id: pageId, institutionId });

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    // Delete all versions
    await Version.deleteMany({ pageId });

    // Delete page
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

    // Check if new slug already exists
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

    // Create duplicate
    const duplicatePage = await Page.create({
      institutionId,
      name: newName,
      slug: newSlug,
      jsonConfig: originalPage.jsonConfig,
      isPublished: false,
      orderIndex:
        ((
          await Page.findOne({ institutionId })
            .sort({ orderIndex: -1, updatedAt: -1 })
            .select("orderIndex")
            .lean()
        )?.orderIndex ?? 0) + 1,
      updatedBy: userId,
    });

    // Create initial version
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
    const query = institutionId
      ? { institutionId, isPublished: true }
      : { isPublished: true };
    return Page.find(query)
      .select("name slug jsonConfig htmlContent useHtml institutionId")
      .sort({ orderIndex: -1, updatedAt: -1 });
  }

  // Get published page by slug (public)
  async getPublishedPageBySlug(
    slug: string,
    institutionId: string,
  ): Promise<IPage> {
    const page = await Page.findOne({
      slug,
      institutionId,
      isPublished: true,
    }).select("name slug jsonConfig htmlContent useHtml");

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }

  // Get any published page by slug globally (cross-institution lookup)
  async getPageBySlugGlobal(slug: string): Promise<IPage> {
    const page = await Page.findOne({ slug, isPublished: true }).select(
      "name slug jsonConfig htmlContent useHtml institutionId",
    );

    if (!page) {
      throw new AppError("Page not found", 404, "PAGE_NOT_FOUND");
    }

    return page;
  }
}

export default new PageService();
