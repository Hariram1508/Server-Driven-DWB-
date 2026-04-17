"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface ParagraphProps {
  children?: React.ReactNode;
  text?: string;
  color?: string;
  fontSize?: string;
  width?: string;
  align?: "left" | "center" | "right" | "justify";
  fontWeight?: "normal" | "bold" | "semibold";
  lineHeight?: string;
  positionMode?: "flow" | "absolute";
  x?: string;
  y?: string;
  zIndex?: string;
}

export const Paragraph = ({
  text = "This is a paragraph. Edit this text to customize your content.",
  color = "#374151",
  fontSize = "16px",
  width = "100%",
  align = "left",
  fontWeight = "normal",
  lineHeight = "1.6",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
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
          width: ${width};
          font-weight: ${fontWeightMap[fontWeight]};
          text-align: ${align};
          line-height: ${lineHeight};
          margin: 0;
          position: ${positionMode === "absolute" ? "absolute" : "relative"};
          left: ${positionMode === "absolute" ? x : "auto"};
          top: ${positionMode === "absolute" ? y : "auto"};
          z-index: ${parseInt(zIndex, 10) || 1};
        }
      `}</style>
      <p
        ref={(ref: HTMLParagraphElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={paraClass}
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
          Width
        </label>
        <input
          value={props.width ?? "100%"}
          onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Paragraph width"
          placeholder="100% or 320px"
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
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Position Mode
        </label>
        <select
          value={props.positionMode ?? "flow"}
          onChange={(e) =>
            setProp((p: any) => (p.positionMode = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Paragraph position mode"
        >
          <option value="flow">Flow</option>
          <option value="absolute">Absolute</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Z Index
        </label>
        <input
          type="number"
          value={props.zIndex ?? "1"}
          onChange={(e) => setProp((p: any) => (p.zIndex = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Paragraph z-index"
          placeholder="1"
        />
      </div>
      {(props.positionMode ?? "flow") === "absolute" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              X
            </label>
            <input
              value={props.x ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm"
              title="Paragraph X position"
              placeholder="0px"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Y
            </label>
            <input
              value={props.y ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm"
              title="Paragraph Y position"
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

Paragraph.craft = {
  displayName: "Paragraph",
  props: {
    text: "This is a paragraph. Edit this text to customize your content.",
    color: "#374151",
    fontSize: "16px",
    width: "100%",
    align: "left",
    fontWeight: "normal",
    lineHeight: "1.6",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: ParagraphSettings },
};
