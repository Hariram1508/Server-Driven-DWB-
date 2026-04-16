"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";
import { Link, ExternalLink } from "lucide-react";

interface ButtonProps {
  text?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
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

export const Button = ({
  text = "Click Me",
  variant = "primary",
  size = "md",
  width = "auto",
  height = "44px",
  backgroundColor = "",
  textColor = "",
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
}: ButtonProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const buttonClass = `sdui-btn-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;
  const zIndexNumber = Number.parseInt(String(zIndex ?? "1"), 10);
  const safeZIndex = Number.isNaN(zIndexNumber) ? 1 : zIndexNumber;

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "secondary":
        return "bg-gray-100 text-gray-900 hover:bg-gray-200";
      case "outline":
        return "border-2 border-blue-600 text-blue-600 hover:bg-blue-50";
      case "ghost":
        return "text-gray-600 hover:bg-gray-100";
      default:
        return "bg-blue-600 text-white";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-lg";
      default:
        return "text-sm";
    }
  };

  const className = `${buttonClass} inline-block font-semibold transition-all duration-200 ${getVariantStyles()} ${getSizeStyles()}`;

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

  const customCss =
    variant === "outline"
      ? `
            border-color: ${backgroundColor || "#2563eb"};
            color: ${backgroundColor || "#2563eb"};
            width: ${width};
            height: ${height};
            padding: ${padding};
            margin: ${margin};
            position: ${positionMode === "absolute" ? "absolute" : "relative"};
            left: ${positionMode === "absolute" ? x : "auto"};
            top: ${positionMode === "absolute" ? y : "auto"};
            z-index: ${safeZIndex};
            border-radius: ${borderRadius};
          `
      : `
            ${backgroundColor ? `background-color: ${backgroundColor};` : ""}
            ${textColor ? `color: ${textColor};` : ""}
            width: ${width};
            height: ${height};
            padding: ${padding};
            margin: ${margin};
            position: ${positionMode === "absolute" ? "absolute" : "relative"};
            left: ${positionMode === "absolute" ? x : "auto"};
            top: ${positionMode === "absolute" ? y : "auto"};
            z-index: ${safeZIndex};
            border-radius: ${borderRadius};
          `;

  const scopedStyle = (
    <style>{`
      .${buttonClass} { ${customCss} }
    `}</style>
  );

  if (resolvedHref) {
    return (
      <>
        {scopedStyle}
        <a
          ref={(ref: HTMLAnchorElement | null) => {
            if (ref) connect(drag(ref));
          }}
          href={resolvedHref}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className={className}
        >
          {text}
        </a>
      </>
    );
  }

  return (
    <>
      {scopedStyle}
      <button
        ref={(ref: HTMLButtonElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        {text}
      </button>
    </>
  );
};

export const ButtonSettings = () => {
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
  const zIndexNumber = Number.parseInt(String(props.zIndex ?? "1"), 10);
  const safeZIndexValue = Number.isNaN(zIndexNumber)
    ? ""
    : String(zIndexNumber);

  return (
    <div className="p-4 space-y-4">
      {/* Text */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Button Text
        </label>
        <input
          type="text"
          value={props.text ?? ""}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Enter button text"
        />
      </div>

      {/* Variant */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Variant
        </label>
        <select
          value={props.variant ?? "primary"}
          onChange={(e) => setProp((p: any) => (p.variant = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Select button variant"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Size
        </label>
        <select
          value={props.size ?? "md"}
          onChange={(e) => setProp((p: any) => (p.size = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Select button size"
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Border Radius
        </label>
        <input
          type="text"
          value={props.borderRadius ?? "8px"}
          onChange={(e) =>
            setProp((p: any) => (p.borderRadius = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="e.g. 8px or 9999px"
          title="Enter border radius value"
        />
      </div>

      {/* Advanced layout controls */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Layout
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
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

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Position Mode
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                X
              </label>
              <input
                type="text"
                value={props.x ?? "0px"}
                onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
                className="w-full px-2 py-1.5 border rounded text-xs"
                title="X position"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Y
              </label>
              <input
                type="text"
                value={props.y ?? "0px"}
                onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
                className="w-full px-2 py-1.5 border rounded text-xs"
                title="Y position"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Z-Index
              </label>
              <input
                type="number"
                value={safeZIndexValue}
                onChange={(e) =>
                  setProp((p: any) => (p.zIndex = e.target.value))
                }
                className="w-full px-2 py-1.5 border rounded text-xs"
                min="0"
                title="Set z-index"
              />
            </div>
          </div>
        )}

        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-2">Padding</h5>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "paddingTop", label: "Top" },
              { key: "paddingRight", label: "Right" },
              { key: "paddingBottom", label: "Bottom" },
              { key: "paddingLeft", label: "Left" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {label}
                </label>
                <select
                  value={
                    (props as any)[key] ??
                    (key === "paddingTop" || key === "paddingBottom"
                      ? "10px"
                      : "16px")
                  }
                  onChange={(e) =>
                    setProp((p: any) => ((p as any)[key] = e.target.value))
                  }
                  className="w-full px-2 py-1.5 border rounded text-xs"
                  title={`Button padding ${label.toLowerCase()}`}
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

        <div>
          <h5 className="text-xs font-semibold text-gray-600 mb-2">Margin</h5>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "marginTop", label: "Top" },
              { key: "marginRight", label: "Right" },
              { key: "marginBottom", label: "Bottom" },
              { key: "marginLeft", label: "Left" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {label}
                </label>
                <select
                  value={(props as any)[key] ?? "0px"}
                  onChange={(e) =>
                    setProp((p: any) => ((p as any)[key] = e.target.value))
                  }
                  className="w-full px-2 py-1.5 border rounded text-xs"
                  title={`Button margin ${label.toLowerCase()}`}
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
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            BG Color
          </label>
          <input
            type="color"
            value={props.backgroundColor || "#2563eb"}
            onChange={(e) =>
              setProp((p: any) => (p.backgroundColor = e.target.value))
            }
            className="w-full h-9 rounded cursor-pointer border"
            title="Choose background color"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Text Color
          </label>
          <input
            type="color"
            value={props.textColor || "#ffffff"}
            onChange={(e) =>
              setProp((p: any) => (p.textColor = e.target.value))
            }
            className="w-full h-9 rounded cursor-pointer border"
            title="Choose text color"
          />
        </div>
      </div>

      {/* ── LINK SECTION ── */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Link className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Link / Redirect
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Link URL
          </label>
          <input
            type="text"
            value={props.href ?? ""}
            onChange={(e) => setProp((p: any) => (p.href = e.target.value))}
            placeholder="https://... or /page-slug"
            className="w-full px-3 py-2 border rounded text-sm font-mono"
            title="Enter link URL"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Leave empty to keep as a plain button.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Open In
          </label>
          <select
            value={props.target ?? "_self"}
            onChange={(e) => setProp((p: any) => (p.target = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Choose link target"
          >
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </select>
        </div>
      </div>
    </div>
  );
};

Button.craft = {
  displayName: "Button",
  props: {
    text: "Click Me",
    variant: "primary",
    size: "md",
    width: "auto",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: "",
    textColor: "",
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
    toolbar: ButtonSettings,
  },
};
