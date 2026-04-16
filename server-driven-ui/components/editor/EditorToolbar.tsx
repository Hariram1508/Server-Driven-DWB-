"use client";

import React from "react";
import Link from "next/link";
import { useEditor } from "@craftjs/core";
import {
  Save,
  RotateCcw,
  RotateCw,
  Bot,
  Eye,
  Edit3,
  Globe,
  Sparkles,
  ArrowLeft,
  Clipboard,
  ClipboardPaste,
  CheckSquare2,
} from "lucide-react";
import Button from "../ui/Button";
import { APIHealthIndicator } from "./APIHealthIndicator";
import { useEditorSelection } from "./EditorSelectionContext";

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
  const { actions, enabled, selectedNodeId, query } = useEditor((state) => {
    const [selectedNodeId] = state.events.selected;

    return {
      enabled: state.options.enabled,
      selectedNodeId,
    };
  });

  const {
    selectedIds,
    setSelectedIds,
    clearSelection,
    clipboardItems,
    setClipboardItems,
  } = useEditorSelection();

  const getPrimarySelection = React.useCallback(() => {
    if (selectedIds.length > 0) {
      return selectedIds[0];
    }

    return selectedNodeId;
  }, [selectedIds, selectedNodeId]);

  const getTopLevelSelectionIds = React.useCallback(() => {
    const uniqueIds = selectedIds.filter(
      (id, index, array) => array.indexOf(id) === index,
    );

    return uniqueIds.filter((id) => {
      const ancestors = query.node(id).ancestors(true);
      return !ancestors.some((ancestorId) => uniqueIds.includes(ancestorId));
    });
  }, [query, selectedIds]);

  const buildClipboardElement = React.useCallback(
    (nodeId: string): React.ReactElement | null => {
      const node = query.node(nodeId).get();

      if (!node || node.id === "ROOT") {
        return null;
      }

      const childElements = node.data.nodes
        .map((childId) => buildClipboardElement(childId))
        .filter(Boolean) as React.ReactElement[];

      const props = { ...(node.data.props as Record<string, unknown>) };
      if (childElements.length > 0) {
        props.children =
          childElements.length === 1 ? childElements[0] : childElements;
      }

      return React.createElement(node.data.type as React.ElementType, props);
    },
    [query],
  );

  const handleCopy = React.useCallback(() => {
    const idsToCopy = getTopLevelSelectionIds();
    if (idsToCopy.length === 0) {
      return;
    }

    setClipboardItems(
      idsToCopy.map((id) => ({
        sourceId: id,
        element: buildClipboardElement(id) as React.ReactElement,
      })),
    );
  }, [buildClipboardElement, getTopLevelSelectionIds, setClipboardItems]);

  const handlePaste = React.useCallback(() => {
    if (clipboardItems.length === 0) {
      return;
    }

    const targetId = getPrimarySelection();
    const targetIsCanvas = targetId ? query.node(targetId).isCanvas() : false;
    const parentId = targetIsCanvas ? targetId : "ROOT";

    clipboardItems.forEach((item, index) => {
      const tree = query.parseReactElement(item.element).toNodeTree();
      actions.addNodeTree(tree, parentId, index);
    });
  }, [actions, clipboardItems, getPrimarySelection, query]);

  const handleSelectAll = React.useCallback(() => {
    const allIds = Object.keys(query.getNodes()).filter((id) => id !== "ROOT");
    setSelectedIds(allIds);
  }, [query, setSelectedIds]);

  const handleDeleteSelection = React.useCallback(() => {
    const idsToDelete =
      selectedIds.length > 0
        ? selectedIds
        : selectedNodeId
          ? [selectedNodeId]
          : [];
    const filteredIds = idsToDelete.filter((id) => id && id !== "ROOT");

    if (filteredIds.length === 0) {
      return;
    }

    actions.delete(filteredIds);
    clearSelection();
  }, [actions, clearSelection, selectedIds, selectedNodeId]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) &&
        !(target as HTMLInputElement).readOnly;

      if (!enabled || isTypingTarget) {
        return;
      }

      const key = event.key.toLowerCase();
      const isModKey = event.metaKey || event.ctrlKey;

      if (isModKey && key === "a") {
        event.preventDefault();
        handleSelectAll();
        return;
      }

      if (isModKey && key === "c") {
        event.preventDefault();
        handleCopy();
        return;
      }

      if (isModKey && key === "v") {
        event.preventDefault();
        handlePaste();
        return;
      }

      if (isModKey && key === "z" && event.shiftKey) {
        event.preventDefault();
        actions.history.redo();
        return;
      }

      if (isModKey && key === "z") {
        event.preventDefault();
        actions.history.undo();
        return;
      }

      if (isModKey && key === "y") {
        event.preventDefault();
        actions.history.redo();
        return;
      }

      if (
        (key === "delete" || key === "backspace") &&
        (selectedIds.length > 0 || selectedNodeId)
      ) {
        event.preventDefault();
        handleDeleteSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    actions.history,
    enabled,
    handleCopy,
    handleDeleteSelection,
    handlePaste,
    handleSelectAll,
    selectedIds.length,
    selectedNodeId,
  ]);

  const hasSelection =
    selectedIds.length > 0 || (selectedNodeId && selectedNodeId !== "ROOT");

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
              actions.setOptions((options) => {
                options.enabled = true;
              })
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
              actions.setOptions((options) => {
                options.enabled = false;
              })
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
            onClick={handleCopy}
            disabled={selectedIds.length === 0}
            className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Copy
            </span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePaste}
            disabled={clipboardItems.length === 0}
            className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Paste
            </span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSelectAll}
            className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <CheckSquare2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Select All
            </span>
          </Button>

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
            variant="secondary"
            size="sm"
            onClick={() => actions.history.redo()}
            className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Redo
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
