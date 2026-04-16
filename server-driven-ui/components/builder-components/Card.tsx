"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface CardProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  padding?: string;
  title?: string;
}

const shadowMap = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
};

export const Card = ({
  children,
  backgroundColor = "#ffffff",
  borderColor = "#e5e7eb",
  borderRadius = "12px",
  shadow = "md",
  padding = "24px",
  title = "",
}: CardProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const cardClass = `sdui-card-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <>
      <style>{`
        .${cardClass} {
          background-color: ${backgroundColor};
          border: 1px solid ${borderColor};
          border-radius: ${borderRadius};
          padding: ${padding};
          box-shadow: ${shadowMap[shadow] || shadowMap.md};
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={`${cardClass} w-full`}
      >
        {title && (
          <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        )}
        {children}
      </div>
    </>
  );
};

export const CardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Title
        </label>
        <input
          value={props.title ?? ""}
          onChange={(e) => setProp((p: any) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Card title"
          placeholder="Card title"
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
          title="Card background color"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Border Color
        </label>
        <input
          type="color"
          value={props.borderColor ?? "#e5e7eb"}
          onChange={(e) =>
            setProp((p: any) => (p.borderColor = e.target.value))
          }
          className="w-full h-10 border rounded cursor-pointer"
          title="Card border color"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Shadow
        </label>
        <select
          value={props.shadow ?? "md"}
          onChange={(e) => setProp((p: any) => (p.shadow = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Card shadow"
        >
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Padding
        </label>
        <input
          value={props.padding ?? "24px"}
          onChange={(e) => setProp((p: any) => (p.padding = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Card padding"
          placeholder="24px"
        />
      </div>
    </div>
  );
};

Card.craft = {
  displayName: "Card",
  props: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: "12px",
    shadow: "md",
    padding: "24px",
    title: "",
  },
  related: { toolbar: CardSettings },
};
