"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface SpacerProps {
  height?: string;
  backgroundColor?: string;
}

export const Spacer = ({
  height = "32px",
  backgroundColor = "transparent",
}: SpacerProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const spacerClass = `sdui-spacer-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <>
      <style>{`
        .${spacerClass} {
          width: 100%;
          height: ${height};
          background-color: ${backgroundColor};
          display: block;
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={spacerClass}
      />
    </>
  );
};

export const SpacerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Height
        </label>
        <input
          value={props.height ?? "32px"}
          onChange={(e) => setProp((p: any) => (p.height = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Spacer height"
          placeholder="32px"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Background Color
        </label>
        <input
          type="color"
          value={props.backgroundColor ?? "#ffffff"}
          onChange={(e) =>
            setProp((p: any) => (p.backgroundColor = e.target.value))
          }
          className="w-full h-10 border rounded cursor-pointer"
          title="Spacer background"
        />
      </div>
    </div>
  );
};

Spacer.craft = {
  displayName: "Spacer",
  props: {
    height: "32px",
    backgroundColor: "transparent",
  },
  related: { toolbar: SpacerSettings },
};
