"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface ImageProps {
  src?: string;
  alt?: string;
  placeholderSrc?: string;
  placeholderColor?: string;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill";
  borderRadius?: string;
  caption?: string;
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  positionMode?: "flow" | "absolute";
  x?: string;
  y?: string;
  zIndex?: string;
}

export const Image = ({
  src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  alt = "Institution image",
  placeholderSrc = "",
  placeholderColor = "#E2E8F0",
  width = "100%",
  height = "320px",
  objectFit = "cover",
  borderRadius = "16px",
  caption = "",
  margin = "0px",
  padding = "0px",
  backgroundColor = "transparent",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: ImageProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
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
          opacity: ${isLoaded ? 1 : 0};
          transition: opacity 220ms ease;
        }
        .${imageClass}-wrapper {
          margin: ${margin};
          padding: ${padding};
          background-color: ${backgroundColor};
          position: ${positionMode === "absolute" ? "absolute" : "relative"};
          left: ${positionMode === "absolute" ? x : "auto"};
          top: ${positionMode === "absolute" ? y : "auto"};
          z-index: ${parseInt(zIndex, 10) || 1};
        }
        .${imageClass}-placeholder {
          position: absolute;
          inset: 0;
          border-radius: ${borderRadius};
          background-color: ${placeholderColor};
          background-image: ${placeholderSrc ? `url('${placeholderSrc}')` : "none"};
          background-size: cover;
          background-position: center;
          filter: blur(8px);
          transform: scale(1.02);
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
        {!isLoaded && (
          <div aria-hidden="true" className={`${imageClass}-placeholder`} />
        )}
        <img
          src={src}
          alt={alt}
          className={imageClass}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
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
          Placeholder URL (LQIP)
        </label>
        <input
          value={props.placeholderSrc ?? ""}
          onChange={(e) =>
            setProp((p: any) => (p.placeholderSrc = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Low quality placeholder image"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Placeholder Color
        </label>
        <input
          type="color"
          value={props.placeholderColor ?? "#E2E8F0"}
          onChange={(e) =>
            setProp((p: any) => (p.placeholderColor = e.target.value))
          }
          className="w-full h-10 border rounded cursor-pointer"
          title="Fallback placeholder color"
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Width
          </label>
          <input
            value={props.width ?? "100%"}
            onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image width"
            placeholder="100%"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Height
          </label>
          <input
            value={props.height ?? "320px"}
            onChange={(e) => setProp((p: any) => (p.height = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image height"
            placeholder="320px"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Object Fit
          </label>
          <select
            value={props.objectFit ?? "cover"}
            onChange={(e) =>
              setProp((p: any) => (p.objectFit = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image fit mode"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Border Radius
          </label>
          <input
            value={props.borderRadius ?? "16px"}
            onChange={(e) =>
              setProp((p: any) => (p.borderRadius = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image border radius"
            placeholder="16px"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Padding
          </label>
          <input
            value={props.padding ?? "0px"}
            onChange={(e) => setProp((p: any) => (p.padding = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image wrapper padding"
            placeholder="0px"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Margin
          </label>
          <input
            value={props.margin ?? "0px"}
            onChange={(e) => setProp((p: any) => (p.margin = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Image wrapper margin"
            placeholder="0px"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Wrapper Background
        </label>
        <input
          type="color"
          value={
            props.backgroundColor === "transparent"
              ? "#ffffff"
              : (props.backgroundColor ?? "#ffffff")
          }
          onChange={(e) =>
            setProp((p: any) => (p.backgroundColor = e.target.value))
          }
          className="w-full h-10 border rounded cursor-pointer"
          title="Image wrapper background"
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
    margin: "0px",
    padding: "0px",
    backgroundColor: "transparent",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: ImageSettings },
};
