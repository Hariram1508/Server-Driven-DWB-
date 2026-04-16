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
  MoreVertical,
} from "lucide-react";
import Button from "../ui/Button";
import { APIHealthIndicator } from "./APIHealthIndicator";
import { useEditorSelection } from "./EditorSelectionContext";

const ToolsDropdown = ({
  onCopy,
  onPaste,
  onSelectAll,
  onUndo,
  onRedo,
  canCopy,
  canPaste,
  selectAllLabel,
}: {
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canCopy: boolean;
  canPaste: boolean;
  selectAllLabel: string;
}) => {
  return (
    <div className="relative group">
      <button
        className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 flex items-center justify-center"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1">
        <button
          disabled={!canCopy}
          onClick={() => {
            onCopy();
          }}
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors flex items-center gap-3"
        >
          <Clipboard className="w-4 h-4" />
          Copy
        </button>
        <button
          disabled={!canPaste}
          onClick={() => {
            onPaste();
          }}
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors flex items-center gap-3"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste
        </button>
        <button
          onClick={onSelectAll}
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
        >
          <CheckSquare2 className="w-4 h-4" />
          {selectAllLabel}
        </button>
        <div className="border-t border-gray-100 my-1" />
        <button
          onClick={() => {
            onUndo();
          }}
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </button>
        <button
          onClick={() => {
            onRedo();
          }}
          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3"
        >
          <RotateCw className="w-4 h-4" />
          Redo
        </button>
      </div>
    </div>
  );
};

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

  const allSelectableIds = React.useMemo(
    () => Object.keys(query.getNodes()).filter((id) => id !== "ROOT"),
    [query, selectedIds.length],
  );

  const isAllSelected =
    allSelectableIds.length > 0 &&
    selectedIds.length === allSelectableIds.length;

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
    if (isAllSelected) {
      clearSelection();
      return;
    }

    setSelectedIds(allSelectableIds);
  }, [allSelectableIds, clearSelection, isAllSelected, setSelectedIds]);

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
    <nav className="flex items-center justify-between bg-white border-b border-gray-200 px-8 h-16 sticky top-0 z-50">
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Visual Editor</h1>
            <p className="text-xs text-gray-500">Global Architecture</p>
          </div>
        </div>
      </div>

      {/* Center: Build/Preview Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() =>
            actions.setOptions((options) => {
              options.enabled = true;
            })
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            enabled
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Build
        </button>
        <button
          onClick={() =>
            actions.setOptions((options) => {
              options.enabled = false;
            })
          }
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
            !enabled
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Health Indicator */}
        <APIHealthIndicator />

        {/* Live View */}
        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            <Globe className="w-4 h-4" />
            Live View
          </a>
        )}

        {/* Tools Dropdown */}
        <ToolsDropdown
          onCopy={handleCopy}
          onPaste={handlePaste}
          onSelectAll={handleSelectAll}
          onUndo={() => actions.history.undo()}
          onRedo={() => actions.history.redo()}
          canCopy={selectedIds.length > 0}
          canPaste={clipboardItems.length > 0}
          selectAllLabel={isAllSelected ? "Unselect All" : "Select All"}
        />

        {/* AI Full Build */}
        {onAIGenerate && (
          <button
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Generating..." : "AI Build"}
          </button>
        )}

        {/* Save Button - Primary CTA */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>

        {/* Exit Editor */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </Link>
      </div>
    </nav>
  );
};
