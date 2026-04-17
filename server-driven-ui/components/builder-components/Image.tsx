"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: string;
  caption?: string;
  positionMode?: "flow" | "absolute";
  x?: string;
  y?: string;
  zIndex?: string;
}

export const Image = ({
  src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  alt = "Institution image",
  width = "100%",
  height = "320px",
  objectFit = "cover",
  borderRadius = "16px",
  caption = "",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: ImageProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const imageClass = `sdui-image-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <>
      <style>{`
        .${imageClass} {
          width: ${width};
          height: ${height};
          object-fit: ${objectFit};
          border-radius: ${borderRadius};
          display: block;
        }
        .${imageClass}-wrapper {
          position: ${positionMode === "absolute" ? "absolute" : "relative"};
          left: ${positionMode === "absolute" ? x : "auto"};
          top: ${positionMode === "absolute" ? y : "auto"};
          z-index: ${parseInt(zIndex, 10) || 1};
        }
      `}</style>
      <figure
        ref={(ref: HTMLElement | null) => {
          if (ref) {
            connect(drag(ref));
          }
        }}
        className={`w-full ${imageClass}-wrapper`}
      >
        <img src={src} alt={alt} className={imageClass} loading="lazy" />
        {caption ? (
          <figcaption className="mt-2 text-sm text-gray-500 text-center">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </>
  );
};

export const ImageSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Image URL
        </label>
        <input
          value={props.src ?? ""}
          onChange={(e) => setProp((p: any) => (p.src = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Image source URL"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Alt Text
        </label>
        <input
          value={props.alt ?? ""}
          onChange={(e) => setProp((p: any) => (p.alt = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Image alt text"
          placeholder="Describe the image"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Caption
        </label>
        <input
          value={props.caption ?? ""}
          onChange={(e) => setProp((p: any) => (p.caption = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Image caption"
          placeholder="Optional caption"
        />
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
          title="Image position mode"
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
          title="Image z-index"
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
              title="Image X position"
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
              title="Image Y position"
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

Image.craft = {
  displayName: "Image",
  props: {
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    alt: "Institution image",
    width: "100%",
    height: "320px",
    objectFit: "cover",
    borderRadius: "16px",
    caption: "",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: ImageSettings },
};
