"use client";

import React, { useEffect, useRef } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { Trash2, Move } from "lucide-react";
import ReactDOM from "react-dom";
import { useEditorSelection } from "./EditorSelectionContext";

export const RenderNode = ({ render }: { render: React.ReactElement }) => {
  const { id } = useNode();
  const { actions, query, isActive } = useEditor((state) => ({
    isActive: state.nodes[id]?.events.selected,
  }));
  const { selectedIds, replaceSelectedId, toggleSelectedId } =
    useEditorSelection();

  const {
    isRoot,
    connectors: { connect },
    actions: { setProp },
    name,
  } = useNode((node) => ({
    isRoot: node.id === "ROOT",
    name: node.data.custom.displayName || node.data.displayName,
  }));

  const currentElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentElement.current) {
      if (isActive || query.node(id).isHovered()) {
        currentElement.current.classList.add("component-selected");
      } else {
        currentElement.current.classList.remove("component-selected");
      }
    }
  }, [isActive, id, query]);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(ref);
        }
      }}
      onClick={(event) => {
        if (id === "ROOT") {
          return;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          toggleSelectedId(id);
          return;
        }

        replaceSelectedId(id);
      }}
      className={`relative group transition-all duration-200 ${
        isActive || selectedIds.includes(id)
          ? "ring-2 ring-blue-500 ring-offset-4 shadow-2xl z-40"
          : "hover:ring-1 hover:ring-blue-300 hover:ring-offset-2"
      }`}
    >
      {(isActive || selectedIds.includes(id)) && !isRoot && (
        <div className="absolute top-0 right-0 -translate-y-full flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-t-xl text-[10px] font-black z-60 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Move className="w-3 h-3 text-blue-200" />
          <span className="mr-3 uppercase tracking-[0.2em]">{name}</span>
          {selectedIds.length > 1 && selectedIds.includes(id) && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-blue-100">
              Multi
            </span>
          )}
          <div className="w-px h-3 bg-white/20 mx-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.delete(id);
            }}
            className="hover:text-red-300 transition-colors p-1"
            title="Remove Component"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {render}
    </div>
  );
};
