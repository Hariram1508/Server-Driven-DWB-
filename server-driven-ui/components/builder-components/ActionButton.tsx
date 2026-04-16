"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";
import { Link, ExternalLink } from "lucide-react";

interface ActionButtonProps {
  label?: string;
  variant?: "solid" | "outline";
  width?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  positionMode?: "flow" | "absolute";
  x?: string;
  y?: string;
  zIndex?: string;
  href?: string;
  target?: "_self" | "_blank";
}

export const ActionButton = ({
  label = "Click Me",
  variant = "solid",
  width = "auto",
  height = "44px",
  backgroundColor = "#3b82f6",
  textColor = "#ffffff",
  borderRadius = "8px",
  paddingTop = "10px",
  paddingRight = "16px",
  paddingBottom = "10px",
  paddingLeft = "16px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "0px",
  marginLeft = "0px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  href = "",
  target = "_self",
}: ActionButtonProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const actionButtonClass = `sdui-action-btn-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;

  const cssRule =
    variant === "outline"
      ? `
      background-color: transparent;
      border: 2px solid ${backgroundColor};
      color: ${backgroundColor};
    `
      : `
      background-color: ${backgroundColor};
      color: ${textColor};
      border: none;
    `;

  const scopedStyle = (
    <style>{`
    .${actionButtonClass} {
      ${cssRule}
      width: ${width};
      height: ${height};
      border-radius: ${borderRadius};
      padding: ${padding};
      margin: ${margin};
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: ${positionMode === "absolute" ? "absolute" : "relative"};
      left: ${positionMode === "absolute" ? x : "auto"};
      top: ${positionMode === "absolute" ? y : "auto"};
      z-index: ${parseInt(zIndex) || 1};
    }
  `}</style>
  );

  const normalizeHref = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const isAbsoluteOrSpecial = /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(
      trimmed,
    );
    if (isAbsoluteOrSpecial) {
      return trimmed;
    }

    const withoutRelativeDots = trimmed.replace(/^(\.\.\/|\.\/)+/, "");
    return `/${withoutRelativeDots}`;
  };

  const resolvedHref = normalizeHref(href);

  const buttonElement = (
    <>
      {scopedStyle}
      <button
        ref={(ref: HTMLButtonElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={`${actionButtonClass} font-semibold hover:opacity-90 active:scale-95 transition-all`}
      >
        {label}
      </button>
    </>
  );

  if (resolvedHref) {
    return (
      <>
        {scopedStyle}
        <a
          href={resolvedHref}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={`${actionButtonClass} no-underline inline-block`}
        >
          {label}
        </a>
      </>
    );
  }

  return buttonElement;
};

export const ActionButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  const sizeOptions = [
    "auto",
    "100%",
    "50%",
    "100px",
    "150px",
    "200px",
    "300px",
  ];
  const heightOptions = [
    "auto",
    "32px",
    "40px",
    "44px",
    "48px",
    "52px",
    "56px",
    "64px",
  ];
  const spacingOptions = ["0px", "4px", "8px", "12px", "16px", "20px", "24px"];
  const radiusOptions = [
    "0px",
    "4px",
    "6px",
    "8px",
    "12px",
    "16px",
    "20px",
    "24px",
    "32px",
  ];
  const zIndexNumber = Number.parseInt(String(props.zIndex ?? "1"), 10);
  const safeZIndexValue = Number.isNaN(zIndexNumber)
    ? ""
    : String(zIndexNumber);

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Label Section */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Content
        </h4>
        <input
          type="text"
          value={props.label ?? ""}
          onChange={(e) => setProp((p: any) => (p.label = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Button text"
          title="Enter button label"
        />
      </div>

      {/* Variant & colors */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Style
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Variant
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["solid", "outline"].map((v) => (
                <button
                  key={v}
                  onClick={() => setProp((p: any) => (p.variant = v))}
                  className={`px-3 py-2 rounded border text-xs font-semibold ${
                    props.variant === v
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Background Color
            </label>
            <input
              type="color"
              value={props.backgroundColor ?? "#3b82f6"}
              onChange={(e) =>
                setProp((p: any) => (p.backgroundColor = e.target.value))
              }
              className="w-full h-10 border rounded cursor-pointer"
              title="Choose background color"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Text Color
            </label>
            <input
              type="color"
              value={props.textColor ?? "#ffffff"}
              onChange={(e) =>
                setProp((p: any) => (p.textColor = e.target.value))
              }
              className="w-full h-10 border rounded cursor-pointer"
              title="Choose text color"
            />
          </div>
        </div>
      </div>

      {/* Size Section */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Size
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Width
            </label>
            <select
              value={props.width ?? "auto"}
              onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
              className="w-full px-2 py-1.5 border rounded text-xs"
              title="Select button width"
            >
              {sizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Height
            </label>
            <select
              value={props.height ?? "44px"}
              onChange={(e) => setProp((p: any) => (p.height = e.target.value))}
              className="w-full px-2 py-1.5 border rounded text-xs"
              title="Select button height"
            >
              {heightOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Appearance
        </h4>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Border Radius
          </label>
          <select
            value={props.borderRadius ?? "8px"}
            onChange={(e) =>
              setProp((p: any) => (p.borderRadius = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Select border radius"
          >
            {radiusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Padding Section */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Padding
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "paddingTop", label: "Top" },
            { key: "paddingRight", label: "Right" },
            { key: "paddingBottom", label: "Bottom" },
            { key: "paddingLeft", label: "Left" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {label}
              </label>
              <select
                value={(props as any)[key] ?? "10px"}
                onChange={(e) =>
                  setProp((p: any) => ((p as any)[key] = e.target.value))
                }
                className="w-full px-2 py-1.5 border rounded text-xs"
                title={`Set padding for ${label}`}
              >
                {spacingOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Margin Section */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Margin
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "marginTop", label: "Top" },
            { key: "marginRight", label: "Right" },
            { key: "marginBottom", label: "Bottom" },
            { key: "marginLeft", label: "Left" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {label}
              </label>
              <select
                value={(props as any)[key] ?? "0px"}
                onChange={(e) =>
                  setProp((p: any) => ((p as any)[key] = e.target.value))
                }
                className="w-full px-2 py-1.5 border rounded text-xs"
                title={`Set margin for ${label}`}
              >
                {spacingOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Position Section */}
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Position
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["flow", "absolute"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setProp((p: any) => (p.positionMode = mode))}
                  className={`px-3 py-2 rounded border text-xs font-semibold ${
                    props.positionMode === mode ||
                    (!props.positionMode && mode === "flow")
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {props.positionMode === "absolute" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  X Position
                </label>
                <input
                  type="text"
                  value={props.x ?? "0px"}
                  onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="0px"
                  title="X position coordinate"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Y Position
                </label>
                <input
                  type="text"
                  value={props.y ?? "0px"}
                  onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="0px"
                  title="Y position coordinate"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Z-Index
                </label>
                <input
                  type="number"
                  value={safeZIndexValue}
                  onChange={(e) =>
                    setProp((p: any) => (p.zIndex = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  min="0"
                  title="Set z-index for layering"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Link Section */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Link className="w-3.5 h-3.5 text-blue-500" />
          Link
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              URL
            </label>
            <input
              type="text"
              value={props.href ?? ""}
              onChange={(e) => setProp((p: any) => (p.href = e.target.value))}
              placeholder="https://... or /page-slug"
              className="w-full px-3 py-2 border rounded text-sm font-mono"
              title="Enter link URL"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Open In
            </label>
            <select
              value={props.target ?? "_self"}
              onChange={(e) => setProp((p: any) => (p.target = e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm"
              title="Choose how to open the link"
            >
              <option value="_self">Same Tab</option>
              <option value="_blank">New Tab</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

ActionButton.craft = {
  displayName: "Action Button",
  props: {
    label: "Click Me",
    variant: "solid",
    width: "auto",
    height: "44px",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    borderRadius: "8px",
    paddingTop: "10px",
    paddingRight: "16px",
    paddingBottom: "10px",
    paddingLeft: "16px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "0px",
    marginLeft: "0px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
    href: "",
    target: "_self",
  },
  related: {
    toolbar: ActionButtonSettings,
  },
};
