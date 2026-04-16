import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import env from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { PageJSON } from "../types/page.types";
import {
  getTemplate,
  suggestTemplate,
  TemplateType,
} from "../templates/site-templates";

export class AIService {
  private anthropic: Anthropic | null = null;
  private groq: OpenAI | null = null;

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

    if (!this.anthropic && !this.groq) {
      console.warn(
        "⚠️ No AI API keys configured. AI features will be disabled.",
      );
    }
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
  ): Promise<{
    success: boolean;
    operation?: any;
    error?: string;
  }> {
    try {
      const prompt = `You are an AI assistant for a website builder.
    
User command: "${command}"

Current page context:
${JSON.stringify(context, null, 2)}

Analyze the command. Determine if the user wants to:
1. Build a COMPLETELY NEW FULL PAGE or a FULL WEBSITE/TEMPLATE from scratch (Keywords: "full", "website", "template", "landing page", "html code", "full code"). For these, return the action "generate_full_html". This is the HIGHEST PRIORITY.
2. Perform a specific modification (insert, update, delete, move) on existing sections.

Response format:
{
  "action": "insert" | "update" | "delete" | "move" | "generate_full_html",
  "component": {
    "type": "ComponentType",
    "props": {...},
    "position": "append" | "prepend" | number
  },
  "prompt": "Full description for HTML generation if action is generate_full_html"
}

VALID COMPONENT TYPES (only use these for insert/update): 
HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, DynamicSection, Button, RawHTML.
CRITICAL: If the user says "full", "website", or "html page", DO NOT use "insert". USE "generate_full_html".

Only respond with valid JSON, no explanations.`;

      const responseText = await this.getChatCompletion(prompt, true);
      console.log("AI Raw Response:", responseText);
      const jsonOperation = JSON.parse(responseText);

      // Validation: If it seems like a full page request, convert it to generate_full_html
      const lowerCommand = command.toLowerCase();
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
        ![
          "HeroBanner",
          "TextBlock",
          "Container",
          "AboutSection",
          "Statistics",
          "FacultyGrid",
          "FAQAccordion",
          "ContactForm",
          "DynamicSection",
          "Button",
          "RawHTML",
        ].includes(jsonOperation.component?.type)
      ) {
        console.log("Unknown component type, reverting to generate_full_html");
        jsonOperation.action = "generate_full_html";
        jsonOperation.prompt = command;
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
        error: "Failed to process command",
      };
    }
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
  async generateComponent(prompt: string): Promise<{
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
    if (!this.groq) {
      throw new AppError(
        "Groq AI service not configured",
        503,
        "AI_NOT_CONFIGURED",
      );
    }

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

You can use these existing types: HeroBanner, TextBlock, Container, AboutSection, Statistics, FacultyGrid, FAQAccordion, ContactForm, DynamicSection, Button, RawHTML.
If the component requested doesn't fit the others, use "RawHTML" and put the full HTML/Tailwind code in the "html" prop.
Only return valid JSON. Do not include markdown code blocks or explanations.`;

      console.log(
        `Generating component with Groq using model: llama-3.3-70b-versatile`,
      );
      const response = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const responseText = response.choices[0].message.content || "{}";
      const componentData = JSON.parse(responseText);

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
}

export default new AIService();
