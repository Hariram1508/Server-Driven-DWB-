"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { useEditor } from "@craftjs/core";
import { SafeHTMLRenderer } from "../editor/SafeHTMLRenderer";

interface RawHTMLProps {
  html?: string;
}

export const RawHTML = ({
  html = '<div class="p-10 bg-gray-100 rounded-xl text-center"><h3>Custom HTML Section</h3><p>Edit the code in the settings panel</p></div>',
}: RawHTMLProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const { selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="relative w-full"
    >
      <SafeHTMLRenderer
        html={html}
        className={`w-full min-h-125 rounded-lg ${enabled ? "pointer-events-none" : ""}`}
      />

      {enabled && (
        <div
          className={`absolute inset-0 rounded-lg border-2 border-dashed transition pointer-events-none ${
            selected ? "border-blue-500 bg-blue-500/5" : "border-transparent"
          }`}
        >
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-semibold">
            HTML Block · Click to edit settings
          </div>
        </div>
      )}
    </div>
  );
};

export const RawHTMLSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">HTML Content</label>
        <textarea
          value={props.html}
          onChange={(e) =>
            setProp((props: any) => (props.html = e.target.value))
          }
          className="w-full h-64 p-3 font-mono text-xs border rounded bg-gray-900 text-green-400"
          placeholder="Paste your HTML here..."
        />
        <p className="mt-2 text-[10px] text-gray-500 italic">
          Full HTML is rendered in an isolated iframe so generated styles match
          the preview.
        </p>
      </div>
    </div>
  );
};

RawHTML.craft = {
  displayName: "Custom HTML",
  props: {
    html: '<div class="p-10 bg-gray-100 rounded-xl text-center"><h3>Custom HTML Section</h3><p>Edit the code in the settings panel</p></div>',
  },
  related: {
    toolbar: RawHTMLSettings,
  },
};
