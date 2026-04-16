"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface ParagraphProps {
  children?: React.ReactNode;
  text?: string;
  color?: string;
  fontSize?: string;
  align?: "left" | "center" | "right" | "justify";
  fontWeight?: "normal" | "bold" | "semibold";
  lineHeight?: string;
}

export const Paragraph = ({
  text = "This is a paragraph. Edit this text to customize your content.",
  color = "#374151",
  fontSize = "16px",
  align = "left",
  fontWeight = "normal",
  lineHeight = "1.6",
}: ParagraphProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const paraClass = `sdui-paragraph-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const fontWeightMap = {
    normal: "400",
    semibold: "600",
    bold: "700",
  };

  return (
    <>
      <style>{`
        .${paraClass} {
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeightMap[fontWeight]};
          text-align: ${align};
          line-height: ${lineHeight};
          margin: 0;
        }
      `}</style>
      <p
        ref={(ref: HTMLParagraphElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={`${paraClass} w-full`}
      >
        {text}
      </p>
    </>
  );
};

export const ParagraphSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Text
        </label>
        <textarea
          value={props.text ?? ""}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Paragraph text"
          rows={4}
          placeholder="Enter paragraph text..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Font Size
        </label>
        <input
          value={props.fontSize ?? "16px"}
          onChange={(e) => setProp((p: any) => (p.fontSize = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Font size"
          placeholder="16px"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Color
        </label>
        <input
          type="color"
          value={props.color ?? "#374151"}
          onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          className="w-full h-10 border rounded cursor-pointer"
          title="Text color"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Alignment
        </label>
        <select
          value={props.align ?? "left"}
          onChange={(e) => setProp((p: any) => (p.align = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Text alignment"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Font Weight
        </label>
        <select
          value={props.fontWeight ?? "normal"}
          onChange={(e) => setProp((p: any) => (p.fontWeight = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Font weight"
        >
          <option value="normal">Normal</option>
          <option value="semibold">Semibold</option>
          <option value="bold">Bold</option>
        </select>
      </div>
    </div>
  );
};

Paragraph.craft = {
  displayName: "Paragraph",
  props: {
    text: "This is a paragraph. Edit this text to customize your content.",
    color: "#374151",
    fontSize: "16px",
    align: "left",
    fontWeight: "normal",
    lineHeight: "1.6",
  },
  related: { toolbar: ParagraphSettings },
};
