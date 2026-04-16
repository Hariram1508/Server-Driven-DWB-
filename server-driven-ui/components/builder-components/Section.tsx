"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface SectionProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  minHeight?: string;
  borderRadius?: string;
}

export const Section = ({
  children,
  backgroundColor = "#ffffff",
  backgroundImage = "",
  backgroundSize = "cover",
  backgroundPosition = "center",
  backgroundRepeat = "no-repeat",
  paddingTop = "64px",
  paddingRight = "24px",
  paddingBottom = "64px",
  paddingLeft = "24px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "0px",
  marginLeft = "0px",
  minHeight = "auto",
  borderRadius = "0px",
}: SectionProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const sectionClass = `sdui-section-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;

  return (
    <>
      <style>{`
        .${sectionClass} {
          background-color: ${backgroundColor};
          ${backgroundImage ? `background-image: url(${backgroundImage});` : ""}
          background-size: ${backgroundSize};
          background-position: ${backgroundPosition};
          background-repeat: ${backgroundRepeat};
          padding: ${padding};
          margin: ${margin};
          min-height: ${minHeight};
          border-radius: ${borderRadius};
        }
      `}</style>
      <section
        ref={(ref: HTMLElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={`${sectionClass} w-full`}
      >
        {children}
      </section>
    </>
  );
};

export const SectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
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
          title="Section background color"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Background Image URL
        </label>
        <input
          type="text"
          value={props.backgroundImage ?? ""}
          onChange={(e) =>
            setProp((p: any) => (p.backgroundImage = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="https://..."
          title="Section background image URL"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Top Padding
          </label>
          <input
            value={props.paddingTop ?? "64px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Section top padding"
            placeholder="64px"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Bottom Padding
          </label>
          <input
            value={props.paddingBottom ?? "64px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Section bottom padding"
            placeholder="64px"
          />
        </div>
      </div>
    </div>
  );
};

Section.craft = {
  displayName: "Section",
  props: {
    backgroundColor: "#ffffff",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    paddingTop: "64px",
    paddingRight: "24px",
    paddingBottom: "64px",
    paddingLeft: "24px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "0px",
    marginLeft: "0px",
    minHeight: "auto",
    borderRadius: "0px",
  },
  related: { toolbar: SectionSettings },
};
