import { Request, Response } from "express";
import aiService from "../services/ai.service";
import { CustomComponent } from "../models/CustomComponent.model";
import { Page } from "../models/Page.model";
import { sendSuccess, sendError } from "../utils/response.util";
import { asyncHandler } from "../middleware/error.middleware";

export class AIController {
  // Process command
  processCommand = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { command, context, model } = req.body;

    const result = await aiService.processCommand(
      command,
      context,
      typeof model === "string" ? model : undefined,
    );

    if (result.success) {
      return sendSuccess(
        res,
        result.operation,
        "Command processed successfully",
      );
    } else {
      return sendError(res, result.error || "Failed to process command", 500);
    }
  });

  // Generate content
  generateContent = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { type, params } = req.body;

    const result = await aiService.generateContent(type, params);

    if (result.success) {
      return sendSuccess(
        res,
        { content: result.content },
        "Content generated successfully",
      );
    } else {
      return sendError(res, result.error || "Failed to generate content", 500);
    }
  });

  // Get suggestions
  getSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pageJSON } = req.body;

    const result = await aiService.suggestImprovements(pageJSON);

    if (result.success) {
      return sendSuccess(
        res,
        result.suggestions,
        "Suggestions generated successfully",
      );
    } else {
      return sendError(
        res,
        result.error || "Failed to generate suggestions",
        500,
      );
    }
  });

  // Validate design
  validateDesign = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pageJSON } = req.body;

    const result = await aiService.validateDesign(pageJSON);

    if (result.success) {
      return sendSuccess(
        res,
        {
          isValid: result.isValid,
          issues: result.issues,
        },
        "Validation completed",
      );
    } else {
      return sendError(res, result.error || "Failed to validate design", 500);
    }
  });

  // Generate and save a custom component
  generateCustomComponent = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        return sendError(res, "Unauthorized", 401);
      }

      const { prompt, model } = req.body;

      if (!prompt) {
        return sendError(res, "Prompt is required", 400);
      }

      const result = await aiService.generateComponent(
        prompt,
        typeof model === "string" ? model : undefined,
      );

      if (result.success && result.component) {
        // Save the generated component to the database
        const component = await CustomComponent.create({
          institutionId: req.user.institutionId,
          name: result.component.name,
          description: result.component.description,
          type: result.component.type,
          props: result.component.props,
          jsxCode: result.component.jsxCode,
          createdBy: req.user.userId,
        });

        return sendSuccess(
          res,
          component,
          "Component generated and saved successfully",
          201,
        );
      } else {
        return sendError(
          res,
          result.error || "Failed to generate component",
          500,
        );
      }
    },
  );

  // Get all custom components for an institution
  getCustomComponents = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const components = await CustomComponent.find({
      institutionId: req.user.institutionId,
    }).sort({ createdAt: -1 });

    return sendSuccess(res, components);
  });

  // Plan a multi-page site structure from a single prompt
  planSite = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { prompt } = req.body;
    if (!prompt) {
      return sendError(res, "Prompt is required", 400);
    }

    const result = await aiService.planSite(prompt);

    if (result.success) {
      return sendSuccess(
        res,
        { pages: result.pages },
        "Site planned successfully",
      );
    } else {
      return sendError(res, result.error || "Failed to plan site", 500);
    }
  });

  // Generate a full page HTML using Groq/Claude
  generatePageHTML = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { prompt, currentSlug, templateType } = req.body;
    if (!prompt) {
      return sendError(res, "Prompt is required", 400);
    }

    // Get pages for link context
    const existingPages = await Page.find({
      institutionId: req.user.institutionId,
    })
      .select("name slug")
      .sort({ createdAt: 1 });

    const result = await aiService.generateFullPageHTML(prompt, {
      pages: existingPages.map((p: { name: string; slug: string }) => ({
        name: p.name,
        slug: p.slug,
      })),
      currentSlug: currentSlug || undefined,
      templateType: templateType || undefined,
    });

    if (result.success) {
      return sendSuccess(
        res,
        { html: result.html },
        "HTML generated successfully",
      );
    } else {
      return sendError(res, result.error || "Failed to generate HTML", 500);
    }
  });

  // Modify existing full page HTML
  modifyPageHTML = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { prompt, currentHtml, currentSlug } = req.body;
    if (!prompt) {
      return sendError(res, "Prompt is required", 400);
    }
    if (!currentHtml) {
      return sendError(res, "Current HTML is required", 400);
    }

    // Fetch existing pages to provide navigation context to AI
    const existingPages = await Page.find({
      institutionId: req.user.institutionId,
    })
      .select("name slug")
      .sort({ createdAt: 1 });

    const pagesContext = existingPages.map(
      (p: { name: string; slug: string }) => ({ name: p.name, slug: p.slug }),
    );

    const result = await aiService.modifyFullPageHTML(prompt, currentHtml, {
      pages: pagesContext,
      currentSlug: currentSlug || undefined,
    });

    if (result.success) {
      return sendSuccess(
        res,
        { html: result.html },
        "HTML modified successfully",
      );
    } else {
      return sendError(res, result.error || "Failed to modify HTML", 500);
    }
  });

  // Multi-turn AI chat with persisted context memory
  chatWithMemory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { message, threadId, model } = req.body;
    if (!message || !String(message).trim()) {
      return sendError(res, "Message is required", 400);
    }

    const result = await aiService.chatWithMemory({
      institutionId: req.user.institutionId,
      userId: req.user.userId,
      message: String(message).trim(),
      threadId: typeof threadId === "string" ? threadId : undefined,
      requestedModel: typeof model === "string" ? model : undefined,
    });

    return sendSuccess(res, result, "AI reply generated");
  });

  getConversationHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const history = await aiService.getConversationHistory(
      req.user.institutionId,
      req.user.userId,
    );

    return sendSuccess(
      res,
      { conversations: history },
      "Conversation history fetched",
    );
  });

  getConversationThread = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const threadId = String(req.params.threadId || "").trim();
    if (!threadId) {
      return sendError(res, "Thread ID is required", 400);
    }

    const thread = await aiService.getConversationThread(
      req.user.institutionId,
      req.user.userId,
      threadId,
    );

    if (!thread) {
      return sendError(res, "Conversation thread not found", 404);
    }

    return sendSuccess(res, thread, "Conversation thread fetched");
  });

  runNlpBenchmark = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const result = await aiService.runNlpAccuracyBenchmark(
      req.user.institutionId,
      req.user.userId,
    );
    return sendSuccess(res, result, "NLP benchmark completed");
  });

  validateCompliance = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pageJSON } = req.body;
    if (!pageJSON || typeof pageJSON !== "object") {
      return sendError(res, "Page JSON is required", 400);
    }

    const result = await aiService.runComplianceValidation(pageJSON);
    return sendSuccess(res, result, "Compliance validation completed");
  });

  getComplianceReport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const report = await aiService.getComplianceReport(req.user.institutionId);
    return sendSuccess(res, report, "Compliance report fetched");
  });

  getComplianceAuditTrail = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.user) {
        return sendError(res, "Unauthorized", 401);
      }

      const pageId =
        typeof req.query.pageId === "string" ? req.query.pageId : undefined;

      const trail = await aiService.getComplianceAuditTrail(
        req.user.institutionId,
        pageId,
      );
      return sendSuccess(
        res,
        { events: trail },
        "Compliance audit trail fetched",
      );
    },
  );

  getLiveSuggestions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pageJSON } = req.body;
    if (!pageJSON || typeof pageJSON !== "object") {
      return sendError(res, "Page JSON is required", 400);
    }

    const result = await aiService.getLiveSuggestions(pageJSON);
    return sendSuccess(res, result, "Live suggestions generated");
  });

  applySuggestion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { pageJSON, operation } = req.body;
    if (!pageJSON || typeof pageJSON !== "object") {
      return sendError(res, "Page JSON is required", 400);
    }
    if (!operation || typeof operation !== "object") {
      return sendError(res, "Operation is required", 400);
    }

    const updatedPageJSON = aiService.applySuggestionOperation(
      pageJSON,
      operation,
    );
    return sendSuccess(
      res,
      { pageJSON: updatedPageJSON },
      "Suggestion applied",
    );
  });

  getUsageSummary = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const from =
      typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
    const to =
      typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

    const summary = await aiService.getUsageSummary(
      req.user.institutionId,
      from,
      to,
    );
    return sendSuccess(res, summary, "Usage summary fetched");
  });

  generateImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { prompt, size } = req.body;
    if (!prompt || !String(prompt).trim()) {
      return sendError(res, "Prompt is required", 400);
    }

    const result = await aiService.generateImageFromPrompt({
      prompt: String(prompt).trim(),
      size,
      institutionId: req.user.institutionId,
      userId: req.user.userId,
    });
    return sendSuccess(res, result, "Image generated successfully");
  });

  executeJsx = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { jsxCode } = req.body;
    if (!jsxCode || !String(jsxCode).trim()) {
      return sendError(res, "JSX code is required", 400);
    }

    const result = aiService.executeJsxAsLiveComponent(String(jsxCode));
    return sendSuccess(res, result, "JSX compiled to live component payload");
  });
}

export default new AIController();
