"use client";

import React from "react";
import Link from "next/link";
import { useEditor } from "@craftjs/core";
import {
  Save,
  Plus,
  RotateCcw,
  Bot,
  Eye,
  Edit3,
  Globe,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Button from "../ui/Button";
import { APIHealthIndicator } from "./APIHealthIndicator";

interface EditorToolbarProps {
  onSave: () => void;
  onAIGenerate?: () => void;
  isSaving?: boolean;
  isGenerating?: boolean;
  slug?: string;
}

export const EditorToolbar = ({
  onSave,
  onAIGenerate,
  isSaving,
  isGenerating,
  slug,
}: EditorToolbarProps) => {
  const { actions, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-100 px-8 h-20 sticky top-0 z-50 shadow-xs">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none mb-1">
              Visual Editor
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
              Global Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-100">
          <button
            onClick={() =>
              actions.setOptions((options) => (options.enabled = true))
            }
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              enabled
                ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Build
          </button>
          <button
            onClick={() =>
              actions.setOptions((options) => (options.enabled = false))
            }
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              !enabled
                ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* API Health Indicator */}
        <div className="pl-6 border-l border-gray-100">
          <APIHealthIndicator />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all flex items-center gap-2 border border-gray-100 bg-gray-50 hover:bg-gray-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        {onAIGenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="h-10 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Building..." : "AI Full Build"}
          </Button>
        )}

        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2 border border-transparent hover:border-gray-100 hover:bg-gray-50 mr-4"
          >
            <Globe className="w-3.5 h-3.5" />
            Live View
          </a>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => actions.history.undo()}
            className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Undo
            </span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-gray-900 hover:bg-black text-white font-bold flex items-center gap-2 shadow-lg shadow-gray-100 transition-all hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isSaving ? "Synching..." : "Push Updates"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
