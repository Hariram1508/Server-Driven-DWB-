import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createHash, randomUUID } from "crypto";
import env from "../config/env";
import { getRedisClient } from "../config/redis";
import { AppError } from "../middleware/error.middleware";
import { AIConversation } from "../models/AIConversation.model";
import { ComplianceAudit } from "../models/ComplianceAudit.model";
import { AIUsage } from "../models/AIUsage.model";
import { Page } from "../models/Page.model";
import { PageJSON } from "../types/page.types";
import {
  getTemplate,
  suggestTemplate,
  TemplateType,
} from "../templates/site-templates";

export class AIService {
  private anthropic: Anthropic | null = null;
  private groq: OpenAI | null = null;
  private openai: OpenAI | null = null;
  private readonly supportedComponentTypes = [
    "HeroBanner",
    "HeroHeading",
    "HeroSubheading",
    "HeroCTAButton",
    "TextBlock",
    "Container",
    "Section",
    "Grid",
    "GridSection",
    "Image",
    "Video",
    "AboutSection",
    "Statistics",
    "FacultyGrid",
    "FAQAccordion",
    "ContactForm",
    "DynamicSection",
    "Button",
    "ActionButton",
    "RawHTML",
    "Card",
    "ClubCard",
    "CourseList",
    "DepartmentCard",
    "Divider",
    "EventCalendar",
    "ExamSchedule",
    "FacilityCard",
    "FeedbackForm",
    "Footer",
    "Breadcrumb",
    "Pagination",
    "Gallery",
    "Heading",
    "Paragraph",
    "Spacer",
    "FacultyProfile",
    "AdmissionForm",
    "AnnouncementBanner",
    "InquiryForm",
    "Badge",
    "AlertBanner",
    "Modal",
    "Navbar",
    "PlacementStats",
    "ProgressTracker",
    "Quote",
    "ScholarshipCard",
    "Sidebar",
    "Stack",
    "StudentTestimonial",
    "Tabs",
    "Testimonial",
    "Timeline",
    "Tooltip",
  ] as const;

  constructor() {
    if (env.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: env.anthropicApiKey,
      });
    }

    if (env.groqApiKey) {
      this.groq = new OpenAI({
        apiKey: env.groqApiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    }

    if (env.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: env.openaiApiKey,
      });
    }

    if (!this.anthropic && !this.groq && !this.openai) {
      console.warn(
        "⚠️ No AI API keys configured. AI features will be disabled.",
      );
    }
  }

  private isTextLikeComponentType(type: unknown): boolean {
    const normalized = String(type || "").toLowerCase();
    return (
      normalized.includes("text") ||
      normalized.includes("paragraph") ||
      normalized === "heading"
    );
  }

  private hasMeaningfulTextProps(props: Record<string, unknown>): boolean {
    const candidates = [
      props.content,
      props.text,
      props.description,
      props.body,
      props.title,
      props.subtitle,
      props.children,
    ];

    return candidates.some(
      (value) =>
        typeof value === "string" &&
        value.trim().length >= 20 &&
        !/enter your text here/i.test(value),
    );
  }

  private shouldGenerateTextComponentContent(command: string): boolean {
    const normalized = command.toLowerCase();

    if (
      /\b(empty|blank|without\s+text|no\s+text|no\s+content|do\s*not\s+write|don't\s+write|only\s+add\s+text\s+component|only\s+text\s+component|text\s+component\s+only|component\s+only)\b/i.test(
        normalized,
      )
    ) {
      return false;
    }

    return (
      /\b(write|generate|create|compose|draft)\b/i.test(normalized) &&
      /\b(paragraph|article|copy|content|bio|description|summary|text)\b/i.test(
        normalized,
      )
    );
  }

  private normalizeTextComponentProps(
    props: Record<string, unknown>,
  ): Record<string, unknown> {
    const primaryText = [
      props.content,
      props.text,
      props.description,
      props.body,
      props.title,
      props.subtitle,
      props.children,
    ].find((value) => typeof value === "string" && value.trim().length > 0);

    if (typeof primaryText !== "string") {
      return props;
    }

    return {
      ...props,
      text: props.text ?? primaryText,
      content: props.content ?? primaryText,
      description: props.description ?? primaryText,
      body: props.body ?? primaryText,
    };
  }

  private extractTopicFromCommand(command: string): string {
    const lowered = command.toLowerCase();
    const aboutMatch = lowered.match(
      /(?:about|on|regarding|for)\s+([a-z0-9\s\-+,.'&/]{3,120})/i,
    );

    if (aboutMatch?.[1]) {
      return aboutMatch[1]
        .replace(/\b(at|in|to|of|the\s+page|bottom|top)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    return "the requested topic";
  }

  private async generateTextForComponent(
    command: string,
    requestedModel?: string,
  ): Promise<string> {
    const topic = this.extractTopicFromCommand(command);
    const { model, provider } = this.resolveModel(requestedModel);

    const prompt = `Write one clear paragraph (80-120 words) for a website text section about ${topic}.
Requirements:
- Output plain text only (no JSON, no markdown)
- Keep it engaging, specific, and readable
- Do not include headings or bullet points`;

    const text = await this.callModel(provider, model, prompt, false);
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalizeTemplateType(
    templateType: unknown,
    nameHint: string = "",
    purposeHint: string = "",
  ): TemplateType {
    const raw =
      typeof templateType === "string" ? templateType.trim().toLowerCase() : "";

    const legacyMap: Record<string, TemplateType> = {
      "hero-dark": "college-home",
      "product-grid": "college-programs",
      "about-editorial": "college-about",
      "contact-split": "college-contact",
      "blog-magazine": "college-events",
      "services-dark": "college-campus",
      "pricing-tiers": "college-admissions",
      "team-profiles": "college-faculty",
      "product-showcase": "college-gallery",
      "minimal-content": "college-about",
    };

    if (legacyMap[raw]) {
      return legacyMap[raw];
    }

    const validTemplates: TemplateType[] = [
      "college-home",
      "college-admissions",
      "college-programs",
      "college-faculty",
      "college-about",
      "college-campus",
      "college-events",
      "college-contact",
      "college-placements",
      "college-gallery",
    ];

    if (validTemplates.includes(raw as TemplateType)) {
      return raw as TemplateType;
    }

    return suggestTemplate(nameHint, purposeHint);
  }

  private async getChatCompletion(
    prompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    if (this.anthropic) {
      const message = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: jsonMode ? 2000 : 1000,
        messages: [{ role: "user", content: prompt }],
      });
      return message.content[0].type === "text" ? message.content[0].text : "";
    } else if (this.groq) {
      console.log(
        `Calling Groq using model: llama-3.3-70b-versatile ${jsonMode ? "(JSON Mode)" : ""}`,
      );
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: jsonMode ? { type: "json_object" } : undefined,
      });
      return response.choices[0].message.content || "";
    }
    throw new AppError("AI service not configured", 503, "AI_NOT_CONFIGURED");
  }

  // Process natural language command
  async processCommand(
    command: string,
    context: any,
    requestedModel?: string,
  ): Promise<{
    success: boolean;
    operation?: any;
    error?: string;
  }> {
    try {
      const lowerCommand = command.toLowerCase();
      const isSpacerRequest =
        /\b(spacer|blank\s+space|empty\s+space|whitespace|gap|vertical\s+space|space\s+only)\b/i.test(
          lowerCommand,
        );

      if (isSpacerRequest) {
        const heightMatch = lowerCommand.match(
          /(\d+(?:\.\d+)?)(px|rem|em|vh|vw|%)?/i,
        );
        const height = heightMatch
          ? `${heightMatch[1]}${heightMatch[2] || "px"}`
          : "32px";

        return {
          success: true,
          operation: {
            action: "insert",
            component: {
              type: "Spacer",
              props: {
                height,
                backgroundColor: "transparent",
              },
              position: "append",
            },
          },
        };
      }

      const compactContext = this.buildCompactCommandContext(context);
      const validTypes = this.supportedComponentTypes.join(", ");
      const prompt = `You are an AI assistant for a website builder.
    
User command: "${command}"

Current page context:
${JSON.stringify(compactContext, null, 2)}

Analyze the command. Determine if the user wants to:
1. Build a COMPLETELY NEW FULL PAGE or a FULL WEBSITE/TEMPLATE from scratch (Keywords: "full", "website", "template", "landing page", "html code", "full code"). For these, return the action "generate_full_html". This is the HIGHEST PRIORITY.
2. Perform a specific modification (insert, update, delete, move) on existing sections.

Response format:
{
  "action": "insert" | "update" | "delete" | "move" | "generate_full_html",
  "reason": "Short explanation",
  "component": {
    "type": "ComponentType",
    "props": {...},
    "position": "append" | "prepend" | number
  },
  "prompt": "Full description for HTML generation if action is generate_full_html"
}

VALID COMPONENT TYPES (only use these for insert/update):
${validTypes}
CRITICAL: If the user says "full", "website", or "html page", DO NOT use "insert". USE "generate_full_html".
Placement rules:
- "at end" or "bottom" => position "append"
- "at top" or "start" => position "prepend"
- "after section 2" => position 2 (number)
- If not specified => position "append"

Only respond with valid JSON, no explanations.`;

      const { model, provider } = this.resolveModel(requestedModel);
      let responseText = await this.callModel(provider, model, prompt, true);
      responseText = responseText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();
      console.log("AI Raw Response:", responseText);
      const jsonOperation = JSON.parse(responseText);

      // Validation: If it seems like a full page request, convert it to generate_full_html
      const isFullPageRequest = lowerCommand.match(
        /full|website|template|landing|college|university|hospital|school/,
      );

      console.log("Is Full Page Request:", !!isFullPageRequest);

      if (isFullPageRequest && jsonOperation.action !== "generate_full_html") {
        console.log("Overriding action to generate_full_html");
        jsonOperation.action = "generate_full_html";
        jsonOperation.prompt = command;
      }

      // If it's an insert with an unknown type, convert it to generate_full_html
      if (
        jsonOperation.action === "insert" &&
        !this.supportedComponentTypes.includes(jsonOperation.component?.type)
      ) {
        console.log("Unknown component type, reverting to generate_full_html");
        jsonOperation.action = "generate_full_html";
        jsonOperation.prompt = command;
      }

      if (jsonOperation.action === "insert" && jsonOperation.component) {
        const commandText = lowerCommand;
        if (/\b(at\s+top|at\s+start|on\s+top)\b/i.test(commandText)) {
          jsonOperation.component.position = "prepend";
        } else if (
          /\b(at\s+end|at\s+bottom|to\s+the\s+end|last)\b/i.test(commandText)
        ) {
          jsonOperation.component.position = "append";
        }

        if (this.isTextLikeComponentType(jsonOperation.component.type)) {
          const componentProps = this.normalizeTextComponentProps(
            (jsonOperation.component.props || {}) as Record<string, unknown>,
          );
          jsonOperation.component.props = componentProps;

          if (
            this.shouldGenerateTextComponentContent(command) &&
            !this.hasMeaningfulTextProps(componentProps)
          ) {
            try {
              const generatedText = await this.generateTextForComponent(
                command,
                requestedModel,
              );

              jsonOperation.component.props = {
                ...componentProps,
                content: generatedText,
                text: generatedText,
                description: generatedText,
              };
            } catch (generationError) {
              console.warn(
                "Failed to auto-generate text component content:",
                generationError,
              );
            }
          }
        }
      }

      console.log(
        "Final AI Operation:",
        JSON.stringify(jsonOperation, null, 2),
      );

      return {
        success: true,
        operation: jsonOperation,
      };
    } catch (error) {
      console.error("AI command processing error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  private buildCompactCommandContext(context: any): Record<string, unknown> {
    if (!context || typeof context !== "object") {
      return {};
    }

    const raw = context as Record<string, any>;
    const rootNode = raw.ROOT;
    const entries = Object.entries(raw).filter(([key]) => key !== "ROOT");

    const components = entries.slice(0, 25).map(([id, node]) => {
      const nodeObj = (node || {}) as Record<string, any>;
      const type =
        (nodeObj.type &&
          typeof nodeObj.type === "object" &&
          nodeObj.type.resolvedName) ||
        nodeObj.type ||
        "Unknown";
      const props = (nodeObj.props || {}) as Record<string, unknown>;
      const previewText = [
        props.title,
        props.subtitle,
        props.description,
        props.text,
      ]
        .filter(
          (value) => typeof value === "string" && (value as string).trim(),
        )
        .join(" | ")
        .slice(0, 180);

      return {
        id,
        type,
        previewText,
      };
    });

    const componentCounts: Record<string, number> = {};
    for (const [, node] of entries) {
      const nodeObj = (node || {}) as Record<string, any>;
      const type =
        (nodeObj.type &&
          typeof nodeObj.type === "object" &&
          nodeObj.type.resolvedName) ||
        nodeObj.type ||
        "Unknown";
      componentCounts[String(type)] = (componentCounts[String(type)] || 0) + 1;
    }

    return {
      nodeCount: entries.length,
      root: {
        type:
          rootNode && typeof rootNode === "object"
            ? rootNode.type?.resolvedName || rootNode.type || "ROOT"
            : "ROOT",
      },
      componentCounts,
      componentPreview: components,
      truncated: entries.length > 25,
    };
  }

  // Generate content
  async generateContent(
    type: string,
    params: any,
  ): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }> {
    try {
      let prompt = "";

      switch (type) {
        case "department":
          prompt = `Write a professional 200-word description for the ${params.departmentName} department at ${params.collegeName}.
        
Include:
- Overview of the department
- Programs offered: ${params.programs.join(", ")}
- Key focus areas
- Career opportunities

Write in a professional, inspiring tone suitable for a college website.`;
          break;

        case "event":
          prompt = `Write a 100-word description for this event:
        
Event Name: ${params.eventName}
Date: ${params.eventDate}
Type: ${params.eventType}

Include key highlights and who should attend.`;
          break;

        case "course":
          prompt = `Write a 150-word description for this course:
        
Course Name: ${params.courseName}
Level: ${params.level}
Duration: ${params.duration}

Include course objectives, key topics, and expected outcomes.`;
          break;

        case "faculty":
          prompt = `Write a 150-word professional biography for:
        
Name: ${params.name}
Position: ${params.position}
Department: ${params.department}
Specialization: ${params.specialization}

Include education, research interests, and achievements.`;
          break;

        default:
          prompt = `Generate professional content for: ${JSON.stringify(params)}`;
      }

      const content = await this.getChatCompletion(prompt);

      return {
        success: true,
        content,
      };
    } catch (error) {
      console.error("Content generation error:", error);
      return {
        success: false,
        error: "Failed to generate content",
      };
    }
  }

  // Suggest improvements
  async suggestImprovements(pageJSON: PageJSON): Promise<{
    success: boolean;
    suggestions?: any[];
    error?: string;
  }> {
    try {
      const prompt = `Analyze this website page structure and suggest improvements:

${JSON.stringify(pageJSON, null, 2)}

Check for:
1. Missing important sections (About, Contact, etc.)
2. Accessibility issues
3. SEO optimization
4. Design best practices
5. Educational institution requirements (AICTE/UGC compliance)

Respond with JSON array of suggestions:
[
  {
    "priority": "critical" | "important" | "recommended",
    "category": "accessibility" | "seo" | "design" | "compliance",
    "issue": "Description of the issue",
    "suggestion": "How to fix it",
    "autoFix": true/false
  }
]

Only respond with valid JSON array.`;

      const responseText = await this.getChatCompletion(prompt, true);
      const suggestions = JSON.parse(responseText);

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      console.error("Suggestion generation error:", error);
      return {
        success: false,
        error: "Failed to generate suggestions",
      };
    }
  }

  // Validate design
  async validateDesign(pageJSON: PageJSON): Promise<{
    success: boolean;
    isValid?: boolean;
    issues?: any[];
    error?: string;
  }> {
    try {
      const prompt = `Validate this website page for compliance and best practices:

${JSON.stringify(pageJSON, null, 2)}

Check for:
1. WCAG 2.1 accessibility compliance
2. SEO requirements (meta tags, headings, etc.)
3. Educational institution compliance
4. Mobile responsiveness considerations
5. Performance issues

Respond with JSON:
{
  "isValid": true/false,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "category": "accessibility" | "seo" | "compliance" | "performance",
      "message": "Issue description"
    }
  ]
}

Only respond with valid JSON.`;

      const responseText = await this.getChatCompletion(prompt, true);
      const validation = JSON.parse(responseText);

      return {
        success: true,
        isValid: validation.isValid,
        issues: validation.issues,
      };
    } catch (error) {
      console.error("Design validation error:", error);
      return {
        success: false,
        error: "Failed to validate design",
      };
    }
  }

  // Generate a new component using Groq
  async generateComponent(
    prompt: string,
    requestedModel?: string,
  ): Promise<{
    success: boolean;
    component?: {
      name: string;
      description: string;
      type: string;
      props: any;
      jsxCode: string;
    };
    error?: string;
  }> {
    try {
      const systemPrompt = `You are an expert React and Craft.js developer.
Generate a new reusable component based on the user's request.
The component should be compatible with Craft.js.

Response MUST be a JSON object with this exact structure:
{
  "name": "Readable Name",
  "description": "Short description of what it does",
  "type": "Button",
  "props": {
    "title": "...",
    "subtitle": "...",
    "content": "...",
    "backgroundColor": "...",
    "textColor": "...",
    "alignment": "left|center|right"
  },
  "jsxCode": "..."
}

You can use these existing types: HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, FeedbackForm, Image, DynamicSection, Button, RawHTML.
If the component requested doesn't fit the others, use "RawHTML" and put the full HTML/Tailwind code in the "html" prop.
Only return valid JSON. Do not include markdown code blocks or explanations.`;

      const { model, provider } = this.resolveModel(requestedModel);
      console.log(
        `Generating component with ${provider} using model: ${model}`,
      );

      const responseText = await this.callModel(
        provider,
        model,
        `${systemPrompt}\n\nUser request:\n${prompt}`,
        true,
      );
      const componentData = JSON.parse(responseText);

      const normalizedType = String(componentData?.type || "RawHTML").trim();
      componentData.name =
        typeof componentData?.name === "string" && componentData.name.trim()
          ? componentData.name.trim()
          : `${normalizedType} Component`;
      componentData.description =
        typeof componentData?.description === "string"
          ? componentData.description
          : "AI generated component";
      componentData.type = normalizedType;
      componentData.props =
        componentData?.props && typeof componentData.props === "object"
          ? componentData.props
          : {};

      if (this.isTextLikeComponentType(componentData?.type)) {
        componentData.props = this.normalizeTextComponentProps(
          componentData.props as Record<string, unknown>,
        );
      }

      if (
        typeof componentData?.jsxCode !== "string" ||
        !componentData.jsxCode.trim()
      ) {
        componentData.jsxCode = `<${normalizedType} />`;
      }

      if (
        this.isTextLikeComponentType(componentData?.type) &&
        this.shouldGenerateTextComponentContent(prompt)
      ) {
        const componentProps = (componentData.props || {}) as Record<
          string,
          unknown
        >;

        if (!this.hasMeaningfulTextProps(componentProps)) {
          const generatedText = await this.generateTextForComponent(
            prompt,
            requestedModel,
          );

          componentData.props = {
            ...componentProps,
            content: generatedText,
            text: generatedText,
            description: generatedText,
          };
        }
      }

      return {
        success: true,
        component: componentData,
      };
    } catch (error: any) {
      console.error(
        "Groq component generation error:",
        error?.response?.data || error,
      );
      return {
        success: false,
        error:
          error?.response?.data?.error?.message ||
          error.message ||
          "Failed to generate component using Groq",
      };
    }
  }

  // Plan a full multi-page website structure from a single prompt
  async planSite(prompt: string): Promise<{
    success: boolean;
    pages?: Array<{
      name: string;
      slug: string;
      purpose: string;
      templateType: string;
    }>;
    error?: string;
  }> {
    try {
      const planPrompt = `You are a website architect. The user wants to build a website described below.
Analyse the request and decide what PAGES this website needs.

USER REQUEST: "${prompt}"

RULES:
- Return 3 to 7 pages. Always include a home page as the FIRST item.
- Slugs must be lowercase, URL-safe, hyphens only (no spaces, no slashes).
- "purpose" describes the exact content and sections on this page (2-3 sentences).
- "templateType" must be ONE of:
  college-home, college-admissions, college-programs, college-faculty,
  college-about, college-campus, college-events, college-contact,
  college-placements, college-gallery
  Choose the best-fitting template:
  college-home → homepage, landing page
  college-admissions → admissions, apply, enroll
  college-programs → programs, courses, departments
  college-faculty → faculty, team, staff profiles
  college-about → about, mission, history
  college-campus → campus life, facilities, clubs
  college-events → events, news, announcements
  college-contact → contact, reach us, support
  college-placements → placements, careers, recruiters
  college-gallery → gallery, media, photos

Respond with ONLY a JSON object (no markdown):
{
  "pages": [
    { "name": "Page Name", "slug": "url-slug", "purpose": "Description.", "templateType": "hero-dark" }
  ]
}`;

      let responseText: string;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1500,
          messages: [{ role: "user", content: planPrompt }],
        });
        responseText =
          message.content[0].type === "text" ? message.content[0].text : "{}";
        // Strip markdown fences if present
        responseText = responseText
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/gi, "")
          .trim();
      } else if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: planPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 1500,
        });
        responseText = response.choices[0].message.content || "{}";
      } else {
        throw new AppError(
          "AI service not configured",
          503,
          "AI_NOT_CONFIGURED",
        );
      }

      const parsed = JSON.parse(responseText);
      const pages: Array<{ name: string; slug: string; purpose: string }> =
        Array.isArray(parsed) ? parsed : (parsed.pages ?? []);

      // Sanitize slugs just in case
      const sanitized = pages.map((p) => ({
        name: p.name,
        slug: p.slug
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
        purpose: p.purpose,
        templateType: this.normalizeTemplateType(
          (p as any).templateType,
          p.name,
          p.purpose,
        ),
      }));

      return { success: true, pages: sanitized };
    } catch (error: any) {
      console.error("Site planning error:", error);
      return { success: false, error: error.message || "Failed to plan site" };
    }
  }

  // Extract all [PLACEHOLDER] keys from a template
  private extractPlaceholders(html: string): string[] {
    const matches = new Set<string>();
    const regex = /\[([A-Z][A-Z0-9_]+)\]/g;
    let m;
    while ((m = regex.exec(html)) !== null) matches.add(m[1]);
    return Array.from(matches);
  }

  private fillTemplate(
    template: string,
    values: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.split(`[${key}]`).join(value ?? "");
    }
    return result;
  }

  /**
   * Compress a flat placeholder list into a compact schema for the AI.
   * Numbered keys like STAT1_N, STAT2_N, STAT3_N get merged into
   *   { "STAT_N": ["v1","v2","v3"] }
   * which the AI fills as an array — server expands back to STAT1_N etc.
   * Returns { compactKeys, expandFn } where expandFn restores the flat map.
   */
  private compressPlaceholders(keys: string[]): {
    compactKeys: string[]; // compact key names for the prompt
    expandFn: (aiValues: Record<string, any>) => Record<string, string>; // restores flat map
  } {
    // Group keys that match PREFIX<digit>[_SUFFIX] into arrays
    // e.g.  STAT1_N, STAT2_N, STAT3_N, STAT4_N  →  group "STAT_N" with 4 members
    const groups = new Map<string, string[]>(); // groupKey → [key1, key2, ...]
    const singles: string[] = [];

    for (const key of keys) {
      const m = key.match(/^([A-Z_]+?)(\d+)(_[A-Z0-9_]+)?$/);
      if (m) {
        const groupKey = m[1].replace(/_$/, "") + (m[3] ?? ""); // e.g. STAT_N
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey)!.push(key);
      } else {
        singles.push(key);
      }
    }

    // Only treat as group if 2+ numbered variants exist
    const realGroups = new Map<string, string[]>();
    for (const [gk, members] of groups) {
      if (members.length >= 2) {
        realGroups.set(gk, members.sort());
      } else {
        singles.push(...members);
      }
    }

    const compactKeys: string[] = [
      ...singles,
      // compact format: "STAT_N[]" signals array of values
      ...Array.from(realGroups.keys()).map(
        (k) => `${k}[] (${realGroups.get(k)!.length} items)`,
      ),
    ];

    const expandFn = (
      aiValues: Record<string, any>,
    ): Record<string, string> => {
      const flat: Record<string, string> = {};

      // Copy single keys directly
      for (const sk of singles) {
        if (aiValues[sk] !== undefined) flat[sk] = String(aiValues[sk]);
      }

      // Expand arrays back to numbered keys
      for (const [gk, members] of realGroups) {
        const arr: any[] = aiValues[gk] ?? aiValues[`${gk}[]`] ?? [];
        members.forEach((origKey, i) => {
          flat[origKey] = arr[i] !== undefined ? String(arr[i]) : "";
        });
      }

      return flat;
    };

    return { compactKeys, expandFn };
  }

  // Generate a full page HTML using a pre-built template + AI JSON filling.
  // Instead of sending the full template (~12k chars) to the AI, we extract
  // only the placeholder KEYS, ask AI for a small JSON object, then fill
  // the template server-side. This keeps each request well under 2k tokens.
  async generateFullPageHTML(
    prompt: string,
    context: {
      pages: { name: string; slug: string }[];
      currentSlug?: string;
      templateType?: string;
    },
  ): Promise<{
    success: boolean;
    html?: string;
    error?: string;
  }> {
    if (!this.groq && !this.anthropic) {
      throw new AppError("AI service not configured", 503, "AI_NOT_CONFIGURED");
    }

    try {
      const allPages = context.pages;
      const currentSlug = context.currentSlug;
      const year = new Date().getFullYear();

      // Pick template
      const templateType = this.normalizeTemplateType(
        context.templateType,
        currentSlug ?? "",
        prompt,
      );
      const templateHtml = getTemplate(templateType);

      // Build nav links — white-on-dark style matching SHARED_NAV (dark blue navbar)
      // These links are also reused in footers which are all dark, so white works everywhere.
      const navLinksHtml = allPages
        .map((p) =>
          p.slug === currentSlug
            ? `<a href="/${p.slug}" style="color:#ffffff;font-weight:800;text-decoration:underline;text-underline-offset:4px;white-space:nowrap">${p.name}</a>`
            : `<a href="/${p.slug}" style="color:rgba(191,219,254,0.8);font-weight:500;white-space:nowrap" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(191,219,254,0.8)'">${p.name}</a>`,
        )
        .join(
          '<span style="color:rgba(255,255,255,0.15);margin:0 8px">|</span>',
        );

      const pageSlugList = allPages.map((p) => `/${p.slug}`).join(", ");

      // Extract placeholder keys — exclude ones we fill ourselves
      const autoFilled = new Set(["NAV_LINKS", "YEAR"]);
      const placeholders = this.extractPlaceholders(templateHtml).filter(
        (k) => !autoFilled.has(k),
      );

      // Compress numbered sequences into arrays to shrink the prompt significantly
      const { compactKeys, expandFn } = this.compressPlaceholders(placeholders);

      const fillPrompt = `College page content needed. Return compact JSON only.

College info: ${prompt}
Page: /${currentSlug ?? ""} | Site pages: ${allPages.map((p) => `${p.name}→/${p.slug}`).join(" ")}

Fill these keys (keys ending in [] = return array of values, one per item):
${compactKeys.join(", ")}

Key rules: _LINK/_URL=use a real slug from ${pageSlugList} | _IMG/_SEED=one descriptive word | _ICON=one emoji | _DAY=2-digit day | _MON=3-letter month | _ABBR=short abbreviation | LOGO_ABBR=2-3 uppercase letters | PAGE_TITLE=browser tab title

Return ONLY valid JSON.`;

      console.log(
        `[generateFullPageHTML] template=${templateType} slug=${currentSlug} keys=${placeholders.length}→${compactKeys.length} promptLen=${fillPrompt.length}`,
      );

      let jsonText: string;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2000,
          messages: [{ role: "user", content: fillPrompt }],
        });
        jsonText =
          message.content[0].type === "text" ? message.content[0].text : "{}";
      } else if (this.groq) {
        await new Promise((r) => setTimeout(r, 300));
        const response = await this.groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: fillPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 2000,
        });
        jsonText = response.choices[0].message.content || "{}";
      } else {
        throw new AppError(
          "AI service not configured",
          503,
          "AI_NOT_CONFIGURED",
        );
      }

      // Strip markdown fences if AI ignored instructions
      jsonText = jsonText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

      let aiValues: Record<string, any> = {};
      try {
        aiValues = JSON.parse(jsonText);
      } catch {
        throw new Error(`AI returned invalid JSON: ${jsonText.slice(0, 200)}`);
      }

      // Expand compressed arrays back to numbered flat keys
      const values: Record<string, string> = expandFn(aiValues);

      // Always override these with our correct values
      values["NAV_LINKS"] = navLinksHtml;
      values["YEAR"] = String(year);

      const filledHtml = this.fillTemplate(templateHtml, values);

      console.log(
        `[generateFullPageHTML] done — filledLen=${filledHtml.length}`,
      );

      return { success: true, html: filledHtml };
    } catch (error: any) {
      let msg: string =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to generate page HTML";

      if (
        msg.includes("429") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("tokens per day")
      ) {
        const waitMatch = msg.match(/try again in ([^.]+)/i);
        msg = waitMatch
          ? `AI daily limit reached. Try again in ${waitMatch[1]}.`
          : "AI daily token limit reached. Please try again in a few hours.";
      }

      console.error("[generateFullPageHTML] ERROR:", msg);
      return { success: false, error: msg };
    }
  }

  // Iteratively modify existing HTML based on user request
  async modifyFullPageHTML(
    prompt: string,
    currentHtml: string,
    context?: {
      pages?: { name: string; slug: string }[];
      currentSlug?: string;
    },
  ): Promise<{
    success: boolean;
    html?: string;
    error?: string;
  }> {
    if (!this.groq && !this.anthropic) {
      throw new AppError("AI service not configured", 503, "AI_NOT_CONFIGURED");
    }

    try {
      // Build page navigation context for cross-page linking
      let pageLinksContext = "";
      if (context?.pages && context.pages.length > 0) {
        const currentIndex = context?.currentSlug
          ? context.pages.findIndex((p) => p.slug === context.currentSlug)
          : -1;
        const nextPage =
          currentIndex >= 0 && currentIndex < context.pages.length - 1
            ? context.pages[currentIndex + 1]
            : null;
        const prevPage =
          currentIndex > 0 ? context.pages[currentIndex - 1] : null;

        const pageList = context.pages
          .map(
            (p, i) =>
              `  ${i + 1}. "${p.name}" → URL: /${p.slug}${context.currentSlug === p.slug ? " (CURRENT PAGE)" : ""}`,
          )
          .join("\n");

        const otherPages = context.pages.filter(
          (p) => p.slug !== context.currentSlug,
        );
        const applyLikeHint =
          otherPages.find((p) =>
            /apply|admission|form|register|signup/i.test(p.name),
          ) || otherPages[0];

        pageLinksContext = `
PAGE NAVIGATION CONTEXT:
The following pages exist in this web app. Use their URLs when the user asks to redirect or link between pages:
${pageList}
${nextPage ? `- "next page" means: /${nextPage.slug} (${nextPage.name})` : ""}
${prevPage ? `- "previous page" means: /${prevPage.slug} (${prevPage.name})` : ""}
${!nextPage && otherPages.length > 0 ? `- There is no "next" page in list order after the current one. For vague phrases like "another page" or "go to the apply page", match by page name (e.g. Apply → slug) or use: /${applyLikeHint.slug} (${applyLikeHint.name}) if it fits the user's intent.` : ""}
When adding redirect buttons or links, always use the actual page URL paths listed above (paths start with /, e.g. href="/my-slug").

BUTTON → PAGE REDIRECTS (CRITICAL):
- If the user wants a button (e.g. "Apply", "Submit", "Continue", CTA) to navigate to another page in this app, you MUST make it actually navigate:
  PREFERRED: change the element to an anchor with the same Tailwind classes: <a href="/TARGET-SLUG" class="...existing button classes...">Label</a>
  ALTERNATIVE: keep <button> and add: onclick="window.location.href='/TARGET-SLUG'" (use type="button")
- Do NOT leave navigation as href="#" or javascript:void(0) when a real target page exists in the list above.
- Match the user's wording to the right page (e.g. "apply page" → page whose name/slug contains apply; "next page" → next page line above).
- Preserve accessibility: if using <a>, keep visible text; add cursor-pointer if needed.
`;
      }

      const systemPrompt = `You are a world-class frontend developer. Your task is to MODIFY an existing HTML landing page based on the user's instructions.

STRICT OUTPUT RULES:
1. Return the FULL, COMPLETE updated HTML document. Do NOT return just the snippets.
2. Do NOT wrap your response in markdown code blocks. Output raw HTML only.
3. Keep the overall design system and Tailwind CSS configuration intact unless asked otherwise.
4. Do NOT include any explanations or apologies. Just the updated code.
${pageLinksContext}
USER INSTRUCTION: ${prompt}

CURRENT HTML CODE:
${currentHtml}`;

      let responseText: string;

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 8000,
          messages: [{ role: "user", content: systemPrompt }],
        });
        responseText =
          message.content[0].type === "text" ? message.content[0].text : "";
      } else if (this.groq) {
        const response = await this.groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: systemPrompt }],
          max_tokens: 8000,
        });
        responseText = response.choices[0].message.content || "";
      } else {
        throw new AppError(
          "AI service not configured",
          503,
          "AI_NOT_CONFIGURED",
        );
      }

      const cleanHtml = this.extractHTML(responseText);

      return {
        success: true,
        html: cleanHtml,
      };
    } catch (error: any) {
      console.error("HTML modification error:", error);
      return {
        success: false,
        error: error.message || "Failed to modify page HTML",
      };
    }
  }

  // Helper to robustly extract HTML from AI response
  private extractHTML(responseText: string): string {
    let cleanHtml = responseText;

    // 1. Strip markdown code fences anywhere in the string (multiline)
    cleanHtml = cleanHtml.replace(/```html\s*/gi, "").replace(/```\s*/gi, "");

    // 2. Find where the actual HTML document starts
    const doctypeIdx = cleanHtml.toLowerCase().indexOf("<!doctype");
    const htmlTagIdx = cleanHtml.toLowerCase().indexOf("<html");

    if (doctypeIdx !== -1) {
      cleanHtml = cleanHtml.slice(doctypeIdx);
    } else if (htmlTagIdx !== -1) {
      cleanHtml = cleanHtml.slice(htmlTagIdx);
    }

    // 3. Trim any trailing whitespace / leftover text after </html>
    const closingIdx = cleanHtml.toLowerCase().lastIndexOf("</html>");
    if (closingIdx !== -1) {
      cleanHtml = cleanHtml.slice(0, closingIdx + 7);
    }

    cleanHtml = cleanHtml.trim();

    // 4. Safety net: if we still don't have a valid document, wrap what we have
    if (
      !cleanHtml.toLowerCase().includes("<!doctype") &&
      !cleanHtml.toLowerCase().startsWith("<html")
    ) {
      cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; margin: 0; }</style>
</head>
<body>
${cleanHtml}
</body>
</html>`;
    }

    return cleanHtml;
  }

  // Advanced parsing methods for AI command interpretation

  // Parse color from text - supports named colors, hex, and common misspellings
  parseColor(text: string): string {
    const lower = text.toLowerCase().trim();

    // Hex color pattern
    const hexMatch = lower.match(/#[0-9a-f]{3}([0-9a-f]{3})?/);
    if (hexMatch) return hexMatch[0];

    // Named colors map (with fuzzy matching support)
    const colorMap: Record<string, string> = {
      red: "#ef4444",
      "red-500": "#ef4444",
      blue: "#3b82f6",
      "blue-600": "#3b82f6",
      green: "#22c55e",
      "green-600": "#22c55e",
      yellow: "#eab308",
      "yellow-400": "#eab308",
      purple: "#a855f7",
      "purple-600": "#a855f7",
      pink: "#ec4899",
      "pink-500": "#ec4899",
      orange: "#f97316",
      "orange-500": "#f97316",
      gray: "#6b7280",
      "gray-500": "#6b7280",
      black: "#000000",
      white: "#ffffff",
      cyan: "#06b6d4",
      teal: "#14b8a6",
      indigo: "#6366f1",
    };

    for (const [colorName, hexValue] of Object.entries(colorMap)) {
      if (lower.includes(colorName)) return hexValue;
    }

    return "#000000"; // Default fallback
  }

  // Parse css dimensions from text - supports px, em, %, vh, vw
  parseDimension(text: string, defaultValue: string = "0px"): string {
    const lower = text.toLowerCase().trim();

    // Match number followed by unit
    const match = lower.match(/(\d+(?:\.\d+)?)(px|em|%|rem|vh|vw|pt|cm|mm)/);
    if (match) {
      return `${match[1]}${match[2]}`;
    }

    // Match just a number (assume px)
    const justNumber = lower.match(/^\d+(?:\.\d+)?$/);
    if (justNumber) {
      return `${justNumber[0]}px`;
    }

    // Convert common text values to sizes
    if (lower.includes("small")) return "12px";
    if (lower.includes("medium")) return "16px";
    if (lower.includes("large")) return "24px";
    if (lower.includes("extra")) return "32px";
    if (lower.includes("full")) return "100%";
    if (lower.includes("half")) return "50%";

    return defaultValue;
  }

  // Parse quantity from text - e.g., "2 buttons" → 2
  parseQuantity(text: string): number {
    const match = text.match(/(\d+)\s*(?:button|component|section|item)/i);
    return match ? parseInt(match[1]) : 1;
  }

  // Detect intent type from command
  detectIntent(
    command: string,
  ): "add" | "update" | "delete" | "move" | "unknown" {
    const lower = command.toLowerCase();

    if (lower.match(/add|create|insert|new|make|build|generate/)) return "add";
    if (lower.match(/change|update|modify|edit|adjust|set|apply|make/))
      return "update";
    if (lower.match(/remove|delete|destroy|clear|erase/)) return "delete";
    if (lower.match(/move|reorder|rearrange|swap|shift|position/))
      return "move";

    return "unknown";
  }

  // Parse style variant from text - e.g., "outline button" → "outline"
  parseStyleVariant(text: string): "solid" | "outline" | "ghost" | "primary" {
    const lower = text.toLowerCase();

    if (lower.includes("outline")) return "outline";
    if (lower.includes("ghost")) return "ghost";
    if (lower.includes("primary")) return "primary";

    return "solid";
  }

  // Parse positioning mode from text
  parsePositionMode(text: string): "flow" | "absolute" {
    const lower = text.toLowerCase();

    if (
      lower.includes("absolute") ||
      lower.includes("fixed") ||
      lower.includes("position")
    ) {
      return "absolute";
    }

    return "flow";
  }

  // Parse target/destination from text (with fuzzy matching for common misspellings)
  parseTarget(text: string, availableComponents: string[] = []): string | null {
    const lower = text.toLowerCase().trim();

    // Remove common words
    const cleaned = lower
      .replace(/add|insert|inside|within|to|into/g, "")
      .trim();

    // Direct match
    if (availableComponents.some((c) => lower.includes(c.toLowerCase()))) {
      return (
        availableComponents.find((c) => lower.includes(c.toLowerCase())) || null
      );
    }

    // Fuzzy match for common types
    const typeMap: Record<string, string> = {
      txt: "TextBlock",
      text: "TextBlock",
      heading: "TextBlock",
      title: "TextBlock",
      btn: "ActionButton",
      button: "ActionButton",
      action: "ActionButton",
      box: "Container",
      container: "Container",
      div: "Container",
      section: "Container",
      card: "Container",
    };

    for (const [keyword, component] of Object.entries(typeMap)) {
      if (cleaned.includes(keyword)) {
        return availableComponents.includes(component) ? component : component;
      }
    }

    return null;
  }

  // Create a snapshot for undo/redo functionality
  createSnapshot(pageData: any): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      data: pageData,
    });
  }

  // Parse landing page generic intent - auto-creates starter components
  parseLandingPageIntent(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    const components: string[] = [];

    // Check what sections are mentioned
    if (lower.match(/hero|welcome|title|main|banner/))
      components.push("HeroBanner");
    if (lower.match(/about|intro|description|company|mission/))
      components.push("AboutSection");
    if (lower.match(/feature|service|solution|benefit|ability/))
      components.push("Statistics");
    if (lower.match(/team|staff|faculty|member|people|who/))
      components.push("FacultyGrid");
    if (lower.match(/faq|question|answer|help|support/))
      components.push("FAQAccordion");
    if (lower.match(/contact|reach|email|form|phone|inquiry/))
      components.push("ContactForm");

    // Default starter for any landing page
    if (components.length === 0) {
      components.push("HeroBanner", "TextBlock", "Statistics", "ContactForm");
    }

    return [...new Set(components)]; // Remove duplicates
  }

  private estimateTokensFromChars(chars: number): number {
    return Math.max(1, Math.ceil(chars / 4));
  }

  private estimateCostUsd(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const ratesPerMToken: Record<string, { in: number; out: number }> = {
      "claude-3-5-sonnet-20241022": { in: 3, out: 15 },
      "llama-3.3-70b-versatile": { in: 0.59, out: 0.79 },
      "gpt-4o-mini": { in: 0.15, out: 0.6 },
      "gpt-image-1": { in: 0.4, out: 0.4 },
    };

    const modelRates = ratesPerMToken[model] || { in: 1, out: 1 };
    const inputCost = (inputTokens / 1_000_000) * modelRates.in;
    const outputCost = (outputTokens / 1_000_000) * modelRates.out;
    return Number((inputCost + outputCost).toFixed(6));
  }

  private buildCacheKey(
    model: string,
    feature: string,
    prompt: string,
    jsonMode: boolean,
  ): string {
    const hash = createHash("sha256")
      .update(`${model}|${feature}|${jsonMode}|${prompt}`)
      .digest("hex");
    return `ai:prompt-cache:${hash}`;
  }

  private getProviderFromModel(model: string): "anthropic" | "groq" | "openai" {
    if (model.startsWith("claude")) return "anthropic";
    if (model.startsWith("llama")) return "groq";
    return "openai";
  }

  private resolveModel(requestedModel?: string): {
    model: string;
    provider: "anthropic" | "groq" | "openai";
  } {
    if (requestedModel) {
      const explicitProvider = this.getProviderFromModel(requestedModel);
      if (explicitProvider === "anthropic" && this.anthropic) {
        return { model: requestedModel, provider: "anthropic" };
      }
      if (explicitProvider === "groq" && this.groq) {
        return { model: requestedModel, provider: "groq" };
      }
      if (explicitProvider === "openai" && this.openai) {
        return { model: requestedModel, provider: "openai" };
      }
    }

    if (this.anthropic) {
      return { model: "claude-3-5-sonnet-20241022", provider: "anthropic" };
    }
    if (this.groq) {
      return { model: "llama-3.3-70b-versatile", provider: "groq" };
    }
    if (this.openai) {
      return { model: "gpt-4o-mini", provider: "openai" };
    }

    throw new AppError("AI service not configured", 503, "AI_NOT_CONFIGURED");
  }

  private isProviderConfigured(provider: "anthropic" | "groq" | "openai") {
    return Boolean(
      (provider === "anthropic" && this.anthropic) ||
      (provider === "groq" && this.groq) ||
      (provider === "openai" && this.openai),
    );
  }

  private defaultModelForProvider(
    provider: "anthropic" | "groq" | "openai",
  ): string {
    if (provider === "anthropic") return "claude-3-5-sonnet-20241022";
    if (provider === "groq") return "llama-3.3-70b-versatile";
    return "gpt-4o-mini";
  }

  private async callSingleProvider(
    provider: "anthropic" | "groq" | "openai",
    model: string,
    prompt: string,
    jsonMode: boolean,
  ): Promise<string> {
    if (provider === "anthropic") {
      if (!this.anthropic) {
        throw new AppError(
          "Anthropic provider not configured",
          503,
          "AI_NOT_CONFIGURED",
        );
      }
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: jsonMode ? 2000 : 1000,
        messages: [{ role: "user", content: prompt }],
      });
      return message.content[0].type === "text" ? message.content[0].text : "";
    }

    if (provider === "groq") {
      if (!this.groq) {
        throw new AppError(
          "Groq provider not configured",
          503,
          "AI_NOT_CONFIGURED",
        );
      }
      const response = await this.groq.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: jsonMode ? { type: "json_object" } : undefined,
      });
      return response.choices[0].message.content || "";
    }

    if (!this.openai) {
      throw new AppError(
        "OpenAI provider not configured",
        503,
        "AI_NOT_CONFIGURED",
      );
    }
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });
    return response.choices[0].message.content || "";
  }

  private async callModel(
    provider: "anthropic" | "groq" | "openai",
    model: string,
    prompt: string,
    jsonMode: boolean,
  ): Promise<string> {
    const candidates: Array<{
      provider: "anthropic" | "groq" | "openai";
      model: string;
    }> = [{ provider, model }];

    (["anthropic", "groq", "openai"] as const)
      .filter((candidateProvider) => candidateProvider !== provider)
      .forEach((candidateProvider) => {
        if (!this.isProviderConfigured(candidateProvider)) return;
        candidates.push({
          provider: candidateProvider,
          model: this.defaultModelForProvider(candidateProvider),
        });
      });

    let lastError: unknown;
    for (const candidate of candidates) {
      try {
        return await this.callSingleProvider(
          candidate.provider,
          candidate.model,
          prompt,
          jsonMode,
        );
      } catch (error) {
        lastError = error;
        console.warn(
          `AI provider call failed (${candidate.provider}/${candidate.model}). Trying fallback if available...`,
        );
      }
    }

    throw lastError || new Error("No AI provider available");
  }

  private getErrorMessage(error: unknown): string {
    if (!error) return "Unknown AI provider error";
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;

    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown AI provider error";
    }
  }

  private buildChatFallbackReply(errorMessage: string): string {
    const normalized = errorMessage.toLowerCase();

    if (
      /policy|safety|unsafe|disallowed|not allowed|violent|hate|extrem|refus/.test(
        normalized,
      )
    ) {
      return "I can still help with the UI action safely. For your case, I can add an empty text component at the bottom without generating any paragraph content.";
    }

    if (/rate limit|quota|too many requests|daily limit/.test(normalized)) {
      return "The AI provider is rate-limited right now. Please retry in a moment, or switch to another model from the dropdown.";
    }

    if (/timeout|timed out|network|unavailable|503|502|500/.test(normalized)) {
      return "The AI provider is temporarily unavailable. Please retry, or switch to another model from the dropdown.";
    }

    return "I hit an AI provider error for this message. I can still continue with UI commands like adding an empty text component at the bottom.";
  }

  async runTrackedPrompt(options: {
    prompt: string;
    institutionId: string;
    userId: string;
    feature: string;
    requestedModel?: string;
    jsonMode?: boolean;
    useCache?: boolean;
    cacheTtlSeconds?: number;
    metadata?: Record<string, unknown>;
  }): Promise<{
    text: string;
    model: string;
    provider: "anthropic" | "groq" | "openai";
    cacheHit: boolean;
    latencyMs: number;
    usageId: string;
  }> {
    const {
      prompt,
      institutionId,
      userId,
      feature,
      requestedModel,
      jsonMode = false,
      useCache = true,
      cacheTtlSeconds = 3600,
      metadata,
    } = options;

    const { model, provider } = this.resolveModel(requestedModel);
    const startedAt = Date.now();

    const cacheKey = this.buildCacheKey(model, feature, prompt, jsonMode);
    if (useCache) {
      try {
        const redis = getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
          const latencyMs = Date.now() - startedAt;
          const promptChars = prompt.length;
          const responseChars = cached.length;
          const inputTokensEstimated =
            this.estimateTokensFromChars(promptChars);
          const outputTokensEstimated =
            this.estimateTokensFromChars(responseChars);
          const usage = await AIUsage.create({
            institutionId,
            userId,
            feature,
            provider,
            modelName: model,
            promptChars,
            responseChars,
            inputTokensEstimated,
            outputTokensEstimated,
            estimatedCostUsd: 0,
            cacheHit: true,
            latencyMs,
            metadata: metadata || {},
          });
          return {
            text: cached,
            model,
            provider,
            cacheHit: true,
            latencyMs,
            usageId: usage._id.toString(),
          };
        }
      } catch (error) {
        console.warn("AI cache read skipped:", error);
      }
    }

    const text = await this.callModel(provider, model, prompt, jsonMode);
    const latencyMs = Date.now() - startedAt;
    const promptChars = prompt.length;
    const responseChars = text.length;
    const inputTokensEstimated = this.estimateTokensFromChars(promptChars);
    const outputTokensEstimated = this.estimateTokensFromChars(responseChars);
    const estimatedCostUsd = this.estimateCostUsd(
      model,
      inputTokensEstimated,
      outputTokensEstimated,
    );

    const usage = await AIUsage.create({
      institutionId,
      userId,
      feature,
      provider,
      modelName: model,
      promptChars,
      responseChars,
      inputTokensEstimated,
      outputTokensEstimated,
      estimatedCostUsd,
      cacheHit: false,
      latencyMs,
      metadata: metadata || {},
    });

    if (useCache) {
      try {
        const redis = getRedisClient();
        await redis.set(cacheKey, text, "EX", cacheTtlSeconds);
      } catch (error) {
        console.warn("AI cache write skipped:", error);
      }
    }

    return {
      text,
      model,
      provider,
      cacheHit: false,
      latencyMs,
      usageId: usage._id.toString(),
    };
  }

  async chatWithMemory(options: {
    institutionId: string;
    userId: string;
    message: string;
    threadId?: string;
    requestedModel?: string;
  }): Promise<{
    threadId: string;
    reply: string;
    model: string;
    provider: "anthropic" | "groq" | "openai";
    history: Array<{
      role: "user" | "assistant";
      message: string;
      createdAt: Date;
    }>;
    cacheHit: boolean;
    usageId: string;
  }> {
    const { institutionId, userId, message, requestedModel } = options;
    const threadId = options.threadId?.trim() || randomUUID();

    const conversation = await AIConversation.findOneAndUpdate(
      { institutionId, userId, threadId },
      {
        $setOnInsert: {
          title: message.slice(0, 60),
        },
      },
      { new: true, upsert: true },
    );

    const history = conversation.exchanges.slice(-10);
    const historyBlock = history
      .map((exchange) => `${exchange.role.toUpperCase()}: ${exchange.message}`)
      .join("\n");

    const prompt = `You are an AI copilot for a server-driven UI platform. Keep answers practical and implementation-oriented.

Conversation history:
${historyBlock || "(none)"}

Latest user message:
${message}`;

    let tracked:
      | {
          text: string;
          model: string;
          provider: "anthropic" | "groq" | "openai";
          cacheHit: boolean;
          latencyMs: number;
          usageId: string;
        }
      | undefined;

    try {
      tracked = await this.runTrackedPrompt({
        prompt,
        institutionId,
        userId,
        feature: "chat-memory",
        requestedModel,
        jsonMode: false,
        useCache: false,
        metadata: { threadId },
      });
    } catch (error) {
      const { model, provider } = this.resolveModel(requestedModel);
      const fallbackText = this.buildChatFallbackReply(
        this.getErrorMessage(error),
      );

      tracked = {
        text: fallbackText,
        model,
        provider,
        cacheHit: false,
        latencyMs: 0,
        usageId: `fallback-${randomUUID()}`,
      };
    }

    const now = new Date();
    const updated = await AIConversation.findOneAndUpdate(
      { institutionId, userId, threadId },
      {
        $push: {
          exchanges: {
            $each: [
              {
                role: "user",
                message,
                model: tracked.model,
                createdAt: now,
              },
              {
                role: "assistant",
                message: tracked.text,
                model: tracked.model,
                createdAt: now,
              },
            ],
            $slice: -50,
          },
        },
      },
      { new: true },
    );

    return {
      threadId,
      reply: tracked.text,
      model: tracked.model,
      provider: tracked.provider,
      history: updated?.exchanges.slice(-10) || [],
      cacheHit: tracked.cacheHit,
      usageId: tracked.usageId,
    };
  }

  async getConversationHistory(institutionId: string, userId: string) {
    const conversations = await AIConversation.find({ institutionId, userId })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select("threadId title exchanges updatedAt");

    return conversations.map((conversation) => ({
      threadId: conversation.threadId,
      title: conversation.title || "AI Conversation",
      updatedAt: conversation.updatedAt,
      preview:
        conversation.exchanges[
          conversation.exchanges.length - 1
        ]?.message?.slice(0, 120) || "",
      exchangeCount: conversation.exchanges.length,
    }));
  }

  async getConversationThread(
    institutionId: string,
    userId: string,
    threadId: string,
  ): Promise<{
    threadId: string;
    title: string;
    updatedAt: Date;
    exchanges: Array<{
      role: "user" | "assistant";
      message: string;
      createdAt: Date;
    }>;
  } | null> {
    const conversation = await AIConversation.findOne({
      institutionId,
      userId,
      threadId,
    }).select("threadId title updatedAt exchanges");

    if (!conversation) {
      return null;
    }

    return {
      threadId: conversation.threadId,
      title: conversation.title || "AI Conversation",
      updatedAt: conversation.updatedAt,
      exchanges: conversation.exchanges,
    };
  }

  async getUsageSummary(institutionId: string, from?: Date, to?: Date) {
    const fromDate = from || new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const toDate = to || new Date();

    const match = {
      institutionId,
      createdAt: { $gte: fromDate, $lte: toDate },
    };

    const [overview] = await AIUsage.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCostUsd: { $sum: "$estimatedCostUsd" },
          totalRequests: { $sum: 1 },
          totalInputTokens: { $sum: "$inputTokensEstimated" },
          totalOutputTokens: { $sum: "$outputTokensEstimated" },
          cacheHits: {
            $sum: {
              $cond: ["$cacheHit", 1, 0],
            },
          },
        },
      },
    ]);

    const byFeature = await AIUsage.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$feature",
          requests: { $sum: 1 },
          costUsd: { $sum: "$estimatedCostUsd" },
        },
      },
      { $sort: { requests: -1 } },
    ]);

    const byModel = await AIUsage.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$modelName",
          provider: { $first: "$provider" },
          requests: { $sum: 1 },
          costUsd: { $sum: "$estimatedCostUsd" },
        },
      },
      { $sort: { requests: -1 } },
    ]);

    return {
      period: {
        from: fromDate,
        to: toDate,
      },
      overview: {
        totalCostUsd: Number((overview?.totalCostUsd || 0).toFixed(4)),
        totalRequests: overview?.totalRequests || 0,
        totalInputTokens: overview?.totalInputTokens || 0,
        totalOutputTokens: overview?.totalOutputTokens || 0,
        cacheHits: overview?.cacheHits || 0,
      },
      byFeature: byFeature.map((item) => ({
        feature: item._id,
        requests: item.requests,
        costUsd: Number(item.costUsd.toFixed(4)),
      })),
      byModel: byModel.map((item) => ({
        model: item._id,
        provider: item.provider,
        requests: item.requests,
        costUsd: Number(item.costUsd.toFixed(4)),
      })),
    };
  }

  async runNlpAccuracyBenchmark(
    institutionId: string,
    userId: string,
  ): Promise<{
    accuracy: number;
    total: number;
    passed: number;
    results: Array<{
      prompt: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  }> {
    const dataset: Array<{ prompt: string; expected: string }> = [
      { prompt: "Add a hero section", expected: "insert" },
      { prompt: "Delete the footer", expected: "delete" },
      { prompt: "Update CTA button text", expected: "update" },
      {
        prompt: "Build a full college website",
        expected: "generate_full_html",
      },
      { prompt: "Move testimonials above contact", expected: "move" },
    ];

    const results: Array<{
      prompt: string;
      expected: string;
      actual: string;
      passed: boolean;
    }> = [];
    for (const sample of dataset) {
      const response = await this.processCommand(sample.prompt, {});
      const actual = response.operation?.action || "unknown";
      results.push({
        prompt: sample.prompt,
        expected: sample.expected,
        actual,
        passed: actual === sample.expected,
      });
    }

    const passed = results.filter((result) => result.passed).length;
    const accuracy = Number(((passed / dataset.length) * 100).toFixed(2));

    await AIUsage.create({
      institutionId,
      userId,
      feature: "nlp-benchmark",
      provider: "internal",
      modelName: "rule-based",
      promptChars: dataset
        .map((item) => item.prompt.length)
        .reduce((a, b) => a + b, 0),
      responseChars: JSON.stringify(results).length,
      inputTokensEstimated: 0,
      outputTokensEstimated: 0,
      estimatedCostUsd: 0,
      cacheHit: false,
      latencyMs: 0,
      metadata: { accuracy, total: dataset.length, passed },
    });

    return { accuracy, total: dataset.length, passed, results };
  }

  async runComplianceValidation(pageJSON: PageJSON): Promise<{
    score: number;
    canPublish: boolean;
    checks: Array<{
      category: "AICTE" | "UGC" | "WCAG" | "SEO";
      status: "pass" | "warn" | "fail";
      message: string;
      fix?: string;
      evidence?: string[];
    }>;
    summary: {
      total: number;
      passed: number;
      warnings: number;
      critical: number;
    };
    recommendations: Array<{
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      operation: Record<string, unknown>;
    }>;
  }> {
    const components = pageJSON?.components || [];
    const meta = pageJSON?.meta || {};
    const textBlob =
      `${JSON.stringify(components)} ${JSON.stringify(meta)}`.toLowerCase();
    const hasFaculty = components.some((component) =>
      ["FacultyGrid", "FacultyProfile"].includes(component.type),
    );
    const hasContact = components.some((component) =>
      ["ContactForm", "InquiryForm", "FeedbackForm"].includes(component.type),
    );
    const hasCalendar =
      textBlob.includes("calendar") || textBlob.includes("academic calendar");
    const hasExamPolicy =
      textBlob.includes("exam") || textBlob.includes("examination");
    const hasGrievance = textBlob.includes("grievance");
    const hasApproval = textBlob.includes("approval");
    const hasAccreditation = textBlob.includes("accreditation");
    const hasNirf = textBlob.includes("nirf");
    const hasAltText = components.some((component) => {
      const props = component.props || {};
      const candidate = [props.alt, props.altText, props.caption]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return candidate.includes("alt") || candidate.length > 0;
    });
    const hasAria =
      textBlob.includes("aria-") ||
      textBlob.includes("aria label") ||
      textBlob.includes("aria-label");
    const headingCount = components.filter((component) =>
      [
        "HeroBanner",
        "HeroHeading",
        "Heading",
        "TextBlock",
        "Paragraph",
      ].includes(component.type),
    ).length;
    const imageCount = components.filter(
      (component) => component.type === "Image",
    ).length;
    const rawHtmlCount = components.filter(
      (component) => component.type === "RawHTML",
    ).length;
    const hasTitle = Boolean(String(meta.title || "").trim());
    const hasDescription = Boolean(String(meta.description || "").trim());

    const checks: Array<{
      category: "AICTE" | "UGC" | "WCAG" | "SEO";
      status: "pass" | "warn" | "fail";
      message: string;
      fix?: string;
      evidence?: string[];
    }> = [
      {
        category: "AICTE",
        status: hasFaculty ? "pass" : "warn",
        message: hasFaculty
          ? "Faculty information components detected."
          : "Faculty information is missing from the page.",
        fix: "Add a FacultyGrid or FacultyProfile section with names, roles, and departments.",
        evidence: hasFaculty ? ["FacultyGrid/FacultyProfile detected"] : [],
      },
      {
        category: "AICTE",
        status: hasApproval && hasAccreditation && hasNirf ? "pass" : "warn",
        message:
          hasApproval && hasAccreditation && hasNirf
            ? "Approval, accreditation, and ranking references found."
            : "Approval letters, accreditation, or NIRF references are incomplete.",
        fix: "Add accreditation, approval, and ranking information in an about or disclosures section.",
        evidence: [
          hasApproval ? "approval" : "missing approval",
          hasAccreditation ? "accreditation" : "missing accreditation",
          hasNirf ? "NIRF" : "missing NIRF",
        ],
      },
      {
        category: "UGC",
        status:
          hasContact && hasCalendar && hasExamPolicy && hasGrievance
            ? "pass"
            : "warn",
        message:
          hasContact && hasCalendar && hasExamPolicy && hasGrievance
            ? "Academic calendar, examination rules, and grievance references detected."
            : "UGC transparency details are incomplete.",
        fix: "Add academic calendar, examination policy, and grievance mechanism content.",
        evidence: [
          hasContact ? "contact mechanism" : "missing contact mechanism",
          hasCalendar ? "calendar" : "missing calendar",
          hasExamPolicy ? "exam policy" : "missing exam policy",
          hasGrievance ? "grievance" : "missing grievance",
        ],
      },
      {
        category: "WCAG",
        status:
          hasAltText && hasAria && headingCount >= 1
            ? "pass"
            : hasAltText || hasAria
              ? "warn"
              : "fail",
        message:
          hasAltText && hasAria && headingCount >= 1
            ? "Alt text, ARIA hints, and heading structure detected."
            : "Accessibility coverage is incomplete.",
        fix: "Add alt text, aria-labels, and clear heading hierarchy.",
        evidence: [
          hasAltText ? "alt text" : "missing alt text",
          hasAria ? "aria" : "missing aria",
          headingCount >= 1 ? `headings:${headingCount}` : "missing headings",
        ],
      },
      {
        category: "SEO",
        status:
          hasTitle && hasDescription
            ? imageCount > 8 || rawHtmlCount > 0
              ? "warn"
              : "pass"
            : "fail",
        message:
          hasTitle && hasDescription
            ? imageCount > 8 || rawHtmlCount > 0
              ? "SEO meta exists, but heavy content may impact load speed."
              : "Meta title and description are present."
            : "Meta title/description missing.",
        fix:
          hasTitle && hasDescription
            ? "Reduce heavy raw HTML/images if possible and keep responsive media sizes small."
            : "Add page title and meta description before publishing.",
        evidence: [
          hasTitle ? "title" : "missing title",
          hasDescription ? "description" : "missing description",
          `images:${imageCount}`,
          `rawHtml:${rawHtmlCount}`,
        ],
      },
    ];

    const passed = checks.filter((check) => check.status === "pass").length;
    const warnings = checks.filter((check) => check.status === "warn").length;
    const critical = checks.filter((check) => check.status === "fail").length;
    const score = Math.round((passed / checks.length) * 100);

    const recommendations = checks
      .filter((check) => check.status !== "pass")
      .map((check) => ({
        id: randomUUID(),
        title: `${check.category}: ${check.message}`,
        impact: (check.status === "fail" ? "high" : "medium") as
          | "high"
          | "medium",
        operation: {
          op: "set-meta",
          meta: {
            title: hasTitle ? meta.title : meta.title || "Institution website",
            description: hasDescription
              ? meta.description
              : "Add a concise SEO description before publishing.",
          },
        },
      }));

    return {
      score,
      canPublish: critical === 0,
      checks,
      summary: {
        total: checks.length,
        passed,
        warnings,
        critical,
      },
      recommendations,
    };
  }

  async recordComplianceAudit(entry: {
    institutionId: string;
    pageId?: string;
    pageName?: string;
    pageSlug?: string;
    eventType:
      | "validation"
      | "publish"
      | "publish-blocked"
      | "unpublish"
      | "fix-suggestion";
    severity: "info" | "warning" | "critical";
    message: string;
    details?: Record<string, unknown>;
    createdBy: string;
  }) {
    return ComplianceAudit.create({
      institutionId: entry.institutionId,
      pageId: entry.pageId,
      pageName: entry.pageName,
      pageSlug: entry.pageSlug,
      eventType: entry.eventType,
      severity: entry.severity,
      message: entry.message,
      details: entry.details || {},
      createdBy: entry.createdBy,
    });
  }

  async getComplianceAuditTrail(
    institutionId: string,
    pageId?: string,
  ): Promise<Array<Record<string, unknown>>> {
    const filter: Record<string, unknown> = { institutionId };
    if (pageId) {
      filter.pageId = pageId;
    }

    const records = await ComplianceAudit.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("createdBy", "name email")
      .populate("pageId", "name slug");

    return records.map((record) => ({
      id: record._id.toString(),
      pageId: (record.pageId as any)?._id?.toString?.() || record.pageId,
      pageName: record.pageName || (record.pageId as any)?.name || "Unknown",
      pageSlug: record.pageSlug || (record.pageId as any)?.slug || "",
      eventType: record.eventType,
      severity: record.severity,
      message: record.message,
      details: record.details || {},
      createdBy: record.createdBy,
      createdAt: record.createdAt,
    }));
  }

  async getComplianceReport(institutionId: string): Promise<{
    summary: {
      totalPages: number;
      publishedPages: number;
      complianceScore: number;
      criticalIssues: number;
      warnings: number;
    };
    pages: Array<{
      pageId: string;
      name: string;
      slug: string;
      score: number;
      canPublish: boolean;
      critical: number;
      warnings: number;
      lastValidatedAt?: Date;
      checks: Array<{
        category: "AICTE" | "UGC" | "WCAG" | "SEO";
        status: "pass" | "warn" | "fail";
        message: string;
        fix?: string;
      }>;
    }>;
    auditTrail: Array<Record<string, unknown>>;
  }> {
    const pages = await Page.find({ institutionId })
      .select("name slug jsonConfig isPublished updatedAt updatedBy")
      .sort({ updatedAt: -1 });

    const reports = pages.map((page) => {
      const validation = this.runComplianceValidation(
        page.jsonConfig as PageJSON,
      );
      return validation.then((result) => ({
        pageId: page._id.toString(),
        name: page.name,
        slug: page.slug,
        score: result.score,
        canPublish: result.canPublish,
        critical: result.summary.critical,
        warnings: result.summary.warnings,
        lastValidatedAt: page.updatedAt,
        checks: result.checks.map((check) => ({
          category: check.category,
          status: check.status,
          message: check.message,
          fix: check.fix,
        })),
        recommendations: result.recommendations.slice(0, 3),
      }));
    });

    const pageReports = await Promise.all(reports);
    const totalPages = pageReports.length;
    const complianceScore = totalPages
      ? Math.round(
          pageReports.reduce((total, page) => total + page.score, 0) /
            totalPages,
        )
      : 100;
    const criticalIssues = pageReports.reduce(
      (total, page) => total + page.critical,
      0,
    );
    const warnings = pageReports.reduce(
      (total, page) => total + page.warnings,
      0,
    );

    const auditTrail = await this.getComplianceAuditTrail(institutionId);

    return {
      summary: {
        totalPages,
        publishedPages: pages.filter((page) => page.isPublished).length,
        complianceScore,
        criticalIssues,
        warnings,
      },
      pages: pageReports,
      auditTrail,
    };
  }

  async getLiveSuggestions(pageJSON: PageJSON): Promise<{
    suggestions: Array<{
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      operation: Record<string, unknown>;
    }>;
  }> {
    const suggestions: Array<{
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      operation: Record<string, unknown>;
    }> = [];

    const components = pageJSON?.components || [];
    const hasFaq = components.some(
      (component) => component.type === "FAQAccordion",
    );
    const hasCta = components.some((component) =>
      ["ActionButton", "Button"].includes(component.type),
    );

    if (!hasFaq) {
      suggestions.push({
        id: randomUUID(),
        title: "Add FAQ section to improve conversion and clarity",
        impact: "high",
        operation: {
          op: "add-component",
          component: {
            type: "FAQAccordion",
            props: {
              title: "Frequently Asked Questions",
              items: [
                {
                  q: "How do I apply?",
                  a: "Use the admissions form on this site.",
                },
                {
                  q: "Do you offer scholarships?",
                  a: "Yes, merit and need-based scholarships are available.",
                },
              ],
            },
          },
        },
      });
    }

    if (!hasCta) {
      suggestions.push({
        id: randomUUID(),
        title: "Add a primary CTA button above the fold",
        impact: "high",
        operation: {
          op: "add-component",
          component: {
            type: "ActionButton",
            props: {
              text: "Apply Now",
              backgroundColor: "#2563eb",
              textColor: "#ffffff",
            },
          },
        },
      });
    }

    if (!pageJSON?.meta?.description) {
      suggestions.push({
        id: randomUUID(),
        title: "Add SEO description metadata",
        impact: "medium",
        operation: {
          op: "set-meta",
          meta: {
            description:
              "Leading institution with modern programs, industry-ready curriculum, and strong placement support.",
          },
        },
      });
    }

    return { suggestions };
  }

  applySuggestionOperation(
    pageJSON: PageJSON,
    operation: Record<string, any>,
  ): PageJSON {
    const safeConfig: PageJSON = {
      components: [...(pageJSON?.components || [])],
      meta: {
        ...(pageJSON?.meta || {}),
      },
    };

    if (operation.op === "add-component" && operation.component) {
      safeConfig.components.push(operation.component);
    }

    if (operation.op === "set-meta" && operation.meta) {
      safeConfig.meta = {
        ...(safeConfig.meta || {}),
        ...operation.meta,
      };
    }

    return safeConfig;
  }

  private getImageDimensions(size: "1024x1024" | "1024x1536" | "1536x1024"): {
    width: number;
    height: number;
  } {
    const [w, h] = size.split("x").map((value) => parseInt(value, 10));
    return {
      width: Number.isFinite(w) ? w : 1024,
      height: Number.isFinite(h) ? h : 1024,
    };
  }

  private async generateImageViaLocalEndpoint(options: {
    endpoint: string;
    prompt: string;
    size: "1024x1024" | "1024x1536" | "1536x1024";
    institutionId: string;
    userId: string;
    modelLabel: string;
  }): Promise<{ url: string; provider: "local"; model: string }> {
    const { endpoint, prompt, size, institutionId, userId, modelLabel } =
      options;
    const { width, height } = this.getImageDimensions(size);

    const start = Date.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        steps: 28,
        cfg_scale: 7,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Local image API failed (${response.status}): ${body.slice(0, 220)}`,
      );
    }

    const payload = (await response.json()) as {
      images?: string[];
      image?: string;
      output?: string;
    };

    const rawBase64 =
      payload?.images?.[0] || payload?.image || payload?.output || "";
    if (!rawBase64 || typeof rawBase64 !== "string") {
      throw new Error("Local image API returned no image data");
    }

    const base64 = rawBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const dataUrl = `data:image/png;base64,${base64}`;
    const latencyMs = Date.now() - start;

    await AIUsage.create({
      institutionId,
      userId,
      feature: "image-generation",
      provider: "internal",
      modelName: modelLabel,
      promptChars: prompt.length,
      responseChars: base64.length,
      inputTokensEstimated: 0,
      outputTokensEstimated: 0,
      estimatedCostUsd: 0,
      cacheHit: false,
      latencyMs,
      metadata: { size, source: "local-endpoint" },
    });

    return { url: dataUrl, provider: "local", model: modelLabel };
  }

  async generateImageFromPrompt(options: {
    prompt: string;
    institutionId: string;
    userId: string;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    allowFallback?: boolean;
  }): Promise<{
    url: string;
    provider: "openai" | "local" | "fallback";
    model: string;
  }> {
    const {
      prompt,
      institutionId,
      userId,
      size = "1024x1024",
      allowFallback = false,
    } = options;
    const fallbackEnabledByEnv =
      String(process.env.AI_IMAGE_ALLOW_FALLBACK || "").toLowerCase() ===
      "true";
    const imageProvider = String(process.env.AI_IMAGE_PROVIDER || "auto")
      .toLowerCase()
      .trim();
    const localEndpoint = String(process.env.LOCAL_IMAGE_API_URL || "").trim();
    const localModelLabel =
      String(
        process.env.LOCAL_IMAGE_MODEL || "local-stable-diffusion",
      ).trim() || "local-stable-diffusion";

    const shouldUseFallback = allowFallback || fallbackEnabledByEnv;

    if (imageProvider === "fallback") {
      const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 64))}/1200/800`;
      await AIUsage.create({
        institutionId,
        userId,
        feature: "image-generation",
        provider: "internal",
        modelName: "fallback-image-url",
        promptChars: prompt.length,
        responseChars: fallbackUrl.length,
        inputTokensEstimated: 0,
        outputTokensEstimated: 0,
        estimatedCostUsd: 0,
        cacheHit: false,
        latencyMs: 0,
        metadata: { fallback: true, mode: "explicit-fallback" },
      });

      return {
        url: fallbackUrl,
        provider: "fallback",
        model: "fallback-image-url",
      };
    }

    const tryOpenAi =
      imageProvider === "openai" || (imageProvider === "auto" && !!this.openai);
    const tryLocal =
      imageProvider === "local" ||
      (imageProvider === "auto" && !this.openai && !!localEndpoint);

    if (tryLocal) {
      if (!localEndpoint) {
        if (!shouldUseFallback) {
          throw new AppError(
            "Local image mode is enabled but LOCAL_IMAGE_API_URL is not set.",
            503,
            "LOCAL_IMAGE_API_NOT_CONFIGURED",
          );
        }
      } else {
        try {
          return await this.generateImageViaLocalEndpoint({
            endpoint: localEndpoint,
            prompt,
            size,
            institutionId,
            userId,
            modelLabel: localModelLabel,
          });
        } catch (error: any) {
          if (!shouldUseFallback) {
            throw new AppError(
              error?.message || "Local image generation failed",
              502,
              "LOCAL_IMAGE_GENERATION_FAILED",
            );
          }
        }
      }
    }

    if (tryOpenAi) {
      if (!this.openai) {
        if (!shouldUseFallback) {
          throw new AppError(
            "Image model is not configured. Set OPENAI_API_KEY to generate prompt-accurate images.",
            503,
            "IMAGE_MODEL_NOT_CONFIGURED",
          );
        }
      } else {
        try {
          const start = Date.now();
          const response = await this.openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size,
          });
          const imageBase64 = response.data?.[0]?.b64_json;
          if (!imageBase64) {
            throw new Error("Image model returned empty response");
          }

          const dataUrl = `data:image/png;base64,${imageBase64}`;
          const latencyMs = Date.now() - start;
          await AIUsage.create({
            institutionId,
            userId,
            feature: "image-generation",
            provider: "openai",
            modelName: "gpt-image-1",
            promptChars: prompt.length,
            responseChars: imageBase64.length,
            inputTokensEstimated: this.estimateTokensFromChars(prompt.length),
            outputTokensEstimated: this.estimateTokensFromChars(
              imageBase64.length,
            ),
            estimatedCostUsd: 0,
            cacheHit: false,
            latencyMs,
            metadata: { size },
          });
          return { url: dataUrl, provider: "openai", model: "gpt-image-1" };
        } catch (error: any) {
          if (!shouldUseFallback) {
            const rawMessage = String(error?.message || "");
            const message = rawMessage.toLowerCase();

            if (
              message.includes("billing hard limit") ||
              message.includes("insufficient_quota") ||
              message.includes("quota") ||
              message.includes("rate_limit_exceeded")
            ) {
              throw new AppError(
                "OpenAI billing/quota limit reached. Add credits or increase your OpenAI project budget, then try again.",
                402,
                "IMAGE_BILLING_LIMIT",
              );
            }

            throw new AppError(
              rawMessage || "Image generation failed with configured model",
              502,
              "IMAGE_GENERATION_FAILED",
            );
          }
        }
      }
    }

    if (!tryOpenAi && !tryLocal && !shouldUseFallback) {
      throw new AppError(
        'No image provider available. Set AI_IMAGE_PROVIDER to "local" with LOCAL_IMAGE_API_URL, or "openai" with OPENAI_API_KEY.',
        503,
        "IMAGE_PROVIDER_NOT_AVAILABLE",
      );
    }

    // Optional fallback placeholder (not prompt-accurate). Use only when explicitly enabled.
    const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 64))}/1200/800`;
    await AIUsage.create({
      institutionId,
      userId,
      feature: "image-generation",
      provider: "internal",
      modelName: "fallback-image-url",
      promptChars: prompt.length,
      responseChars: fallbackUrl.length,
      inputTokensEstimated: 0,
      outputTokensEstimated: 0,
      estimatedCostUsd: 0,
      cacheHit: false,
      latencyMs: 0,
      metadata: { fallback: true },
    });

    return {
      url: fallbackUrl,
      provider: "fallback",
      model: "fallback-image-url",
    };
  }

  executeJsxAsLiveComponent(jsxCode: string): {
    component: {
      type: string;
      props: Record<string, unknown>;
    };
  } {
    const safeJsx = jsxCode.trim();
    if (!safeJsx) {
      throw new AppError("JSX code is required", 400, "INVALID_JSX");
    }

    // MVP-safe execution: map generated JSX to RawHTML payload for immediate rendering.
    return {
      component: {
        type: "RawHTML",
        props: {
          html: safeJsx,
        },
      },
    };
  }
}

export default new AIService();
