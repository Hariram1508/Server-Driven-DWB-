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
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, slug: string, mode: "canvas" | "ai") => void;
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
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900 uppercase">
                Campus<span className="text-blue-600">Sync</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-black text-gray-900">
                  {user?.name}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>
              <div className="h-8 w-px bg-gray-100" />
              <button
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 font-medium">
              Build and manage your AI-powered website.
            </p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowNewPageModal(true)}
                className="rounded-2xl h-12 px-6 bg-white border border-gray-200 text-gray-900 font-bold flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Single Page
              </Button>
              <button
                onClick={() => setShowSiteBuilder(true)}
                className="rounded-2xl h-12 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white font-bold flex items-center gap-2 shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Globe className="w-4 h-4" />
                Build Full Website
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Status
                </h3>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Total Pages
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    {pages.length}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Security
                  </p>
                  <p className="text-sm font-bold text-blue-600 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> High / Encrypted
                  </p>
                </div>
              </div>
            </div>

            {user?.role === "super-admin" && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                    AI Cost Monitor
                  </h3>
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>

                {loadingUsage ? (
                  <div className="py-6 text-center text-xs font-semibold text-gray-500">
                    Loading usage...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        30-Day Cost
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        $
                        {usageSummary?.overview?.totalCostUsd?.toFixed(2) ||
                          "0.00"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Requests
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {usageSummary?.overview?.totalRequests || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Cache Hits
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {usageSummary?.overview?.cacheHits || 0}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRunBenchmark}
                      disabled={runningBenchmark}
                      className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition"
                    >
                      {runningBenchmark
                        ? "Running Benchmark..."
                        : "Run NLP Benchmark"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Site Builder Card */}
            <div className="bg-gradient-to-br from-blue-600 to-violet-700 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="relative z-10">
                <Globe className="w-10 h-10 text-white/30 mb-6" />
                <h3 className="text-xl font-bold mb-2">Full Website Builder</h3>
                <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
                  Describe your entire website in one prompt. AI builds every
                  page with working navigation.
                </p>
                <button
                  onClick={() => setShowSiteBuilder(true)}
                  className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-colors"
                >
                  ✦ Build Full Site with AI
                </button>
              </div>
              <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>

          {/* Pages List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xs overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">
                  All Pages
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter pages..."
                    className="h-10 pl-9 pr-4 rounded-xl border-gray-100 text-sm focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {fetchingPages ? (
                  <div className="p-20 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : filteredPages.length > 0 ? (
                  filteredPages.map((page) => {
                    return (
                      <div
                        key={page._id}
                        className="p-8 hover:bg-gray-50 transition-all duration-300 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                page.useHtml
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-violet-50 text-violet-600"
                              }`}
                            >
                              {page.useHtml ? (
                                <Bot className="w-6 h-6" />
                              ) : (
                                <Layout className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {page.name}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-md ring-1 ring-green-200">
                                  Live
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  {page.useHtml ? "AI Build" : "Visual Canvas"}
                                </span>
                                <span className="text-xs font-mono text-gray-400">
                                  /{page.slug}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {canEdit && (
                              <Link
                                href={`/edit/${page.slug}`}
                                className="h-12 px-6 rounded-xl bg-white border border-gray-100 text-gray-900 text-sm font-bold flex items-center gap-2 hover:bg-gray-50 hover:shadow-sm transition-all shadow-xs"
                              >
                                <FileEdit className="w-4 h-4 text-blue-600" />
                                Edit
                              </Link>
                            )}
                            <Link
                              href={`/${page.slug}`}
                              className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-white text-sm font-bold transition-all shadow-sm hover:shadow-blue-200 hover:-translate-y-0.5"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Play
                            </Link>
                            {canEdit && (
                              <div className="relative">
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
                                      Math.max(
                                        16,
                                        buttonRect.right - menuWidth,
                                      ),
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
                                  className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center">
                    <Globe className="w-12 h-12 text-gray-100 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      No pages yet.
                    </h3>
                    <p className="text-gray-400 font-medium mb-10">
                      Build your first website with a single prompt.
                    </p>
                    <button
                      onClick={() => setShowSiteBuilder(true)}
                      className="h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold shadow-xl"
                    >
                      ✦ Build Full Website
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewPageModal
        isOpen={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreate={handleCreatePage}
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

      <FullSiteBuilderModal
        isOpen={showSiteBuilder}
        onClose={() => setShowSiteBuilder(false)}
        onDone={handleSiteDone}
      />
    </div>
  );
}
