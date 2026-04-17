"use client";

import React, { useEffect, useState, useRef, use, useCallback } from "react";
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  Eye,
  X,
  RefreshCw,
  Wand2,
  CheckCircle2,
  Send,
  MessageSquare,
  LayoutTemplate,
  ArrowRight,
} from "lucide-react";
import { EditorToolbar } from "../../../components/editor/EditorToolbar";
import { ComponentLibrary } from "@/components/editor/ComponentLibrary";
import { PropertyPanel } from "@/components/editor/PropertyPanel";
import { EditorSelectionProvider } from "@/components/editor/EditorSelectionContext";
import { ComponentMapper } from "@/components/renderer/ComponentMapper";
import * as pagesApi from "@/lib/api/pages.api";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { Container } from "@/components/builder-components/Container";
import { AIChat } from "@/components/AIChat";
import { RenderNode } from "@/components/editor/RenderNode";
import { SafeHTMLRenderer } from "@/components/editor/SafeHTMLRenderer";
import { generatePageHTML, modifyPageHTML } from "@/lib/api/ai.api";
import Button from "@/components/ui/Button";
import { Page, PageJSON } from "@/lib/types/page.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const normalizeSlug = (value: string): string =>
  decodeURIComponent(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

type DeviceMode = "desktop" | "tablet" | "mobile";
type SerializedEditorQuery = { serialize: () => string };
type EditorPageData = Page;

const toPageJson = (value: unknown): PageJSON => value as PageJSON;
const toCraftConfig = (value: unknown): Record<string, unknown> =>
  value as Record<string, unknown>;
const createHtmlCraftConfig = (
  html: string,
  existingConfig?: unknown,
): Record<string, unknown> => {
  const config = toCraftConfig(existingConfig);
  const existingRoot =
    (config.ROOT as Record<string, unknown> | undefined) ?? undefined;
  const htmlNodeId = `ai_html_${Date.now()}`;

  return {
    ...(config.meta ? { meta: config.meta } : {}),
    ROOT: {
      type: { resolvedName: "Container" },
      isCanvas: true,
      props: existingRoot?.props ?? {
        backgroundColor: "#ffffff",
        paddingTop: "40px",
        paddingRight: "40px",
        paddingBottom: "40px",
        paddingLeft: "40px",
        minHeight: "800px",
      },
      displayName: existingRoot?.displayName ?? "Container",
      custom: existingRoot?.custom ?? {},
      hidden: existingRoot?.hidden ?? false,
      nodes: [htmlNodeId],
      linkedNodes: existingRoot?.linkedNodes ?? {},
    },
    [htmlNodeId]: {
      type: { resolvedName: "RawHTML" },
      isCanvas: false,
      props: { html },
      displayName: "Custom HTML",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  };
};
const getDeviceWidthLabel = (device: DeviceMode): string => {
  if (device === "tablet") return "768px";
  if (device === "mobile") return "390px";
  return "100%";
};

const sanitizeJsonConfig = (config: unknown): Record<string, unknown> => {
  try {
    const cfg = toCraftConfig(config);
    const validResolvedNames = Object.keys(ComponentMapper);

    const sanitizedConfig = { ...cfg };

    Object.entries(sanitizedConfig).forEach(([nodeId, nodeData]) => {
      const node = nodeData as Record<string, unknown> | undefined;
      if (!node || typeof node !== "object") return;

      const type = node.type as Record<string, unknown> | string | undefined;
      let resolvedName: string | undefined;

      if (type && typeof type === "object") {
        resolvedName = type.resolvedName as string | undefined;
      } else if (typeof type === "string") {
        resolvedName = type;
      }

      if (!resolvedName || !validResolvedNames.includes(resolvedName)) {
        sanitizedConfig[nodeId] = {
          ...node,
          type: { resolvedName: "Container" },
          displayName: node.displayName || "Container",
          props: node.props || {},
        };
      }
    });

    return sanitizedConfig;
  } catch (error) {
    console.error("Error sanitizing config:", error);
    return {
      ROOT: {
        type: { resolvedName: "Container" },
        isCanvas: true,
        nodes: [],
        props: {},
      },
    };
  }
};

const canAutoSavePage = (pageData: EditorPageData) => !pageData.useHtml;

// ─── Full-Page HTML Preview Overlay ─────────────────────────────────────────
const FullPagePreview = ({
  html,
  slug,
  onClose,
  onEditCode,
  onSwitchToBlocks,
  onRegenerate,
  onModify,
}: {
  html: string;
  slug: string;
  onClose: () => void;
  onEditCode: () => void;
  onSwitchToBlocks: () => void;
  onRegenerate: () => void;
  onModify: () => void;
}) => {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [key, setKey] = useState(0);

  const deviceFrameClass =
    device === "desktop"
      ? "w-full max-w-full h-full"
      : device === "tablet"
        ? "w-[768px] max-w-full h-auto min-h-[900px]"
        : "w-[390px] max-w-full h-auto min-h-[900px]";

  const iframeClass =
    device === "desktop" ? "h-full min-h-[400px]" : "h-[900px] min-h-[900px]";

  const refresh = () => setKey((k) => k + 1);

  return (
    <div className="fixed inset-0 z-200 flex flex-col bg-[#111111] font-sans">
      {/* ── Browser Chrome Bar ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-[#1a1a1a] border-b border-white/5 shrink-0">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-4 overflow-hidden">
          <Button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-opacity-80 transition flex items-center justify-center group"
          >
            <X className="w-1.5 h-1.5 text-black opacity-0 group-hover:opacity-100" />
          </Button>
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center bg-[#242424] border border-white/5 rounded-xl px-4 py-2 gap-3 max-w-2xl mx-auto shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="text-white/40 text-xs font-mono tracking-tight">
            https://yourcampus.ai/{" "}
            <span className="text-blue-500/60">{slug}</span>
          </span>
          <RefreshCw
            className="w-3.5 h-3.5 text-white/20 hover:text-white/70 cursor-pointer ml-auto shrink-0 transition"
            onClick={refresh}
          />
        </div>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-[#242424] rounded-xl p-1 border border-white/5">
          {(
            [
              { id: "desktop", Icon: Monitor },
              { id: "tablet", Icon: Tablet },
              { id: "mobile", Icon: Smartphone },
            ] as { id: DeviceMode; Icon: React.ElementType }[]
          ).map(({ id, Icon }) => (
            <Button
              key={id}
              onClick={() => setDevice(id)}
              className={`p-2 rounded-lg transition-all duration-300 ${device === id ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Dashboard
          </Link>
          <button
            onClick={onModify}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Edit with AI
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
          <button
            onClick={onEditCode}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition"
            title="Edit Code"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={onSwitchToBlocks}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-white text-black hover:bg-gray-100 transition-all"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Visual Editor
          </button>
        </div>
      </div>

      {/* ── Viewport area ── */}
      <div className="flex-1 h-0 overflow-auto flex items-start justify-center bg-[#0a0a0a] p-8 pt-4 scrollbar-hide">
        <div
          className={`transition-all duration-500 bg-white rounded-b-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] shrink-0 ${deviceFrameClass}`}
        >
          <SafeHTMLRenderer
            key={`${key}-${device}`}
            html={html}
            fullPage
            className={iframeClass}
          />
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-[#1a1a1a] border-t border-white/5 text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] shrink-0">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          System Operational · {getDeviceWidthLabel(device)} Resolution
        </span>
        <span className="flex items-center gap-1">
          Crafted with AI · Production Ready
        </span>
      </div>
    </div>
  );
};

// ─── Code Editor Overlay ─────────────────────────────────────────────────────
const CodeEditorOverlay = ({
  html,
  onClose,
  onApply,
}: {
  html: string;
  onClose: () => void;
  onApply: (newHtml: string) => void;
}) => {
  const [code, setCode] = useState(html);

  return (
    <div className="fixed inset-0 z-300 flex flex-col bg-[#0d1117]">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            index.html — AI Generated
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <Button
            onClick={() => {
              onApply(code);
              onClose();
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply & Preview
          </Button>
        </div>
      </div>

      {/* editor body */}
      <div className="flex-1 overflow-hidden relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full bg-transparent text-emerald-300 font-mono text-sm leading-6 pl-14 pr-6 pt-4 pb-4 resize-none outline-none caret-white"
          title="Edit generated HTML"
        />
      </div>

      {/* status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#1c2128] border-t border-white/5 text-[10px] text-white/30 shrink-0">
        <span>
          HTML · {code.split("\n").length} lines ·{" "}
          {(code.length / 1024).toFixed(1)} KB
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  );
};

// ─── AI Prompt Modal ────────────────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  "🎓 Modern engineering college homepage with dark hero, admissions & research sections",
  "🏥 Hospital & healthcare landing page with appointments, doctors, and departments",
  "🛍️ SaaS startup landing page with pricing, features, testimonials and CTA",
  "🤖 AI company product page with animated stats, features, and pricing table",
];

const PromptModal = ({
  onClose,
  onSubmit,
  isEdit = false,
}: {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isEdit?: boolean;
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onClose();
    onSubmit(value.trim());
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-10 pb-6">
          <div className="flex items-center gap-5 mb-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isEdit ? "bg-blue-600 text-white" : "bg-violet-600 text-white"
              }`}
            >
              {isEdit ? (
                <MessageSquare className="w-8 h-8" />
              ) : (
                <Wand2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {isEdit ? "AI Visual Modification" : "AI Architect Build"}
              </h3>
              <p className="text-white/40 font-medium">
                {isEdit
                  ? "What specific changes should I make to this site?"
                  : "Describe the full website you envision"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 pb-10 space-y-8">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSubmit();
              }}
              placeholder={
                isEdit
                  ? "e.g. Change the navy blue colors to deep emerald green, and make all buttons rounded-full..."
                  : "e.g. A high-end university landing page..."
              }
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-6 text-white placeholder-white/20 text-lg leading-relaxed resize-none outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
            />
            <div className="absolute bottom-6 right-8 text-[10px] font-black text-white/20 tracking-widest uppercase">
              {value.length > 0
                ? `${value.length} Chars`
                : "⌘ + Enter to submit"}
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">
                Popular Blueprints
              </p>
              <div className="grid grid-cols-1 gap-2">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setValue(ex.replace(/^[^\s]+\s/, ""))}
                    className="text-left text-xs text-white/40 hover:text-white/90 hover:bg-white/5 px-5 py-4 rounded-2xl border border-white/5 hover:border-white/10 transition group flex items-center justify-between"
                  >
                    <span className="truncate">{ex}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Llama-3.3-70B · Active
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`flex items-center gap-3 h-14 px-10 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl ${
              isEdit
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40"
                : "bg-violet-600 hover:bg-violet-500 shadow-violet-900/40"
            }`}
          >
            <Send className="w-4 h-4" />
            {isEdit ? "Apply Changes" : "Initialize Build"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Inner Editor Wrapper (accesses CraftJS context) ────────────────────────
const EditorWrapper = ({
  pageData,
  onSave,
  saving,
  slug,
  onUpdatePageData,
  viewMode,
  setViewMode,
}: {
  pageData: EditorPageData;
  onSave: (query: SerializedEditorQuery) => void;
  saving: boolean;
  slug: string;
  onUpdatePageData: (data: EditorPageData) => void;
  viewMode: "visual" | "code";
  setViewMode: (mode: "visual" | "code") => void;
}) => {
  const { query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }));
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorViewport, setEditorViewport] = useState<DeviceMode>("desktop");
  const [serializedQuery, setSerializedQuery] = useState("");
  const lastAutoSaveRef = useRef<string>("");
  const autoSaveTimerRef = useRef<number | null>(null);
  const latestSerializedQueryRef = useRef<string>("");
  const latestPageDataRef = useRef<EditorPageData | null>(pageData);
  const isFlushingRef = useRef(false);
  const [modalConfig, setModalConfig] = useState<{
    open: boolean;
    isEdit: boolean;
  }>({ open: false, isEdit: false });

  useEffect(() => {
    try {
      setSerializedQuery(query.serialize());
    } catch {
      setSerializedQuery("");
    }
  }, [query, nodes]);

  useEffect(() => {
    latestSerializedQueryRef.current = serializedQuery;
    latestPageDataRef.current = pageData;
  }, [serializedQuery, pageData]);

  const flushAutoSave = useCallback(() => {
    if (isFlushingRef.current) {
      return;
    }

    const latestPage = latestPageDataRef.current;
    const latestSerialized = latestSerializedQueryRef.current;

    if (!latestPage?._id || !canAutoSavePage(latestPage)) {
      return;
    }

    if (!latestSerialized || latestSerialized === lastAutoSaveRef.current) {
      return;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(latestSerialized);
    } catch {
      return;
    }

    isFlushingRef.current = true;
    void pagesApi
      .updatePage(latestPage._id, {
        jsonConfig: parsedJson as PageJSON,
        htmlContent: latestPage.htmlContent,
        useHtml: latestPage.useHtml,
      })
      .then(() => {
        lastAutoSaveRef.current = latestSerialized;
      })
      .catch((error) => {
        console.error("Auto-save flush failed:", error);
      })
      .finally(() => {
        isFlushingRef.current = false;
      });
  }, []);

  // Initial AI check
  useEffect(() => {
    if (
      searchParams.get("init") === "ai" &&
      !pageData?.htmlContent &&
      !isGenerating
    ) {
      setModalConfig({ open: true, isEdit: false });
    }
  }, [searchParams, pageData, isGenerating]);

  const handleAIGenerate = (customPrompt?: string) => {
    if (customPrompt) {
      runGenerate(customPrompt);
    } else {
      setModalConfig({ open: true, isEdit: false });
    }
  };

  const handleAIModify = () => {
    setModalConfig({ open: true, isEdit: true });
  };

  const runGenerate = async (promptToUse: string) => {
    if (!promptToUse) return;
    setIsGenerating(true);
    setGenStatus("Architecting the full page layout...");
    try {
      const result = await generatePageHTML(promptToUse, slug);
      const html: string | undefined = result?.data?.html ?? result?.html;

      if (result.success && html) {
        const updatedData = {
          ...pageData,
          useHtml: false,
          htmlContent: html,
          jsonConfig: toPageJson(
            createHtmlCraftConfig(html, pageData.jsonConfig),
          ),
        };
        onUpdatePageData(updatedData);
        await pagesApi.updatePage(pageData._id, {
          jsonConfig: toPageJson(updatedData.jsonConfig),
          htmlContent: html,
          useHtml: false,
        });
        toast.success("Your experience is ready in the visual editor! 🚀");
      } else {
        toast.error(result.error || "AI generation failed");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error("Failed to generate page");
    } finally {
      setIsGenerating(false);
    }
  };

  const runModify = async (promptToUse: string) => {
    if (!promptToUse || !pageData?.htmlContent) return;
    setIsGenerating(true);
    setGenStatus("Updating components based on your request...");
    try {
      const result = await modifyPageHTML(
        promptToUse,
        pageData.htmlContent,
        slug,
      );
      const html: string | undefined = result?.data?.html ?? result?.html;

      if (result.success && html) {
        const updatedData = {
          ...pageData,
          useHtml: false,
          htmlContent: html,
          jsonConfig: toPageJson(
            createHtmlCraftConfig(html, pageData.jsonConfig),
          ),
        };
        onUpdatePageData(updatedData);
        await pagesApi.updatePage(pageData._id, {
          jsonConfig: toPageJson(updatedData.jsonConfig),
          htmlContent: html,
          useHtml: false,
        });
        toast.success("Modifications applied in the visual editor! ✨");
      } else {
        toast.error(result.error || "Modification failed");
      }
    } catch (error) {
      console.error("AI Modification failed:", error);
      toast.error("Failed to modify page");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyCode = (newHtml: string) => {
    const updatedData = {
      ...pageData,
      useHtml: false,
      htmlContent: newHtml,
      jsonConfig: toPageJson(
        createHtmlCraftConfig(newHtml, pageData.jsonConfig),
      ),
    };
    onUpdatePageData(updatedData);
    pagesApi
      .updatePage(pageData._id, {
        jsonConfig: toPageJson(updatedData.jsonConfig),
        htmlContent: newHtml,
        useHtml: false,
      })
      .catch(() => toast.error("Auto-save failed"));
    toast.success("Code applied!");
  };

  useEffect(() => {
    if (!pageData?._id || !canAutoSavePage(pageData)) return;
    if (!serializedQuery || serializedQuery === lastAutoSaveRef.current) return;

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setTimeout(() => {
      flushAutoSave();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [serializedQuery, pageData, flushAutoSave]);

  useEffect(() => {
    const handlePageHide = () => {
      flushAutoSave();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
      flushAutoSave();
    };
  }, [flushAutoSave]);

  const handleSwitchToBlocks = () => {
    onUpdatePageData({ ...pageData, useHtml: false });
    setViewMode("visual");
  };

  const editorCanvasClass =
    editorViewport === "desktop"
      ? "w-full max-w-5xl"
      : editorViewport === "tablet"
        ? "w-full max-w-[820px]"
        : "w-full max-w-[430px]";

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {modalConfig.open && (
        <PromptModal
          isEdit={modalConfig.isEdit}
          onClose={() => setModalConfig({ ...modalConfig, open: false })}
          onSubmit={(p) => {
            const isEditMode = modalConfig.isEdit;
            setModalConfig({ ...modalConfig, open: false });
            if (isEditMode) {
              void runModify(p);
            } else {
              void runGenerate(p);
            }
          }}
        />
      )}
      {!pageData?.useHtml && (
        <EditorToolbar
          onSave={() => onSave(query)}
          onAIGenerate={() => handleAIGenerate()}
          isSaving={saving}
          isGenerating={isGenerating}
          slug={slug}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-500 bg-black flex flex-col items-center justify-center text-center p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)] animate-pulse" />
          </div>
          <div className="relative mb-12">
            <div className="w-32 h-32 border-8 border-white/5 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute inset-0 border-8 border-violet-500 border-t-transparent rounded-[2.5rem] animate-spin shadow-[0_0_50px_rgba(139,92,246,0.3)]" />
            </div>
            <Sparkles className="absolute inset-x-0 inset-y-0 m-auto w-10 h-10 text-violet-400 animate-pulse shadow-violet-500/50" />
          </div>
          <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Processing Architectural Request
          </h3>
          <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] max-w-sm mx-auto leading-relaxed">
            {genStatus}
          </p>
          <div className="mt-12 flex gap-3 justify-center">
            <div className="w-1.5 h-12 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-violet-600 rounded-full animate-scroll-up [animation-delay:0s]" />
            </div>
            <div className="w-1.5 h-12 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-violet-600 rounded-full animate-scroll-up [animation-delay:0.2s]" />
            </div>
            <div className="w-1.5 h-12 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-full bg-violet-600 rounded-full animate-scroll-up [animation-delay:0.4s]" />
            </div>
          </div>
          <style>{`
                      @keyframes scroll-up {
                        0% { transform: translateY(100%); }
                        100% { transform: translateY(-100%); }
                      }
                      .animate-scroll-up { animation: scroll-up 1.5s infinite linear; }
                    `}</style>
        </div>
      )}

      {pageData?.useHtml && !showCodeEditor && (
        <FullPagePreview
          html={pageData.htmlContent || ""}
          slug={slug}
          onClose={handleSwitchToBlocks}
          onEditCode={() => setShowCodeEditor(true)}
          onSwitchToBlocks={handleSwitchToBlocks}
          onRegenerate={() => setModalConfig({ open: true, isEdit: false })}
          onModify={handleAIModify}
        />
      )}

      {showCodeEditor && (
        <CodeEditorOverlay
          html={pageData?.htmlContent || ""}
          onClose={() => setShowCodeEditor(false)}
          onApply={handleApplyCode}
        />
      )}

      {!pageData?.useHtml && (
        <div className="flex flex-1 overflow-hidden h-full">
          {viewMode === "visual" && <ComponentLibrary />}
          <main className="flex-1 overflow-y-auto bg-gray-100 p-8 scrollbar-hide">
            {viewMode === "visual" && (
              <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Responsive Canvas
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {(
                    [
                      { id: "desktop", Icon: Monitor, label: "Desktop" },
                      { id: "tablet", Icon: Tablet, label: "Tablet" },
                      { id: "mobile", Icon: Smartphone, label: "Mobile" },
                    ] as {
                      id: DeviceMode;
                      Icon: React.ElementType;
                      label: string;
                    }[]
                  ).map(({ id, Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setEditorViewport(id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        editorViewport === id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title={`Switch to ${label} viewport`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className={`bg-white shadow-xl min-h-200 ${editorCanvasClass} mx-auto rounded-lg overflow-hidden relative transition-all duration-300`}
            >
              <Frame
                data={
                  toCraftConfig(pageData?.jsonConfig)?.ROOT
                    ? JSON.stringify(sanitizeJsonConfig(pageData.jsonConfig))
                    : undefined
                }
              >
                <Element
                  is={Container}
                  canvas
                  minHeight="800px"
                  paddingTop="40px"
                  paddingRight="40px"
                  paddingBottom="40px"
                  paddingLeft="40px"
                ></Element>
              </Frame>
            </div>
          </main>
          {viewMode === "visual" && <PropertyPanel />}
        </div>
      )}

      <AIChat
        onFullBuild={handleAIGenerate}
        onModeChange={() => {
          setViewMode("visual");
        }}
      />
    </div>
  );
};

// ─── Page Root ───────────────────────────────────────────────────────────────
export default function EditPage({ params }: PageProps) {
  const { slug } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const [pageData, setPageData] = useState<EditorPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchPage = async () => {
      try {
        const requestedSlug = normalizeSlug(slug);

        let data: EditorPageData;

        try {
          data = await pagesApi.getPageBySlug(
            requestedSlug,
            (user?.institutionId as string) || "",
          );
        } catch (error: any) {
          if (error?.response?.status !== 404) {
            throw error;
          }

          const allPages = await pagesApi.getAllPages();
          const matchedPage = allPages.find(
            (page) => normalizeSlug(page.slug) === requestedSlug,
          );

          if (!matchedPage) {
            throw error;
          }

          data = matchedPage;
        }

        const craftConfig = toCraftConfig(data.jsonConfig);
        const rootNode = craftConfig.ROOT as
          | { nodes?: unknown[]; linkedNodes?: Record<string, unknown> }
          | undefined;
        const hasCraftRoot = Boolean(rootNode);
        const hasRootChildren = Boolean(
          rootNode &&
          ((Array.isArray(rootNode.nodes) && rootNode.nodes.length > 0) ||
            (rootNode.linkedNodes &&
              Object.keys(rootNode.linkedNodes).length > 0)),
        );
        const canHydrateFromHtml =
          Boolean(data.htmlContent) &&
          (Boolean(data.useHtml) || !hasCraftRoot || !hasRootChildren);

        setPageData(
          canHydrateFromHtml
            ? {
                ...data,
                useHtml: false,
                jsonConfig: toPageJson(
                  createHtmlCraftConfig(
                    data.htmlContent as string,
                    data.jsonConfig,
                  ),
                ),
              }
            : data,
        );
      } catch (error) {
        console.error("Failed to fetch page:", error);
        toast.error("Page not found");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchPage();
    }
  }, [slug, user, authLoading, router]);

  const handleSave = async (query: SerializedEditorQuery) => {
    if (!pageData?._id) {
      toast.error("No page ID found to save");
      return;
    }

    setSaving(true);
    try {
      const json = query.serialize();
      await pagesApi.updatePage(pageData._id, {
        jsonConfig: JSON.parse(json),
        htmlContent: pageData.htmlContent,
        useHtml: pageData.useHtml,
      });
      toast.success("Page saved successfully");
    } catch (error) {
      console.error("Failed to save page:", error);
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="text-gray-500 font-medium">Opening Editor...</p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    (user.role !== "admin" &&
      user.role !== "editor" &&
      user.role !== "super-admin")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6">
            You don&apos;t have permission to edit this page.
          </p>
          <a href={`/${slug}`} className="text-blue-600 font-bold">
            View Public Page Instead
          </a>
        </div>
      </div>
    );
  }

  return (
    <Editor resolver={ComponentMapper} onRender={RenderNode}>
      <EditorSelectionProvider>
        <React.Suspense fallback={<div>Loading...</div>}>
          {pageData && (
            <EditorWrapper
              pageData={pageData}
              onSave={handleSave}
              saving={saving}
              slug={slug}
              onUpdatePageData={setPageData}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          )}
        </React.Suspense>
      </EditorSelectionProvider>
    </Editor>
  );
}
