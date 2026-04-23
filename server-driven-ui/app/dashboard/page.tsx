"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import * as pagesApi from "@/lib/api/pages.api";
import {
  planSite,
  generatePageHTML,
  getUsageSummary,
  runNlpBenchmark,
} from "@/lib/api/ai.api";
import { getComplianceReport } from "@/lib/api/ai.api";
import { Page } from "@/lib/types/page.types";
import { toast } from "sonner";
import {
  Plus,
  ExternalLink,
  FileEdit,
  Pencil,
  LogOut,
  Layout,
  Activity,
  Shield,
  Bot,
  Sparkles,
  Search,
  MoreVertical,
  X,
  Wand2,
  MousePointer2,
  ArrowRight,
  Globe,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Send,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  AlertTriangle,
  ShieldCheck,
  CalendarClock,
  CheckSquare,
  Square,
  Files,
  Settings2,
  Save,
} from "lucide-react";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SitePage {
  name: string;
  slug: string;
  purpose: string;
  templateType?: string;
}

type BuildStatus = "pending" | "building" | "done" | "error";

interface PageBuildState extends SitePage {
  status: BuildStatus;
  error?: string;
}

interface AIUsageSummary {
  overview?: {
    totalCostUsd: number;
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    cacheHits: number;
  };
  byFeature?: Array<{ feature: string; requests: number; costUsd: number }>;
}

interface ComplianceReport {
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
    checks: Array<{
      category: "AICTE" | "UGC" | "WCAG" | "SEO";
      status: "pass" | "warn" | "fail";
      message: string;
      fix?: string;
    }>;
    recommendations?: Array<{
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      operation: Record<string, unknown>;
    }>;
  }>;
  auditTrail: Array<{
    id: string;
    pageName?: string;
    pageSlug?: string;
    eventType: string;
    severity: "info" | "warning" | "critical";
    message: string;
    createdAt: string;
  }>;
}

// ── FULL-SITE BUILDER MODAL ───────────────────────────────────────────────────
const FullSiteBuilderModal = ({
  isOpen,
  onClose,
  onDone,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDone: (pages: Page[]) => void;
}) => {
  const [step, setStep] = useState<"prompt" | "plan" | "building" | "done">(
    "prompt",
  );
  const [prompt, setPrompt] = useState("");
  const [sitePlan, setSitePlan] = useState<SitePage[]>([]);
  const [buildStates, setBuildStates] = useState<PageBuildState[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [builtPages, setBuiltPages] = useState<Page[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("prompt");
      setPrompt("");
      setSitePlan([]);
      setBuildStates([]);
      setBuiltPages([]);
      setIsPlanning(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlan = async () => {
    if (!prompt.trim()) return;
    setIsPlanning(true);
    try {
      const res = await planSite(prompt.trim());
      const pages: SitePage[] = res?.data?.pages ?? res?.pages ?? [];
      if (!pages.length) {
        toast.error("AI could not plan pages. Please rephrase your prompt.");
        return;
      }
      setSitePlan(pages);
      setBuildStates(pages.map((p) => ({ ...p, status: "pending" })));
      setStep("plan");
    } catch (e) {
      toast.error("Failed to plan site. Please try again.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleBuild = async () => {
    setStep("building");

    const createdPages: Page[] = [];

    // Step 0 — delete ALL existing pages so old builds don't bleed in
    try {
      const existing = await pagesApi.getAllPages();
      await Promise.all(existing.map((p) => pagesApi.deletePage(p._id)));
    } catch {
      // Non-fatal — proceed even if some deletes fail
    }

    // Step 1 — create all DB records first (so every page's navbar has all slugs)
    try {
      for (const p of sitePlan) {
        const created = await pagesApi.createPage({
          name: p.name,
          slug: p.slug,
          useHtml: true,
        });
        createdPages.push(created);
      }
    } catch (err) {
      toast.error("Failed to create pages in database.");
      setStep("plan");
      return;
    }

    // Refresh build states with corrected slugs
    setBuildStates(sitePlan.map((p) => ({ ...p, status: "pending" })));

    // Step 2 — generate HTML for each page sequentially
    const finalPages: Page[] = [];

    for (let i = 0; i < sitePlan.length; i++) {
      const p = sitePlan[i];
      const created = createdPages[i];

      setBuildStates((prev) =>
        prev.map((s, j) => (j === i ? { ...s, status: "building" } : s)),
      );

      try {
        // Build a rich per-page prompt that names all pages
        const navList = sitePlan
          .map((sp) => `${sp.name} (/${sp.slug})`)
          .join(", ");
        const pagePrompt =
          `Build the "${p.name}" page for a website about: ${prompt}. ` +
          `This page's content: ${p.purpose}. ` +
          `All site pages: ${navList}.`;

        const result = await generatePageHTML(
          pagePrompt,
          p.slug,
          p.templateType,
        );
        // backend returns { data: { html } } via axios, or { html } directly
        const html: string | undefined = result?.data?.html ?? result?.html;
        const serverError: string | undefined =
          result?.data?.error ?? result?.error;

        if (serverError) throw new Error(serverError);
        if (!html)
          throw new Error(
            "No page content returned — check AI API key or try again",
          );

        await pagesApi.updatePage(created._id, {
          htmlContent: html,
          useHtml: true,
          jsonConfig: created.jsonConfig,
        });
        finalPages.push({ ...created, htmlContent: html, useHtml: true });
        setBuildStates((prev) =>
          prev.map((s, j) => (j === i ? { ...s, status: "done" } : s)),
        );
      } catch (err: any) {
        // sendError returns { error: { message } } — drill into it
        const errMsg: string =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Build failed";
        console.error(`Page "${p.name}" failed:`, errMsg);
        setBuildStates((prev) =>
          prev.map((s, j) =>
            j === i ? { ...s, status: "error", error: errMsg } : s,
          ),
        );
      }
    }

    setBuiltPages(finalPages);
    setStep("done");
    onDone(finalPages);
  };

  const doneCount = buildStates.filter((s) => s.status === "done").length;
  const errorCount = buildStates.filter((s) => s.status === "error").length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl"
        onClick={step === "building" ? undefined : onClose}
      />

      <div
        className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── STEP: PROMPT ── */}
        {step === "prompt" && (
          <>
            <div className="p-10 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    Build Full Website
                  </h3>
                  <p className="text-white/40 font-medium text-sm">
                    Describe your entire website — AI creates every page
                  </p>
                </div>
              </div>
            </div>

            <div className="px-10 pb-10 space-y-6">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      handlePlan();
                  }}
                  placeholder={
                    "e.g. Build a fashion e-commerce store with pages for Home, Men's Collection, Women's Collection, Shoes, and T-Shirts. Each category page should have product grids and a Buy Now button."
                  }
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white placeholder-white/20 text-base leading-relaxed resize-none outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <div className="absolute bottom-5 right-6 text-[10px] font-black text-white/20 tracking-widest uppercase">
                  ⌘ + Enter to plan
                </div>
              </div>

              {/* Example prompts */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">
                  Examples
                </p>
                {[
                  "E-commerce fashion store: Home, Men's, Women's, Shoes, T-Shirts pages",
                  "University website: Home, Admissions, Courses, Faculty, Contact pages",
                  "SaaS startup: Home, Features, Pricing, About, Blog pages",
                  "Restaurant: Home, Menu, Reservations, About, Contact pages",
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="w-full text-left text-xs text-white/40 hover:text-white/80 hover:bg-white/5 px-4 py-3 rounded-2xl border border-white/5 hover:border-white/10 transition flex items-center justify-between group"
                  >
                    <span className="truncate">{ex}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white text-sm font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePlan}
                disabled={!prompt.trim() || isPlanning}
                className="flex items-center gap-3 h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-xl"
              >
                {isPlanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isPlanning ? "Planning…" : "Plan My Site"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: PLAN REVIEW ── */}
        {step === "plan" && (
          <>
            <div className="p-10 pb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Site Plan Ready
                  </h3>
                  <p className="text-white/40 text-sm font-medium">
                    AI will build {sitePlan.length} pages with connected
                    navigation
                  </p>
                </div>
              </div>
            </div>

            <div className="px-10 pb-6 space-y-3 max-h-80 overflow-y-auto">
              {sitePlan.map((p, i) => (
                <div
                  key={p.slug}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-black shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold text-sm">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                        /{p.slug}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">
                      {p.purpose}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setStep("prompt")}
                className="text-white/40 hover:text-white text-sm font-bold transition"
              >
                ← Edit Prompt
              </button>
              <button
                onClick={handleBuild}
                className="flex items-center gap-3 h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                Build All {sitePlan.length} Pages
              </button>
            </div>
          </>
        )}

        {/* ── STEP: BUILDING ── */}
        {step === "building" && (
          <div className="p-10 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Building Your Website…
                </h3>
                <p className="text-white/40 text-sm font-medium">
                  {doneCount} / {buildStates.length} pages complete
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                style={{
                  width: buildStates.length
                    ? `${(doneCount / buildStates.length) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {buildStates.map((p, i) => (
                <div
                  key={p.slug}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    p.status === "done"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : p.status === "building"
                        ? "border-blue-500/40 bg-blue-500/10"
                        : p.status === "error"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <div className="shrink-0">
                    {p.status === "done" && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {p.status === "building" && (
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    )}
                    {p.status === "error" && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    {p.status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2 border-white/10 flex items-center justify-center">
                        <span className="text-[9px] text-white/30 font-black">
                          {i + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-bold text-sm ${
                        p.status === "done"
                          ? "text-emerald-300"
                          : p.status === "building"
                            ? "text-blue-300"
                            : p.status === "error"
                              ? "text-red-300"
                              : "text-white/40"
                      }`}
                    >
                      {p.name}
                    </span>
                    {p.status === "building" && (
                      <p className="text-[10px] text-blue-400/70 font-medium mt-0.5">
                        Building page…
                      </p>
                    )}
                    {p.status === "error" && (
                      <p className="text-[10px] text-red-400/70 font-medium mt-0.5">
                        {p.error}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-white/20 shrink-0">
                    /{p.slug}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && (
          <>
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Website Built!
                  </h3>
                  <p className="text-white/40 text-sm font-medium">
                    {doneCount} pages created
                    {errorCount > 0 ? `, ${errorCount} failed` : ""} — all
                    linked together
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {buildStates.map((p) => (
                  <div
                    key={p.slug}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      p.status === "done"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-red-500/20 bg-red-500/5"
                    }`}
                  >
                    {p.status === "done" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-white flex-1">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">
                      /{p.slug}
                    </span>
                    {p.status === "done" && (
                      <a
                        href={`/${p.slug}`}
                        className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition"
                      >
                        Preview →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white text-sm font-bold transition"
              >
                Close
              </button>
              {builtPages.length > 0 && (
                <a
                  href={`/${builtPages[0]?.slug ?? sitePlan[0]?.slug}`}
                  className="flex items-center gap-2 h-12 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black uppercase tracking-widest text-xs hover:opacity-90 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Home Page
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── NEW SINGLE PAGE MODAL ─────────────────────────────────────────────────────
const NewPageModal = ({
  isOpen,
  onClose,
  onCreate,
  initialName,
  initialSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, slug: string, mode: "canvas" | "ai") => void;
  initialName?: string;
  initialSlug?: string;
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [mode, setMode] = useState<"canvas" | "ai">("ai");

  useEffect(() => {
    if (name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }, [name]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialName) {
      setName(initialName);
    }
    if (initialSlug) {
      setSlug(initialSlug);
    }
  }, [isOpen, initialName, initialSlug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Create Single Page
            </h2>
            <p className="text-gray-500 font-medium">
              Add one page to your site
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal"
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                Page Name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Men's Collection"
                className="w-full h-14 px-6 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                URL Slug
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="page-url"
                  title="Enter page slug"
                  className="w-full h-14 pl-10 pr-6 rounded-2xl border-gray-100 bg-gray-50/50 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode("ai")}
              className={`relative p-8 rounded-4xl border-2 text-left transition-all group ${
                mode === "ai"
                  ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-500/5"
                  : "border-gray-100 hover:border-blue-200"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  mode === "ai"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                }`}
              >
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Build</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Describe the page and let AI generate the full HTML instantly.
              </p>
              {mode === "ai" && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setMode("canvas")}
              className={`relative p-8 rounded-4xl border-2 text-left transition-all group ${
                mode === "canvas"
                  ? "border-violet-600 bg-violet-50/30 ring-4 ring-violet-500/5"
                  : "border-gray-100 hover:border-violet-200"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  mode === "canvas"
                    ? "bg-violet-600 text-white"
                    : "bg-gray-50 text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500"
                }`}
              >
                <MousePointer2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Visual Canvas
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Drag-and-drop block editor — build manually.
              </p>
              {mode === "canvas" && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!name || !slug}
            onClick={() => onCreate(name, slug, mode)}
            className="h-14 px-10 bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center gap-3 shadow-xl transition-all hover:-translate-y-0.5"
          >
            Create Page
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── RENAME PAGE MODAL ────────────────────────────────────────────────────────
const RenamePageModal = ({
  isOpen,
  page,
  onClose,
  onSave,
  saving,
}: {
  isOpen: boolean;
  page: Page | null;
  onClose: () => void;
  onSave: (name: string, slug: string) => void;
  saving: boolean;
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!isOpen || !page) return;
    setName(page.name);
    setSlug(page.slug);
  }, [isOpen, page]);

  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-7 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              Rename Page
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              Update title and URL slug
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close rename dialog"
            aria-label="Close rename dialog"
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 pb-7 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Page Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/60 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Page name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Page Slug
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">
                /
              </span>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, ""),
                  )
                }
                className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 bg-gray-50/60 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="page-url"
              />
            </div>
          </div>
        </div>

        <div className="px-7 py-5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-xl text-gray-500 font-bold hover:text-gray-900 transition"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim() || !slug.trim() || saving}
            onClick={() => onSave(name.trim(), slug.trim())}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-black tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-all"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SeoSettingsModal = ({
  isOpen,
  page,
  onClose,
  onSave,
  saving,
}: {
  isOpen: boolean;
  page: Page | null;
  onClose: () => void;
  onSave: (payload: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  }) => void;
  saving: boolean;
}) => {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  useEffect(() => {
    if (!isOpen || !page) return;
    setMetaTitle(page.seo?.metaTitle || page.name);
    setMetaDescription(page.seo?.metaDescription || "");
    setCanonicalUrl(page.seo?.canonicalUrl || `/${page.slug}`);
  }, [isOpen, page]);

  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">SEO Settings</h3>
            <p className="text-sm text-slate-500">
              Configure metadata and SERP presentation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black tracking-wide uppercase text-slate-400">
              Meta Title
            </label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value.slice(0, 70))}
              className="w-full h-11 px-4 rounded-xl border border-slate-200"
              placeholder="Page title in search results"
            />
            <p className="text-[11px] text-slate-400">
              {metaTitle.length}/70 characters
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black tracking-wide uppercase text-slate-400">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))}
              className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 resize-none"
              placeholder="Brief page summary for search engines"
            />
            <p className="text-[11px] text-slate-400">
              {metaDescription.length}/160 characters
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black tracking-wide uppercase text-slate-400">
              Canonical URL
            </label>
            <input
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 font-mono text-sm"
              placeholder="/your-page-slug"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              SERP Preview
            </p>
            <p className="text-sm text-blue-700 font-medium truncate">
              {(canonicalUrl || `/${page.slug}`).startsWith("http")
                ? canonicalUrl || `/${page.slug}`
                : `https://example.edu${canonicalUrl || `/${page.slug}`}`}
            </p>
            <p className="text-lg text-blue-900 font-semibold leading-snug truncate">
              {metaTitle || page.name}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {metaDescription ||
                "Add a concise summary so this page appears clearer on search results."}
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-slate-500 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                metaTitle: metaTitle.trim(),
                metaDescription: metaDescription.trim(),
                canonicalUrl: canonicalUrl.trim(),
              })
            }
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-sky-600 text-white font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save SEO"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduleModal = ({
  isOpen,
  page,
  onClose,
  onSave,
  saving,
}: {
  isOpen: boolean;
  page: Page | null;
  onClose: () => void;
  onSave: (payload: {
    publishAt: string | null;
    unpublishAt: string | null;
  }) => void;
  saving: boolean;
}) => {
  const [publishAt, setPublishAt] = useState("");
  const [unpublishAt, setUnpublishAt] = useState("");

  useEffect(() => {
    if (!isOpen || !page) return;
    setPublishAt(
      page.scheduledPublishAt
        ? new Date(page.scheduledPublishAt).toISOString().slice(0, 16)
        : "",
    );
    setUnpublishAt(
      page.scheduledUnpublishAt
        ? new Date(page.scheduledUnpublishAt).toISOString().slice(0, 16)
        : "",
    );
  }, [isOpen, page]);

  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Publish Scheduling
            </h3>
            <p className="text-sm text-slate-500">
              Set future publish or unpublish times
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-slate-400">
              Schedule Publish At
            </label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-wide text-slate-400">
              Schedule Unpublish At
            </label>
            <input
              type="datetime-local"
              value={unpublishAt}
              onChange={(e) => setUnpublishAt(e.target.value)}
              className="mt-1 w-full h-11 px-4 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-slate-500 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                publishAt: publishAt ? new Date(publishAt).toISOString() : null,
                unpublishAt: unpublishAt
                  ? new Date(unpublishAt).toISOString()
                  : null,
              })
            }
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-sky-600 text-white font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [fetchingPages, setFetchingPages] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [showSiteBuilder, setShowSiteBuilder] = useState(false);
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);
  const [openActionsUpward, setOpenActionsUpward] = useState(false);
  const [openActionsPosition, setOpenActionsPosition] = useState({
    top: 0,
    left: 0,
  });
  const [renamePageTarget, setRenamePageTarget] = useState<Page | null>(null);
  const [savingRename, setSavingRename] = useState(false);
  const [busyPageId, setBusyPageId] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<AIUsageSummary | null>(null);
  const [complianceReport, setComplianceReport] =
    useState<ComplianceReport | null>(null);
  const [loadingCompliance, setLoadingCompliance] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [publishingPageId, setPublishingPageId] = useState<string | null>(null);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [seoPageTarget, setSeoPageTarget] = useState<Page | null>(null);
  const [schedulePageTarget, setSchedulePageTarget] = useState<Page | null>(
    null,
  );
  const [savingSeo, setSavingSeo] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingTemplatePageId, setSavingTemplatePageId] = useState<
    string | null
  >(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [prefillName, setPrefillName] = useState("");
  const [prefillSlug, setPrefillSlug] = useState("");
  const [hasAppliedQueryPrefill, setHasAppliedQueryPrefill] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const createMode = searchParams.get("create");
    if (createMode !== "1" || hasAppliedQueryPrefill) return;

    const rawSlug = (searchParams.get("slug") || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const rawName = (searchParams.get("name") || "").trim();

    setPrefillSlug(rawSlug);
    setPrefillName(rawName);
    setShowNewPageModal(true);
    setHasAppliedQueryPrefill(true);
  }, [hasAppliedQueryPrefill]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const data = await pagesApi.getAllPages();
        setPages(data);
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      } finally {
        setFetchingPages(false);
      }
    };
    if (user) fetchPages();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!actionsMenuRef.current) return;
      if (actionsMenuRef.current.contains(event.target as Node)) return;
      setOpenActionsFor(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      if (user?.role !== "super-admin") return;
      setLoadingUsage(true);
      try {
        const summary = await getUsageSummary();
        setUsageSummary(summary?.data ?? summary ?? null);
      } catch (error) {
        console.error("Failed to fetch AI usage summary:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    void fetchUsage();
  }, [user?.role]);

  useEffect(() => {
    const fetchCompliance = async () => {
      if (!user) return;
      setLoadingCompliance(true);
      try {
        const response = await getComplianceReport();
        setComplianceReport(response?.data ?? response ?? null);
      } catch (error) {
        console.error("Failed to fetch compliance report:", error);
      } finally {
        setLoadingCompliance(false);
      }
    };

    void fetchCompliance();
  }, [user]);

  const handleCreatePage = async (
    name: string,
    slug: string,
    mode: "canvas" | "ai",
  ) => {
    try {
      const newPage = await pagesApi.createPage({
        name,
        slug,
        useHtml: mode === "ai",
      });
      setPages((prev) =>
        [newPage, ...prev].sort(
          (a, b) => (b.orderIndex ?? 0) - (a.orderIndex ?? 0),
        ),
      );
      toast.success("Page created!");
      setShowNewPageModal(false);
      router.push(mode === "ai" ? `/edit/${slug}?init=ai` : `/edit/${slug}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("A page with this slug already exists.");
      } else {
        toast.error("Failed to create page.");
      }
    }
  };

  const handleSiteDone = async (newPages: Page[]) => {
    // Refresh page list from DB — shows only the freshly built pages
    try {
      const data = await pagesApi.getAllPages();
      setPages(data);
    } catch {
      setPages(newPages);
    }
    if (newPages.length > 0) {
      toast.success(`${newPages.length} pages built successfully!`);
    }
  };

  const handleMovePage = async (pageId: string, direction: "up" | "down") => {
    const currentIndex = pages.findIndex((p) => p._id === pageId);
    if (currentIndex < 0) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const next = [...pages];
    const currentPage = next[currentIndex];
    const targetPage = next[targetIndex];
    const currentOrderIndex =
      currentPage.orderIndex ?? pages.length - currentIndex;
    const targetOrderIndex =
      targetPage.orderIndex ?? pages.length - targetIndex;

    next[currentIndex] = {
      ...targetPage,
      orderIndex: currentOrderIndex,
    };
    next[targetIndex] = {
      ...currentPage,
      orderIndex: targetOrderIndex,
    };

    setBusyPageId(pageId);
    try {
      await Promise.all([
        pagesApi.updatePage(currentPage._id, { orderIndex: targetOrderIndex }),
        pagesApi.updatePage(targetPage._id, { orderIndex: currentOrderIndex }),
      ]);

      const refreshedPages = await pagesApi.getAllPages();
      setPages(refreshedPages);
      toast.success("Page order updated.");
    } catch {
      toast.error("Failed to move page.");
    } finally {
      setBusyPageId(null);
      setOpenActionsFor(null);
    }
  };

  const handleRenamePage = async (name: string, slug: string) => {
    if (!renamePageTarget) return;

    setSavingRename(true);
    try {
      const updated = await pagesApi.updatePage(renamePageTarget._id, {
        name,
        slug,
      });
      setPages((prev) =>
        prev.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)),
      );
      toast.success("Page renamed successfully.");
      setRenamePageTarget(null);
      setOpenActionsFor(null);
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("That slug already exists. Please choose a unique slug.");
      } else {
        toast.error("Failed to rename page.");
      }
    } finally {
      setSavingRename(false);
    }
  };

  const handleDeletePage = async (page: Page) => {
    const ok = window.confirm(`Delete "${page.name}"? This cannot be undone.`);
    if (!ok) return;

    setBusyPageId(page._id);
    try {
      await pagesApi.deletePage(page._id);
      setPages((prev) => prev.filter((p) => p._id !== page._id));
      toast.success("Page deleted.");
      setOpenActionsFor(null);
    } catch {
      toast.error("Failed to delete page.");
    } finally {
      setBusyPageId(null);
    }
  };

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId],
    );
  };

  const selectAllFilteredPages = () => {
    const allIds = filteredPages.map((page) => page._id);
    setSelectedPageIds((prev) => {
      const hasAllSelected = allIds.every((id) => prev.includes(id));
      if (hasAllSelected) {
        return prev.filter((id) => !allIds.includes(id));
      }
      return Array.from(new Set([...prev, ...allIds]));
    });
  };

  const refreshPages = async () => {
    const data = await pagesApi.getAllPages();
    setPages(data);
  };

  const handleBulkAction = async (
    action: "publish" | "unpublish" | "duplicate" | "delete",
  ) => {
    if (!selectedPageIds.length) {
      toast.error("Select at least one page first.");
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        `Delete ${selectedPageIds.length} selected page(s)? This cannot be undone.`,
      );
      if (!confirmed) return;
    }

    setBulkBusy(true);
    try {
      await pagesApi.batchPageOperation({
        action,
        pageIds: selectedPageIds,
      });

      await refreshPages();
      setSelectedPageIds([]);
      toast.success(`Bulk ${action} completed.`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          `Bulk ${action} failed.`,
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const handleSaveSeo = async (payload: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  }) => {
    if (!seoPageTarget) return;

    setSavingSeo(true);
    try {
      const updated = await pagesApi.updatePage(seoPageTarget._id, {
        seo: {
          metaTitle: payload.metaTitle,
          metaDescription: payload.metaDescription,
          canonicalUrl: payload.canonicalUrl,
        },
      });
      setPages((prev) =>
        prev.map((page) =>
          page._id === updated._id ? { ...page, ...updated } : page,
        ),
      );
      toast.success("SEO settings saved.");
      setSeoPageTarget(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to save SEO.",
      );
    } finally {
      setSavingSeo(false);
      setOpenActionsFor(null);
    }
  };

  const handleSaveSchedule = async (payload: {
    publishAt: string | null;
    unpublishAt: string | null;
  }) => {
    if (!schedulePageTarget) return;

    setSavingSchedule(true);
    try {
      const result = await pagesApi.schedulePage(
        schedulePageTarget._id,
        payload,
      );
      setPages((prev) =>
        prev.map((page) =>
          page._id === result.page._id ? { ...page, ...result.page } : page,
        ),
      );
      toast.success(result.scheduleSummary || "Schedule updated.");
      setSchedulePageTarget(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to save schedule.",
      );
    } finally {
      setSavingSchedule(false);
      setOpenActionsFor(null);
    }
  };

  const handleSaveAsTemplate = async (page: Page) => {
    const templateName = window.prompt(
      "Template name",
      `${page.name} Template`,
    );
    if (!templateName?.trim()) return;

    setSavingTemplatePageId(page._id);
    try {
      await pagesApi.savePageAsTemplate(page._id, {
        name: templateName.trim(),
        description: `Saved from page ${page.name}`,
        category: "custom",
        isPublic: false,
      });
      toast.success("Page saved as template.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to save template.",
      );
    } finally {
      setSavingTemplatePageId(null);
      setOpenActionsFor(null);
    }
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      const result = await runNlpBenchmark();
      const accuracy = result?.data?.accuracy ?? result?.accuracy;
      toast.success(`NLP benchmark completed: ${accuracy}% accuracy`);

      const summary = await getUsageSummary();
      setUsageSummary(summary?.data ?? summary ?? null);
    } catch {
      toast.error("Failed to run benchmark");
    } finally {
      setRunningBenchmark(false);
    }
  };

  const handlePublishPage = async (page: Page) => {
    setPublishingPageId(page._id);
    try {
      const updated = await pagesApi.publishPage(page._id);
      setPages((prev) =>
        prev.map((item) =>
          item._id === updated._id ? { ...item, ...updated } : item,
        ),
      );
      toast.success(`Published ${page.name}`);
      const refreshed = await getComplianceReport();
      setComplianceReport(refreshed?.data ?? refreshed ?? null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to publish page.";
      toast.error(errorMessage);
      if (
        String(error?.response?.data?.error?.code || "").includes(
          "COMPLIANCE_BLOCKED",
        )
      ) {
        const refreshed = await getComplianceReport();
        setComplianceReport(refreshed?.data ?? refreshed ?? null);
      }
    } finally {
      setPublishingPageId(null);
      setOpenActionsFor(null);
    }
  };

  const handleUnpublishPage = async (page: Page) => {
    setPublishingPageId(page._id);
    try {
      const updated = await pagesApi.unpublishPage(page._id);
      setPages((prev) =>
        prev.map((item) =>
          item._id === updated._id ? { ...item, ...updated } : item,
        ),
      );
      toast.success(`Unpublished ${page.name}`);
      const refreshed = await getComplianceReport();
      setComplianceReport(refreshed?.data ?? refreshed ?? null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to unpublish page.",
      );
    } finally {
      setPublishingPageId(null);
      setOpenActionsFor(null);
    }
  };

  const exportComplianceReport = () => {
    if (!complianceReport) return;

    const blob = new Blob([JSON.stringify(complianceReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Compliance report exported");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const canEdit =
    user?.role === "admin" ||
    user?.role === "super-admin" ||
    user?.role === "editor";
  const filteredPages = pages.filter((page) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      page.name.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q)
    );
  });
  const firstFilteredPageId = filteredPages[0]?._id ?? null;
  const lastFilteredPageId =
    filteredPages[filteredPages.length - 1]?._id ?? null;
  const activePage = openActionsFor
    ? (filteredPages.find((page) => page._id === openActionsFor) ?? null)
    : null;
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,#e0f2fe,transparent_42%),radial-gradient(circle_at_88%_2%,#ede9fe,transparent_36%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)] flex flex-col">
      <nav className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-600 to-indigo-700 text-white grid place-items-center shadow-lg shadow-blue-200/70">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  Campus<span className="text-sky-600">Sync</span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Command Center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900">
                  {user?.name}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
        <section className="rounded-4xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_25px_80px_-38px_rgba(15,23,42,0.35)] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Modern Builder Workspace
              </p>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Design, validate, and publish with confidence.
              </h1>
              <p className="mt-3 text-slate-600 font-medium leading-relaxed">
                Manage pages, compliance, and AI generation from one
                high-clarity dashboard optimized for desktop and mobile.
              </p>
            </div>

            {canEdit && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowNewPageModal(true)}
                  className="h-11 px-5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Single Page
                </Button>
                <button
                  onClick={() => setShowSiteBuilder(true)}
                  className="h-11 px-5 rounded-xl bg-linear-to-r from-sky-600 to-indigo-700 text-white font-bold shadow-lg shadow-blue-200/70 hover:opacity-95 transition"
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Build Full Website
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <aside className="xl:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total Pages
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {pages.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Security
                </p>
                <p className="mt-1 text-sm font-black text-sky-700 inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  High
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Compliance
                </h3>
                <ShieldCheck className="w-4 h-4 text-sky-600" />
              </div>

              {loadingCompliance ? (
                <div className="py-6 text-center text-xs font-semibold text-slate-500">
                  Loading compliance...
                </div>
              ) : complianceReport ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-slate-950 text-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                      Overall Score
                    </p>
                    <p className="text-3xl font-black mt-1">
                      {complianceReport.summary.complianceScore}%
                    </p>
                    <p className="text-[11px] text-white/65 mt-1">
                      {complianceReport.summary.criticalIssues > 0
                        ? `${complianceReport.summary.criticalIssues} critical blocker(s)`
                        : "Publish-ready"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Pages
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {complianceReport.summary.totalPages}
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                        Critical
                      </p>
                      <p className="text-sm font-bold text-red-600">
                        {complianceReport.summary.criticalIssues}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                        Warnings
                      </p>
                      <p className="text-sm font-bold text-amber-600">
                        {complianceReport.summary.warnings}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={exportComplianceReport}
                      className="h-10 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <Link
                      href="/dashboard/compliance"
                      className="h-10 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-black uppercase tracking-widest hover:bg-sky-100 transition flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Full Report
                    </Link>
                  </div>

                  <div className="space-y-2 pt-1">
                    {complianceReport.pages
                      .filter((page) => !page.canPublish || page.critical > 0)
                      .slice(0, 2)
                      .map((page) => (
                        <div
                          key={page.pageId}
                          className="rounded-xl border border-amber-100 bg-amber-50 p-3"
                        >
                          <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {page.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                /{page.slug}
                              </p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                              {page.score}%
                            </span>
                          </div>
                          <button
                            onClick={() => router.push(`/edit/${page.slug}`)}
                            className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                          >
                            Fix now <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs font-semibold text-slate-500">
                  Compliance report unavailable.
                </div>
              )}
            </div>

            {user?.role === "super-admin" && (
              <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    AI Cost Monitor
                  </h3>
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                {loadingUsage ? (
                  <div className="py-6 text-center text-xs font-semibold text-slate-500">
                    Loading usage...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        30-Day Cost
                      </p>
                      <p className="text-2xl font-black text-slate-900">
                        $
                        {usageSummary?.overview?.totalCostUsd?.toFixed(2) ||
                          "0.00"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Requests
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {usageSummary?.overview?.totalRequests || 0}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Cache
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {usageSummary?.overview?.cacheHits || 0}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRunBenchmark}
                      disabled={runningBenchmark}
                      className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition"
                    >
                      {runningBenchmark
                        ? "Running Benchmark..."
                        : "Run NLP Benchmark"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl bg-linear-to-br from-sky-600 to-indigo-700 text-white p-6 shadow-xl">
              <Globe className="w-9 h-9 text-white/70 mb-4" />
              <h3 className="text-lg font-black">Full Website Builder</h3>
              <p className="text-sm text-sky-100/90 mt-2 leading-relaxed">
                Generate a complete multi-page website with connected navigation
                from one prompt.
              </p>
              <button
                onClick={() => setShowSiteBuilder(true)}
                className="mt-5 w-full h-11 rounded-xl bg-white text-sky-700 font-black hover:bg-sky-50 transition"
              >
                Build with AI
              </button>
            </div>
          </aside>

          <section className="xl:col-span-8">
            <div className="rounded-3xl border border-white/80 bg-white/90 overflow-hidden shadow-[0_22px_70px_-42px_rgba(15,23,42,0.35)]">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Project Pages
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Edit, validate, reorder, and publish from one place.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <Link
                    href="/dashboard/settings"
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <Link
                    href="/dashboard/performance"
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Performance
                  </Link>
                  <Link
                    href="/dashboard/media"
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                  >
                    <Files className="w-3.5 h-3.5" />
                    Media Hub
                  </Link>
                  <button
                    onClick={selectAllFilteredPages}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5"
                  >
                    {filteredPages.length > 0 &&
                    filteredPages.every((page) =>
                      selectedPageIds.includes(page._id),
                    ) ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    Select
                  </button>
                  <button
                    onClick={() => void handleBulkAction("publish")}
                    disabled={bulkBusy || !selectedPageIds.length}
                    className="h-10 px-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Bulk Publish
                  </button>
                  <button
                    onClick={() => void handleBulkAction("unpublish")}
                    disabled={bulkBusy || !selectedPageIds.length}
                    className="h-10 px-3 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Bulk Unpublish
                  </button>
                  <button
                    onClick={() => void handleBulkAction("duplicate")}
                    disabled={bulkBusy || !selectedPageIds.length}
                    className="h-10 px-3 rounded-xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Bulk Duplicate
                  </button>
                  <button
                    onClick={() => void handleBulkAction("delete")}
                    disabled={bulkBusy || !selectedPageIds.length}
                    className="h-10 px-3 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Bulk Delete
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages"
                      className="h-10 pl-9 pr-4 w-56 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {fetchingPages ? (
                  <div className="p-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-sky-600" />
                  </div>
                ) : filteredPages.length > 0 ? (
                  filteredPages.map((page) => (
                    <div
                      key={page._id}
                      className="p-5 sm:p-6 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <button
                            onClick={() => togglePageSelection(page._id)}
                            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 grid place-items-center"
                            title="Select page"
                          >
                            {selectedPageIds.includes(page._id) ? (
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div
                            className={`w-12 h-12 rounded-xl grid place-items-center ${page.useHtml ? "bg-sky-100 text-sky-700" : "bg-indigo-100 text-indigo-700"}`}
                          >
                            {page.useHtml ? (
                              <Bot className="w-5 h-5" />
                            ) : (
                              <Layout className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 truncate">
                              {page.name}
                            </h3>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${page.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                              >
                                {page.isPublished ? "Live" : "Draft"}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {page.useHtml ? "AI Build" : "Visual Canvas"}
                              </span>
                              <span className="text-xs font-mono text-slate-500 truncate">
                                /{page.slug}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Link
                              href={`/edit/${page.slug}`}
                              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold inline-flex items-center gap-2 hover:bg-slate-50"
                            >
                              <FileEdit className="w-4 h-4 text-sky-600" />
                              Edit
                            </Link>
                          )}
                          <Link
                            href={`/${page.slug}`}
                            className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold inline-flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Live
                          </Link>
                          {canEdit && (
                            <button
                              onClick={(event) => {
                                if (openActionsFor === page._id) {
                                  setOpenActionsFor(null);
                                  return;
                                }

                                const buttonRect =
                                  event.currentTarget.getBoundingClientRect();
                                const estimatedMenuHeight = 260;
                                const spaceBelow =
                                  window.innerHeight - buttonRect.bottom;
                                const spaceAbove = buttonRect.top;
                                const menuWidth = 224;
                                const left = Math.min(
                                  Math.max(16, buttonRect.right - menuWidth),
                                  window.innerWidth - menuWidth - 16,
                                );

                                setOpenActionsUpward(
                                  spaceBelow < estimatedMenuHeight &&
                                    spaceAbove > spaceBelow,
                                );
                                setOpenActionsPosition({
                                  top: buttonRect.bottom + 12,
                                  left,
                                });
                                setOpenActionsFor(page._id);
                              }}
                              title="Open page actions"
                              aria-label="Open page actions"
                              className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            >
                              <MoreVertical className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900">
                      No pages yet
                    </h3>
                    <p className="text-slate-500 font-medium mt-2 mb-6">
                      Start with a single page or generate a complete site using
                      AI.
                    </p>
                    <button
                      onClick={() => setShowSiteBuilder(true)}
                      className="h-11 px-6 rounded-xl bg-linear-to-r from-sky-600 to-indigo-700 text-white font-bold"
                    >
                      Build Full Website
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <NewPageModal
        isOpen={showNewPageModal}
        onClose={() => {
          setShowNewPageModal(false);
          setPrefillName("");
          setPrefillSlug("");
        }}
        onCreate={handleCreatePage}
        initialName={prefillName}
        initialSlug={prefillSlug}
      />

      <RenamePageModal
        isOpen={!!renamePageTarget}
        page={renamePageTarget}
        onClose={() => setRenamePageTarget(null)}
        onSave={handleRenamePage}
        saving={savingRename}
      />

      {openActionsFor && activePage && (
        <div
          ref={actionsMenuRef}
          className={`fixed z-[9999] w-56 rounded-2xl border border-gray-100 bg-white shadow-[0_25px_55px_-12px_rgba(0,0,0,0.25)] p-2 animate-in fade-in duration-150 ${
            openActionsUpward ? "slide-in-from-bottom-1" : "slide-in-from-top-1"
          }`}
          style={{
            left: `${openActionsPosition.left}px`,
            top: openActionsUpward
              ? `${Math.max(16, openActionsPosition.top - 280)}px`
              : `${openActionsPosition.top}px`,
          }}
        >
          <button
            onClick={() => {
              router.push(`/edit/${activePage.slug}`);
              setOpenActionsFor(null);
            }}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <FileEdit className="w-4 h-4 text-blue-600" />
            Open Editor
          </button>
          <button
            onClick={() => setRenamePageTarget(activePage)}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <Pencil className="w-4 h-4 text-violet-600" />
            Rename Page
          </button>
          <button
            onClick={() => setSeoPageTarget(activePage)}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <Settings2 className="w-4 h-4 text-indigo-600" />
            SEO Settings
          </button>
          <button
            onClick={() => setSchedulePageTarget(activePage)}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <CalendarClock className="w-4 h-4 text-sky-600" />
            Publish Schedule
          </button>
          <button
            disabled={savingTemplatePageId === activePage._id}
            onClick={() => void handleSaveAsTemplate(activePage)}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            {savingTemplatePageId === activePage._id
              ? "Saving Template..."
              : "Save As Template"}
          </button>
          <button
            disabled={publishingPageId === activePage._id}
            onClick={() =>
              activePage.isPublished
                ? void handleUnpublishPage(activePage)
                : void handlePublishPage(activePage)
            }
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {publishingPageId === activePage._id
              ? "Validating…"
              : activePage.isPublished
                ? "Unpublish Page"
                : "Validate & Publish"}
          </button>
          <button
            disabled={activePage._id === firstFilteredPageId}
            onClick={() => handleMovePage(activePage._id, "up")}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4 text-sky-600" />
            Move Up
          </button>
          <button
            disabled={activePage._id === lastFilteredPageId}
            onClick={() => handleMovePage(activePage._id, "down")}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowDown className="w-4 h-4 text-sky-600" />
            Move Down
          </button>
          <div className="my-1 h-px bg-gray-100" />
          <button
            disabled={busyPageId === activePage._id}
            onClick={() => handleDeletePage(activePage)}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {busyPageId === activePage._id ? "Deleting…" : "Delete Page"}
          </button>
        </div>
      )}

      <SeoSettingsModal
        isOpen={!!seoPageTarget}
        page={seoPageTarget}
        onClose={() => setSeoPageTarget(null)}
        onSave={handleSaveSeo}
        saving={savingSeo}
      />

      <ScheduleModal
        isOpen={!!schedulePageTarget}
        page={schedulePageTarget}
        onClose={() => setSchedulePageTarget(null)}
        onSave={handleSaveSchedule}
        saving={savingSchedule}
      />

      <FullSiteBuilderModal
        isOpen={showSiteBuilder}
        onClose={() => setShowSiteBuilder(false)}
        onDone={handleSiteDone}
      />
    </div>
  );
}
