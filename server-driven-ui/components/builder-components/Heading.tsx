"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface HeadingProps {
  children?: React.ReactNode;
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
  align?: "left" | "center" | "right";
  fontSize?: string;
  fontWeight?: string;
}

const levelSizes: Record<string, string> = {
  h1: "48px",
  h2: "40px",
  h3: "32px",
  h4: "24px",
  h5: "20px",
  h6: "16px",
};

const levelWeights: Record<string, string> = {
  h1: "900",
  h2: "800",
  h3: "700",
  h4: "600",
  h5: "600",
  h6: "500",
};

export const Heading = ({
  text = "Heading",
  level = "h2",
  color = "#000000",
  align = "left",
  fontSize,
  fontWeight,
}: HeadingProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const headingClass = `sdui-heading-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const size = fontSize || levelSizes[level];
  const weight = fontWeight || levelWeights[level];

  return (
    <>
      <style>{`
        .${headingClass} {
          color: ${color};
          font-size: ${size};
          font-weight: ${weight};
          text-align: ${align};
          line-height: 1.2;
          margin: 0;
        }
      `}</style>
      {level === "h1" && (
        <h1
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h1>
      )}
      {level === "h2" && (
        <h2
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h2>
      )}
      {level === "h3" && (
        <h3
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h3>
      )}
      {level === "h4" && (
        <h4
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h4>
      )}
      {level === "h5" && (
        <h5
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h5>
      )}
      {level === "h6" && (
        <h6
          ref={(ref: HTMLHeadingElement | null) => {
            if (ref) {
              connect(drag(ref));
            }
          }}
          className={`${headingClass} w-full`}
        >
          {text}
        </h6>
      )}
    </>
  );
};

export const HeadingSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Heading Text
        </label>
        <input
          value={props.text ?? ""}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Heading text"
          placeholder="Enter heading..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Level
        </label>
        <select
          value={props.level ?? "h2"}
          onChange={(e) => setProp((p: any) => (p.level = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Heading level"
        >
          <option value="h1">H1 (Largest)</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="h5">H5</option>
          <option value="h6">H6 (Smallest)</option>
        </select>
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
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Color
        </label>
        <input
          type="color"
          value={props.color ?? "#000000"}
          onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          className="w-full h-10 border rounded cursor-pointer"
          title="Text color"
        />
      </div>
    </div>
  );
};

Heading.craft = {
  displayName: "Heading",
  props: {
    text: "Heading",
    level: "h2",
    color: "#000000",
    align: "left",
  },
  related: { toolbar: HeadingSettings },
};
