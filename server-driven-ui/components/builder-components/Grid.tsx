"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface GridProps {
  children?: React.ReactNode;
  columns?: number;
  gap?: string;
  alignItems?: string;
  justifyItems?: string;
  backgroundColor?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
}

export const Grid = ({
  children,
  columns = 2,
  gap = "24px",
  alignItems = "stretch",
  justifyItems = "stretch",
  backgroundColor = "transparent",
  paddingTop = "0px",
  paddingRight = "0px",
  paddingBottom = "0px",
  paddingLeft = "0px",
}: GridProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const gridClass = `sdui-grid-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;

  return (
    <>
      <style>{`
        .${gridClass} {
          display: grid;
          grid-template-columns: repeat(${Math.max(1, columns)}, minmax(0, 1fr));
          gap: ${gap};
          align-items: ${alignItems};
          justify-items: ${justifyItems};
          background-color: ${backgroundColor};
          padding: ${padding};
        }
        @media (max-width: 768px) {
          .${gridClass} {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={`${gridClass} w-full`}
      >
        {children}
      </div>
    </>
  );
};

export const GridSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Columns
        </label>
        <select
          value={props.columns ?? 2}
          onChange={(e) =>
            setProp((p: any) => (p.columns = Number(e.target.value)))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Grid columns"
        >
          {[1, 2, 3, 4].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Gap
        </label>
        <input
          value={props.gap ?? "24px"}
          onChange={(e) => setProp((p: any) => (p.gap = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Grid gap"
          placeholder="24px"
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
          title="Grid background color"
        />
      </div>
    </div>
  );
};

Grid.craft = {
  displayName: "Grid",
  props: {
    columns: 2,
    gap: "24px",
    alignItems: "stretch",
    justifyItems: "stretch",
    backgroundColor: "transparent",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
  },
  related: { toolbar: GridSettings },
};
