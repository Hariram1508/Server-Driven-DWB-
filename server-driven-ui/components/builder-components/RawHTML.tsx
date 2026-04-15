"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { SafeHTMLRenderer } from "../editor/SafeHTMLRenderer";

interface RawHTMLProps {
  html?: string;
}

export const RawHTML = ({
  html = '<div class="p-10 bg-gray-100 rounded-xl text-center"><h3>Custom HTML Section</h3><p>Edit the code in the settings panel</p></div>',
}: RawHTMLProps) => {
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
      className="w-full"
    >
      <SafeHTMLRenderer html={html} className="w-full min-h-125 rounded-lg" />
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
