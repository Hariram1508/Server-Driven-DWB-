"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

type PositionMode = "flow" | "absolute";

interface BaseProps {
  title?: string;
  subtitle?: string;
  description?: string;
  items?: string;
  titleSize?: string;
  subtitleSize?: string;
  bodySize?: string;
  lineHeight?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "none" | "underline" | "line-through";
  bgColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  width?: string;
  tabletWidth?: string;
  mobileWidth?: string;
  tabletPadding?: string;
  mobilePadding?: string;
  positionMode?: PositionMode;
  x?: string;
  y?: string;
  zIndex?: string;
  // Advanced styling
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  boxShadow?: string;
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: string;
  opacity?: string;
  hoverScale?: string;
  hoverOpacity?: string;
  // Icon support
  showIcon?: boolean;
  iconType?: string;
  iconColor?: string;
  iconSize?: string;
  // Spacing
  marginTop?: string;
  marginBottom?: string;
  gap?: string;
  // INDIVIDUAL TEXT ELEMENT CONTROLS
  titleFontWeight?: "normal" | "medium" | "semibold" | "bold";
  titleFontStyle?: "normal" | "italic";
  subtitleFontWeight?: "normal" | "medium" | "semibold" | "bold";
  subtitleFontStyle?: "normal" | "italic";
  descriptionFontWeight?: "normal" | "medium" | "semibold" | "bold";
  descriptionFontStyle?: "normal" | "italic";
  children?: React.ReactNode;
}

const useNodeClass = (prefix: string) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  return {
    className: `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    connect,
    drag,
  };
};

const basePositionCss = (props: BaseProps) => `
  position: ${props.positionMode === "absolute" ? "absolute" : "relative"};
  left: ${props.positionMode === "absolute" ? props.x : "auto"};
  top: ${props.positionMode === "absolute" ? props.y : "auto"};
  z-index: ${parseInt(props.zIndex || "1", 10) || 1};
`;

const splitItems = (items?: string) =>
  (items || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const BaseSettings = ({ showItems = false }: { showItems?: boolean }) => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as BaseProps }));

  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    "basic",
  );

  return (
    <div className="p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* BASIC CONTENT */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "basic" ? null : "basic")
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>📝 BASIC CONTENT</span>
          <span>{expandedSection === "basic" ? "−" : "+"}</span>
        </button>
        {expandedSection === "basic" && (
          <div className="p-3 space-y-3 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Title
              </label>
              <input
                value={props.title ?? ""}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.title = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Component title"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Subtitle
              </label>
              <input
                value={props.subtitle ?? ""}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.subtitle = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Optional subtitle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Description
              </label>
              <textarea
                value={props.description ?? ""}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.description = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                rows={3}
                placeholder="Component description"
              />
            </div>
            {showItems && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Items (one per line)
                </label>
                <textarea
                  value={props.items ?? ""}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.items = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={4}
                  placeholder="Item 1\nItem 2\nItem 3"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* TYPOGRAPHY */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(
              expandedSection === "typography" ? null : "typography",
            )
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>🔤 TYPOGRAPHY</span>
          <span>{expandedSection === "typography" ? "−" : "+"}</span>
        </button>
        {expandedSection === "typography" && (
          <div className="p-3 space-y-3 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Font Family
              </label>
              <select
                value={props.fontFamily ?? "system"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.fontFamily = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="system">System (Default)</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="cursive">Cursive</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman'">Times New Roman</option>
                <option value="'Courier New'">Courier New</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Title Size
                </label>
                <input
                  value={props.titleSize ?? "22px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.titleSize = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="22px"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Subtitle Size
                </label>
                <input
                  value={props.subtitleSize ?? "12px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.subtitleSize = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="12px"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Body Size
                </label>
                <input
                  value={props.bodySize ?? "15px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.bodySize = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="15px"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Line Height
                </label>
                <input
                  value={props.lineHeight ?? "1.6"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.lineHeight = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="1.6"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Weight
                </label>
                <select
                  value={props.fontWeight ?? "semibold"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) =>
                        (p.fontWeight = e.target
                          .value as BaseProps["fontWeight"]),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Style
                </label>
                <select
                  value={props.fontStyle ?? "normal"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) =>
                        (p.fontStyle = e.target
                          .value as BaseProps["fontStyle"]),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Align
                </label>
                <select
                  value={props.textAlign ?? "left"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) =>
                        (p.textAlign = e.target
                          .value as BaseProps["textAlign"]),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Decoration
                </label>
                <select
                  value={props.textDecoration ?? "none"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) =>
                        (p.textDecoration = e.target
                          .value as BaseProps["textDecoration"]),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="none">None</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Line-through</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INDIVIDUAL TEXT ELEMENT CONTROLS */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(
              expandedSection === "textElements" ? null : "textElements",
            )
          }
          className="w-full px-3 py-2 bg-blue-50 text-left text-xs font-bold text-blue-700 hover:bg-blue-100 flex items-center justify-between"
        >
          <span>✏️ TEXT ELEMENT STYLES</span>
          <span>{expandedSection === "textElements" ? "−" : "+"}</span>
        </button>
        {expandedSection === "textElements" && (
          <div className="p-3 space-y-4 border-t">
            {/* TITLE CONTROLS */}
            <div className="border-b pb-3">
              <h4 className="text-xs font-bold text-gray-700 mb-2">📌 TITLE</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={props.titleFontWeight ?? "semibold"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.titleFontWeight = e.target
                            .value as BaseProps["titleFontWeight"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Style
                  </label>
                  <select
                    value={props.titleFontStyle ?? "normal"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.titleFontStyle = e.target
                            .value as BaseProps["titleFontStyle"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUBTITLE CONTROLS */}
            <div className="border-b pb-3">
              <h4 className="text-xs font-bold text-gray-700 mb-2">
                📌 SUBTITLE
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={props.subtitleFontWeight ?? "medium"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.subtitleFontWeight = e.target
                            .value as BaseProps["subtitleFontWeight"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Style
                  </label>
                  <select
                    value={props.subtitleFontStyle ?? "normal"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.subtitleFontStyle = e.target
                            .value as BaseProps["subtitleFontStyle"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DESCRIPTION CONTROLS */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">
                📌 DESCRIPTION
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={props.descriptionFontWeight ?? "normal"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.descriptionFontWeight = e.target
                            .value as BaseProps["descriptionFontWeight"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="semibold">Semibold</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Font Style
                  </label>
                  <select
                    value={props.descriptionFontStyle ?? "normal"}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) =>
                          (p.descriptionFontStyle = e.target
                            .value as BaseProps["descriptionFontStyle"]),
                      )
                    }
                    className="w-full px-2 py-2 border rounded text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLORS & STYLING */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "colors" ? null : "colors")
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>🎨 COLORS & STYLING</span>
          <span>{expandedSection === "colors" ? "−" : "+"}</span>
        </button>
        {expandedSection === "colors" && (
          <div className="p-3 space-y-3 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={props.bgColor ?? "#ffffff"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.bgColor = e.target.value))
                  }
                  className="w-full h-10 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={props.textColor ?? "#111827"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.textColor = e.target.value))
                  }
                  className="w-full h-10 border rounded cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-gradient"
                checked={props.useGradient ?? false}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.useGradient = e.target.checked))
                }
              />
              <label htmlFor="use-gradient" className="text-sm text-gray-700">
                Use Gradient Background
              </label>
            </div>
            {props.useGradient && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Gradient From
                    </label>
                    <input
                      type="color"
                      value={props.gradientFrom ?? "#3b82f6"}
                      onChange={(e) =>
                        setProp(
                          (p: BaseProps) => (p.gradientFrom = e.target.value),
                        )
                      }
                      className="w-full h-10 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Gradient To
                    </label>
                    <input
                      type="color"
                      value={props.gradientTo ?? "#1e40af"}
                      onChange={(e) =>
                        setProp(
                          (p: BaseProps) => (p.gradientTo = e.target.value),
                        )
                      }
                      className="w-full h-10 border rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Angle (deg)
                  </label>
                  <input
                    type="number"
                    value={parseInt(props.gradientAngle ?? "135", 10)}
                    onChange={(e) =>
                      setProp(
                        (p: BaseProps) => (p.gradientAngle = e.target.value),
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="135"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Border Color
                </label>
                <input
                  type="color"
                  value={props.borderColor ?? "#e5e7eb"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.borderColor = e.target.value))
                  }
                  className="w-full h-10 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Border Width
                </label>
                <input
                  value={props.borderWidth ?? "1px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.borderWidth = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="1px"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parseFloat(props.opacity ?? "1")}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.opacity = e.target.value))
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(parseFloat(props.opacity ?? "1") * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Box Shadow
              </label>
              <input
                value={props.boxShadow ?? "0 1px 3px rgba(0,0,0,0.1)"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.boxShadow = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm text-xs"
                placeholder="0 1px 3px rgba(0,0,0,0.1)"
              />
            </div>
          </div>
        )}
      </div>

      {/* SPACING & LAYOUT */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "spacing" ? null : "spacing")
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>📏 SPACING & LAYOUT</span>
          <span>{expandedSection === "spacing" ? "−" : "+"}</span>
        </button>
        {expandedSection === "spacing" && (
          <div className="p-3 space-y-3 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Width
                </label>
                <input
                  value={props.width ?? "100%"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.width = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="100%"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Padding
                </label>
                <input
                  value={props.padding ?? "20px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.padding = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="20px"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Margin Top
                </label>
                <input
                  value={props.marginTop ?? "0px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.marginTop = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="0px"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Margin Bottom
                </label>
                <input
                  value={props.marginBottom ?? "0px"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.marginBottom = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="0px"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tablet Width
                </label>
                <input
                  value={props.tabletWidth ?? "100%"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.tabletWidth = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="100%"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile Width
                </label>
                <input
                  value={props.mobileWidth ?? "100%"}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.mobileWidth = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="100%"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tablet Padding
                </label>
                <input
                  value={props.tabletPadding ?? "16px"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) => (p.tabletPadding = e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="16px"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile Padding
                </label>
                <input
                  value={props.mobilePadding ?? "12px"}
                  onChange={(e) =>
                    setProp(
                      (p: BaseProps) => (p.mobilePadding = e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="12px"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Gap
              </label>
              <input
                value={props.gap ?? "16px"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.gap = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="16px"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Border Radius
              </label>
              <input
                value={props.borderRadius ?? "12px"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.borderRadius = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="12px"
              />
            </div>
          </div>
        )}
      </div>

      {/* ICONS */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "icons" ? null : "icons")
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>⭐ ICONS</span>
          <span>{expandedSection === "icons" ? "−" : "+"}</span>
        </button>
        {expandedSection === "icons" && (
          <div className="p-3 space-y-3 border-t">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-icon"
                checked={props.showIcon ?? false}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.showIcon = e.target.checked))
                }
              />
              <label htmlFor="show-icon" className="text-sm text-gray-700">
                Show Icon
              </label>
            </div>
            {props.showIcon && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Icon Type
                  </label>
                  <select
                    value={props.iconType ?? "star"}
                    onChange={(e) =>
                      setProp((p: BaseProps) => (p.iconType = e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  >
                    <option value="star">⭐ Star</option>
                    <option value="trophy">🏆 Trophy</option>
                    <option value="medal">🥇 Medal</option>
                    <option value="check">✓ Check</option>
                    <option value="crown">👑 Crown</option>
                    <option value="fire">🔥 Fire</option>
                    <option value="lightning">⚡ Lightning</option>
                    <option value="heart">❤️ Heart</option>
                    <option value="sparkle">✨ Sparkle</option>
                    <option value="target">🎯 Target</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Icon Color
                    </label>
                    <input
                      type="color"
                      value={props.iconColor ?? "#fbbf24"}
                      onChange={(e) =>
                        setProp(
                          (p: BaseProps) => (p.iconColor = e.target.value),
                        )
                      }
                      className="w-full h-10 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Icon Size
                    </label>
                    <input
                      value={props.iconSize ?? "40px"}
                      onChange={(e) =>
                        setProp((p: BaseProps) => (p.iconSize = e.target.value))
                      }
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="40px"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ADVANCED */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(
              expandedSection === "advanced" ? null : "advanced",
            )
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>⚙️ ADVANCED</span>
          <span>{expandedSection === "advanced" ? "−" : "+"}</span>
        </button>
        {expandedSection === "advanced" && (
          <div className="p-3 space-y-3 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Hover Scale
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={parseFloat(props.hoverScale ?? "1")}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.hoverScale = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Hover Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parseFloat(props.hoverOpacity ?? "1")}
                  onChange={(e) =>
                    setProp((p: BaseProps) => (p.hoverOpacity = e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Position Mode
              </label>
              <select
                value={props.positionMode ?? "flow"}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) =>
                      (p.positionMode = e.target.value as PositionMode),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="flow">Flow</option>
                <option value="absolute">Absolute</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Z Index
              </label>
              <input
                type="number"
                value={props.zIndex ?? "1"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.zIndex = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            {(props.positionMode ?? "flow") === "absolute" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    X
                  </label>
                  <input
                    value={props.x ?? "0px"}
                    onChange={(e) =>
                      setProp((p: BaseProps) => (p.x = e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Y
                  </label>
                  <input
                    value={props.y ?? "0px"}
                    onChange={(e) =>
                      setProp((p: BaseProps) => (p.y = e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="0px"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const cardDefaults = {
  title: "Title",
  subtitle: "Subtitle",
  description: "Description",
  items: "",
  titleSize: "22px",
  subtitleSize: "12px",
  bodySize: "15px",
  lineHeight: "1.6",
  fontWeight: "semibold" as BaseProps["fontWeight"],
  fontFamily: "system",
  fontStyle: "normal" as BaseProps["fontStyle"],
  textAlign: "left" as BaseProps["textAlign"],
  textDecoration: "none" as BaseProps["textDecoration"],
  bgColor: "#ffffff",
  textColor: "#111827",
  padding: "20px",
  borderRadius: "12px",
  borderColor: "#e5e7eb",
  borderWidth: "1px",
  borderStyle: "solid" as BaseProps["borderStyle"],
  width: "100%",
  tabletWidth: "100%",
  mobileWidth: "100%",
  tabletPadding: "16px",
  mobilePadding: "12px",
  marginTop: "0px",
  marginBottom: "0px",
  gap: "0px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  useGradient: false,
  gradientFrom: "#3b82f6",
  gradientTo: "#1e40af",
  gradientAngle: "135",
  opacity: "1",
  hoverScale: "1.05",
  hoverOpacity: "1",
  showIcon: false,
  iconType: "star",
  iconColor: "#fbbf24",
  iconSize: "40px",
  positionMode: "flow" as PositionMode,
  x: "0px",
  y: "0px",
  zIndex: "1",
  // Individual text element controls
  titleFontWeight: "semibold" as BaseProps["titleFontWeight"],
  titleFontStyle: "normal" as BaseProps["titleFontStyle"],
  subtitleFontWeight: "medium" as BaseProps["subtitleFontWeight"],
  subtitleFontStyle: "normal" as BaseProps["subtitleFontStyle"],
  descriptionFontWeight: "normal" as BaseProps["descriptionFontWeight"],
  descriptionFontStyle: "normal" as BaseProps["descriptionFontStyle"],
};

const createCardComponent = (
  displayName: string,
  defaults: Partial<BaseProps> = {},
  options: { showItems?: boolean; asList?: boolean } = {},
) => {
  const Component = (incoming: BaseProps) => {
    const props = { ...cardDefaults, ...defaults, ...incoming };
    const { className, connect, drag } = useNodeClass(`sdui-${displayName}`);

    const cardRef = React.useRef<HTMLDivElement>(null);
    const [isTabletView, setIsTabletView] = React.useState(false);
    const [isMobileView, setIsMobileView] = React.useState(false);

    // Setup ResizeObserver to detect actual container width
    React.useEffect(() => {
      const observer = new ResizeObserver(() => {
        if (cardRef.current) {
          const width = cardRef.current.offsetWidth;
          setIsTabletView(width < 1024 && width >= 768);
          setIsMobileView(width < 768);
        }
      });

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const getIconEmoji = (iconType?: string) => {
      const icons: Record<string, string> = {
        star: "⭐",
        trophy: "🏆",
        medal: "🥇",
        check: "✓",
        crown: "👑",
        fire: "🔥",
        lightning: "⚡",
        heart: "❤️",
        sparkle: "✨",
        target: "🎯",
      };
      return icons[iconType ?? "star"] ?? "⭐";
    };

    const fontFamilyMap: Record<string, string> = {
      system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      serif: "Georgia, serif",
      monospace: "'Courier New', monospace",
      cursive: "cursive",
      "Georgia, serif": "Georgia, serif",
      "'Times New Roman'": "'Times New Roman', serif",
      "'Courier New'": "'Courier New', monospace",
    };

    const selectedFamily = fontFamilyMap[props.fontFamily ?? "system"];
    const bgStyle = props.useGradient
      ? `linear-gradient(${props.gradientAngle || 135}deg, ${props.gradientFrom || "#3b82f6"}, ${props.gradientTo || "#1e40af"})`
      : props.bgColor;

    // Calculate actual width based on container (simulate responsive behavior)
    const getResponsiveWidth = () => {
      if (typeof window === "undefined") return props.width;
      const screenWidth = window.innerWidth;
      if (screenWidth < 768 && props.mobileWidth) return props.mobileWidth;
      if (screenWidth < 1024 && props.tabletWidth) return props.tabletWidth;
      return props.width;
    };

    // Calculate actual padding based on container (simulate responsive behavior)
    const getResponsivePadding = () => {
      if (typeof window === "undefined") return props.padding;
      const screenWidth = window.innerWidth;
      if (screenWidth < 768 && props.mobilePadding) return props.mobilePadding;
      if (screenWidth < 1024 && props.tabletPadding) return props.tabletPadding;
      return props.padding;
    };

    // Get proper hover scale with fallback
    const hoverScaleValue =
      props.hoverScale && parseFloat(props.hoverScale) !== 1
        ? parseFloat(props.hoverScale)
        : 1.05;

    return (
      <>
        <style>{`
          .${className} {
            width: ${props.width};
            max-width: 100%;
            box-sizing: border-box;
            ${basePositionCss(props)}
            background: ${bgStyle};
            color: ${props.textColor};
            padding: ${props.padding};
            border-radius: ${props.borderRadius};
            border: ${props.borderWidth || "1px"} ${props.borderStyle || "solid"} ${props.borderColor || "transparent"};
            box-shadow: ${props.boxShadow || "none"};
            opacity: ${props.opacity || "1"};
            margin-top: ${props.marginTop || "0"};
            margin-bottom: ${props.marginBottom || "0"};
            gap: ${props.gap || "0"};
            font-family: ${selectedFamily};
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .${className}:hover {
            transform: scale(${hoverScaleValue});
            opacity: ${props.hoverOpacity || "1"};
            box-shadow: ${
              props.boxShadow && props.boxShadow !== "none"
                ? props.boxShadow
                    .replace(/rgb/g, "rgba")
                    .replace(/\)/, ", 0.8)")
                : "0 4px 12px rgba(0,0,0,0.15)"
            };
          }
          .${className}-icon {
            font-size: ${props.iconSize || "40px"};
            margin-bottom: 12px;
            display: inline-block;
            animation: ${props.showIcon ? "bounce-icon 0.6s infinite" : "none"};
             color: ${props.iconColor || "#fbbf24"};
             text-shadow: 0 0 8px ${props.iconColor || "#fbbf24"}, 0 0 16px ${props.iconColor || "#fbbf24"};
             filter: brightness(1.2) drop-shadow(0 0 4px ${props.iconColor || "#fbbf24"});
          }
          @keyframes bounce-icon {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .${className}-subtitle {
            font-size: ${props.subtitleSize || "12px"};
            font-weight: ${
              (props.subtitleFontWeight || props.fontWeight) === "normal"
                ? 400
                : (props.subtitleFontWeight || props.fontWeight) === "medium"
                  ? 500
                  : (props.subtitleFontWeight || props.fontWeight) === "bold"
                    ? 700
                    : 600
            };
            text-transform: uppercase;
            letter-spacing: 0.08em;
            opacity: 0.75;
            margin-bottom: 6px;
            font-style: ${props.subtitleFontStyle || props.fontStyle || "normal"};
            text-align: ${props.textAlign || "left"};
            text-decoration: ${props.textDecoration || "none"};
            font-family: ${selectedFamily};
          }
          .${className}-title {
            font-size: ${props.titleSize || "22px"};
            font-weight: ${
              (props.titleFontWeight || props.fontWeight) === "normal"
                ? 400
                : (props.titleFontWeight || props.fontWeight) === "medium"
                  ? 500
                  : (props.titleFontWeight || props.fontWeight) === "bold"
                    ? 700
                    : 600
            };
            line-height: ${props.lineHeight || "1.6"};
            margin-bottom: 8px;
            font-style: ${props.titleFontStyle || props.fontStyle || "normal"};
            text-align: ${props.textAlign || "left"};
            text-decoration: ${props.textDecoration || "none"};
            font-family: ${selectedFamily};
          }
          .${className}-body {
            font-size: ${props.bodySize || "15px"};
            line-height: ${props.lineHeight || "1.6"};
            font-weight: ${
              (props.descriptionFontWeight || props.fontWeight) === "normal"
                ? 400
                : (props.descriptionFontWeight || props.fontWeight) === "medium"
                  ? 500
                  : (props.descriptionFontWeight || props.fontWeight) === "bold"
                    ? 700
                    : 400
            };
            font-style: ${props.descriptionFontStyle || props.fontStyle || "normal"};
            text-align: ${props.textAlign || "left"};
            text-decoration: ${props.textDecoration || "none"};
            font-family: ${selectedFamily};
          }
          /* Mobile/Tablet responsive styles - use container queries approach */
          @media (max-width: 1024px) {
            .${className} {
              width: ${props.tabletWidth || "100%"} !important;
              padding: ${props.tabletPadding || props.padding || "16px"} !important;
            }
            .${className}-title {
              font-size: calc(${props.titleSize || "22px"} * 0.92);
            }
            .${className}-body {
              font-size: calc(${props.bodySize || "15px"} * 0.94);
            }
            .${className}-subtitle {
              font-size: calc(${props.subtitleSize || "12px"} * 0.95);
            }
          }
          @media (max-width: 768px) {
            .${className} {
              width: ${props.mobileWidth || "100%"} !important;
              padding: ${props.mobilePadding || props.tabletPadding || props.padding || "12px"} !important;
              margin-left: auto;
              margin-right: auto;
            }
            .${className}-title {
              font-size: calc(${props.titleSize || "22px"} * 0.82);
            }
            .${className}-subtitle {
              font-size: calc(${props.subtitleSize || "12px"} * 0.9);
            }
            .${className}-body {
              font-size: calc(${props.bodySize || "15px"} * 0.9);
            }
          }
         }
         /* Tablet view: 768px <= width < 1024px */
         [data-tablet-view="true"] .${className} {
           width: ${props.tabletWidth || "100%"} !important;
           padding: ${props.tabletPadding || props.padding || "16px"} !important;
         }
         [data-tablet-view="true"] .${className}-title {
           font-size: calc(${props.titleSize || "22px"} * 0.92);
         }
         [data-tablet-view="true"] .${className}-body {
           font-size: calc(${props.bodySize || "15px"} * 0.94);
         }
         [data-tablet-view="true"] .${className}-subtitle {
           font-size: calc(${props.subtitleSize || "12px"} * 0.95);
         }
         /* Mobile view: width < 768px */
         [data-mobile-view="true"] .${className} {
           width: ${props.mobileWidth || "100%"} !important;
           padding: ${props.mobilePadding || props.tabletPadding || props.padding || "12px"} !important;
           margin-left: auto;
           margin-right: auto;
         }
         [data-mobile-view="true"] .${className}-title {
           font-size: calc(${props.titleSize || "22px"} * 0.82);
         }
         [data-mobile-view="true"] .${className}-subtitle {
           font-size: calc(${props.subtitleSize || "12px"} * 0.9);
         }
         [data-mobile-view="true"] .${className}-body {
           font-size: calc(${props.bodySize || "15px"} * 0.9);
         }
       `}</style>
        <div
          ref={(ref: HTMLDivElement | null) => {
            if (ref) {
              cardRef.current = ref;
              connect(drag(ref));
            }
          }}
          className={className}
          data-tablet-view={isTabletView}
          data-mobile-view={isMobileView}
        >
          {props.showIcon && (
            <div className={`${className}-icon`}>
              {getIconEmoji(props.iconType)}
            </div>
          )}
          <p className={`${className}-subtitle`}>{props.subtitle}</p>
          <h3 className={`${className}-title`}>{props.title}</h3>
          {options.asList ? (
            <ul className={`${className}-body space-y-1 list-disc pl-5`}>
              {splitItems(props.items).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className={`${className}-body whitespace-pre-wrap`}>
              {props.description}
            </p>
          )}
        </div>
      </>
    );
  };

  (Component as any).craft = {
    displayName,
    props: { ...cardDefaults, ...defaults },
    related: {
      toolbar: () => (
        <BaseSettings showItems={options.showItems || options.asList} />
      ),
    },
  };

  return Component;
};

const LayoutSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as BaseProps }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Width
        </label>
        <input
          value={props.width ?? "100%"}
          onChange={(e) =>
            setProp((p: BaseProps) => (p.width = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="100%"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Padding
        </label>
        <input
          value={props.padding ?? "16px"}
          onChange={(e) =>
            setProp((p: BaseProps) => (p.padding = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="16px"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Background
        </label>
        <input
          type="color"
          value={props.bgColor ?? "#ffffff"}
          onChange={(e) =>
            setProp((p: BaseProps) => (p.bgColor = e.target.value))
          }
          className="w-full h-10 border rounded cursor-pointer"
          title="Layout background color"
          placeholder="Layout background color"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Position Mode
        </label>
        <select
          value={props.positionMode ?? "flow"}
          onChange={(e) =>
            setProp(
              (p: BaseProps) =>
                (p.positionMode = e.target.value as PositionMode),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Layout position mode"
        >
          <option value="flow">Flow</option>
          <option value="absolute">Absolute</option>
        </select>
      </div>
    </div>
  );
};

export const Sidebar = ({
  width = "280px",
  padding = "16px",
  bgColor = "#f8fafc",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  children,
}: BaseProps) => {
  const props: BaseProps = {
    width,
    padding,
    bgColor,
    positionMode,
    x,
    y,
    zIndex,
  };
  const { className, connect, drag } = useNodeClass("sdui-sidebar");

  return (
    <>
      <style>{`
        .${className} {
          width: ${props.width};
          min-height: 220px;
          ${basePositionCss(props)}
          background: ${props.bgColor};
          padding: ${props.padding};
          border-right: 1px solid rgba(0, 0, 0, 0.08);
        }
      `}</style>
      <aside
        ref={(ref: HTMLElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        {children || (
          <div className="text-sm text-gray-500 border border-dashed rounded p-4">
            Sidebar area - drop content here
          </div>
        )}
      </aside>
    </>
  );
};

(Sidebar as any).craft = {
  displayName: "Sidebar",
  props: {
    width: "280px",
    padding: "16px",
    bgColor: "#f8fafc",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: LayoutSettings },
};

export const Divider = ({
  width = "100%",
  bgColor = "#e5e7eb",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: BaseProps) => {
  const props: BaseProps = { width, bgColor, positionMode, x, y, zIndex };
  const { className, connect, drag } = useNodeClass("sdui-divider");

  return (
    <>
      <style>{`
        .${className} {
          width: ${props.width};
          height: 1px;
          background: ${props.bgColor};
          ${basePositionCss(props)}
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      />
    </>
  );
};

(Divider as any).craft = {
  displayName: "Divider",
  props: {
    width: "100%",
    bgColor: "#e5e7eb",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: LayoutSettings },
};

export const Stack = ({
  width = "100%",
  padding = "16px",
  bgColor = "#ffffff",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  children,
}: BaseProps) => {
  const props: BaseProps = {
    width,
    padding,
    bgColor,
    positionMode,
    x,
    y,
    zIndex,
  };
  const { className, connect, drag } = useNodeClass("sdui-stack");

  return (
    <>
      <style>{`
        .${className} {
          width: ${props.width};
          ${basePositionCss(props)}
          background: ${props.bgColor};
          padding: ${props.padding};
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px dashed rgba(0,0,0,0.14);
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        {children || (
          <div className="text-sm text-gray-500 italic">
            Drop items into stack
          </div>
        )}
      </div>
    </>
  );
};

(Stack as any).craft = {
  displayName: "Stack",
  props: {
    width: "100%",
    padding: "16px",
    bgColor: "#ffffff",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: LayoutSettings },
};

interface GalleryProps extends BaseProps {
  imageUrls?: string;
  columns?: "2" | "3" | "4";
  tabletColumns?: "1" | "2" | "3" | "4";
  mobileColumns?: "1" | "2" | "3" | "4";
  imageHeight?: string;
  mobileImageHeight?: string;
  imageFit?: "cover" | "contain";
  gap?: string;
}

export const Gallery = ({
  title = "Campus Gallery",
  subtitle = "Visual Showcase",
  description = "Add your own image URLs below and create a custom gallery.",
  imageUrls = "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  columns = "3",
  tabletColumns = "2",
  mobileColumns = "1",
  imageHeight = "180px",
  mobileImageHeight = "150px",
  imageFit = "cover",
  gap = "12px",
  bgColor = "#f8fafc",
  textColor = "#111827",
  padding = "20px",
  borderRadius = "12px",
  width = "100%",
  tabletWidth = "100%",
  mobileWidth = "100%",
  tabletPadding = "16px",
  mobilePadding = "12px",
  titleSize = "22px",
  subtitleSize = "12px",
  bodySize = "15px",
  lineHeight = "1.6",
  fontWeight = "semibold",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: GalleryProps) => {
  const { className, connect, drag } = useNodeClass("sdui-Gallery");
  const images = splitItems(imageUrls);

  return (
    <>
      <style>{`
        .${className} {
          width: ${width};
          max-width: 100%;
          box-sizing: border-box;
          ${basePositionCss({ positionMode, x, y, zIndex })}
          background: ${bgColor};
          color: ${textColor};
          padding: ${padding};
          border-radius: ${borderRadius};
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .${className}-subtitle {
          font-size: ${subtitleSize};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          opacity: 0.75;
          margin-bottom: 6px;
        }
        .${className}-title {
          font-size: ${titleSize};
          font-weight: ${
            fontWeight === "normal"
              ? 400
              : fontWeight === "medium"
                ? 500
                : fontWeight === "bold"
                  ? 700
                  : 600
          };
          line-height: ${lineHeight};
          margin-bottom: 8px;
        }
        .${className}-body {
          font-size: ${bodySize};
          line-height: ${lineHeight};
          margin-bottom: 12px;
        }
        .${className}-grid {
          display: grid;
          grid-template-columns: repeat(${columns}, minmax(0, 1fr));
          gap: ${gap};
        }
        .${className}-img {
          width: 100%;
          height: ${imageHeight};
          object-fit: ${imageFit};
          border-radius: calc(${borderRadius} * 0.66);
          border: 1px solid rgba(0,0,0,0.06);
          background: #f3f4f6;
        }
        @media (max-width: 1024px) {
          .${className} {
            width: ${tabletWidth};
            padding: ${tabletPadding};
          }
          .${className}-grid {
            grid-template-columns: repeat(${tabletColumns}, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .${className} {
            width: ${mobileWidth};
            padding: ${mobilePadding};
            left: auto;
          }
          .${className}-grid {
            grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr));
          }
          .${className}-img {
            height: ${mobileImageHeight};
          }
          .${className}-title {
            font-size: calc(${titleSize} * 0.82);
          }
          .${className}-body {
            font-size: calc(${bodySize} * 0.9);
          }
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        <p className={`${className}-subtitle`}>{subtitle}</p>
        <h3 className={`${className}-title`}>{title}</h3>
        <p className={`${className}-body`}>{description}</p>
        <div className={className + "-grid"}>
          {images.length > 0 ? (
            images.map((url, idx) => (
              <img
                key={`${url}-${idx}`}
                src={url}
                alt={`Gallery item ${idx + 1}`}
                className={className + "-img"}
                loading="lazy"
              />
            ))
          ) : (
            <div className={`${className}-body`}>
              Add image URLs in settings.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const GallerySettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as GalleryProps }));

  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-4 space-y-4 border-b">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Image URLs (one per line)
          </label>
          <textarea
            value={props.imageUrls ?? ""}
            onChange={(e) =>
              setProp((p: GalleryProps) => (p.imageUrls = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            rows={6}
            title="Gallery image URLs"
            placeholder="https://example.com/image1.jpg"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Columns
            </label>
            <select
              value={props.columns ?? "3"}
              onChange={(e) =>
                setProp(
                  (p: GalleryProps) =>
                    (p.columns = e.target.value as GalleryProps["columns"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery columns"
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tablet Columns
            </label>
            <select
              value={props.tabletColumns ?? "2"}
              onChange={(e) =>
                setProp(
                  (p: GalleryProps) =>
                    (p.tabletColumns = e.target
                      .value as GalleryProps["tabletColumns"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery tablet columns"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Mobile Columns
            </label>
            <select
              value={props.mobileColumns ?? "1"}
              onChange={(e) =>
                setProp(
                  (p: GalleryProps) =>
                    (p.mobileColumns = e.target
                      .value as GalleryProps["mobileColumns"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery mobile columns"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Fit
            </label>
            <select
              value={props.imageFit ?? "cover"}
              onChange={(e) =>
                setProp(
                  (p: GalleryProps) =>
                    (p.imageFit = e.target.value as GalleryProps["imageFit"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery image fit"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Image Height
            </label>
            <input
              value={props.imageHeight ?? "180px"}
              onChange={(e) =>
                setProp((p: GalleryProps) => (p.imageHeight = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery image height"
              placeholder="180px"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Mobile Height
            </label>
            <input
              value={props.mobileImageHeight ?? "150px"}
              onChange={(e) =>
                setProp(
                  (p: GalleryProps) => (p.mobileImageHeight = e.target.value),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
              title="Gallery mobile image height"
              placeholder="150px"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Gap
          </label>
          <input
            value={props.gap ?? "12px"}
            onChange={(e) =>
              setProp((p: GalleryProps) => (p.gap = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Gallery gap"
            placeholder="12px"
          />
        </div>
      </div>
      <BaseSettings />
    </div>
  );
};

(Gallery as any).craft = {
  displayName: "Gallery",
  props: {
    ...cardDefaults,
    title: "Campus Gallery",
    subtitle: "Visual Showcase",
    description: "Add your own image URLs below and create a custom gallery.",
    bgColor: "#f8fafc",
    imageUrls:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    columns: "3",
    tabletColumns: "2",
    mobileColumns: "1",
    imageHeight: "180px",
    mobileImageHeight: "150px",
    imageFit: "cover",
    gap: "12px",
  },
  related: { toolbar: GallerySettings },
};

export const Testimonial = createCardComponent("Testimonial", {
  title: "Ananya R.",
  subtitle: "Student Voice",
  description:
    "The faculty mentorship and practical labs helped me secure my dream internship.",
  bgColor: "#eff6ff",
});

export const Timeline = createCardComponent(
  "Timeline",
  {
    title: "Admission Timeline",
    subtitle: "Important Milestones",
    items:
      "Application Opens - Jan 10\nEntrance Exam - Mar 05\nCounseling Begins - Apr 12",
    bgColor: "#f0fdf4",
  },
  { showItems: true, asList: true },
);

export const Badge = createCardComponent("Badge", {
  title: "Top Ranked 2026",
  subtitle: "Achievement",
  description: "National Education Excellence Award",
  width: "280px",
  padding: "12px",
  borderRadius: "999px",
  bgColor: "#fef3c7",
});

export const Quote = createCardComponent("Quote", {
  title: '"Learning never exhausts the mind."',
  subtitle: "Inspiration",
  description: "- Leonardo da Vinci",
  bgColor: "#f5f3ff",
});

interface NavbarProps extends BaseProps {
  logoText?: string;
  navLinks?: string;
  linkSize?: string;
  mobileLinkSize?: string;
  sticky?: boolean;
}

const parseNavLinks = (raw?: string) => {
  return splitItems(raw).map((line) => {
    const [labelRaw, hrefRaw, targetRaw] = line.split("|").map((v) => v.trim());
    return {
      label: labelRaw || "Link",
      href: hrefRaw || "#",
      target: targetRaw === "new" ? "_blank" : "_self",
    };
  });
};

export const Navbar = ({
  logoText = "Institution Name",
  navLinks = "Home|/|same\nPrograms|/programs|same\nAdmissions|/admissions|same\nContact|/contact|same",
  bgColor = "#111827",
  textColor = "#f9fafb",
  padding = "14px",
  width = "100%",
  borderRadius = "10px",
  linkSize = "14px",
  mobileLinkSize = "14px",
  sticky = false,
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "20",
  showIcon = false,
  iconType = "star",
}: NavbarProps) => {
  const links = parseNavLinks(navLinks);
  const { className, connect, drag } = useNodeClass("sdui-Navbar");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isMobileView, setIsMobileView] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [navLinks]);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (navRef.current) {
        const width = navRef.current.offsetWidth;
        setIsMobileView(width < 768);
      }
    });

    if (navRef.current) {
      observer.observe(navRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getIconEmoji = (type?: string) => {
    const icons: Record<string, string> = {
      star: "⭐",
      trophy: "🏆",
      medal: "🥇",
      check: "✓",
      crown: "👑",
      fire: "🔥",
      lightning: "⚡",
      heart: "❤️",
      sparkle: "✨",
      target: "🎯",
    };
    return icons[type ?? "star"] ?? "⭐";
  };

  return (
    <>
      <style>{`
        .${className} {
          width: ${width};
          max-width: 100%;
          box-sizing: border-box;
          ${basePositionCss({ positionMode, x, y, zIndex })}
          ${sticky ? "position: sticky; top: 0;" : ""}
          background: ${bgColor};
          color: ${textColor};
          padding: ${padding};
          border-radius: ${borderRadius};
          border: 1px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: nowrap;
          transition: all 0.3s ease;
        }
        .${className}-brand {
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .${className}-brand-icon {
          font-size: 20px;
        }
        .${className}-toggle {
          display: none;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.35);
          color: ${textColor};
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .${className}-toggle:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.5);
        }
        .${className}-links {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: nowrap;
          transition: all 0.3s ease;
        }
        .${className}-link {
          color: ${textColor};
          text-decoration: none;
          font-size: ${linkSize};
          font-weight: 500;
          opacity: 0.92;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .${className}-link:hover {
          opacity: 1;
          text-decoration: underline;
        }
        
        /* Desktop view */
        @media (min-width: 769px) {
          .${className} {
            flex-wrap: nowrap;
          }
          .${className}-toggle {
            display: none !important;
          }
          .${className}-links {
            display: flex !important;
            width: auto;
            border: none;
            padding: 0;
            flex-direction: row;
            align-items: center;
          }
        }
        
        /* Mobile/Tablet view */
        [data-mobile-view="true"] .${className} {
          flex-wrap: nowrap;
          position: relative;
          overflow: visible;
        }
        [data-mobile-view="true"] .${className}-toggle {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }
        [data-mobile-view="true"] .${className}-links {
          width: calc(100% - 2px);
          position: absolute;
          top: calc(100% + 6px);
          left: 1px;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          background: ${bgColor};
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 8px 22px rgba(0,0,0,0.18);
          opacity: 0;
          transform: translateY(-6px);
          visibility: hidden;
          pointer-events: none;
          z-index: 40;
          transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
        }
        [data-mobile-view="true"] .${className}-links.open {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
          pointer-events: auto;
        }
        [data-mobile-view="true"] .${className}-link {
          font-size: ${mobileLinkSize};
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
        }
        [data-mobile-view="true"] .${className}-link:hover {
          text-decoration: none;
          background: rgba(255,255,255,0.12);
        }
      `}</style>
      <nav
        ref={(ref: HTMLElement | null) => {
          if (ref) {
            navRef.current = ref;
            connect(drag(ref));
          }
        }}
        className={className}
        data-mobile-view={isMobileView}
      >
        <div className={`${className}-brand`}>
          {showIcon && (
            <span className={`${className}-brand-icon`}>
              {getIconEmoji(iconType)}
            </span>
          )}
          <span>{logoText}</span>
        </div>
        <button
          type="button"
          className={`${className}-toggle`}
          onClick={() => setMenuOpen((prev) => !prev)}
          title="Toggle navigation menu"
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✕" : "≡"}
        </button>
        <div className={`${className}-links ${menuOpen ? "open" : ""}`}>
          {links.map((link, idx) => (
            <a
              key={`${link.label}-${idx}`}
              href={link.href}
              target={link.target}
              rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
              className={`${className}-link`}
              onClick={() => isMobileView && setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
};

const NavbarSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as NavbarProps }));

  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    "basic",
  );

  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* NAVBAR BASIC */}
      <div className="border rounded-lg overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "basic" ? null : "basic")
          }
          className="w-full px-3 py-2 bg-gray-100 text-left text-xs font-bold text-gray-700 hover:bg-gray-200 flex items-center justify-between"
        >
          <span>⚙️ NAVBAR SETTINGS</span>
          <span>{expandedSection === "basic" ? "−" : "+"}</span>
        </button>
        {expandedSection === "basic" && (
          <div className="p-3 space-y-3 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Logo Text
              </label>
              <input
                value={props.logoText ?? "Institution Name"}
                onChange={(e) =>
                  setProp((p: NavbarProps) => (p.logoText = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Institution Name"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="navbar-show-icon"
                checked={props.showIcon ?? false}
                onChange={(e) =>
                  setProp((p: NavbarProps) => (p.showIcon = e.target.checked))
                }
              />
              <label
                htmlFor="navbar-show-icon"
                className="text-sm text-gray-700"
              >
                Show Logo Icon
              </label>
            </div>
            {props.showIcon && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Icon Type
                </label>
                <select
                  value={props.iconType ?? "star"}
                  onChange={(e) =>
                    setProp((p: NavbarProps) => (p.iconType = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="star">⭐ Star</option>
                  <option value="trophy">🏆 Trophy</option>
                  <option value="crown">👑 Crown</option>
                  <option value="fire">🔥 Fire</option>
                  <option value="target">🎯 Target</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nav Links (label|href|same/new)
              </label>
              <textarea
                value={props.navLinks ?? ""}
                onChange={(e) =>
                  setProp((p: NavbarProps) => (p.navLinks = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm text-xs"
                rows={5}
                placeholder="Home|/|same&#10;Programs|/programs|same"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Link Size
                </label>
                <input
                  value={props.linkSize ?? "14px"}
                  onChange={(e) =>
                    setProp((p: NavbarProps) => (p.linkSize = e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="14px"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile Link Size
                </label>
                <input
                  value={props.mobileLinkSize ?? "14px"}
                  onChange={(e) =>
                    setProp(
                      (p: NavbarProps) => (p.mobileLinkSize = e.target.value),
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="14px"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="navbar-sticky"
                type="checkbox"
                checked={Boolean(props.sticky)}
                onChange={(e) =>
                  setProp((p: NavbarProps) => (p.sticky = e.target.checked))
                }
                className="h-4 w-4"
              />
              <label htmlFor="navbar-sticky" className="text-sm text-gray-700">
                Sticky Top
              </label>
            </div>
          </div>
        )}
      </div>
      <BaseSettings />
    </div>
  );
};

(Navbar as any).craft = {
  displayName: "Navbar",
  props: {
    ...cardDefaults,
    logoText: "Institution Name",
    navLinks:
      "Home|/|same\nPrograms|/programs|same\nAdmissions|/admissions|same\nContact|/contact|same",
    bgColor: "#111827",
    textColor: "#f9fafb",
    padding: "14px",
    borderRadius: "10px",
    linkSize: "14px",
    mobileLinkSize: "14px",
    sticky: false,
    zIndex: "20",
    showIcon: false,
    iconType: "star",
  },
  related: { toolbar: NavbarSettings },
};

export const Footer = createCardComponent(
  "Footer",
  {
    title: "Institution Name",
    subtitle: "Footer",
    description: "© 2026 Institution. All rights reserved.",
    bgColor: "#111827",
    textColor: "#f9fafb",
    padding: "18px",
  },
  { showItems: false },
);

export const Breadcrumb = createCardComponent(
  "Breadcrumb",
  {
    title: "Current Page",
    subtitle: "Navigation Trail",
    description: "Home > Academics > Computer Science",
    bgColor: "#f9fafb",
    padding: "10px",
  },
  { showItems: false },
);

export const Pagination = createCardComponent(
  "Pagination",
  {
    title: "Page Navigation",
    subtitle: "Pagination",
    description: "Previous  1  2  3  Next",
    bgColor: "#f9fafb",
    padding: "10px",
  },
  { showItems: false },
);

export const DepartmentCard = createCardComponent("DepartmentCard", {
  title: "Department of Computer Science",
  subtitle: "Department",
  description:
    "Industry-driven curriculum, active research labs, and placement support.",
  bgColor: "#ecfeff",
});

export const FacultyProfile = createCardComponent("FacultyProfile", {
  title: "Dr. Kavya Menon",
  subtitle: "Professor, AI",
  description:
    "15+ years of research in machine learning and distributed systems.",
  bgColor: "#f5f3ff",
});

export const CourseList = createCardComponent(
  "CourseList",
  {
    title: "Core Courses",
    subtitle: "Curriculum",
    items:
      "Data Structures\nOperating Systems\nDatabase Systems\nComputer Networks",
    bgColor: "#f0f9ff",
  },
  { showItems: true, asList: true },
);

export const EventCalendar = createCardComponent(
  "EventCalendar",
  {
    title: "Upcoming Events",
    subtitle: "Calendar",
    items: "Tech Fest - Aug 14\nAlumni Meet - Sep 2\nHackathon - Oct 6",
    bgColor: "#f0fdf4",
  },
  { showItems: true, asList: true },
);

export const AdmissionForm = createCardComponent(
  "AdmissionForm",
  {
    title: "Admission Form",
    subtitle: "Apply Now",
    description:
      "Collect applicant details, program preference, and required documents.",
    bgColor: "#fff7ed",
  },
  { showItems: false },
);

export const AnnouncementBanner = createCardComponent("AnnouncementBanner", {
  title: "Admissions Open for 2026",
  subtitle: "Announcement",
  description: "Applications close on July 30. Scholarships available.",
  bgColor: "#fef9c3",
});

export const PlacementStats = createCardComponent(
  "PlacementStats",
  {
    title: "Placement Snapshot",
    subtitle: "Career Outcomes",
    items:
      "Highest Package: 18 LPA\nAverage Package: 6.5 LPA\nPlacement Rate: 92%",
    bgColor: "#ecfccb",
  },
  { showItems: true, asList: true },
);

export const ScholarshipCard = createCardComponent("ScholarshipCard", {
  title: "Merit Scholarship",
  subtitle: "Financial Aid",
  description: "Up to 70% tuition fee waiver for top-performing students.",
  bgColor: "#eef2ff",
});

export const ExamSchedule = createCardComponent(
  "ExamSchedule",
  {
    title: "Exam Schedule",
    subtitle: "Semester End",
    items: "Maths - Nov 2\nDBMS - Nov 4\nOS - Nov 8",
    bgColor: "#fdf4ff",
  },
  { showItems: true, asList: true },
);

export const StudentTestimonial = createCardComponent("StudentTestimonial", {
  title: "Rahul S.",
  subtitle: "Final Year Student",
  description: "The project-based courses made me industry-ready from day one.",
  bgColor: "#f0f9ff",
});

export const FacilityCard = createCardComponent("FacilityCard", {
  title: "Innovation Lab",
  subtitle: "Campus Facility",
  description:
    "24x7 prototyping space with electronics benches and 3D printers.",
  bgColor: "#ecfeff",
});

export const ClubCard = createCardComponent("ClubCard", {
  title: "Coding Club",
  subtitle: "Student Community",
  description: "Weekly contests, peer mentoring, and inter-college events.",
  bgColor: "#f0fdf4",
});

export const InquiryForm = createCardComponent(
  "InquiryForm",
  {
    title: "Inquiry Form",
    subtitle: "Get Information",
    description: "Collect visitor contact details and their questions.",
    bgColor: "#fff7ed",
  },
  { showItems: false },
);

export const FeedbackForm = createCardComponent(
  "FeedbackForm",
  {
    title: "Feedback Form",
    subtitle: "Share Experience",
    description:
      "Gather student and parent suggestions for quality improvement.",
    bgColor: "#fef2f2",
  },
  { showItems: false },
);

export const AlertBanner = createCardComponent("AlertBanner", {
  title: "Important Notice",
  subtitle: "Alert",
  description: "Campus will remain closed on Friday due to maintenance.",
  bgColor: "#fee2e2",
});

export const ProgressTracker = createCardComponent(
  "ProgressTracker",
  {
    title: "Application Progress",
    subtitle: "Status",
    items: "Form Submitted\nDocuments Verified\nInterview Scheduled",
    bgColor: "#eef2ff",
  },
  { showItems: true, asList: true },
);

interface TabsProps extends BaseProps {
  tabLabels?: string;
  tabContents?: string;
}

export const Tabs = ({
  title = "Tabs",
  tabLabels = "Overview|Curriculum|Eligibility",
  tabContents = "Overview content|Curriculum content|Eligibility content",
  width = "100%",
  bgColor = "#ffffff",
  textColor = "#111827",
  padding = "16px",
  borderRadius = "12px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: TabsProps) => {
  const { className, connect, drag } = useNodeClass("sdui-tabs");
  const labels = tabLabels
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
  const contents = tabContents.split("|").map((x) => x.trim());
  const [active, setActive] = React.useState(0);

  const safeIndex = Math.min(active, labels.length - 1);

  return (
    <>
      <style>{`
        .${className} {
          width: ${width};
          ${basePositionCss({ positionMode, x, y, zIndex })}
          background: ${bgColor};
          color: ${textColor};
          padding: ${padding};
          border-radius: ${borderRadius};
          border: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        <h3 className="font-bold text-base mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {labels.map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`px-3 py-1.5 text-xs rounded-full border ${
                idx === safeIndex
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {contents[safeIndex] || "Tab content"}
        </p>
      </div>
    </>
  );
};

const TabsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TabsProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Title
        </label>
        <input
          value={props.title ?? "Tabs"}
          onChange={(e) =>
            setProp((p: TabsProps) => (p.title = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Tabs title"
          placeholder="Tabs"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Tab Labels (| separated)
        </label>
        <input
          value={props.tabLabels ?? ""}
          onChange={(e) =>
            setProp((p: TabsProps) => (p.tabLabels = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Overview|Curriculum|Eligibility"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Tab Contents (| separated)
        </label>
        <textarea
          value={props.tabContents ?? ""}
          onChange={(e) =>
            setProp((p: TabsProps) => (p.tabContents = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          rows={4}
          placeholder="Overview content|Curriculum content|Eligibility content"
        />
      </div>
      <BaseSettings />
    </div>
  );
};

(Tabs as any).craft = {
  displayName: "Tabs",
  props: {
    ...cardDefaults,
    title: "Tabs",
    tabLabels: "Overview|Curriculum|Eligibility",
    tabContents: "Overview content|Curriculum content|Eligibility content",
  },
  related: { toolbar: TabsSettings },
};

interface ModalProps extends BaseProps {
  buttonLabel?: string;
}

export const Modal = ({
  title = "Modal Title",
  description = "This is a modal body preview.",
  buttonLabel = "Open Modal",
  width = "100%",
  bgColor = "#ffffff",
  textColor = "#111827",
  padding = "16px",
  borderRadius = "12px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: ModalProps) => {
  const [open, setOpen] = React.useState(false);
  const { className, connect, drag } = useNodeClass("sdui-modal");

  return (
    <>
      <style>{`
        .${className} {
          width: ${width};
          ${basePositionCss({ positionMode, x, y, zIndex })}
        }
        .${className}-panel {
          margin-top: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: ${borderRadius};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          background: ${bgColor};
          color: ${textColor};
          padding: 16px;
        }
        .${className}-body {
          padding: ${padding};
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={className}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
        >
          {buttonLabel}
        </button>
        {open && (
          <div className={`${className}-panel`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{title}</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-gray-500"
              >
                Close
              </button>
            </div>
            <p className={`${className}-body text-sm`}>{description}</p>
          </div>
        )}
      </div>
    </>
  );
};

const ModalSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ModalProps }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Button Label
        </label>
        <input
          value={props.buttonLabel ?? "Open Modal"}
          onChange={(e) =>
            setProp((p: ModalProps) => (p.buttonLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Modal button label"
          placeholder="Open Modal"
        />
      </div>
      <BaseSettings />
    </div>
  );
};

(Modal as any).craft = {
  displayName: "Modal",
  props: {
    ...cardDefaults,
    title: "Modal Title",
    description: "This is a modal body preview.",
    buttonLabel: "Open Modal",
  },
  related: { toolbar: ModalSettings },
};

interface TooltipProps extends BaseProps {
  targetText?: string;
  tooltipText?: string;
}

export const Tooltip = ({
  targetText = "Hover this text",
  tooltipText = "Tooltip content",
  width = "fit-content",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: TooltipProps) => {
  const { className, connect, drag } = useNodeClass("sdui-tooltip");

  return (
    <>
      <style>{`
        .${className} {
          width: ${width};
          ${basePositionCss({ positionMode, x, y, zIndex })}
        }
      `}</style>
      <span
        ref={(ref: HTMLSpanElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={`${className} inline-flex px-3 py-2 rounded border border-dashed text-sm text-gray-700`}
        title={tooltipText}
      >
        {targetText}
      </span>
    </>
  );
};

const TooltipSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TooltipProps }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Target Text
        </label>
        <input
          value={props.targetText ?? "Hover this text"}
          onChange={(e) =>
            setProp((p: TooltipProps) => (p.targetText = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Tooltip target text"
          placeholder="Hover this text"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Tooltip Text
        </label>
        <input
          value={props.tooltipText ?? "Tooltip content"}
          onChange={(e) =>
            setProp((p: TooltipProps) => (p.tooltipText = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          title="Tooltip content text"
          placeholder="Tooltip content"
        />
      </div>
      <BaseSettings />
    </div>
  );
};

(Tooltip as any).craft = {
  displayName: "Tooltip",
  props: {
    ...cardDefaults,
    targetText: "Hover this text",
    tooltipText: "Tooltip content",
    width: "fit-content",
  },
  related: { toolbar: TooltipSettings },
};
