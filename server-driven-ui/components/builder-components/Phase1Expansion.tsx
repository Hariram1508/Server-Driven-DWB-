"use client";

import React from "react";
import { useNode } from "@craftjs/core";

type BaseProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  items?: string;
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  bodyTextColor?: string;
  titleSize?: string;
  subtitleSize?: string;
  bodySize?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  fontFamily?: string;
  textStyle?: "normal" | "italic";
  padding?: string;
  gap?: string;
  borderRadius?: string;
  borderColor?: string;
  boxShadow?: string;
  showIcon?: boolean;
  iconEmoji?: string;
  iconSize?: string;
  iconColor?: string;
  iconPosition?: "top-left" | "top-center" | "top-right" | "inline-title";
  itemLayout?: "list" | "grid";
  itemColumns?: 1 | 2 | 3 | 4;
  tabletItemColumns?: 1 | 2 | 3 | 4;
  mobileItemColumns?: 1 | 2 | 3 | 4;
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaTarget?: "same" | "new";
  buttonColor?: string;
  buttonTextColor?: string;
  buttonHoverColor?: string;
};

const splitItems = (items?: string) =>
  (items || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const FONT_FAMILY_OPTIONS = [
  "inherit",
  "Inter, system-ui, sans-serif",
  "Poppins, sans-serif",
  "Merriweather, serif",
  "Playfair Display, serif",
  "Fira Sans, sans-serif",
  "Manrope, sans-serif",
  "Lora, serif",
  "JetBrains Mono, monospace",
];

const BaseSettings = ({ showItems = false }: { showItems?: boolean }) => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as BaseProps }));

  const itemRows = splitItems(props.items);

  const updateItemRow = (index: number, value: string) => {
    setProp((p: BaseProps) => {
      const rows = splitItems(p.items);
      if (!rows[index]) return;
      rows[index] = value;
      p.items = rows.join("\n");
    });
  };

  const removeItemRow = (index: number) => {
    setProp((p: BaseProps) => {
      const rows = splitItems(p.items);
      p.items = rows.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Title
        </label>
        <input
          value={props.title ?? ""}
          onChange={(e) =>
            setProp((p: BaseProps) => (p.title = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Subtitle
        </label>
        <input
          value={props.subtitle ?? ""}
          onChange={(e) =>
            setProp((p: BaseProps) => (p.subtitle = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      {showItems ? (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Items (one per line)
          </label>
          <textarea
            value={props.items ?? ""}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.items = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            rows={4}
          />
          <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60 mt-2">
            <p className="text-xs font-semibold text-gray-600 m-0">Items</p>
            {itemRows.map((item, idx) => (
              <div
                key={`base-item-${idx}`}
                className="grid grid-cols-[1fr_auto] gap-2"
              >
                <input
                  value={item}
                  onChange={(e) => updateItemRow(idx, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Item"
                />
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <QuickLineAdder
            label="Quick Add Item"
            placeholder="New item"
            onAdd={(value) =>
              setProp((p: BaseProps) => {
                p.items = [...splitItems(p.items), value].join("\n");
              })
            }
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Item Layout
              </label>
              <select
                value={props.itemLayout ?? "list"}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) =>
                      (p.itemLayout = e.target
                        .value as BaseProps["itemLayout"]),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Desktop Columns
              </label>
              <select
                value={props.itemColumns ?? 2}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) =>
                      (p.itemColumns = Number(e.target.value) as 1 | 2 | 3 | 4),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Tablet Columns
              </label>
              <select
                value={props.tabletItemColumns ?? 2}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) =>
                      (p.tabletItemColumns = Number(e.target.value) as
                        | 1
                        | 2
                        | 3
                        | 4),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Mobile Columns
              </label>
              <select
                value={props.mobileItemColumns ?? 1}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) =>
                      (p.mobileItemColumns = Number(e.target.value) as
                        | 1
                        | 2
                        | 3
                        | 4),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Description
          </label>
          <textarea
            value={props.description ?? ""}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.description = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            rows={3}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Background
          </label>
          <input
            type="color"
            value={props.backgroundColor ?? "#ffffff"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.backgroundColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Text Color
          </label>
          <input
            type="color"
            value={props.textColor ?? "#111827"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.textColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Title Color
          </label>
          <input
            type="color"
            value={props.titleColor ?? props.textColor ?? "#111827"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.titleColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Subtitle Color
          </label>
          <input
            type="color"
            value={props.subtitleColor ?? props.textColor ?? "#6b7280"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.subtitleColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Body Color
          </label>
          <input
            type="color"
            value={props.bodyTextColor ?? props.textColor ?? "#374151"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.bodyTextColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Font Family
          </label>
          <select
            value={props.fontFamily ?? "inherit"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.fontFamily = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            {FONT_FAMILY_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Text Style
          </label>
          <select
            value={props.textStyle ?? "normal"}
            onChange={(e) =>
              setProp(
                (p: BaseProps) =>
                  (p.textStyle = e.target.value as BaseProps["textStyle"]),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Title Size
          </label>
          <input
            value={props.titleSize ?? "20px"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.titleSize = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Subtitle Size
          </label>
          <input
            value={props.subtitleSize ?? "12px"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.subtitleSize = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Body Size
          </label>
          <input
            value={props.bodySize ?? "14px"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.bodySize = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
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
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Radius
          </label>
          <input
            value={props.borderRadius ?? "12px"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.borderRadius = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Border Color
          </label>
          <input
            type="color"
            value={props.borderColor ?? "#e5e7eb"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.borderColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Gap
          </label>
          <input
            value={props.gap ?? "10px"}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.gap = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="show-icon"
            type="checkbox"
            checked={Boolean(props.showIcon)}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.showIcon = e.target.checked))
            }
          />
          <label htmlFor="show-icon" className="text-sm text-gray-700">
            Show Icon / Emoji
          </label>
        </div>
        {props.showIcon ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              value={props.iconEmoji ?? "⭐"}
              onChange={(e) =>
                setProp((p: BaseProps) => (p.iconEmoji = e.target.value))
              }
              className="px-3 py-2 border rounded text-sm"
              placeholder="⭐"
            />
            <input
              value={props.iconSize ?? "22px"}
              onChange={(e) =>
                setProp((p: BaseProps) => (p.iconSize = e.target.value))
              }
              className="px-3 py-2 border rounded text-sm"
              placeholder="22px"
            />
            <input
              type="color"
              value={props.iconColor ?? props.titleColor ?? "#111827"}
              onChange={(e) =>
                setProp((p: BaseProps) => (p.iconColor = e.target.value))
              }
              className="w-full h-10 border rounded"
            />
            <select
              value={props.iconPosition ?? "top-left"}
              onChange={(e) =>
                setProp(
                  (p: BaseProps) =>
                    (p.iconPosition = e.target
                      .value as BaseProps["iconPosition"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="inline-title">Inline With Title</option>
            </select>
          </div>
        ) : null}
      </div>
      <div className="border-t pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="show-cta"
            type="checkbox"
            checked={Boolean(props.showCta)}
            onChange={(e) =>
              setProp((p: BaseProps) => (p.showCta = e.target.checked))
            }
          />
          <label htmlFor="show-cta" className="text-sm text-gray-700">
            Show Action Button
          </label>
        </div>
        {props.showCta ? (
          <>
            <input
              value={props.ctaText ?? "Explore"}
              onChange={(e) =>
                setProp((p: BaseProps) => (p.ctaText = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Button text"
            />
            <input
              value={props.ctaUrl ?? "#"}
              onChange={(e) =>
                setProp((p: BaseProps) => (p.ctaUrl = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Button URL"
            />
            <select
              value={props.ctaTarget ?? "same"}
              onChange={(e) =>
                setProp(
                  (p: BaseProps) =>
                    (p.ctaTarget = e.target.value as BaseProps["ctaTarget"]),
                )
              }
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="same">Open in same tab</option>
              <option value="new">Open in new tab</option>
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="color"
                value={props.buttonColor ?? "#2563eb"}
                onChange={(e) =>
                  setProp((p: BaseProps) => (p.buttonColor = e.target.value))
                }
                className="w-full h-10 border rounded"
              />
              <input
                type="color"
                value={props.buttonTextColor ?? "#ffffff"}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) => (p.buttonTextColor = e.target.value),
                  )
                }
                className="w-full h-10 border rounded"
              />
              <input
                type="color"
                value={props.buttonHoverColor ?? "#1d4ed8"}
                onChange={(e) =>
                  setProp(
                    (p: BaseProps) => (p.buttonHoverColor = e.target.value),
                  )
                }
                className="w-full h-10 border rounded"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const createSimpleComponent = (
  displayName: string,
  defaults: BaseProps = {},
  useList = false,
) => {
  const Component = (incoming: BaseProps) => {
    const props = {
      title: displayName,
      subtitle: "",
      description: "",
      items: "",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      titleColor: "#111827",
      subtitleColor: "#6b7280",
      bodyTextColor: "#374151",
      titleSize: "20px",
      subtitleSize: "12px",
      bodySize: "14px",
      fontWeight: "semibold" as BaseProps["fontWeight"],
      fontFamily: "inherit",
      textStyle: "normal" as BaseProps["textStyle"],
      padding: "16px",
      gap: "10px",
      borderRadius: "12px",
      borderColor: "#e5e7eb",
      boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
      showIcon: false,
      iconEmoji: "⭐",
      iconSize: "22px",
      iconColor: "#111827",
      iconPosition: "top-left" as BaseProps["iconPosition"],
      itemLayout: "list" as BaseProps["itemLayout"],
      itemColumns: 2,
      tabletItemColumns: 2,
      mobileItemColumns: 1,
      showCta: false,
      ctaText: "Explore",
      ctaUrl: "#",
      ctaTarget: "same" as BaseProps["ctaTarget"],
      buttonColor: "#2563eb",
      buttonTextColor: "#ffffff",
      buttonHoverColor: "#1d4ed8",
      ...defaults,
      ...incoming,
    };

    const {
      connectors: { connect, drag },
    } = useNode();
    const [buttonHover, setButtonHover] = React.useState(false);

    const iconNode = props.showIcon ? (
      <span
        style={{
          fontSize: props.iconSize,
          lineHeight: 1,
          color: props.iconColor,
          alignSelf:
            props.iconPosition === "top-center"
              ? "center"
              : props.iconPosition === "top-right"
                ? "flex-end"
                : "flex-start",
        }}
      >
        {props.iconEmoji}
      </span>
    ) : null;

    const handleActionClick = () => {
      if (!props.ctaUrl || props.ctaUrl === "#") return;
      if (props.ctaTarget === "new") {
        window.open(props.ctaUrl, "_blank", "noopener,noreferrer");
        return;
      }
      window.location.href = props.ctaUrl;
    };

    return (
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        style={{
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          fontFamily: props.fontFamily,
          fontStyle: props.textStyle,
          padding: props.padding,
          borderRadius: props.borderRadius,
          border: `1px solid ${props.borderColor}`,
          boxShadow: props.boxShadow,
          display: "flex",
          flexDirection: "column",
          gap: props.gap,
        }}
      >
        {props.iconPosition === "inline-title" ? null : iconNode}
        {props.subtitle ? (
          <p
            style={{
              fontSize: props.subtitleSize,
              color: props.subtitleColor,
              opacity: 0.9,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {props.subtitle}
          </p>
        ) : null}
        <h3
          style={{
            margin: 0,
            fontSize: props.titleSize,
            color: props.titleColor,
            fontWeight:
              props.fontWeight === "normal"
                ? 400
                : props.fontWeight === "medium"
                  ? 500
                  : props.fontWeight === "bold"
                    ? 700
                    : 600,
          }}
        >
          {props.showIcon && props.iconPosition === "inline-title" ? (
            <span
              style={{
                fontSize: props.iconSize,
                lineHeight: 1,
                color: props.iconColor,
                marginRight: "8px",
              }}
            >
              {props.iconEmoji}
            </span>
          ) : null}
          {props.title}
        </h3>
        {useList ? (
          <ul
            style={{
              margin: 0,
              paddingLeft: props.itemLayout === "list" ? "18px" : 0,
              display: props.itemLayout === "grid" ? "grid" : "block",
              gridTemplateColumns:
                props.itemLayout === "grid"
                  ? `repeat(${props.itemColumns}, minmax(0, 1fr))`
                  : undefined,
              gap: props.gap,
              listStyle: props.itemLayout === "grid" ? "none" : undefined,
            }}
          >
            {splitItems(props.items).map((item, idx) => (
              <li
                key={idx}
                style={
                  props.itemLayout === "grid"
                    ? {
                        border: `1px solid ${props.borderColor}`,
                        borderRadius: "10px",
                        padding: "8px 10px",
                        color: props.bodyTextColor,
                      }
                    : { color: props.bodyTextColor }
                }
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              margin: 0,
              lineHeight: 1.6,
              fontSize: props.bodySize,
              color: props.bodyTextColor,
            }}
          >
            {props.description}
          </p>
        )}
        {props.showCta ? (
          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              onClick={handleActionClick}
              style={{
                backgroundColor: buttonHover
                  ? props.buttonHoverColor
                  : props.buttonColor,
                color: props.buttonTextColor,
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {props.ctaText || "Explore"}
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  (Component as any).craft = {
    displayName,
    props: {
      title: displayName,
      subtitle: defaults.subtitle || "",
      description: defaults.description || "",
      items: defaults.items || "",
      backgroundColor: defaults.backgroundColor || "#ffffff",
      textColor: defaults.textColor || "#111827",
      titleColor: defaults.titleColor || "#111827",
      subtitleColor: defaults.subtitleColor || "#6b7280",
      bodyTextColor: defaults.bodyTextColor || "#374151",
      titleSize: defaults.titleSize || "20px",
      subtitleSize: defaults.subtitleSize || "12px",
      bodySize: defaults.bodySize || "14px",
      fontWeight: defaults.fontWeight || "semibold",
      fontFamily: defaults.fontFamily || "inherit",
      textStyle: defaults.textStyle || "normal",
      padding: defaults.padding || "16px",
      gap: defaults.gap || "10px",
      borderRadius: defaults.borderRadius || "12px",
      borderColor: defaults.borderColor || "#e5e7eb",
      boxShadow: defaults.boxShadow || "0 6px 18px rgba(15,23,42,0.08)",
      showIcon: defaults.showIcon || false,
      iconEmoji: defaults.iconEmoji || "⭐",
      iconSize: defaults.iconSize || "22px",
      iconColor: defaults.iconColor || "#111827",
      iconPosition: defaults.iconPosition || "top-left",
      itemLayout: defaults.itemLayout || "list",
      itemColumns: defaults.itemColumns || 2,
      tabletItemColumns: defaults.tabletItemColumns || 2,
      mobileItemColumns: defaults.mobileItemColumns || 1,
      showCta: defaults.showCta || false,
      ctaText: defaults.ctaText || "Explore",
      ctaUrl: defaults.ctaUrl || "#",
      ctaTarget: defaults.ctaTarget || "same",
      buttonColor: defaults.buttonColor || "#2563eb",
      buttonTextColor: defaults.buttonTextColor || "#ffffff",
      buttonHoverColor: defaults.buttonHoverColor || "#1d4ed8",
    },
    related: {
      toolbar: () => <BaseSettings showItems={useList} />,
    },
  };

  return Component;
};

export const Sidebar = createSimpleComponent("Sidebar", {
  subtitle: "Layout",
  description: "Sidebar area",
  backgroundColor: "#f8fafc",
});

export const Divider = createSimpleComponent("Divider", {
  subtitle: "Layout",
  description: "Horizontal divider",
  backgroundColor: "#ffffff",
});

export const Stack = createSimpleComponent("Stack", {
  subtitle: "Layout",
  description: "Vertical stack container",
  backgroundColor: "#ffffff",
});

type GridSectionProps = BaseProps & {
  sectionTitle?: string;
  gridColumns?: 1 | 2 | 3 | 4;
  cardRowsData?: string;
  clickAction?: "disabled" | "navigate";
};

export const GridSection = ({
  subtitle = "Grid Section",
  sectionTitle = "Program Highlights",
  gridColumns = 3,
  cardRowsData = "Innovation Lab|State-of-the-art makerspace for student projects.|Explore Lab|/facilities/innovation-lab\nPlacement Hub|Career support, training, and recruiter connects.|See Placements|/placements\nResearch Center|Funded research opportunities with faculty mentors.|View Research|/research",
  clickAction = "disabled",
  backgroundColor = "#f8fafc",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: GridSectionProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const cards = parseSimpleLines(cardRowsData).map((line, idx) => {
    const [title, description, actionLabel, actionUrl] = line
      .split("|")
      .map((part) => part.trim());
    return {
      id: `${idx}-${title || "card"}`,
      title: title || "Card",
      description: description || "Description",
      actionLabel: actionLabel || "Learn More",
      actionUrl: actionUrl || "#",
    };
  });

  const columnClassMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-4">{sectionTitle}</h3>
      <div className={`grid gap-3 ${columnClassMap[gridColumns]}`}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl bg-white/90 border border-slate-200 p-4"
          >
            <h4 className="text-base font-semibold m-0">{card.title}</h4>
            <p className="mt-2 mb-3 text-sm text-slate-600">
              {card.description}
            </p>
            <a
              href={card.actionUrl}
              onClick={(e) => {
                if (clickAction !== "navigate") e.preventDefault();
              }}
              className="inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold bg-slate-900 text-white"
            >
              {card.actionLabel}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const GridSectionSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as GridSectionProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.sectionTitle ?? ""}
          onChange={(e) =>
            setProp((p: GridSectionProps) => (p.sectionTitle = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Section Title"
        />
        <select
          value={props.gridColumns ?? 3}
          onChange={(e) =>
            setProp(
              (p: GridSectionProps) =>
                (p.gridColumns = Number(e.target.value) as 1 | 2 | 3 | 4),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Cards (Title|Description|Button Label|URL)
        </label>
        <textarea
          value={props.cardRowsData ?? ""}
          onChange={(e) =>
            setProp((p: GridSectionProps) => (p.cardRowsData = e.target.value))
          }
          rows={6}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <QuickRowAdder
          label="Quick Add Card"
          placeholders={["Title", "Description", "Button Label", "URL"]}
          onAdd={(values) =>
            setProp(
              (p: GridSectionProps) =>
                (p.cardRowsData = appendRow(p.cardRowsData, values)),
            )
          }
        />
      </div>
      <BaseSettings />
    </div>
  );
};

(GridSection as any).craft = {
  displayName: "GridSection",
  props: {
    subtitle: "Grid Section",
    sectionTitle: "Program Highlights",
    gridColumns: 3,
    cardRowsData:
      "Innovation Lab|State-of-the-art makerspace for student projects.|Explore Lab|/facilities/innovation-lab\nPlacement Hub|Career support, training, and recruiter connects.|See Placements|/placements\nResearch Center|Funded research opportunities with faculty mentors.|View Research|/research",
    clickAction: "disabled",
    backgroundColor: "#f8fafc",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: GridSectionSettings,
  },
};

type GalleryProps = BaseProps & {
  imagesData?: string;
  imageColumns?: 2 | 3 | 4;
  imageRadius?: string;
  clickAction?: "disabled" | "navigate";
};

const parseGalleryImages = (raw?: string) =>
  (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const [url, alt] = line.split("|");
      return {
        id: `${idx}-${alt || "image"}`,
        url: (url || "").trim(),
        alt: (alt || `Gallery image ${idx + 1}`).trim(),
      };
    });

export const Gallery = ({
  title = "Gallery",
  subtitle = "Visual Showcase",
  description = "Campus gallery section",
  imagesData = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop|Campus aerial view\nhttps://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop|Library interior\nhttps://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200&auto=format&fit=crop|Student collaboration",
  imageColumns = 3,
  imageRadius = "12px",
  clickAction = "disabled",
  backgroundColor = "#f8fafc",
  textColor = "#111827",
  bodyTextColor = "#374151",
  padding = "16px",
  borderRadius = "12px",
  borderColor = "#e5e7eb",
  fontFamily = "inherit",
  textStyle = "normal",
}: GalleryProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const images = parseGalleryImages(imagesData);
  const columnClass =
    imageColumns === 4
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      : imageColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: `1px solid ${borderColor}`,
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-2">{title}</h3>
      {description ? (
        <p className="text-sm m-0 mb-4" style={{ color: bodyTextColor }}>
          {description}
        </p>
      ) : null}
      <div className={`grid gap-3 ${columnClass}`}>
        {images.map((image) => (
          <a
            key={image.id}
            href={image.url || "#"}
            onClick={(e) => {
              if (clickAction !== "navigate") e.preventDefault();
            }}
            className="block overflow-hidden border border-slate-200 bg-white"
            style={{ borderRadius: imageRadius }}
          >
            {image.url ? (
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 grid place-items-center text-xs text-slate-500">
                Add image URL
              </div>
            )}
            <p className="m-0 px-3 py-2 text-xs text-slate-600">{image.alt}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

const GallerySettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as GalleryProps }));

  const images = parseGalleryImages(props.imagesData);

  const updateImage = (index: number, field: "url" | "alt", value: string) => {
    setProp((p: GalleryProps) => {
      const rows = parseGalleryImages(p.imagesData);
      if (!rows[index]) return;
      rows[index][field] = value;
      p.imagesData = rows.map((row) => `${row.url}|${row.alt}`).join("\n");
    });
  };

  const removeImage = (index: number) => {
    setProp((p: GalleryProps) => {
      const rows = parseGalleryImages(p.imagesData);
      p.imagesData = rows
        .filter((_, idx) => idx !== index)
        .map((row) => `${row.url}|${row.alt}`)
        .join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.imageColumns ?? 3}
          onChange={(e) =>
            setProp(
              (p: GalleryProps) =>
                (p.imageColumns = Number(e.target.value) as 2 | 3 | 4),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
        <input
          value={props.imageRadius ?? "12px"}
          onChange={(e) =>
            setProp((p: GalleryProps) => (p.imageRadius = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Image Radius"
        />
      </div>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: GalleryProps) =>
              (p.clickAction = e.target.value as GalleryProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Images (URL|Alt Text)
        </label>
        <textarea
          value={props.imagesData ?? ""}
          onChange={(e) =>
            setProp((p: GalleryProps) => (p.imagesData = e.target.value))
          }
          rows={6}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Image Rows</p>
        {images.map((image, idx) => (
          <div
            key={image.id}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={image.url}
                onChange={(e) => updateImage(idx, "url", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Image URL"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
            <input
              value={image.alt}
              onChange={(e) => updateImage(idx, "alt", e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Alt Text"
            />
          </div>
        ))}
      </div>
      <QuickRowAdder
        label="Quick Add Image"
        placeholders={["Image URL", "Alt Text"]}
        onAdd={(values) =>
          setProp(
            (p: GalleryProps) =>
              (p.imagesData = appendRow(p.imagesData, values)),
          )
        }
      />
      <BaseSettings />
    </div>
  );
};

(Gallery as any).craft = {
  displayName: "Gallery",
  props: {
    title: "Gallery",
    subtitle: "Visual Showcase",
    description: "Campus gallery section",
    imagesData:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop|Campus aerial view\nhttps://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop|Library interior\nhttps://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200&auto=format&fit=crop|Student collaboration",
    imageColumns: 3,
    imageRadius: "12px",
    clickAction: "disabled",
    backgroundColor: "#f8fafc",
    textColor: "#111827",
    bodyTextColor: "#374151",
    padding: "16px",
    borderRadius: "12px",
    borderColor: "#e5e7eb",
    fontFamily: "inherit",
    textStyle: "normal",
  },
  related: {
    toolbar: GallerySettings,
  },
};

export const Testimonial = createSimpleComponent("Testimonial", {
  subtitle: "Student Voice",
  description: "The faculty mentorship helped me grow quickly.",
  backgroundColor: "#eff6ff",
});

export const Timeline = createSimpleComponent(
  "Timeline",
  {
    subtitle: "Milestones",
    items: "Application Opens\nExam Date\nCounseling",
    backgroundColor: "#f0fdf4",
  },
  true,
);

export const Badge = createSimpleComponent("Badge", {
  subtitle: "Achievement",
  description: "Top Ranked 2026",
  backgroundColor: "#fef3c7",
  borderRadius: "999px",
});

export const Quote = createSimpleComponent("Quote", {
  subtitle: "Inspiration",
  description: "Learning never exhausts the mind.",
  backgroundColor: "#f5f3ff",
});

type NavbarProps = {
  logoText?: string;
  navLinks?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  borderRadius?: string;
  showIcon?: boolean;
  iconEmoji?: string;
  iconSize?: string;
  iconColor?: string;
  iconPosition?: "left" | "right";
  fontFamily?: string;
  textStyle?: "normal" | "italic";
  linkAction?: "disabled" | "navigate";
  sticky?: boolean;
  collapseAt?: number;
};

const parseNavbarLinks = (raw?: string) =>
  (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href, target] = line.split("|");
      return {
        label: (label || "Link").trim(),
        href: (href || "#").trim(),
        target: (target || "same").trim() === "new" ? "_blank" : "_self",
      };
    });

const serializeNavbarLinks = (
  links: Array<{ label: string; href: string; target: "_self" | "_blank" }>,
) =>
  links
    .map(
      (link) =>
        `${link.label}|${link.href}|${link.target === "_blank" ? "new" : "same"}`,
    )
    .join("\n");

export const Navbar = ({
  logoText = "Institution Name",
  navLinks = "Home|/|same\nPrograms|/programs|same\nAdmissions|/admissions|same\nContact|/contact|same",
  backgroundColor = "#111827",
  textColor = "#f9fafb",
  padding = "12px 16px",
  borderRadius = "12px",
  showIcon = false,
  iconEmoji = "⭐",
  iconSize = "18px",
  iconColor = "#f9fafb",
  iconPosition = "left",
  fontFamily = "inherit",
  textStyle = "normal",
  linkAction = "disabled",
  sticky = false,
  collapseAt = 768,
}: NavbarProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(false);
  const navRef = React.useRef<HTMLElement | null>(null);
  const links = parseNavbarLinks(navLinks);

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const updateCompact = () => {
      const width = el.getBoundingClientRect().width;
      const compact = width < (collapseAt || 768);
      setIsCompact(compact);
      if (!compact) {
        setMobileOpen(false);
      }
    };

    updateCompact();
    const observer = new ResizeObserver(updateCompact);
    observer.observe(el);
    window.addEventListener("resize", updateCompact);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateCompact);
    };
  }, [collapseAt]);

  return (
    <nav
      ref={(ref: HTMLElement | null) => {
        if (ref) connect(drag(ref));
        navRef.current = ref;
      }}
      style={{
        position: sticky ? "sticky" : "relative",
        top: sticky ? 0 : undefined,
        zIndex: 30,
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 8px 24px rgba(2,6,23,0.25)",
      }}
      className="w-full"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-base font-semibold tracking-wide">
          {showIcon && iconPosition === "left" ? (
            <span style={{ fontSize: iconSize, color: iconColor }}>
              {iconEmoji}
            </span>
          ) : null}
          <span>{logoText}</span>
          {showIcon && iconPosition === "right" ? (
            <span style={{ fontSize: iconSize, color: iconColor }}>
              {iconEmoji}
            </span>
          ) : null}
        </div>

        {isCompact ? (
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center h-10 px-3 rounded-lg border border-white/30 text-sm"
            style={{ color: textColor }}
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        ) : (
          <div className="flex items-center gap-5">
            {links.map((link, idx) => (
              <a
                key={`${link.label}-${idx}`}
                href={link.href}
                target={link.target}
                rel={
                  link.target === "_blank" ? "noopener noreferrer" : undefined
                }
                onClick={(e) => {
                  if (linkAction !== "navigate") e.preventDefault();
                }}
                className="text-sm font-medium opacity-90 hover:opacity-100 hover:underline"
                style={{ color: textColor }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${isCompact && mobileOpen ? "max-h-96 mt-3" : "max-h-0"}`}
      >
        <div className="rounded-lg border border-white/20 bg-black/15 backdrop-blur-sm p-2 flex flex-col gap-1">
          {links.map((link, idx) => (
            <a
              key={`mobile-${link.label}-${idx}`}
              href={link.href}
              target={link.target}
              rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (linkAction !== "navigate") e.preventDefault();
                setMobileOpen(false);
              }}
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

const NavbarSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as NavbarProps }));

  const links = React.useMemo(
    () => parseNavbarLinks(props.navLinks),
    [props.navLinks],
  );

  const updateLink = (
    index: number,
    field: "label" | "href" | "target",
    value: string,
  ) => {
    setProp((p: NavbarProps) => {
      const current = parseNavbarLinks(p.navLinks).map((item) => ({
        ...item,
        target: item.target as "_self" | "_blank",
      }));
      if (!current[index]) return;
      if (field === "target") {
        current[index].target = value === "_blank" ? "_blank" : "_self";
      } else if (field === "label") {
        current[index].label = value;
      } else {
        current[index].href = value;
      }
      p.navLinks = serializeNavbarLinks(current);
    });
  };

  const addLink = () => {
    setProp((p: NavbarProps) => {
      const current = parseNavbarLinks(p.navLinks).map((item) => ({
        ...item,
        target: item.target as "_self" | "_blank",
      }));
      current.push({ label: "New Link", href: "/new-page", target: "_self" });
      p.navLinks = serializeNavbarLinks(current);
    });
  };

  const removeLink = (index: number) => {
    setProp((p: NavbarProps) => {
      const current = parseNavbarLinks(p.navLinks).filter(
        (_, idx) => idx !== index,
      );
      p.navLinks = serializeNavbarLinks(
        current.map((item) => ({
          ...item,
          target: item.target as "_self" | "_blank",
        })),
      );
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Logo Text
        </label>
        <input
          value={props.logoText ?? ""}
          onChange={(e) =>
            setProp((p: NavbarProps) => (p.logoText = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Nav Links (Label|URL|same/new per line)
        </label>
        <div className="space-y-2">
          {links.map((link, idx) => (
            <div
              key={`${link.label}-${idx}`}
              className="border rounded p-2 space-y-2 bg-slate-50"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={link.label}
                  onChange={(e) => updateLink(idx, "label", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Label"
                />
                <select
                  value={link.target}
                  onChange={(e) => updateLink(idx, "target", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  value={link.href}
                  onChange={(e) => updateLink(idx, "href", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                  placeholder="URL"
                />
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="px-3 py-2 text-xs rounded bg-red-50 text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="w-full px-3 py-2 text-sm rounded bg-blue-600 text-white"
          >
            Add Nav Link
          </button>
          <details>
            <summary className="text-xs text-slate-600 cursor-pointer">
              Advanced Raw Data Editor
            </summary>
            <textarea
              value={props.navLinks ?? ""}
              onChange={(e) =>
                setProp((p: NavbarProps) => (p.navLinks = e.target.value))
              }
              rows={5}
              className="w-full mt-2 px-3 py-2 border rounded text-sm"
            />
          </details>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Background
          </label>
          <input
            type="color"
            value={props.backgroundColor ?? "#111827"}
            onChange={(e) =>
              setProp((p: NavbarProps) => (p.backgroundColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Text Color
          </label>
          <input
            type="color"
            value={props.textColor ?? "#f9fafb"}
            onChange={(e) =>
              setProp((p: NavbarProps) => (p.textColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Collapse Breakpoint (px)
        </label>
        <input
          type="number"
          min={320}
          value={props.collapseAt ?? 768}
          onChange={(e) =>
            setProp(
              (p: NavbarProps) =>
                (p.collapseAt = Number(e.target.value) || 768),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Padding
          </label>
          <input
            value={props.padding ?? "12px 16px"}
            onChange={(e) =>
              setProp((p: NavbarProps) => (p.padding = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Radius
          </label>
          <input
            value={props.borderRadius ?? "12px"}
            onChange={(e) =>
              setProp((p: NavbarProps) => (p.borderRadius = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Link Action
          </label>
          <select
            value={props.linkAction ?? "disabled"}
            onChange={(e) =>
              setProp(
                (p: NavbarProps) =>
                  (p.linkAction = e.target.value as NavbarProps["linkAction"]),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="disabled">Display Only</option>
            <option value="navigate">Navigate</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="navbar-sticky"
            type="checkbox"
            checked={Boolean(props.sticky)}
            onChange={(e) =>
              setProp((p: NavbarProps) => (p.sticky = e.target.checked))
            }
          />
          <label htmlFor="navbar-sticky" className="text-sm text-gray-700">
            Sticky Navbar
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="navbar-show-icon"
          type="checkbox"
          checked={Boolean(props.showIcon)}
          onChange={(e) =>
            setProp((p: NavbarProps) => (p.showIcon = e.target.checked))
          }
        />
        <label htmlFor="navbar-show-icon" className="text-sm text-gray-700">
          Show Logo Icon
        </label>
        <input
          value={props.iconEmoji ?? "⭐"}
          onChange={(e) =>
            setProp((p: NavbarProps) => (p.iconEmoji = e.target.value))
          }
          className="px-3 py-2 border rounded text-sm w-24"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.iconSize ?? "18px"}
          onChange={(e) =>
            setProp((p: NavbarProps) => (p.iconSize = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Icon Size"
        />
        <input
          type="color"
          value={props.iconColor ?? props.textColor ?? "#f9fafb"}
          onChange={(e) =>
            setProp((p: NavbarProps) => (p.iconColor = e.target.value))
          }
          className="w-full h-10 border rounded"
        />
        <select
          value={props.iconPosition ?? "left"}
          onChange={(e) =>
            setProp(
              (p: NavbarProps) =>
                (p.iconPosition = e.target
                  .value as NavbarProps["iconPosition"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="left">Left of Logo</option>
          <option value="right">Right of Logo</option>
        </select>
        <select
          value={props.textStyle ?? "normal"}
          onChange={(e) =>
            setProp(
              (p: NavbarProps) =>
                (p.textStyle = e.target.value as NavbarProps["textStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="normal">Normal Text</option>
          <option value="italic">Italic Text</option>
        </select>
      </div>
      <select
        value={props.fontFamily ?? "inherit"}
        onChange={(e) =>
          setProp((p: NavbarProps) => (p.fontFamily = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        {FONT_FAMILY_OPTIONS.map((font) => (
          <option key={`nav-${font}`} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
};

(Navbar as any).craft = {
  displayName: "Navbar",
  props: {
    logoText: "Institution Name",
    navLinks:
      "Home|/|same\nPrograms|/programs|same\nAdmissions|/admissions|same\nContact|/contact|same",
    backgroundColor: "#111827",
    textColor: "#f9fafb",
    padding: "12px 16px",
    borderRadius: "12px",
    showIcon: false,
    iconEmoji: "⭐",
    iconSize: "18px",
    iconColor: "#f9fafb",
    iconPosition: "left",
    fontFamily: "inherit",
    textStyle: "normal",
    linkAction: "disabled",
    sticky: false,
    collapseAt: 768,
  },
  related: {
    toolbar: NavbarSettings,
  },
};

export const Footer = createSimpleComponent("Footer", {
  subtitle: "Footer",
  description: "© 2026 Institution. All rights reserved.",
  backgroundColor: "#111827",
  textColor: "#f9fafb",
});

type BreadcrumbProps = BaseProps & {
  crumbsData?: string;
  separator?: string;
  showHome?: boolean;
  homeLabel?: string;
  homeUrl?: string;
  clickAction?: "disabled" | "navigate";
  activeColor?: string;
  linkColor?: string;
};

const parseCrumbs = (raw?: string) =>
  (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|");
      return { label: (label || "").trim(), href: (href || "#").trim() };
    })
    .filter((item) => item.label);

export const Breadcrumb = ({
  title = "Current Page",
  subtitle = "Navigation Trail",
  crumbsData = "Academics|/academics\nComputer Science|/academics/computer-science",
  separator = ">",
  showHome = true,
  homeLabel = "Home",
  homeUrl = "/",
  clickAction = "disabled",
  backgroundColor = "#f9fafb",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  activeColor = "#0f172a",
  linkColor = "#2563eb",
  padding = "12px",
  borderRadius = "12px",
}: BreadcrumbProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const crumbs = parseCrumbs(crumbsData);
  const allCrumbs = showHome
    ? [{ label: homeLabel, href: homeUrl }, ...crumbs]
    : crumbs;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {subtitle}
      </p>
      <h3 style={{ margin: "6px 0 10px", fontSize: "18px" }}>{title}</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {allCrumbs.map((item, idx) => {
          const isLast = idx === allCrumbs.length - 1;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <a
                href={item.href}
                onClick={(e) => {
                  if (clickAction !== "navigate" || isLast) e.preventDefault();
                }}
                style={{
                  textDecoration: "none",
                  color: isLast ? activeColor : linkColor,
                  fontWeight: isLast ? 700 : 500,
                  cursor: isLast ? "default" : "pointer",
                }}
              >
                {item.label}
              </a>
              {!isLast ? (
                <span style={{ color: "#94a3b8" }}>{separator}</span>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const BreadcrumbSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as BreadcrumbProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Breadcrumb Items (Label|URL per line)
        </label>
        <textarea
          value={props.crumbsData ?? ""}
          onChange={(e) =>
            setProp((p: BreadcrumbProps) => (p.crumbsData = e.target.value))
          }
          rows={4}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Separator
          </label>
          <input
            value={props.separator ?? ">"}
            onChange={(e) =>
              setProp((p: BreadcrumbProps) => (p.separator = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Click Action
          </label>
          <select
            value={props.clickAction ?? "disabled"}
            onChange={(e) =>
              setProp(
                (p: BreadcrumbProps) =>
                  (p.clickAction = e.target
                    .value as BreadcrumbProps["clickAction"]),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="disabled">Display Only</option>
            <option value="navigate">Navigate</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="breadcrumb-show-home"
          type="checkbox"
          checked={Boolean(props.showHome ?? true)}
          onChange={(e) =>
            setProp((p: BreadcrumbProps) => (p.showHome = e.target.checked))
          }
        />
        <label htmlFor="breadcrumb-show-home" className="text-sm text-gray-700">
          Show Home Item
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Home Label
          </label>
          <input
            value={props.homeLabel ?? "Home"}
            onChange={(e) =>
              setProp((p: BreadcrumbProps) => (p.homeLabel = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Home URL
          </label>
          <input
            value={props.homeUrl ?? "/"}
            onChange={(e) =>
              setProp((p: BreadcrumbProps) => (p.homeUrl = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Link Color
          </label>
          <input
            type="color"
            value={props.linkColor ?? "#2563eb"}
            onChange={(e) =>
              setProp((p: BreadcrumbProps) => (p.linkColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Active Color
          </label>
          <input
            type="color"
            value={props.activeColor ?? "#0f172a"}
            onChange={(e) =>
              setProp((p: BreadcrumbProps) => (p.activeColor = e.target.value))
            }
            className="w-full h-10 border rounded"
          />
        </div>
      </div>
      <BaseSettings />
    </div>
  );
};

(Breadcrumb as any).craft = {
  displayName: "Breadcrumb",
  props: {
    title: "Current Page",
    subtitle: "Navigation Trail",
    crumbsData:
      "Academics|/academics\nComputer Science|/academics/computer-science",
    separator: ">",
    showHome: true,
    homeLabel: "Home",
    homeUrl: "/",
    clickAction: "disabled",
    backgroundColor: "#f9fafb",
    textColor: "#111827",
    activeColor: "#0f172a",
    linkColor: "#2563eb",
    padding: "12px",
    borderRadius: "12px",
  },
  related: {
    toolbar: BreadcrumbSettings,
  },
};

type PaginationProps = BaseProps & {
  currentPage?: number;
  totalPages?: number;
  maxVisible?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  clickAction?: "disabled" | "navigate";
  linkTemplate?: string;
};

export const Pagination = ({
  title = "Page Navigation",
  subtitle = "Pagination",
  currentPage = 1,
  totalPages = 8,
  maxVisible = 5,
  showPrevNext = true,
  showFirstLast = true,
  clickAction = "disabled",
  linkTemplate = "/page/{page}",
  backgroundColor = "#f9fafb",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "12px",
  borderRadius = "12px",
  buttonColor = "#2563eb",
  buttonTextColor = "#ffffff",
  buttonHoverColor = "#1d4ed8",
}: PaginationProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [page, setPage] = React.useState(currentPage);

  React.useEffect(() => setPage(currentPage), [currentPage]);

  const buildUrl = (targetPage: number) =>
    linkTemplate.replace("{page}", String(targetPage));
  const goToPage = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page)
      return;
    setPage(targetPage);
    if (clickAction === "navigate") {
      window.location.href = buildUrl(targetPage);
    }
  };

  const half = Math.floor(maxVisible / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - maxVisible + 1));
  const end = Math.min(totalPages, start + maxVisible - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {subtitle}
      </p>
      <h3 style={{ margin: "6px 0 10px", fontSize: "18px" }}>{title}</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {showFirstLast ? (
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={page === 1}
          >
            First
          </button>
        ) : null}
        {showPrevNext ? (
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
        ) : null}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            style={{
              background: p === page ? buttonColor : "#ffffff",
              color: p === page ? buttonTextColor : textColor,
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "6px 10px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (p !== page)
                e.currentTarget.style.backgroundColor =
                  buttonHoverColor || "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              if (p !== page) e.currentTarget.style.backgroundColor = "#ffffff";
            }}
          >
            {p}
          </button>
        ))}
        {showPrevNext ? (
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        ) : null}
        {showFirstLast ? (
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </button>
        ) : null}
      </div>
    </div>
  );
};

const PaginationSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as PaginationProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Current Page
          </label>
          <input
            type="number"
            value={props.currentPage ?? 1}
            min={1}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) =>
                  (p.currentPage = Number(e.target.value) || 1),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Total Pages
          </label>
          <input
            type="number"
            value={props.totalPages ?? 8}
            min={1}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) =>
                  (p.totalPages = Number(e.target.value) || 1),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Max Visible
          </label>
          <input
            type="number"
            value={props.maxVisible ?? 5}
            min={3}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) =>
                  (p.maxVisible = Number(e.target.value) || 5),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Click Action
          </label>
          <select
            value={props.clickAction ?? "disabled"}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) =>
                  (p.clickAction = e.target
                    .value as PaginationProps["clickAction"]),
              )
            }
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="disabled">Display Only</option>
            <option value="navigate">Navigate</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          URL Template
        </label>
        <input
          value={props.linkTemplate ?? "/page/{page}"}
          onChange={(e) =>
            setProp((p: PaginationProps) => (p.linkTemplate = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div className="flex gap-4 items-center">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(props.showPrevNext ?? true)}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) => (p.showPrevNext = e.target.checked),
              )
            }
          />
          Prev/Next
        </label>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(props.showFirstLast ?? true)}
            onChange={(e) =>
              setProp(
                (p: PaginationProps) => (p.showFirstLast = e.target.checked),
              )
            }
          />
          First/Last
        </label>
      </div>
      <BaseSettings />
    </div>
  );
};

(Pagination as any).craft = {
  displayName: "Pagination",
  props: {
    title: "Page Navigation",
    subtitle: "Pagination",
    currentPage: 1,
    totalPages: 8,
    maxVisible: 5,
    showPrevNext: true,
    showFirstLast: true,
    clickAction: "disabled",
    linkTemplate: "/page/{page}",
    backgroundColor: "#f9fafb",
    textColor: "#111827",
    padding: "12px",
    borderRadius: "12px",
    buttonColor: "#2563eb",
    buttonTextColor: "#ffffff",
    buttonHoverColor: "#1d4ed8",
  },
  related: {
    toolbar: PaginationSettings,
  },
};

type DepartmentCardProps = BaseProps & {
  departmentName?: string;
  hodName?: string;
  intake?: string;
  accreditation?: string;
  highlightsData?: string;
  programsData?: string;
  detailColumns?: 1 | 2;
  listCardStyle?: "plain" | "outlined" | "soft";
  brochureUrl?: string;
  clickAction?: "disabled" | "navigate";
};

const parseSimpleLines = (raw?: string) =>
  (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const appendLine = (existing: string | undefined, line: string) => {
  const value = line.trim();
  if (!value) return existing || "";
  return [existing || "", value].filter(Boolean).join("\n");
};

const appendRow = (existing: string | undefined, columns: string[]) => {
  const row = columns.map((col) => col.trim()).join("|");
  if (!row.replace(/\|/g, "").trim()) return existing || "";
  return [existing || "", row].filter(Boolean).join("\n");
};

const QuickLineAdder = ({
  label,
  placeholder,
  onAdd,
}: {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}) => {
  const [value, setValue] = React.useState("");

  return (
    <div className="mt-2">
      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (!value.trim()) return;
            onAdd(value);
            setValue("");
          }}
          className="px-3 py-2 rounded bg-slate-900 text-white text-xs font-semibold"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const QuickRowAdder = ({
  label,
  placeholders,
  onAdd,
}: {
  label: string;
  placeholders: string[];
  onAdd: (values: string[]) => void;
}) => {
  const [values, setValues] = React.useState<string[]>(
    placeholders.map(() => ""),
  );

  return (
    <div className="mt-2">
      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {placeholders.map((placeholder, idx) => (
          <input
            key={`${placeholder}-${idx}`}
            value={values[idx] ?? ""}
            onChange={(e) =>
              setValues((prev) =>
                prev.map((value, valueIdx) =>
                  valueIdx === idx ? e.target.value : value,
                ),
              )
            }
            placeholder={placeholder}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          if (!values.some((value) => value.trim())) return;
          onAdd(values);
          setValues(placeholders.map(() => ""));
        }}
        className="mt-2 px-3 py-2 rounded bg-slate-900 text-white text-xs font-semibold"
      >
        Add Row
      </button>
    </div>
  );
};

export const DepartmentCard = ({
  subtitle = "Department",
  departmentName = "Computer Science and Engineering",
  hodName = "Dr. Priya Raman",
  intake = "180",
  accreditation = "NBA Accredited",
  highlightsData = "Industry-led curriculum\nModern research labs\nStrong placement support",
  programsData = "B.Tech CSE\nM.Tech AI\nPhD Research",
  detailColumns = 2,
  listCardStyle = "outlined",
  brochureUrl = "/brochures/cse.pdf",
  clickAction = "disabled",
  backgroundColor = "#ecfeff",
  textColor = "#0f172a",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: DepartmentCardProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const highlights = parseSimpleLines(highlightsData);
  const programs = parseSimpleLines(programsData);
  const detailColumnsClass =
    detailColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const listItemClass =
    listCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-cyan-50/70 border border-cyan-100"
      : listCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(15,23,42,0.12)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-3">{departmentName}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200">
          HOD: {hodName}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200">
          Intake: {intake}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200">
          {accreditation}
        </span>
      </div>
      <div className={`grid ${detailColumnsClass} gap-3 text-sm`}>
        <div>
          <p className="font-semibold mb-1">Highlights</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {highlights.map((item, idx) => (
              <li key={`h-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Programs</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {programs.map((item, idx) => (
              <li key={`p-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={brochureUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          Download Brochure
        </a>
      </div>
    </div>
  );
};

const DepartmentCardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as DepartmentCardProps }));

  const highlightItems = parseSimpleLines(props.highlightsData);
  const programItems = parseSimpleLines(props.programsData);

  const updateHighlightItem = (index: number, value: string) => {
    setProp((p: DepartmentCardProps) => {
      const items = parseSimpleLines(p.highlightsData);
      if (!items[index]) return;
      items[index] = value;
      p.highlightsData = items.join("\n");
    });
  };

  const removeHighlightItem = (index: number) => {
    setProp((p: DepartmentCardProps) => {
      const items = parseSimpleLines(p.highlightsData);
      p.highlightsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  const updateProgramItem = (index: number, value: string) => {
    setProp((p: DepartmentCardProps) => {
      const items = parseSimpleLines(p.programsData);
      if (!items[index]) return;
      items[index] = value;
      p.programsData = items.join("\n");
    });
  };

  const removeProgramItem = (index: number) => {
    setProp((p: DepartmentCardProps) => {
      const items = parseSimpleLines(p.programsData);
      p.programsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Department Name
        </label>
        <input
          value={props.departmentName ?? ""}
          onChange={(e) =>
            setProp(
              (p: DepartmentCardProps) => (p.departmentName = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.hodName ?? ""}
          onChange={(e) =>
            setProp((p: DepartmentCardProps) => (p.hodName = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="HOD Name"
        />
        <input
          value={props.intake ?? ""}
          onChange={(e) =>
            setProp((p: DepartmentCardProps) => (p.intake = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Intake"
        />
      </div>
      <input
        value={props.accreditation ?? ""}
        onChange={(e) =>
          setProp(
            (p: DepartmentCardProps) => (p.accreditation = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Accreditation"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.detailColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: DepartmentCardProps) =>
                (p.detailColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.listCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: DepartmentCardProps) =>
                (p.listCardStyle = e.target
                  .value as DepartmentCardProps["listCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Highlights</p>
        {highlightItems.map((item, idx) => (
          <div
            key={`highlight-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateHighlightItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeHighlightItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Highlight"
          placeholder="Industry internships"
          onAdd={(value) =>
            setProp(
              (p: DepartmentCardProps) =>
                (p.highlightsData = appendLine(p.highlightsData, value)),
            )
          }
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Programs</p>
        {programItems.map((item, idx) => (
          <div
            key={`program-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateProgramItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeProgramItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Program"
          placeholder="M.Tech Robotics"
          onAdd={(value) =>
            setProp(
              (p: DepartmentCardProps) =>
                (p.programsData = appendLine(p.programsData, value)),
            )
          }
        />
      </div>
      <input
        value={props.brochureUrl ?? ""}
        onChange={(e) =>
          setProp((p: DepartmentCardProps) => (p.brochureUrl = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Brochure URL"
      />
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: DepartmentCardProps) =>
              (p.clickAction = e.target
                .value as DepartmentCardProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(DepartmentCard as any).craft = {
  displayName: "DepartmentCard",
  props: {
    subtitle: "Department",
    departmentName: "Computer Science and Engineering",
    hodName: "Dr. Priya Raman",
    intake: "180",
    accreditation: "NBA Accredited",
    highlightsData:
      "Industry-led curriculum\nModern research labs\nStrong placement support",
    programsData: "B.Tech CSE\nM.Tech AI\nPhD Research",
    detailColumns: 2,
    listCardStyle: "outlined",
    brochureUrl: "/brochures/cse.pdf",
    clickAction: "disabled",
    backgroundColor: "#ecfeff",
    textColor: "#0f172a",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: DepartmentCardSettings,
  },
};

type FacultyProfileProps = BaseProps & {
  facultyName?: string;
  designation?: string;
  department?: string;
  experienceYears?: string;
  qualificationsData?: string;
  specialtiesData?: string;
  detailColumns?: 1 | 2;
  listCardStyle?: "plain" | "outlined" | "soft";
  office?: string;
  email?: string;
  profileUrl?: string;
  actionLabel?: string;
  clickAction?: "disabled" | "navigate";
};

const getInitials = (name?: string) =>
  (name || "FP")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const parseDelimitedRows = (raw?: string, delimiter = "|") =>
  parseSimpleLines(raw).map((line, idx) => {
    const parts = line.split(delimiter).map((part) => part.trim());
    return { id: `${idx}-${parts[0] || "row"}`, parts };
  });

export const FacultyProfile = ({
  facultyName = "Dr. Priya Raman",
  designation = "Professor",
  department = "Computer Science and Engineering",
  experienceYears = "15+ years",
  qualificationsData = "Ph.D. in Computer Science\nM.Tech CSE\nB.E. Information Technology",
  specialtiesData = "Machine Learning\nData Mining\nCurriculum Design",
  detailColumns = 2,
  listCardStyle = "outlined",
  office = "Block A, Room 312",
  email = "priya.roman@college.edu",
  profileUrl = "/faculty/priya-raman",
  actionLabel = "View Profile",
  clickAction = "disabled",
  backgroundColor = "#f5f3ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: FacultyProfileProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const qualifications = parseSimpleLines(qualificationsData);
  const specialties = parseSimpleLines(specialtiesData);
  const detailColumnsClass =
    detailColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const listItemClass =
    listCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-violet-50/70 border border-violet-100"
      : listCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
          {getInitials(facultyName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
            {designation}
          </p>
          <h3 className="text-xl font-bold mt-1 mb-1">{facultyName}</h3>
          <p className="text-sm text-slate-600 m-0">{department}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
              Experience: {experienceYears}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
              Office: {office}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/70 border border-slate-200">
              {email}
            </span>
          </div>
        </div>
      </div>
      <div className={`grid ${detailColumnsClass} gap-3 mt-4 text-sm`}>
        <div>
          <p className="font-semibold mb-1">Qualifications</p>
          <ul className="m-0 p-0 list-none space-y-1">
            {qualifications.map((item, idx) => (
              <li key={`qual-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Specialties</p>
          <ul className="m-0 p-0 list-none space-y-1">
            {specialties.map((item, idx) => (
              <li key={`spec-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={profileUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

const FacultyProfileSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FacultyProfileProps }));

  const qualificationItems = parseSimpleLines(props.qualificationsData);
  const specialtyItems = parseSimpleLines(props.specialtiesData);

  const updateQualificationItem = (index: number, value: string) => {
    setProp((p: FacultyProfileProps) => {
      const items = parseSimpleLines(p.qualificationsData);
      if (!items[index]) return;
      items[index] = value;
      p.qualificationsData = items.join("\n");
    });
  };

  const removeQualificationItem = (index: number) => {
    setProp((p: FacultyProfileProps) => {
      const items = parseSimpleLines(p.qualificationsData);
      p.qualificationsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  const updateSpecialtyItem = (index: number, value: string) => {
    setProp((p: FacultyProfileProps) => {
      const items = parseSimpleLines(p.specialtiesData);
      if (!items[index]) return;
      items[index] = value;
      p.specialtiesData = items.join("\n");
    });
  };

  const removeSpecialtyItem = (index: number) => {
    setProp((p: FacultyProfileProps) => {
      const items = parseSimpleLines(p.specialtiesData);
      p.specialtiesData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.facultyName ?? ""}
        onChange={(e) =>
          setProp((p: FacultyProfileProps) => (p.facultyName = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Faculty Name"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.designation ?? ""}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) => (p.designation = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Designation"
        />
        <input
          value={props.department ?? ""}
          onChange={(e) =>
            setProp((p: FacultyProfileProps) => (p.department = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Department"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.experienceYears ?? ""}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) => (p.experienceYears = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Experience"
        />
        <input
          value={props.office ?? ""}
          onChange={(e) =>
            setProp((p: FacultyProfileProps) => (p.office = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Office"
        />
      </div>
      <input
        value={props.email ?? ""}
        onChange={(e) =>
          setProp((p: FacultyProfileProps) => (p.email = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Email"
      />
      <input
        value={props.profileUrl ?? ""}
        onChange={(e) =>
          setProp((p: FacultyProfileProps) => (p.profileUrl = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Profile URL"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.detailColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) =>
                (p.detailColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.listCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) =>
                (p.listCardStyle = e.target
                  .value as FacultyProfileProps["listCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">
          Qualifications
        </p>
        {qualificationItems.map((item, idx) => (
          <div
            key={`qualification-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateQualificationItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeQualificationItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Qualification"
          placeholder="UGC-NET Qualified"
          onAdd={(value) =>
            setProp(
              (p: FacultyProfileProps) =>
                (p.qualificationsData = appendLine(
                  p.qualificationsData,
                  value,
                )),
            )
          }
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Specialties</p>
        {specialtyItems.map((item, idx) => (
          <div
            key={`specialty-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateSpecialtyItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeSpecialtyItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Specialty"
          placeholder="Cyber Security"
          onAdd={(value) =>
            setProp(
              (p: FacultyProfileProps) =>
                (p.specialtiesData = appendLine(p.specialtiesData, value)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.actionLabel ?? ""}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) => (p.actionLabel = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action Label"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: FacultyProfileProps) =>
                (p.clickAction = e.target
                  .value as FacultyProfileProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(FacultyProfile as any).craft = {
  displayName: "FacultyProfile",
  props: {
    facultyName: "Dr. Priya Raman",
    designation: "Professor",
    department: "Computer Science and Engineering",
    experienceYears: "15+ years",
    qualificationsData:
      "Ph.D. in Computer Science\nM.Tech CSE\nB.E. Information Technology",
    specialtiesData: "Machine Learning\nData Mining\nCurriculum Design",
    detailColumns: 2,
    listCardStyle: "outlined",
    office: "Block A, Room 312",
    email: "priya.roman@college.edu",
    profileUrl: "/faculty/priya-raman",
    actionLabel: "View Profile",
    clickAction: "disabled",
    backgroundColor: "#f5f3ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: FacultyProfileSettings,
  },
};

type CourseListProps = BaseProps & {
  semester?: string;
  courseRowsData?: string;
  curriculumUrl?: string;
  showCredits?: boolean;
  clickAction?: "disabled" | "navigate";
};

export const CourseList = ({
  title = "Curriculum",
  subtitle = "Semester 4",
  description = "Core and elective courses for the current term.",
  courseRowsData = "CS401|Data Structures|4|Core\nCS402|Operating Systems|4|Core\nCS403|Database Systems|3|Lab",
  curriculumUrl = "/curriculum",
  showCredits = true,
  clickAction = "disabled",
  backgroundColor = "#f0f9ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: CourseListProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const courses = parseDelimitedRows(courseRowsData);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 m-0">{description}</p>
      <div className="mt-4 space-y-3">
        {courses.map((course) => {
          const [code = "", name = "Course", credits = "", type = ""] =
            course.parts;
          return (
            <div
              key={course.id}
              className="rounded-lg bg-white/80 border border-slate-200 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 m-0">{code}</p>
                  <p className="font-semibold m-0">{name}</p>
                </div>
                {showCredits ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-900 text-white">
                    {credits} Credits
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {type ? (
                  <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    {type}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <a
          href={curriculumUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          View Curriculum
        </a>
      </div>
    </div>
  );
};

const CourseListSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as CourseListProps }));

  const courseItems = parseDelimitedRows(props.courseRowsData);

  const updateCourseItem = (
    index: number,
    key: 0 | 1 | 2 | 3,
    nextValue: string,
  ) => {
    setProp((p: CourseListProps) => {
      const rows = parseDelimitedRows(p.courseRowsData);
      if (!rows[index]) return;
      rows[index].parts[key] = nextValue;
      p.courseRowsData = rows.map((row) => row.parts.join("|")).join("\n");
    });
  };

  const removeCourseItem = (index: number) => {
    setProp((p: CourseListProps) => {
      const rows = parseDelimitedRows(p.courseRowsData);
      p.courseRowsData = rows
        .filter((_, idx) => idx !== index)
        .map((row) => row.parts.join("|"))
        .join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: CourseListProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.subtitle ?? ""}
          onChange={(e) =>
            setProp((p: CourseListProps) => (p.subtitle = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Semester"
        />
        <select
          value={props.showCredits ? "yes" : "no"}
          onChange={(e) =>
            setProp(
              (p: CourseListProps) =>
                (p.showCredits = e.target.value === "yes"),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="yes">Show Credits</option>
          <option value="no">Hide Credits</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Course Rows (Code|Name|Credits|Type)
        </label>
        <textarea
          value={props.courseRowsData ?? ""}
          onChange={(e) =>
            setProp((p: CourseListProps) => (p.courseRowsData = e.target.value))
          }
          rows={6}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60 mt-2">
          <p className="text-xs font-semibold text-gray-600 m-0">Courses</p>
          {courseItems.map((course, idx) => (
            <div
              key={course.id}
              className="space-y-2 border border-slate-200 rounded p-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={course.parts[0] ?? ""}
                  onChange={(e) => updateCourseItem(idx, 0, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Code"
                />
                <input
                  value={course.parts[1] ?? ""}
                  onChange={(e) => updateCourseItem(idx, 1, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Course Name"
                />
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  value={course.parts[2] ?? ""}
                  onChange={(e) => updateCourseItem(idx, 2, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Credits"
                />
                <input
                  value={course.parts[3] ?? ""}
                  onChange={(e) => updateCourseItem(idx, 3, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="Type"
                />
                <button
                  type="button"
                  onClick={() => removeCourseItem(idx)}
                  className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <QuickRowAdder
          label="Quick Add Course"
          placeholders={["Code", "Course Name", "Credits", "Type"]}
          onAdd={(values) =>
            setProp(
              (p: CourseListProps) =>
                (p.courseRowsData = appendRow(p.courseRowsData, values)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.curriculumUrl ?? ""}
          onChange={(e) =>
            setProp((p: CourseListProps) => (p.curriculumUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Curriculum URL"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: CourseListProps) =>
                (p.clickAction = e.target
                  .value as CourseListProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(CourseList as any).craft = {
  displayName: "CourseList",
  props: {
    title: "Curriculum",
    subtitle: "Semester 4",
    description: "Core and elective courses for the current term.",
    courseRowsData:
      "CS401|Data Structures|4|Core\nCS402|Operating Systems|4|Core\nCS403|Database Systems|3|Lab",
    curriculumUrl: "/curriculum",
    showCredits: true,
    clickAction: "disabled",
    backgroundColor: "#f0f9ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: CourseListSettings,
  },
};

type EventCalendarProps = BaseProps & {
  eventsData?: string;
  eventColumns?: 1 | 2;
  cardStyle?: "plain" | "outlined" | "soft";
  showPastEvents?: boolean;
  clickAction?: "disabled" | "navigate";
};

const parseEvents = (raw?: string) =>
  (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const [date, title, location, mode, url] = line.split("|");
      return {
        id: `${idx}-${title || "event"}`,
        date: (date || "").trim(),
        title: (title || "Event").trim(),
        location: (location || "Campus").trim(),
        mode: (mode || "offline").trim(),
        url: (url || "#").trim(),
      };
    });

export const EventCalendar = ({
  subtitle = "Calendar",
  eventsData = "2026-06-20|Tech Fest|Main Auditorium|offline|/events/tech-fest\n2026-07-05|Alumni Meet|Seminar Hall|hybrid|/events/alumni-meet\n2026-08-12|Hackathon|Innovation Lab|offline|/events/hackathon",
  eventColumns = 1,
  cardStyle = "outlined",
  showPastEvents = false,
  clickAction = "disabled",
  backgroundColor = "#f0fdf4",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: EventCalendarProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const now = new Date();
  const events = parseEvents(eventsData)
    .map((event) => ({
      ...event,
      timeValue: Number.isNaN(Date.parse(event.date))
        ? 0
        : Date.parse(event.date),
    }))
    .filter((event) => {
      if (showPastEvents) return true;
      return event.timeValue >= new Date(now.toDateString()).getTime();
    })
    .sort((a, b) => a.timeValue - b.timeValue);
  const eventColumnClass =
    eventColumns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2";
  const eventItemClass =
    cardStyle === "soft"
      ? "block rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2"
      : cardStyle === "plain"
        ? "block rounded-lg border border-transparent bg-transparent px-3 py-2"
        : "block rounded-lg border border-slate-200 bg-white px-3 py-2";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-3">Upcoming Events</h3>
      <div className={eventColumnClass}>
        {events.map((event) => (
          <a
            key={event.id}
            href={event.url}
            onClick={(e) => {
              if (clickAction !== "navigate") e.preventDefault();
            }}
            className={eventItemClass}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm m-0">{event.title}</p>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 capitalize">
                {event.mode}
              </span>
            </div>
            <p className="text-xs text-slate-600 m-0 mt-1">
              {event.date} • {event.location}
            </p>
          </a>
        ))}
        {events.length === 0 ? (
          <p className="text-sm text-slate-500 m-0">No events to show.</p>
        ) : null}
      </div>
    </div>
  );
};

const EventCalendarSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as EventCalendarProps }));

  const eventRows = parseEvents(props.eventsData);

  const updateEvent = (index: number, values: string[]) => {
    setProp((p: EventCalendarProps) => {
      const rows = parseEvents(p.eventsData).map((event) => [
        event.date,
        event.title,
        event.location,
        event.mode,
        event.url,
      ]);
      if (!rows[index]) return;
      rows[index] = values;
      p.eventsData = rows.map((row) => row.join("|")).join("\n");
    });
  };

  const removeEvent = (index: number) => {
    setProp((p: EventCalendarProps) => {
      const rows = parseEvents(p.eventsData).map((event) => [
        event.date,
        event.title,
        event.location,
        event.mode,
        event.url,
      ]);
      p.eventsData = rows
        .filter((_, idx) => idx !== index)
        .map((row) => row.join("|"))
        .join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Events (Date|Title|Location|Mode|URL)
        </label>
        <textarea
          value={props.eventsData ?? ""}
          onChange={(e) =>
            setProp((p: EventCalendarProps) => (p.eventsData = e.target.value))
          }
          rows={8}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <QuickRowAdder
          label="Quick Add Event"
          placeholders={["Date", "Title", "Location", "Mode", "URL"]}
          onAdd={(values) =>
            setProp(
              (p: EventCalendarProps) =>
                (p.eventsData = appendRow(p.eventsData, values)),
            )
          }
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Event Rows</p>
        {eventRows.map((event, idx) => (
          <div
            key={event.id}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                value={event.date}
                onChange={(e) =>
                  updateEvent(
                    idx,
                    [
                      event.date,
                      event.title,
                      event.location,
                      event.mode,
                      event.url,
                    ].map((value, valueIdx) =>
                      valueIdx === 0 ? e.target.value : value,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Date"
              />
              <input
                value={event.title}
                onChange={(e) =>
                  updateEvent(
                    idx,
                    [
                      event.date,
                      event.title,
                      event.location,
                      event.mode,
                      event.url,
                    ].map((value, valueIdx) =>
                      valueIdx === 1 ? e.target.value : value,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={event.location}
                onChange={(e) =>
                  updateEvent(
                    idx,
                    [
                      event.date,
                      event.title,
                      event.location,
                      event.mode,
                      event.url,
                    ].map((value, valueIdx) =>
                      valueIdx === 2 ? e.target.value : value,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Location"
              />
              <input
                value={event.mode}
                onChange={(e) =>
                  updateEvent(
                    idx,
                    [
                      event.date,
                      event.title,
                      event.location,
                      event.mode,
                      event.url,
                    ].map((value, valueIdx) =>
                      valueIdx === 3 ? e.target.value : value,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Mode"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={event.url}
                onChange={(e) =>
                  updateEvent(
                    idx,
                    [
                      event.date,
                      event.title,
                      event.location,
                      event.mode,
                      event.url,
                    ].map((value, valueIdx) =>
                      valueIdx === 4 ? e.target.value : value,
                    ),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="URL"
              />
              <button
                type="button"
                onClick={() => removeEvent(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.eventColumns ?? 1}
          onChange={(e) =>
            setProp(
              (p: EventCalendarProps) =>
                (p.eventColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.cardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: EventCalendarProps) =>
                (p.cardStyle = e.target
                  .value as EventCalendarProps["cardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <label className="text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(props.showPastEvents)}
          onChange={(e) =>
            setProp(
              (p: EventCalendarProps) => (p.showPastEvents = e.target.checked),
            )
          }
        />
        Show Past Events
      </label>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: EventCalendarProps) =>
              (p.clickAction = e.target
                .value as EventCalendarProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(EventCalendar as any).craft = {
  displayName: "EventCalendar",
  props: {
    subtitle: "Calendar",
    eventsData:
      "2026-06-20|Tech Fest|Main Auditorium|offline|/events/tech-fest\n2026-07-05|Alumni Meet|Seminar Hall|hybrid|/events/alumni-meet\n2026-08-12|Hackathon|Innovation Lab|offline|/events/hackathon",
    eventColumns: 1,
    cardStyle: "outlined",
    showPastEvents: false,
    clickAction: "disabled",
    backgroundColor: "#f0fdf4",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: EventCalendarSettings,
  },
};

type AdmissionFormProps = BaseProps & {
  admissionMode?: "online" | "offline";
  intakeYear?: string;
  deadline?: string;
  applicationUrl?: string;
  seatsAvailable?: string;
  programOptionsData?: string;
  requiredDocumentsData?: string;
  processStepsData?: string;
  note?: string;
  clickAction?: "disabled" | "navigate";
};

export const AdmissionForm = ({
  subtitle = "Apply Now",
  title = "Admissions 2026",
  admissionMode = "online",
  intakeYear = "2026-27",
  deadline = "2026-05-15",
  applicationUrl = "/apply",
  seatsAvailable = "180",
  programOptionsData = "B.Tech CSE\nB.Tech AI\nM.Tech Data Science",
  requiredDocumentsData = "10th Marksheet\n12th Marksheet\nPassport Photo\nID Proof",
  processStepsData = "Fill application\nUpload documents\nPay fee\nDownload acknowledgement",
  note = "Shortlisted applicants will be contacted by email.",
  clickAction = "disabled",
  backgroundColor = "#fff7ed",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: AdmissionFormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const programs = parseSimpleLines(programOptionsData);
  const docs = parseSimpleLines(requiredDocumentsData);
  const steps = parseSimpleLines(processStepsData);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200 uppercase tracking-[0.12em]">
          {admissionMode}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200">
          Intake {intakeYear}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-slate-200">
          Seats {seatsAvailable}
        </span>
      </div>
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-2xl font-bold mt-1 mb-3">{title}</h3>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="font-semibold mb-1">Programs</p>
          <ul className="list-disc pl-5 m-0 space-y-1">
            {programs.map((item, idx) => (
              <li key={`prog-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Required Documents</p>
          <ul className="list-disc pl-5 m-0 space-y-1">
            {docs.map((item, idx) => (
              <li key={`doc-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Process</p>
          <ol className="list-decimal pl-5 m-0 space-y-1">
            {steps.map((item, idx) => (
              <li key={`step-${idx}`}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={applicationUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          Apply Now
        </a>
        <span className="text-xs text-slate-500">Deadline: {deadline}</span>
      </div>
      {note ? <p className="mt-3 text-xs text-slate-600">{note}</p> : null}
    </div>
  );
};

const AdmissionFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as AdmissionFormProps }));

  const programItems = parseSimpleLines(props.programOptionsData);
  const documentItems = parseSimpleLines(props.requiredDocumentsData);
  const processItems = parseSimpleLines(props.processStepsData);

  const updateLineItem = (
    key: "programOptionsData" | "requiredDocumentsData" | "processStepsData",
    index: number,
    value: string,
  ) => {
    setProp((p: AdmissionFormProps) => {
      const items = parseSimpleLines(p[key]);
      if (!items[index]) return;
      items[index] = value;
      p[key] = items.join("\n");
    });
  };

  const removeLineItem = (
    key: "programOptionsData" | "requiredDocumentsData" | "processStepsData",
    index: number,
  ) => {
    setProp((p: AdmissionFormProps) => {
      const items = parseSimpleLines(p[key]);
      p[key] = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.title ?? ""}
          onChange={(e) =>
            setProp((p: AdmissionFormProps) => (p.title = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Title"
        />
        <select
          value={props.admissionMode ?? "online"}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.admissionMode = e.target
                  .value as AdmissionFormProps["admissionMode"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.intakeYear ?? ""}
          onChange={(e) =>
            setProp((p: AdmissionFormProps) => (p.intakeYear = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Intake Year"
        />
        <input
          type="date"
          value={props.deadline ?? ""}
          onChange={(e) =>
            setProp((p: AdmissionFormProps) => (p.deadline = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.seatsAvailable ?? ""}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) => (p.seatsAvailable = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Seats Available"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.clickAction = e.target
                  .value as AdmissionFormProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <input
        value={props.applicationUrl ?? ""}
        onChange={(e) =>
          setProp(
            (p: AdmissionFormProps) => (p.applicationUrl = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Application URL"
      />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Program Options (one per line)
        </label>
        <textarea
          value={props.programOptionsData ?? ""}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.programOptionsData = e.target.value),
            )
          }
          rows={3}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60 mt-2">
          <p className="text-xs font-semibold text-gray-600 m-0">Programs</p>
          {programItems.map((item, idx) => (
            <div
              key={`program-item-${idx}`}
              className="grid grid-cols-[1fr_auto] gap-2"
            >
              <input
                value={item}
                onChange={(e) =>
                  updateLineItem("programOptionsData", idx, e.target.value)
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <button
                type="button"
                onClick={() => removeLineItem("programOptionsData", idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <QuickLineAdder
          label="Quick Add Program"
          placeholder="B.Tech AI"
          onAdd={(value) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.programOptionsData = appendLine(
                  p.programOptionsData,
                  value,
                )),
            )
          }
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Required Documents (one per line)
        </label>
        <textarea
          value={props.requiredDocumentsData ?? ""}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.requiredDocumentsData = e.target.value),
            )
          }
          rows={3}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60 mt-2">
          <p className="text-xs font-semibold text-gray-600 m-0">Documents</p>
          {documentItems.map((item, idx) => (
            <div
              key={`document-item-${idx}`}
              className="grid grid-cols-[1fr_auto] gap-2"
            >
              <input
                value={item}
                onChange={(e) =>
                  updateLineItem("requiredDocumentsData", idx, e.target.value)
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <button
                type="button"
                onClick={() => removeLineItem("requiredDocumentsData", idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <QuickLineAdder
          label="Quick Add Document"
          placeholder="Transfer Certificate"
          onAdd={(value) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.requiredDocumentsData = appendLine(
                  p.requiredDocumentsData,
                  value,
                )),
            )
          }
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Process Steps (one per line)
        </label>
        <textarea
          value={props.processStepsData ?? ""}
          onChange={(e) =>
            setProp(
              (p: AdmissionFormProps) => (p.processStepsData = e.target.value),
            )
          }
          rows={4}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60 mt-2">
          <p className="text-xs font-semibold text-gray-600 m-0">
            Process Steps
          </p>
          {processItems.map((item, idx) => (
            <div
              key={`process-item-${idx}`}
              className="grid grid-cols-[1fr_auto] gap-2"
            >
              <input
                value={item}
                onChange={(e) =>
                  updateLineItem("processStepsData", idx, e.target.value)
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <button
                type="button"
                onClick={() => removeLineItem("processStepsData", idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <QuickLineAdder
          label="Quick Add Step"
          placeholder="Verify documents"
          onAdd={(value) =>
            setProp(
              (p: AdmissionFormProps) =>
                (p.processStepsData = appendLine(p.processStepsData, value)),
            )
          }
        />
      </div>
      <textarea
        value={props.note ?? ""}
        onChange={(e) =>
          setProp((p: AdmissionFormProps) => (p.note = e.target.value))
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Note"
      />
      <BaseSettings />
    </div>
  );
};

(AdmissionForm as any).craft = {
  displayName: "AdmissionForm",
  props: {
    subtitle: "Apply Now",
    title: "Admissions 2026",
    admissionMode: "online",
    intakeYear: "2026-27",
    deadline: "2026-05-15",
    applicationUrl: "/apply",
    seatsAvailable: "180",
    programOptionsData: "B.Tech CSE\nB.Tech AI\nM.Tech Data Science",
    requiredDocumentsData:
      "10th Marksheet\n12th Marksheet\nPassport Photo\nID Proof",
    processStepsData:
      "Fill application\nUpload documents\nPay fee\nDownload acknowledgement",
    note: "Shortlisted applicants will be contacted by email.",
    clickAction: "disabled",
    backgroundColor: "#fff7ed",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: AdmissionFormSettings,
  },
};

type AnnouncementBannerProps = BaseProps & {
  announcementText?: string;
  tone?: "info" | "success" | "warning" | "urgent";
  showDismiss?: boolean;
  showTimestamp?: boolean;
  timestampText?: string;
  actionText?: string;
  actionUrl?: string;
  actionTarget?: "same" | "new";
  clickAction?: "disabled" | "navigate";
};

export const AnnouncementBanner = ({
  subtitle = "Announcement",
  announcementText = "Admissions open for 2026.",
  tone = "info",
  showDismiss = true,
  showTimestamp = true,
  timestampText = "Updated 2 hours ago",
  actionText = "Read More",
  actionUrl = "/announcements/admissions-2026",
  actionTarget = "same",
  clickAction = "disabled",
  backgroundColor = "#fef9c3",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  borderRadius = "12px",
  padding = "12px 14px",
}: AnnouncementBannerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    setDismissed(false);
  }, [announcementText, tone]);

  if (dismissed) return null;

  const toneStyles: Record<
    NonNullable<AnnouncementBannerProps["tone"]>,
    string
  > = {
    info: "bg-sky-100 text-sky-800 border-sky-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    urgent: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        borderRadius,
        padding,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
      className="flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full border ${toneStyles[tone]}`}
          >
            {tone.toUpperCase()}
          </span>
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500 m-0">
            {subtitle}
          </p>
        </div>
        <p className="text-sm font-medium m-0 break-words">
          {announcementText}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {showTimestamp ? (
            <span className="text-xs text-slate-500">{timestampText}</span>
          ) : null}
          {actionText ? (
            <a
              href={actionUrl}
              target={actionTarget === "new" ? "_blank" : "_self"}
              rel={actionTarget === "new" ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (clickAction !== "navigate") e.preventDefault();
              }}
              className="text-xs font-semibold underline"
            >
              {actionText}
            </a>
          ) : null}
        </div>
      </div>
      {showDismiss ? (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-md px-2 py-1 text-xs border border-slate-300"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
};

const AnnouncementBannerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as AnnouncementBannerProps,
  }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <textarea
        value={props.announcementText ?? ""}
        onChange={(e) =>
          setProp(
            (p: AnnouncementBannerProps) =>
              (p.announcementText = e.target.value),
          )
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Announcement text"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.tone ?? "info"}
          onChange={(e) =>
            setProp(
              (p: AnnouncementBannerProps) =>
                (p.tone = e.target.value as AnnouncementBannerProps["tone"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: AnnouncementBannerProps) =>
                (p.clickAction = e.target
                  .value as AnnouncementBannerProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(props.showDismiss)}
            onChange={(e) =>
              setProp(
                (p: AnnouncementBannerProps) =>
                  (p.showDismiss = e.target.checked),
              )
            }
          />
          Show Dismiss
        </label>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(props.showTimestamp)}
            onChange={(e) =>
              setProp(
                (p: AnnouncementBannerProps) =>
                  (p.showTimestamp = e.target.checked),
              )
            }
          />
          Show Timestamp
        </label>
      </div>
      <input
        value={props.timestampText ?? ""}
        onChange={(e) =>
          setProp(
            (p: AnnouncementBannerProps) => (p.timestampText = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Timestamp text"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.actionText ?? ""}
          onChange={(e) =>
            setProp(
              (p: AnnouncementBannerProps) => (p.actionText = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action text"
        />
        <select
          value={props.actionTarget ?? "same"}
          onChange={(e) =>
            setProp(
              (p: AnnouncementBannerProps) =>
                (p.actionTarget = e.target
                  .value as AnnouncementBannerProps["actionTarget"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="same">Same Tab</option>
          <option value="new">New Tab</option>
        </select>
      </div>
      <input
        value={props.actionUrl ?? ""}
        onChange={(e) =>
          setProp(
            (p: AnnouncementBannerProps) => (p.actionUrl = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Action URL"
      />
      <BaseSettings />
    </div>
  );
};

(AnnouncementBanner as any).craft = {
  displayName: "AnnouncementBanner",
  props: {
    subtitle: "Announcement",
    announcementText: "Admissions open for 2026.",
    tone: "info",
    showDismiss: true,
    showTimestamp: true,
    timestampText: "Updated 2 hours ago",
    actionText: "Read More",
    actionUrl: "/announcements/admissions-2026",
    actionTarget: "same",
    clickAction: "disabled",
    backgroundColor: "#fef9c3",
    textColor: "#111827",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  related: {
    toolbar: AnnouncementBannerSettings,
  },
};

type PlacementStatsProps = BaseProps & {
  statsData?: string;
  recruitersData?: string;
  placementYear?: string;
  reportUrl?: string;
  clickAction?: "disabled" | "navigate";
};

const parseStats = (raw?: string) =>
  parseSimpleLines(raw).map((line, idx) => {
    const [label, value, trend] = line.split("|");
    return {
      id: `${idx}-${label || "stat"}`,
      label: (label || "Stat").trim(),
      value: (value || "").trim(),
      trend: (trend || "").trim(),
    };
  });

export const PlacementStats = ({
  subtitle = "Career Outcomes",
  title = "Placement Highlights",
  statsData = "Highest Package|18 LPA|+12%\nAverage Package|6.5 LPA|+8%\nPlacement Rate|92%|+4%",
  recruitersData = "Google\nTCS\nInfosys\nWipro\nAmazon",
  placementYear = "2026",
  reportUrl = "/placement-report",
  clickAction = "disabled",
  backgroundColor = "#ecfccb",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: PlacementStatsProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const stats = parseStats(statsData);
  const recruiters = parseSimpleLines(recruitersData);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle} {placementYear}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-3">{title}</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-lg bg-white/75 border border-slate-200 p-3"
          >
            <p className="text-xs text-slate-500 m-0">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-lg font-bold m-0">{stat.value}</p>
              {stat.trend ? (
                <span className="text-xs text-emerald-600 font-semibold">
                  {stat.trend}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold mb-2">Top Recruiters</p>
        <div className="flex flex-wrap gap-2">
          {recruiters.map((company, idx) => (
            <span
              key={`${company}-${idx}`}
              className="text-xs px-2 py-1 rounded-full bg-white/75 border border-slate-200"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <a
          href={reportUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          View Full Report
        </a>
      </div>
    </div>
  );
};

const PlacementStatsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as PlacementStatsProps }));

  const statItems = parseStats(props.statsData);
  const recruiterItems = parseSimpleLines(props.recruitersData);

  const updateStatItem = (
    index: number,
    key: "label" | "value" | "trend",
    nextValue: string,
  ) => {
    setProp((p: PlacementStatsProps) => {
      const rows = parseStats(p.statsData).map((stat) => ({
        label: stat.label,
        value: stat.value,
        trend: stat.trend,
      }));
      if (!rows[index]) return;
      rows[index][key] = nextValue;
      p.statsData = rows
        .map((row) => [row.label, row.value, row.trend].join("|"))
        .join("\n");
    });
  };

  const removeStatItem = (index: number) => {
    setProp((p: PlacementStatsProps) => {
      const rows = parseStats(p.statsData).map((stat) => ({
        label: stat.label,
        value: stat.value,
        trend: stat.trend,
      }));
      p.statsData = rows
        .filter((_, idx) => idx !== index)
        .map((row) => [row.label, row.value, row.trend].join("|"))
        .join("\n");
    });
  };

  const updateRecruiterItem = (index: number, value: string) => {
    setProp((p: PlacementStatsProps) => {
      const items = parseSimpleLines(p.recruitersData);
      if (!items[index]) return;
      items[index] = value;
      p.recruitersData = items.join("\n");
    });
  };

  const removeRecruiterItem = (index: number) => {
    setProp((p: PlacementStatsProps) => {
      const items = parseSimpleLines(p.recruitersData);
      p.recruitersData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: PlacementStatsProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <input
        value={props.placementYear ?? ""}
        onChange={(e) =>
          setProp(
            (p: PlacementStatsProps) => (p.placementYear = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Placement Year"
      />
      <textarea
        value={props.statsData ?? ""}
        onChange={(e) =>
          setProp((p: PlacementStatsProps) => (p.statsData = e.target.value))
        }
        rows={4}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Stats (Label|Value|Trend)"
      />
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Stats</p>
        {statItems.map((item, idx) => (
          <div
            key={item.id}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.label}
                onChange={(e) => updateStatItem(idx, "label", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Label"
              />
              <input
                value={item.value}
                onChange={(e) => updateStatItem(idx, "value", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Value"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={item.trend}
                onChange={(e) => updateStatItem(idx, "trend", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Trend"
              />
              <button
                type="button"
                onClick={() => removeStatItem(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <QuickRowAdder
        label="Quick Add Stat"
        placeholders={["Label", "Value", "Trend"]}
        onAdd={(values) =>
          setProp(
            (p: PlacementStatsProps) =>
              (p.statsData = appendRow(p.statsData, values)),
          )
        }
      />
      <textarea
        value={props.recruitersData ?? ""}
        onChange={(e) =>
          setProp(
            (p: PlacementStatsProps) => (p.recruitersData = e.target.value),
          )
        }
        rows={4}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Recruiters (one per line)"
      />
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Recruiters</p>
        {recruiterItems.map((item, idx) => (
          <div
            key={`recruiter-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateRecruiterItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeRecruiterItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <QuickLineAdder
        label="Quick Add Recruiter"
        placeholder="Microsoft"
        onAdd={(value) =>
          setProp(
            (p: PlacementStatsProps) =>
              (p.recruitersData = appendLine(p.recruitersData, value)),
          )
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.reportUrl ?? ""}
          onChange={(e) =>
            setProp((p: PlacementStatsProps) => (p.reportUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Report URL"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: PlacementStatsProps) =>
                (p.clickAction = e.target
                  .value as PlacementStatsProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(PlacementStats as any).craft = {
  displayName: "PlacementStats",
  props: {
    subtitle: "Career Outcomes",
    title: "Placement Highlights",
    statsData:
      "Highest Package|18 LPA|+12%\nAverage Package|6.5 LPA|+8%\nPlacement Rate|92%|+4%",
    recruitersData: "Google\nTCS\nInfosys\nWipro\nAmazon",
    placementYear: "2026",
    reportUrl: "/placement-report",
    clickAction: "disabled",
    backgroundColor: "#ecfccb",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: PlacementStatsSettings,
  },
};

type ScholarshipCardProps = BaseProps & {
  scholarshipName?: string;
  amount?: string;
  deadline?: string;
  eligibilityData?: string;
  benefitsData?: string;
  detailColumns?: 1 | 2;
  listCardStyle?: "plain" | "outlined" | "soft";
  applyUrl?: string;
  clickAction?: "disabled" | "navigate";
};

export const ScholarshipCard = ({
  subtitle = "Financial Aid",
  scholarshipName = "Merit Scholarship",
  amount = "Up to 70% tuition waiver",
  deadline = "2026-06-30",
  eligibilityData = "90%+ in qualifying exams\nFamily income criteria met\nGood academic standing",
  benefitsData = "Tuition reduction\nMentorship support\nPriority hostel allocation",
  detailColumns = 2,
  listCardStyle = "outlined",
  applyUrl = "/scholarships/merit",
  clickAction = "disabled",
  backgroundColor = "#eef2ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: ScholarshipCardProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const eligibility = parseSimpleLines(eligibilityData);
  const benefits = parseSimpleLines(benefitsData);
  const detailsColumnClass =
    detailColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const listItemClass =
    listCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-indigo-50/70 border border-indigo-100"
      : listCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-2">{scholarshipName}</h3>
      <p className="text-sm font-semibold text-slate-700 m-0">{amount}</p>
      <p className="text-xs text-slate-500 mt-1">Deadline: {deadline}</p>
      <div className={`grid ${detailsColumnClass} gap-3 mt-3 text-sm`}>
        <div>
          <p className="font-semibold mb-1">Eligibility</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {eligibility.map((item, idx) => (
              <li key={`el-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Benefits</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {benefits.map((item, idx) => (
              <li key={`ben-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4">
        <a
          href={applyUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          Apply for Scholarship
        </a>
      </div>
    </div>
  );
};

const ScholarshipCardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ScholarshipCardProps }));

  const eligibilityItems = parseSimpleLines(props.eligibilityData);
  const benefitItems = parseSimpleLines(props.benefitsData);

  const updateEligibilityItem = (index: number, value: string) => {
    setProp((p: ScholarshipCardProps) => {
      const items = parseSimpleLines(p.eligibilityData);
      if (!items[index]) return;
      items[index] = value;
      p.eligibilityData = items.join("\n");
    });
  };

  const removeEligibilityItem = (index: number) => {
    setProp((p: ScholarshipCardProps) => {
      const items = parseSimpleLines(p.eligibilityData);
      p.eligibilityData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  const updateBenefitItem = (index: number, value: string) => {
    setProp((p: ScholarshipCardProps) => {
      const items = parseSimpleLines(p.benefitsData);
      if (!items[index]) return;
      items[index] = value;
      p.benefitsData = items.join("\n");
    });
  };

  const removeBenefitItem = (index: number) => {
    setProp((p: ScholarshipCardProps) => {
      const items = parseSimpleLines(p.benefitsData);
      p.benefitsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.scholarshipName ?? ""}
        onChange={(e) =>
          setProp(
            (p: ScholarshipCardProps) => (p.scholarshipName = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Scholarship Name"
      />
      <input
        value={props.amount ?? ""}
        onChange={(e) =>
          setProp((p: ScholarshipCardProps) => (p.amount = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Amount / Benefit"
      />
      <input
        type="date"
        value={props.deadline ?? ""}
        onChange={(e) =>
          setProp((p: ScholarshipCardProps) => (p.deadline = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.detailColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: ScholarshipCardProps) =>
                (p.detailColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.listCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: ScholarshipCardProps) =>
                (p.listCardStyle = e.target
                  .value as ScholarshipCardProps["listCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">
          Eligibility Items
        </p>
        {eligibilityItems.map((item, idx) => (
          <div
            key={`eligibility-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateEligibilityItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeEligibilityItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Eligibility"
          placeholder="Minimum 85% marks"
          onAdd={(value) =>
            setProp(
              (p: ScholarshipCardProps) =>
                (p.eligibilityData = appendLine(p.eligibilityData, value)),
            )
          }
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Benefit Items</p>
        {benefitItems.map((item, idx) => (
          <div
            key={`benefit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateBenefitItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeBenefitItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Benefit"
          placeholder="Hostel fee waiver"
          onAdd={(value) =>
            setProp(
              (p: ScholarshipCardProps) =>
                (p.benefitsData = appendLine(p.benefitsData, value)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.applyUrl ?? ""}
          onChange={(e) =>
            setProp((p: ScholarshipCardProps) => (p.applyUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Apply URL"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: ScholarshipCardProps) =>
                (p.clickAction = e.target
                  .value as ScholarshipCardProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(ScholarshipCard as any).craft = {
  displayName: "ScholarshipCard",
  props: {
    subtitle: "Financial Aid",
    scholarshipName: "Merit Scholarship",
    amount: "Up to 70% tuition waiver",
    deadline: "2026-06-30",
    eligibilityData:
      "90%+ in qualifying exams\nFamily income criteria met\nGood academic standing",
    benefitsData:
      "Tuition reduction\nMentorship support\nPriority hostel allocation",
    detailColumns: 2,
    listCardStyle: "outlined",
    applyUrl: "/scholarships/merit",
    clickAction: "disabled",
    backgroundColor: "#eef2ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: ScholarshipCardSettings,
  },
};

type ExamScheduleProps = BaseProps & {
  examRowsData?: string;
  venue?: string;
  instructions?: string;
  resultUrl?: string;
  clickAction?: "disabled" | "navigate";
};

export const ExamSchedule = ({
  subtitle = "Semester End",
  title = "Exam Schedule",
  examRowsData = "2026-11-01|Mathematics|09:30 AM|Hall A|Bring ID card\n2026-11-03|DBMS|09:30 AM|Hall B|No mobile phones\n2026-11-05|Operating Systems|09:30 AM|Hall C|Arrive 30 min early",
  venue = "Main Campus",
  instructions = "Carry hall ticket and ID proof.",
  resultUrl = "/results",
  clickAction = "disabled",
  backgroundColor = "#fdf4ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: ExamScheduleProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const exams = parseEvents(examRowsData);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 m-0 mb-3">Venue: {venue}</p>
      <div className="space-y-2">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-lg bg-white/75 border border-slate-200 p-3 text-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold m-0">{exam.title}</p>
              <span className="text-xs text-slate-500">{exam.date}</span>
            </div>
            <p className="m-0 mt-1 text-slate-600">
              {exam.mode} • {exam.location}
            </p>
            {exam.url && exam.url !== "#" ? (
              <p className="m-0 mt-1 text-xs text-slate-500">
                Note: {exam.url}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-600">{instructions}</p>
      <div className="mt-4">
        <a
          href={resultUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          View Results
        </a>
      </div>
    </div>
  );
};

const ExamScheduleSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ExamScheduleProps }));

  const examItems = parseEvents(props.examRowsData);

  const updateExamItem = (
    index: number,
    key: keyof ReturnType<typeof parseEvents>[number],
    nextValue: string,
  ) => {
    setProp((p: ExamScheduleProps) => {
      const rows = parseEvents(p.examRowsData);
      if (!rows[index]) return;
      rows[index][key] = nextValue;
      p.examRowsData = rows
        .map((row) =>
          [row.date, row.title, row.location, row.mode, row.url].join("|"),
        )
        .join("\n");
    });
  };

  const removeExamItem = (index: number) => {
    setProp((p: ExamScheduleProps) => {
      const rows = parseEvents(p.examRowsData);
      p.examRowsData = rows
        .filter((_, idx) => idx !== index)
        .map((row) =>
          [row.date, row.title, row.location, row.mode, row.url].join("|"),
        )
        .join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: ExamScheduleProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <input
        value={props.venue ?? ""}
        onChange={(e) =>
          setProp((p: ExamScheduleProps) => (p.venue = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Venue"
      />
      <textarea
        value={props.examRowsData ?? ""}
        onChange={(e) =>
          setProp((p: ExamScheduleProps) => (p.examRowsData = e.target.value))
        }
        rows={8}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Schedule (Date|Subject|Session|Hall|Instruction)"
      />
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Exam Rows</p>
        {examItems.map((item, idx) => (
          <div
            key={`${item.date}-${idx}`}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.date}
                onChange={(e) => updateExamItem(idx, "date", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Date"
              />
              <input
                value={item.title}
                onChange={(e) => updateExamItem(idx, "title", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Title"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.location}
                onChange={(e) =>
                  updateExamItem(idx, "location", e.target.value)
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Location"
              />
              <input
                value={item.mode}
                onChange={(e) => updateExamItem(idx, "mode", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Mode"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={item.url}
                onChange={(e) => updateExamItem(idx, "url", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="URL"
              />
              <button
                type="button"
                onClick={() => removeExamItem(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <QuickRowAdder
        label="Quick Add Exam"
        placeholders={["Date", "Subject", "Session", "Hall", "Instruction"]}
        onAdd={(values) =>
          setProp(
            (p: ExamScheduleProps) =>
              (p.examRowsData = appendRow(p.examRowsData, values)),
          )
        }
      />
      <textarea
        value={props.instructions ?? ""}
        onChange={(e) =>
          setProp((p: ExamScheduleProps) => (p.instructions = e.target.value))
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Instructions"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.resultUrl ?? ""}
          onChange={(e) =>
            setProp((p: ExamScheduleProps) => (p.resultUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Result URL"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: ExamScheduleProps) =>
                (p.clickAction = e.target
                  .value as ExamScheduleProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(ExamSchedule as any).craft = {
  displayName: "ExamSchedule",
  props: {
    subtitle: "Semester End",
    title: "Exam Schedule",
    examRowsData:
      "2026-11-01|Mathematics|09:30 AM|Hall A|Bring ID card\n2026-11-03|DBMS|09:30 AM|Hall B|No mobile phones\n2026-11-05|Operating Systems|09:30 AM|Hall C|Arrive 30 min early",
    venue: "Main Campus",
    instructions: "Carry hall ticket and ID proof.",
    resultUrl: "/results",
    clickAction: "disabled",
    backgroundColor: "#fdf4ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: ExamScheduleSettings,
  },
};

type StudentTestimonialProps = BaseProps & {
  studentName?: string;
  program?: string;
  batch?: string;
  rating?: string;
  testimonialText?: string;
  highlight?: string;
  achievementsData?: string;
  achievementColumns?: 1 | 2;
  achievementCardStyle?: "plain" | "outlined" | "soft";
  profileUrl?: string;
  actionLabel?: string;
  clickAction?: "disabled" | "navigate";
};

export const StudentTestimonial = ({
  studentName = "Aarav Menon",
  program = "B.Tech CSE",
  batch = "2026",
  rating = "5",
  testimonialText = "Project-based learning made me industry-ready.",
  highlight = "Built two internship-ready projects before graduation.",
  achievementsData = "Won Smart India Hackathon\nPublished student research paper\nSecured internship at product company",
  achievementColumns = 2,
  achievementCardStyle = "outlined",
  profileUrl = "/students/aarav-menon",
  actionLabel = "Read Full Story",
  clickAction = "disabled",
  backgroundColor = "#f0f9ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: StudentTestimonialProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const ratingValue = Math.min(5, Math.max(1, Number(rating) || 5));
  const achievements = parseSimpleLines(achievementsData);
  const achievementColumnClass =
    achievementColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const achievementItemClass =
    achievementCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-sky-50/70 border border-sky-100"
      : achievementCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
            Student Story
          </p>
          <h3 className="text-xl font-bold mt-1 mb-1">{studentName}</h3>
          <p className="text-sm text-slate-600 m-0">
            {program} • Batch {batch}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 text-white px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.12em] opacity-80">
            Rating
          </div>
          <div className="text-lg font-bold">{ratingValue}/5</div>
        </div>
      </div>
      <div className="mt-3 flex gap-1 text-amber-500 text-lg">
        {Array.from({ length: ratingValue }).map((_, idx) => (
          <span key={`star-${idx}`}>★</span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6">{testimonialText}</p>
      <div className="mt-3 rounded-lg bg-white/70 border border-slate-200 p-3 text-sm">
        {highlight}
      </div>
      <div className={`mt-3 grid ${achievementColumnClass} gap-2 text-sm`}>
        {achievements.map((item, idx) => (
          <div key={`achievement-${idx}`} className={achievementItemClass}>
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <a
          href={profileUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

const StudentTestimonialSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as StudentTestimonialProps,
  }));

  const achievementItems = parseSimpleLines(props.achievementsData);

  const updateAchievementItem = (index: number, value: string) => {
    setProp((p: StudentTestimonialProps) => {
      const items = parseSimpleLines(p.achievementsData);
      if (!items[index]) return;
      items[index] = value;
      p.achievementsData = items.join("\n");
    });
  };

  const removeAchievementItem = (index: number) => {
    setProp((p: StudentTestimonialProps) => {
      const items = parseSimpleLines(p.achievementsData);
      p.achievementsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.studentName ?? ""}
        onChange={(e) =>
          setProp(
            (p: StudentTestimonialProps) => (p.studentName = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Student Name"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.program ?? ""}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) => (p.program = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Program"
        />
        <input
          value={props.batch ?? ""}
          onChange={(e) =>
            setProp((p: StudentTestimonialProps) => (p.batch = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Batch"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.rating ?? ""}
          onChange={(e) =>
            setProp((p: StudentTestimonialProps) => (p.rating = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Rating 1-5"
        />
        <input
          value={props.profileUrl ?? ""}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) => (p.profileUrl = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Profile URL"
        />
      </div>
      <textarea
        value={props.testimonialText ?? ""}
        onChange={(e) =>
          setProp(
            (p: StudentTestimonialProps) =>
              (p.testimonialText = e.target.value),
          )
        }
        rows={4}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Testimonial text"
      />
      <textarea
        value={props.highlight ?? ""}
        onChange={(e) =>
          setProp(
            (p: StudentTestimonialProps) => (p.highlight = e.target.value),
          )
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Highlight"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.achievementColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) =>
                (p.achievementColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.achievementCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) =>
                (p.achievementCardStyle = e.target
                  .value as StudentTestimonialProps["achievementCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Achievements</p>
        {achievementItems.map((item, idx) => (
          <div
            key={`achievement-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateAchievementItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeAchievementItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Achievement"
          placeholder="Completed funded research internship"
          onAdd={(value) =>
            setProp(
              (p: StudentTestimonialProps) =>
                (p.achievementsData = appendLine(p.achievementsData, value)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.actionLabel ?? ""}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) => (p.actionLabel = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action Label"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: StudentTestimonialProps) =>
                (p.clickAction = e.target
                  .value as StudentTestimonialProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(StudentTestimonial as any).craft = {
  displayName: "StudentTestimonial",
  props: {
    studentName: "Aarav Menon",
    program: "B.Tech CSE",
    batch: "2026",
    rating: "5",
    testimonialText: "Project-based learning made me industry-ready.",
    highlight: "Built two internship-ready projects before graduation.",
    achievementsData:
      "Won Smart India Hackathon\nPublished student research paper\nSecured internship at product company",
    achievementColumns: 2,
    achievementCardStyle: "outlined",
    profileUrl: "/students/aarav-menon",
    actionLabel: "Read Full Story",
    clickAction: "disabled",
    backgroundColor: "#f0f9ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: StudentTestimonialSettings,
  },
};

type FacilityCardProps = BaseProps & {
  facilityName?: string;
  facilityType?: string;
  location?: string;
  capacity?: string;
  amenitiesData?: string;
  amenityColumns?: 1 | 2 | 3;
  amenityCardStyle?: "plain" | "outlined" | "soft";
  availability?: string;
  bookingUrl?: string;
  actionLabel?: string;
  clickAction?: "disabled" | "navigate";
};

export const FacilityCard = ({
  facilityName = "Innovation Lab",
  facilityType = "Campus Facility",
  location = "Block B, Ground Floor",
  capacity = "60 users",
  amenitiesData = "3D printers\nHigh-end workstations\nIoT kits\nSmart board",
  amenityColumns = 2,
  amenityCardStyle = "outlined",
  availability = "Available 24x7 for approved projects",
  bookingUrl = "/facilities/innovation-lab",
  actionLabel = "Book Facility",
  clickAction = "disabled",
  backgroundColor = "#ecfeff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: FacilityCardProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const amenities = parseSimpleLines(amenitiesData);
  const amenityColumnClass =
    amenityColumns === 1
      ? "grid-cols-1"
      : amenityColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  const amenityItemClass =
    amenityCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-cyan-50/70 border border-cyan-100"
      : amenityCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
            {facilityType}
          </p>
          <h3 className="text-xl font-bold mt-1 mb-1">{facilityName}</h3>
          <p className="text-sm text-slate-600 m-0">{location}</p>
        </div>
        <div className="rounded-2xl bg-white/75 border border-slate-200 px-3 py-2 text-right text-sm">
          <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Capacity
          </div>
          <div className="font-semibold">{capacity}</div>
        </div>
      </div>
      <p className="mt-3 text-sm">{availability}</p>
      <div className={`mt-3 grid ${amenityColumnClass} gap-2`}>
        {amenities.map((item, idx) => (
          <div key={`amenity-${idx}`} className={`text-sm ${amenityItemClass}`}>
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <a
          href={bookingUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

const FacilityCardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FacilityCardProps }));

  const amenityItems = parseSimpleLines(props.amenitiesData);

  const updateAmenityItem = (index: number, value: string) => {
    setProp((p: FacilityCardProps) => {
      const items = parseSimpleLines(p.amenitiesData);
      if (!items[index]) return;
      items[index] = value;
      p.amenitiesData = items.join("\n");
    });
  };

  const removeAmenityItem = (index: number) => {
    setProp((p: FacilityCardProps) => {
      const items = parseSimpleLines(p.amenitiesData);
      p.amenitiesData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.facilityName ?? ""}
        onChange={(e) =>
          setProp((p: FacilityCardProps) => (p.facilityName = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Facility Name"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.facilityType ?? ""}
          onChange={(e) =>
            setProp((p: FacilityCardProps) => (p.facilityType = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Facility Type"
        />
        <input
          value={props.location ?? ""}
          onChange={(e) =>
            setProp((p: FacilityCardProps) => (p.location = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Location"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.capacity ?? ""}
          onChange={(e) =>
            setProp((p: FacilityCardProps) => (p.capacity = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Capacity"
        />
        <input
          value={props.bookingUrl ?? ""}
          onChange={(e) =>
            setProp((p: FacilityCardProps) => (p.bookingUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Booking URL"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.amenityColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: FacilityCardProps) =>
                (p.amenityColumns = Number(e.target.value) as 1 | 2 | 3),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
        </select>
        <select
          value={props.amenityCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: FacilityCardProps) =>
                (p.amenityCardStyle = e.target
                  .value as FacilityCardProps["amenityCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Amenities</p>
        {amenityItems.map((item, idx) => (
          <div
            key={`amenity-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateAmenityItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeAmenityItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Amenity"
          placeholder="VR lab setup"
          onAdd={(value) =>
            setProp(
              (p: FacilityCardProps) =>
                (p.amenitiesData = appendLine(p.amenitiesData, value)),
            )
          }
        />
      </div>
      <textarea
        value={props.availability ?? ""}
        onChange={(e) =>
          setProp((p: FacilityCardProps) => (p.availability = e.target.value))
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Availability"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.actionLabel ?? ""}
          onChange={(e) =>
            setProp((p: FacilityCardProps) => (p.actionLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action Label"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: FacilityCardProps) =>
                (p.clickAction = e.target
                  .value as FacilityCardProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(FacilityCard as any).craft = {
  displayName: "FacilityCard",
  props: {
    facilityName: "Innovation Lab",
    facilityType: "Campus Facility",
    location: "Block B, Ground Floor",
    capacity: "60 users",
    amenitiesData: "3D printers\nHigh-end workstations\nIoT kits\nSmart board",
    amenityColumns: 2,
    amenityCardStyle: "outlined",
    availability: "Available 24x7 for approved projects",
    bookingUrl: "/facilities/innovation-lab",
    actionLabel: "Book Facility",
    clickAction: "disabled",
    backgroundColor: "#ecfeff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: FacilityCardSettings,
  },
};

type ClubCardProps = BaseProps & {
  clubName?: string;
  coordinator?: string;
  meetingTime?: string;
  joinUrl?: string;
  activitiesData?: string;
  benefitsData?: string;
  detailColumns?: 1 | 2;
  listCardStyle?: "plain" | "outlined" | "soft";
  contactEmail?: string;
  membershipOpen?: boolean;
  clickAction?: "disabled" | "navigate";
};

export const ClubCard = ({
  subtitle = "Student Community",
  clubName = "Innovation Club",
  coordinator = "Prof. Anil Kumar",
  meetingTime = "Every Friday, 4:00 PM",
  joinUrl = "/clubs/innovation",
  activitiesData = "Hackathons\nPeer mentoring\nTech talks\nProject showcases",
  benefitsData = "Leadership growth\nNetworking\nCertificates\nInternship exposure",
  detailColumns = 2,
  listCardStyle = "outlined",
  contactEmail = "club@college.edu",
  membershipOpen = true,
  clickAction = "disabled",
  backgroundColor = "#f0fdf4",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: ClubCardProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const activities = parseSimpleLines(activitiesData);
  const benefits = parseSimpleLines(benefitsData);
  const detailsColumnClass =
    detailColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const listItemClass =
    listCardStyle === "soft"
      ? "rounded-lg px-3 py-2 bg-emerald-50/70 border border-emerald-100"
      : listCardStyle === "plain"
        ? "rounded-lg px-3 py-2 bg-transparent border border-transparent"
        : "rounded-lg px-3 py-2 bg-white/80 border border-slate-200";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
          {subtitle}
        </p>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${membershipOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          {membershipOpen ? "Open" : "Closed"}
        </span>
      </div>
      <h3 className="text-xl font-bold mt-1 mb-2">{clubName}</h3>
      <p className="text-sm text-slate-600 m-0">Coordinator: {coordinator}</p>
      <p className="text-xs text-slate-500 mt-1">Meetings: {meetingTime}</p>
      <div className={`grid ${detailsColumnClass} gap-3 mt-3 text-sm`}>
        <div>
          <p className="font-semibold mb-1">Activities</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {activities.map((item, idx) => (
              <li key={`act-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Member Benefits</p>
          <ul className="m-0 p-0 space-y-1 list-none">
            {benefits.map((item, idx) => (
              <li key={`ben-${idx}`} className={listItemClass}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">Contact: {contactEmail}</div>
      <div className="mt-4">
        <a
          href={joinUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-block px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          Join Club
        </a>
      </div>
    </div>
  );
};

const ClubCardSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ClubCardProps }));

  const activityItems = parseSimpleLines(props.activitiesData);
  const benefitItems = parseSimpleLines(props.benefitsData);

  const updateActivityItem = (index: number, value: string) => {
    setProp((p: ClubCardProps) => {
      const items = parseSimpleLines(p.activitiesData);
      if (!items[index]) return;
      items[index] = value;
      p.activitiesData = items.join("\n");
    });
  };

  const removeActivityItem = (index: number) => {
    setProp((p: ClubCardProps) => {
      const items = parseSimpleLines(p.activitiesData);
      p.activitiesData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  const updateBenefitItem = (index: number, value: string) => {
    setProp((p: ClubCardProps) => {
      const items = parseSimpleLines(p.benefitsData);
      if (!items[index]) return;
      items[index] = value;
      p.benefitsData = items.join("\n");
    });
  };

  const removeBenefitItem = (index: number) => {
    setProp((p: ClubCardProps) => {
      const items = parseSimpleLines(p.benefitsData);
      p.benefitsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.clubName ?? ""}
        onChange={(e) =>
          setProp((p: ClubCardProps) => (p.clubName = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Club Name"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.coordinator ?? ""}
          onChange={(e) =>
            setProp((p: ClubCardProps) => (p.coordinator = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Coordinator"
        />
        <input
          value={props.meetingTime ?? ""}
          onChange={(e) =>
            setProp((p: ClubCardProps) => (p.meetingTime = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Meeting Time"
        />
      </div>
      <label className="text-sm flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(props.membershipOpen)}
          onChange={(e) =>
            setProp((p: ClubCardProps) => (p.membershipOpen = e.target.checked))
          }
        />
        Membership Open
      </label>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.detailColumns ?? 2}
          onChange={(e) =>
            setProp(
              (p: ClubCardProps) =>
                (p.detailColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.listCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: ClubCardProps) =>
                (p.listCardStyle = e.target
                  .value as ClubCardProps["listCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Activities</p>
        {activityItems.map((item, idx) => (
          <div
            key={`activity-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateActivityItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeActivityItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Activity"
          placeholder="Design workshop"
          onAdd={(value) =>
            setProp(
              (p: ClubCardProps) =>
                (p.activitiesData = appendLine(p.activitiesData, value)),
            )
          }
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">
          Member Benefits
        </p>
        {benefitItems.map((item, idx) => (
          <div
            key={`club-benefit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateBenefitItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeBenefitItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Benefit"
          placeholder="Networking opportunities"
          onAdd={(value) =>
            setProp(
              (p: ClubCardProps) =>
                (p.benefitsData = appendLine(p.benefitsData, value)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.contactEmail ?? ""}
          onChange={(e) =>
            setProp((p: ClubCardProps) => (p.contactEmail = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Contact Email"
        />
        <select
          value={props.clickAction ?? "disabled"}
          onChange={(e) =>
            setProp(
              (p: ClubCardProps) =>
                (p.clickAction = e.target
                  .value as ClubCardProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate</option>
        </select>
      </div>
      <input
        value={props.joinUrl ?? ""}
        onChange={(e) =>
          setProp((p: ClubCardProps) => (p.joinUrl = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Join URL"
      />
      <BaseSettings />
    </div>
  );
};

(ClubCard as any).craft = {
  displayName: "ClubCard",
  props: {
    subtitle: "Student Community",
    clubName: "Innovation Club",
    coordinator: "Prof. Anil Kumar",
    meetingTime: "Every Friday, 4:00 PM",
    joinUrl: "/clubs/innovation",
    activitiesData: "Hackathons\nPeer mentoring\nTech talks\nProject showcases",
    benefitsData:
      "Leadership growth\nNetworking\nCertificates\nInternship exposure",
    detailColumns: 2,
    listCardStyle: "outlined",
    contactEmail: "club@college.edu",
    membershipOpen: true,
    clickAction: "disabled",
    backgroundColor: "#f0fdf4",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: ClubCardSettings,
  },
};

type InquiryFormProps = BaseProps & {
  formFieldsData?: string;
  fieldColumns?: 1 | 2;
  fieldCardStyle?: "plain" | "outlined" | "soft";
  contactEmail?: string;
  responseTime?: string;
  submitLabel?: string;
  formUrl?: string;
  clickAction?: "disabled" | "navigate";
};

export const InquiryForm = ({
  title = "Inquiry Form",
  subtitle = "Get Information",
  description = "Collect visitor details and questions.",
  formFieldsData = "Full Name\nEmail Address\nPhone Number\nCourse Interested In\nMessage",
  fieldColumns = 1,
  fieldCardStyle = "outlined",
  contactEmail = "admissions@college.edu",
  responseTime = "Replies within 24 hours",
  submitLabel = "Submit Inquiry",
  formUrl = "/inquiry",
  clickAction = "disabled",
  backgroundColor = "#fff7ed",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: InquiryFormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const fields = parseSimpleLines(formFieldsData);
  const fieldColumnClass =
    fieldColumns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2";
  const fieldItemClass =
    fieldCardStyle === "soft"
      ? "rounded-lg bg-orange-50/70 border border-orange-100 px-3 py-2 text-sm text-slate-600"
      : fieldCardStyle === "plain"
        ? "rounded-lg bg-transparent border border-transparent px-3 py-2 text-sm text-slate-600"
        : "rounded-lg bg-white/80 border border-slate-200 px-3 py-2 text-sm text-slate-600";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 m-0">{description}</p>
      <div className={`mt-4 ${fieldColumnClass}`}>
        {fields.map((field) => (
          <div key={field} className={fieldItemClass}>
            {field}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-white/70 border border-slate-200 p-3 text-sm">
        <p className="m-0 font-semibold">{contactEmail}</p>
        <p className="m-0 text-slate-600">{responseTime}</p>
      </div>
      <div className="mt-4">
        <a
          href={formUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {submitLabel}
        </a>
      </div>
    </div>
  );
};

const InquiryFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as InquiryFormProps }));

  const fieldItems = parseSimpleLines(props.formFieldsData);

  const updateFieldItem = (index: number, value: string) => {
    setProp((p: InquiryFormProps) => {
      const items = parseSimpleLines(p.formFieldsData);
      if (!items[index]) return;
      items[index] = value;
      p.formFieldsData = items.join("\n");
    });
  };

  const removeFieldItem = (index: number) => {
    setProp((p: InquiryFormProps) => {
      const items = parseSimpleLines(p.formFieldsData);
      p.formFieldsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: InquiryFormProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <textarea
        value={props.description ?? ""}
        onChange={(e) =>
          setProp((p: InquiryFormProps) => (p.description = e.target.value))
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Description"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.fieldColumns ?? 1}
          onChange={(e) =>
            setProp(
              (p: InquiryFormProps) =>
                (p.fieldColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.fieldCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: InquiryFormProps) =>
                (p.fieldCardStyle = e.target
                  .value as InquiryFormProps["fieldCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Form Fields</p>
        {fieldItems.map((item, idx) => (
          <div
            key={`field-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateFieldItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeFieldItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Field"
          placeholder="Parent Name"
          onAdd={(value) =>
            setProp(
              (p: InquiryFormProps) =>
                (p.formFieldsData = appendLine(p.formFieldsData, value)),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.contactEmail ?? ""}
          onChange={(e) =>
            setProp((p: InquiryFormProps) => (p.contactEmail = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Contact Email"
        />
        <input
          value={props.responseTime ?? ""}
          onChange={(e) =>
            setProp((p: InquiryFormProps) => (p.responseTime = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Response Time"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.submitLabel ?? ""}
          onChange={(e) =>
            setProp((p: InquiryFormProps) => (p.submitLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Submit Label"
        />
        <input
          value={props.formUrl ?? ""}
          onChange={(e) =>
            setProp((p: InquiryFormProps) => (p.formUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Form URL"
        />
      </div>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: InquiryFormProps) =>
              (p.clickAction = e.target
                .value as InquiryFormProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(InquiryForm as any).craft = {
  displayName: "InquiryForm",
  props: {
    title: "Inquiry Form",
    subtitle: "Get Information",
    description: "Collect visitor details and questions.",
    formFieldsData:
      "Full Name\nEmail Address\nPhone Number\nCourse Interested In\nMessage",
    fieldColumns: 1,
    fieldCardStyle: "outlined",
    contactEmail: "admissions@college.edu",
    responseTime: "Replies within 24 hours",
    submitLabel: "Submit Inquiry",
    formUrl: "/inquiry",
    clickAction: "disabled",
    backgroundColor: "#fff7ed",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: InquiryFormSettings,
  },
};

type FeedbackFormProps = BaseProps & {
  feedbackTopicsData?: string;
  topicColumns?: 1 | 2;
  topicCardStyle?: "plain" | "outlined" | "soft";
  ratingScale?: string;
  anonymousAllowed?: boolean;
  submitLabel?: string;
  formUrl?: string;
  clickAction?: "disabled" | "navigate";
};

export const FeedbackForm = ({
  title = "Feedback Form",
  subtitle = "Share Experience",
  description = "Gather suggestions for quality improvement.",
  feedbackTopicsData = "Teaching quality\nCampus facilities\nPlacements\nSupport services",
  topicColumns = 1,
  topicCardStyle = "outlined",
  ratingScale = "1 to 5",
  anonymousAllowed = true,
  submitLabel = "Send Feedback",
  formUrl = "/feedback",
  clickAction = "disabled",
  backgroundColor = "#fef2f2",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: FeedbackFormProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const topics = parseSimpleLines(feedbackTopicsData);
  const topicColumnClass =
    topicColumns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2";
  const topicItemClass =
    topicCardStyle === "soft"
      ? "rounded-lg bg-rose-50/70 border border-rose-100 px-3 py-2 text-sm text-slate-600"
      : topicCardStyle === "plain"
        ? "rounded-lg bg-transparent border border-transparent px-3 py-2 text-sm text-slate-600"
        : "rounded-lg bg-white/80 border border-slate-200 px-3 py-2 text-sm text-slate-600";

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 m-0">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <span
            key={`rating-${idx}`}
            className="text-xs px-2 py-1 rounded-full bg-white/80 border border-slate-200"
          >
            {idx + 1}
          </span>
        ))}
        <span className="text-xs px-2 py-1 rounded-full bg-white/80 border border-slate-200">
          {ratingScale}
        </span>
      </div>
      <div className={`mt-4 ${topicColumnClass}`}>
        {topics.map((topic) => (
          <div key={topic} className={topicItemClass}>
            {topic}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-500">
        {anonymousAllowed
          ? "Anonymous responses allowed"
          : "Responses require identity"}
      </div>
      <div className="mt-4">
        <a
          href={formUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {submitLabel}
        </a>
      </div>
    </div>
  );
};

const FeedbackFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as FeedbackFormProps }));

  const topicItems = parseSimpleLines(props.feedbackTopicsData);

  const updateTopicItem = (index: number, value: string) => {
    setProp((p: FeedbackFormProps) => {
      const items = parseSimpleLines(p.feedbackTopicsData);
      if (!items[index]) return;
      items[index] = value;
      p.feedbackTopicsData = items.join("\n");
    });
  };

  const removeTopicItem = (index: number) => {
    setProp((p: FeedbackFormProps) => {
      const items = parseSimpleLines(p.feedbackTopicsData);
      p.feedbackTopicsData = items.filter((_, idx) => idx !== index).join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: FeedbackFormProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <textarea
        value={props.description ?? ""}
        onChange={(e) =>
          setProp((p: FeedbackFormProps) => (p.description = e.target.value))
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Description"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.topicColumns ?? 1}
          onChange={(e) =>
            setProp(
              (p: FeedbackFormProps) =>
                (p.topicColumns = Number(e.target.value) as 1 | 2),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
        </select>
        <select
          value={props.topicCardStyle ?? "outlined"}
          onChange={(e) =>
            setProp(
              (p: FeedbackFormProps) =>
                (p.topicCardStyle = e.target
                  .value as FeedbackFormProps["topicCardStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="outlined">Outlined</option>
          <option value="soft">Soft</option>
          <option value="plain">Plain</option>
        </select>
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">
          Feedback Topics
        </p>
        {topicItems.map((item, idx) => (
          <div
            key={`topic-edit-${idx}`}
            className="grid grid-cols-[1fr_auto] gap-2"
          >
            <input
              value={item}
              onChange={(e) => updateTopicItem(idx, e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeTopicItem(idx)}
              className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ))}
        <QuickLineAdder
          label="Quick Add Topic"
          placeholder="Hostel facilities"
          onAdd={(value) =>
            setProp(
              (p: FeedbackFormProps) =>
                (p.feedbackTopicsData = appendLine(
                  p.feedbackTopicsData,
                  value,
                )),
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.ratingScale ?? ""}
          onChange={(e) =>
            setProp((p: FeedbackFormProps) => (p.ratingScale = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Rating Scale"
        />
        <input
          value={props.submitLabel ?? ""}
          onChange={(e) =>
            setProp((p: FeedbackFormProps) => (p.submitLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Submit Label"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.formUrl ?? ""}
          onChange={(e) =>
            setProp((p: FeedbackFormProps) => (p.formUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Form URL"
        />
        <label className="text-sm flex items-center gap-2 px-3 py-2 border rounded">
          <input
            type="checkbox"
            checked={Boolean(props.anonymousAllowed)}
            onChange={(e) =>
              setProp(
                (p: FeedbackFormProps) =>
                  (p.anonymousAllowed = e.target.checked),
              )
            }
          />
          Anonymous Allowed
        </label>
      </div>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: FeedbackFormProps) =>
              (p.clickAction = e.target
                .value as FeedbackFormProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(FeedbackForm as any).craft = {
  displayName: "FeedbackForm",
  props: {
    title: "Feedback Form",
    subtitle: "Share Experience",
    description: "Gather suggestions for quality improvement.",
    feedbackTopicsData:
      "Teaching quality\nCampus facilities\nPlacements\nSupport services",
    topicColumns: 1,
    topicCardStyle: "outlined",
    ratingScale: "1 to 5",
    anonymousAllowed: true,
    submitLabel: "Send Feedback",
    formUrl: "/feedback",
    clickAction: "disabled",
    backgroundColor: "#fef2f2",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: FeedbackFormSettings,
  },
};

type AlertBannerProps = BaseProps & {
  alertType?: "info" | "success" | "warning" | "error";
  alertDetail?: string;
  actionLabel?: string;
  actionUrl?: string;
  dismissible?: boolean;
  clickAction?: "disabled" | "navigate";
};

const getAlertTheme = (alertType: AlertBannerProps["alertType"]) => {
  switch (alertType) {
    case "success":
      return {
        backgroundColor: "#ecfdf5",
        textColor: "#065f46",
        borderColor: "#6ee7b7",
      };
    case "warning":
      return {
        backgroundColor: "#fffbeb",
        textColor: "#92400e",
        borderColor: "#f59e0b",
      };
    case "error":
      return {
        backgroundColor: "#fef2f2",
        textColor: "#991b1b",
        borderColor: "#f87171",
      };
    default:
      return {
        backgroundColor: "#eff6ff",
        textColor: "#1e3a8a",
        borderColor: "#60a5fa",
      };
  }
};

export const AlertBanner = ({
  title = "Alert",
  subtitle = "Campus Notice",
  description = "Campus closed on Friday due to maintenance.",
  alertType = "error",
  alertDetail = "The main gate will reopen on Saturday morning.",
  actionLabel = "Read More",
  actionUrl = "/announcements/maintenance",
  dismissible = true,
  clickAction = "disabled",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: AlertBannerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [visible, setVisible] = React.useState(true);
  const theme = getAlertTheme(alertType);

  if (!visible) return null;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: `1px solid ${theme.borderColor}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] m-0 opacity-75">
            {subtitle}
          </p>
          <h3 className="text-lg font-bold mt-1 mb-1">{title}</h3>
          <p className="text-sm m-0">{description}</p>
        </div>
        {dismissible ? (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-xs font-semibold px-2 py-1 rounded border border-current/20"
          >
            Dismiss
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm">{alertDetail}</p>
      <div className="mt-4">
        <a
          href={actionUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
};

const AlertBannerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as AlertBannerProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: AlertBannerProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <input
        value={props.subtitle ?? ""}
        onChange={(e) =>
          setProp((p: AlertBannerProps) => (p.subtitle = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Subtitle"
      />
      <textarea
        value={props.description ?? ""}
        onChange={(e) =>
          setProp((p: AlertBannerProps) => (p.description = e.target.value))
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Description"
      />
      <textarea
        value={props.alertDetail ?? ""}
        onChange={(e) =>
          setProp((p: AlertBannerProps) => (p.alertDetail = e.target.value))
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Alert Detail"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.alertType ?? "error"}
          onChange={(e) =>
            setProp(
              (p: AlertBannerProps) =>
                (p.alertType = e.target.value as AlertBannerProps["alertType"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <label className="text-sm flex items-center gap-2 px-3 py-2 border rounded">
          <input
            type="checkbox"
            checked={Boolean(props.dismissible)}
            onChange={(e) =>
              setProp(
                (p: AlertBannerProps) => (p.dismissible = e.target.checked),
              )
            }
          />
          Dismissible
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.actionLabel ?? ""}
          onChange={(e) =>
            setProp((p: AlertBannerProps) => (p.actionLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action Label"
        />
        <input
          value={props.actionUrl ?? ""}
          onChange={(e) =>
            setProp((p: AlertBannerProps) => (p.actionUrl = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Action URL"
        />
      </div>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: AlertBannerProps) =>
              (p.clickAction = e.target
                .value as AlertBannerProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(AlertBanner as any).craft = {
  displayName: "AlertBanner",
  props: {
    title: "Alert",
    subtitle: "Campus Notice",
    description: "Campus closed on Friday due to maintenance.",
    alertType: "error",
    alertDetail: "The main gate will reopen on Saturday morning.",
    actionLabel: "Read More",
    actionUrl: "/announcements/maintenance",
    dismissible: true,
    clickAction: "disabled",
    backgroundColor: "#fee2e2",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: AlertBannerSettings,
  },
};

type ProgressTrackerProps = BaseProps & {
  progressLabel?: string;
  stepsData?: string;
  currentStep?: string;
  trackerUrl?: string;
  clickAction?: "disabled" | "navigate";
};

export const ProgressTracker = ({
  title = "Progress Tracker",
  subtitle = "Status",
  description = "Form Submitted • Documents Verified • Interview Scheduled",
  progressLabel = "Application Progress",
  stepsData = "Form Submitted|done|Application received\nDocuments Verified|done|All required documents checked\nInterview Scheduled|current|Awaiting interview slot\nAdmission Decision|todo|Final result pending",
  currentStep = "Interview Scheduled",
  trackerUrl = "/application/status",
  clickAction = "disabled",
  backgroundColor = "#eef2ff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: ProgressTrackerProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const steps = parseDelimitedRows(stepsData);
  const activeIndex = steps.findIndex((step) => step.parts[0] === currentStep);
  const progress = steps.length
    ? Math.max(0, activeIndex + 1) / steps.length
    : 0;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-slate-500 m-0">
        {subtitle}
      </p>
      <h3 className="text-xl font-bold mt-1 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 m-0">{description}</p>
      <p className="text-sm font-semibold mt-3 mb-2">{progressLabel}</p>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="mt-4 space-y-2">
        {steps.map((step, idx) => {
          const [label = "Step", status = "todo", note = ""] = step.parts;
          const isCurrent = label === currentStep;
          return (
            <div
              key={step.id}
              className={`rounded-lg border p-3 text-sm ${isCurrent ? "bg-slate-900 text-white border-slate-900" : "bg-white/80 border-slate-200"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold m-0">{label}</p>
                <span className="text-xs uppercase tracking-[0.08em] opacity-75">
                  {status}
                </span>
              </div>
              {note ? <p className="mt-1 mb-0 opacity-90">{note}</p> : null}
              <p className="text-xs mt-1 opacity-75">Step {idx + 1}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <a
          href={trackerUrl}
          onClick={(e) => {
            if (clickAction !== "navigate") e.preventDefault();
          }}
          className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white"
        >
          View Status
        </a>
      </div>
    </div>
  );
};

const ProgressTrackerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ProgressTrackerProps }));

  const stepItems = parseDelimitedRows(props.stepsData);

  const updateStepItem = (
    index: number,
    partIndex: 0 | 1 | 2,
    nextValue: string,
  ) => {
    setProp((p: ProgressTrackerProps) => {
      const rows = parseDelimitedRows(p.stepsData);
      if (!rows[index]) return;
      rows[index].parts[partIndex] = nextValue;
      p.stepsData = rows.map((row) => row.parts.join("|")).join("\n");
    });
  };

  const removeStepItem = (index: number) => {
    setProp((p: ProgressTrackerProps) => {
      const rows = parseDelimitedRows(p.stepsData);
      p.stepsData = rows
        .filter((_, idx) => idx !== index)
        .map((row) => row.parts.join("|"))
        .join("\n");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <input
        value={props.title ?? ""}
        onChange={(e) =>
          setProp((p: ProgressTrackerProps) => (p.title = e.target.value))
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Title"
      />
      <textarea
        value={props.description ?? ""}
        onChange={(e) =>
          setProp((p: ProgressTrackerProps) => (p.description = e.target.value))
        }
        rows={3}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Description"
      />
      <input
        value={props.progressLabel ?? ""}
        onChange={(e) =>
          setProp(
            (p: ProgressTrackerProps) => (p.progressLabel = e.target.value),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Progress Label"
      />
      <textarea
        value={props.stepsData ?? ""}
        onChange={(e) =>
          setProp((p: ProgressTrackerProps) => (p.stepsData = e.target.value))
        }
        rows={6}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Steps (Label|Status|Note)"
      />
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Steps</p>
        {stepItems.map((item, idx) => (
          <div
            key={`${item.parts[0] || "step"}-${idx}`}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                value={item.parts[0] ?? ""}
                onChange={(e) => updateStepItem(idx, 0, e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Label"
              />
              <input
                value={item.parts[1] ?? ""}
                onChange={(e) => updateStepItem(idx, 1, e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Status"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={item.parts[2] ?? ""}
                onChange={(e) => updateStepItem(idx, 2, e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Note"
              />
              <button
                type="button"
                onClick={() => removeStepItem(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <QuickRowAdder
        label="Quick Add Step"
        placeholders={["Label", "Status", "Note"]}
        onAdd={(values) =>
          setProp(
            (p: ProgressTrackerProps) =>
              (p.stepsData = appendRow(p.stepsData, values)),
          )
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.currentStep ?? ""}
          onChange={(e) =>
            setProp(
              (p: ProgressTrackerProps) => (p.currentStep = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Current Step"
        />
        <input
          value={props.trackerUrl ?? ""}
          onChange={(e) =>
            setProp(
              (p: ProgressTrackerProps) => (p.trackerUrl = e.target.value),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Tracker URL"
        />
      </div>
      <select
        value={props.clickAction ?? "disabled"}
        onChange={(e) =>
          setProp(
            (p: ProgressTrackerProps) =>
              (p.clickAction = e.target
                .value as ProgressTrackerProps["clickAction"]),
          )
        }
        className="w-full px-3 py-2 border rounded text-sm"
      >
        <option value="disabled">Display Only</option>
        <option value="navigate">Navigate</option>
      </select>
      <BaseSettings />
    </div>
  );
};

(ProgressTracker as any).craft = {
  displayName: "ProgressTracker",
  props: {
    title: "Progress Tracker",
    subtitle: "Status",
    description: "Form Submitted • Documents Verified • Interview Scheduled",
    progressLabel: "Application Progress",
    stepsData:
      "Form Submitted|done|Application received\nDocuments Verified|done|All required documents checked\nInterview Scheduled|current|Awaiting interview slot\nAdmission Decision|todo|Final result pending",
    currentStep: "Interview Scheduled",
    trackerUrl: "/application/status",
    clickAction: "disabled",
    backgroundColor: "#eef2ff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: ProgressTrackerSettings,
  },
};

type TabsProps = BaseProps & {
  tabLabels?: string;
  tabContents?: string;
  tabDescriptionsData?: string;
  defaultTabIndex?: number;
  tabStyle?: "pill" | "underline";
};

export const Tabs = ({
  title = "Tabs",
  tabLabels = "Overview|Curriculum|Eligibility",
  tabContents = "Overview content|Curriculum content|Eligibility content",
  tabDescriptionsData = "High-level summary|Course structure|Entry requirements",
  defaultTabIndex = 0,
  tabStyle = "pill",
  backgroundColor = "#ffffff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: TabsProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const labels = tabLabels.split("|").map((x) => x.trim());
  const contents = tabContents.split("|").map((x) => x.trim());
  const descriptions = tabDescriptionsData.split("|").map((x) => x.trim());
  const [active, setActive] = React.useState(() =>
    Math.min(Math.max(defaultTabIndex, 0), Math.max(labels.length - 1, 0)),
  );

  React.useEffect(() => {
    setActive(
      Math.min(Math.max(defaultTabIndex, 0), Math.max(labels.length - 1, 0)),
    );
  }, [defaultTabIndex, labels.length]);

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      style={{
        backgroundColor,
        color: textColor,
        fontFamily,
        fontStyle: textStyle,
        padding,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        {labels.map((label, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActive(idx)}
            style={{
              borderRadius: tabStyle === "underline" ? "8px 8px 0 0" : "999px",
              padding: "6px 12px",
              border: tabStyle === "underline" ? "none" : "1px solid #cbd5e1",
              borderBottom:
                tabStyle === "underline"
                  ? idx === active
                    ? "2px solid #2563eb"
                    : "1px solid #e2e8f0"
                  : "1px solid #cbd5e1",
              background:
                idx === active
                  ? tabStyle === "underline"
                    ? "rgba(37, 99, 235, 0.08)"
                    : "#2563eb"
                  : "#ffffff",
              color:
                idx === active
                  ? tabStyle === "underline"
                    ? "#2563eb"
                    : "#ffffff"
                  : "#1f2937",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {descriptions[active] ? (
        <p style={{ marginTop: "0", marginBottom: "12px", color: "#475569" }}>
          {descriptions[active]}
        </p>
      ) : null}
      <p style={{ margin: 0 }}>{contents[active] || "Tab content"}</p>
    </div>
  );
};

const TabsSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TabsProps }));
  const [draftTab, setDraftTab] = React.useState({
    label: "",
    content: "",
    description: "",
  });

  const tabLabels = (props.tabLabels || "")
    .split("|")
    .map((value) => value.trim());
  const tabContents = (props.tabContents || "")
    .split("|")
    .map((value) => value.trim());
  const tabDescriptions = (props.tabDescriptionsData || "")
    .split("|")
    .map((value) => value.trim());
  const tabItems = tabLabels.map((label, idx) => ({
    id: `${idx}-${label || "tab"}`,
    label,
    content: tabContents[idx] ?? "",
    description: tabDescriptions[idx] ?? "",
  }));

  const updateTabItem = (
    index: number,
    field: "label" | "content" | "description",
    nextValue: string,
  ) => {
    setProp((p: TabsProps) => {
      const labels = (p.tabLabels || "")
        .split("|")
        .map((value) => value.trim());
      const contents = (p.tabContents || "")
        .split("|")
        .map((value) => value.trim());
      const descriptions = (p.tabDescriptionsData || "")
        .split("|")
        .map((value) => value.trim());

      if (field === "label") labels[index] = nextValue;
      if (field === "content") contents[index] = nextValue;
      if (field === "description") descriptions[index] = nextValue;

      p.tabLabels = labels.join("|");
      p.tabContents = contents.join("|");
      p.tabDescriptionsData = descriptions.join("|");
    });
  };

  const removeTabItem = (index: number) => {
    setProp((p: TabsProps) => {
      const labels = (p.tabLabels || "")
        .split("|")
        .map((value) => value.trim());
      const contents = (p.tabContents || "")
        .split("|")
        .map((value) => value.trim());
      const descriptions = (p.tabDescriptionsData || "")
        .split("|")
        .map((value) => value.trim());

      p.tabLabels = labels.filter((_, idx) => idx !== index).join("|");
      p.tabContents = contents.filter((_, idx) => idx !== index).join("|");
      p.tabDescriptionsData = descriptions
        .filter((_, idx) => idx !== index)
        .join("|");
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
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
        />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
        <p className="text-xs font-semibold text-gray-600 m-0">Tabs</p>
        {tabItems.map((tab, idx) => (
          <div
            key={tab.id}
            className="space-y-2 border border-slate-200 rounded p-2"
          >
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                value={tab.label}
                onChange={(e) => updateTabItem(idx, "label", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Tab Label"
              />
              <button
                type="button"
                onClick={() => removeTabItem(idx)}
                className="px-3 py-2 rounded bg-rose-600 text-white text-xs font-semibold"
              >
                Remove
              </button>
            </div>
            <textarea
              value={tab.content}
              onChange={(e) => updateTabItem(idx, "content", e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
              placeholder="Tab Content"
            />
            <input
              value={tab.description}
              onChange={(e) =>
                updateTabItem(idx, "description", e.target.value)
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Tab Description"
            />
          </div>
        ))}
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
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Tab Descriptions (| separated)
        </label>
        <textarea
          value={props.tabDescriptionsData ?? ""}
          onChange={(e) =>
            setProp((p: TabsProps) => (p.tabDescriptionsData = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          rows={3}
        />
      </div>
      <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/70 space-y-2">
        <p className="text-xs font-semibold text-gray-600 m-0">Quick Add Tab</p>
        <input
          value={draftTab.label}
          onChange={(e) =>
            setDraftTab((prev) => ({ ...prev, label: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Tab Label"
        />
        <textarea
          value={draftTab.content}
          onChange={(e) =>
            setDraftTab((prev) => ({ ...prev, content: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          rows={2}
          placeholder="Tab Content"
        />
        <input
          value={draftTab.description}
          onChange={(e) =>
            setDraftTab((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Tab Description"
        />
        <button
          type="button"
          onClick={() => {
            if (!draftTab.label.trim()) return;
            setProp((p: TabsProps) => {
              p.tabLabels = [p.tabLabels || "", draftTab.label.trim()]
                .filter(Boolean)
                .join("|");
              p.tabContents = [p.tabContents || "", draftTab.content.trim()]
                .filter(Boolean)
                .join("|");
              p.tabDescriptionsData = [
                p.tabDescriptionsData || "",
                draftTab.description.trim(),
              ]
                .filter(Boolean)
                .join("|");
            });
            setDraftTab({ label: "", content: "", description: "" });
          }}
          className="px-3 py-2 rounded bg-slate-900 text-white text-xs font-semibold"
        >
          Add Tab
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min={0}
          value={props.defaultTabIndex ?? 0}
          onChange={(e) =>
            setProp(
              (p: TabsProps) => (p.defaultTabIndex = Number(e.target.value)),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Default Tab"
        />
        <select
          value={props.tabStyle ?? "pill"}
          onChange={(e) =>
            setProp(
              (p: TabsProps) =>
                (p.tabStyle = e.target.value as TabsProps["tabStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="pill">Pill</option>
          <option value="underline">Underline</option>
        </select>
      </div>
      <BaseSettings />
    </div>
  );
};

(Tabs as any).craft = {
  displayName: "Tabs",
  props: {
    title: "Tabs",
    tabLabels: "Overview|Curriculum|Eligibility",
    tabContents: "Overview content|Curriculum content|Eligibility content",
    tabDescriptionsData:
      "High-level summary|Course structure|Entry requirements",
    defaultTabIndex: 0,
    tabStyle: "pill",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: TabsSettings,
  },
};

type ModalProps = BaseProps & {
  buttonLabel?: string;
  secondaryLabel?: string;
  modalTone?: "neutral" | "info" | "success" | "warning";
  modalFooterNote?: string;
};

export const Modal = ({
  title = "Modal Title",
  description = "This is a modal preview.",
  buttonLabel = "Open Modal",
  secondaryLabel = "Cancel",
  modalTone = "neutral",
  modalFooterNote = "Use this modal to confirm a decision or show additional details.",
  backgroundColor = "#ffffff",
  textColor = "#111827",
  fontFamily = "inherit",
  textStyle = "normal",
  padding = "16px",
  borderRadius = "12px",
}: ModalProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();
  const [open, setOpen] = React.useState(false);
  const toneStyles =
    modalTone === "success"
      ? { badge: "#dcfce7", badgeText: "#166534" }
      : modalTone === "warning"
        ? { badge: "#fef3c7", badgeText: "#92400e" }
        : modalTone === "info"
          ? { badge: "#dbeafe", badgeText: "#1d4ed8" }
          : { badge: "#e2e8f0", badgeText: "#334155" };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          borderRadius: "10px",
          padding: "10px 14px",
          backgroundColor: "#111827",
          color: "#ffffff",
          border: "none",
        }}
      >
        {buttonLabel}
      </button>
      {open ? (
        <div
          style={{
            marginTop: "12px",
            backgroundColor,
            color: textColor,
            fontFamily,
            fontStyle: textStyle,
            padding,
            borderRadius,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4 style={{ margin: 0 }}>{title}</h4>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "999px",
                backgroundColor: toneStyles.badge,
                color: toneStyles.badgeText,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {modalTone}
            </span>
          </div>
          <p style={{ marginBottom: 0 }}>{description}</p>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            {modalFooterNote}
          </p>
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
          >
            <button type="button" onClick={() => setOpen(false)}>
              {secondaryLabel}
            </button>
            <button type="button" onClick={() => setOpen(false)}>
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ModalSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ModalProps }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
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
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.secondaryLabel ?? "Cancel"}
          onChange={(e) =>
            setProp((p: ModalProps) => (p.secondaryLabel = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Secondary Label"
        />
        <select
          value={props.modalTone ?? "neutral"}
          onChange={(e) =>
            setProp(
              (p: ModalProps) =>
                (p.modalTone = e.target.value as ModalProps["modalTone"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="neutral">Neutral</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
        </select>
      </div>
      <textarea
        value={props.modalFooterNote ?? ""}
        onChange={(e) =>
          setProp((p: ModalProps) => (p.modalFooterNote = e.target.value))
        }
        rows={2}
        className="w-full px-3 py-2 border rounded text-sm"
        placeholder="Footer note"
      />
      <BaseSettings />
    </div>
  );
};

(Modal as any).craft = {
  displayName: "Modal",
  props: {
    title: "Modal Title",
    description: "This is a modal preview.",
    buttonLabel: "Open Modal",
    secondaryLabel: "Cancel",
    modalTone: "neutral",
    modalFooterNote:
      "Use this modal to confirm a decision or show additional details.",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    padding: "16px",
    borderRadius: "12px",
  },
  related: {
    toolbar: ModalSettings,
  },
};

type TooltipProps = {
  targetText?: string;
  tooltipText?: string;
  placement?: "top" | "right" | "bottom" | "left";
  tooltipTone?: "neutral" | "brand" | "success";
  fontFamily?: string;
  textStyle?: "normal" | "italic";
};

export const Tooltip = ({
  targetText = "Hover this text",
  tooltipText = "Tooltip content",
  placement = "top",
  tooltipTone = "neutral",
  fontFamily = "inherit",
  textStyle = "normal",
}: TooltipProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const tooltipStyle =
    tooltipTone === "success"
      ? { backgroundColor: "#dcfce7", color: "#166534", borderColor: "#86efac" }
      : tooltipTone === "brand"
        ? {
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
            borderColor: "#93c5fd",
          }
        : {
            backgroundColor: "#0f172a",
            color: "#ffffff",
            borderColor: "#0f172a",
          };

  const positionClass =
    placement === "right"
      ? "left-full top-1/2 ml-3 -translate-y-1/2"
      : placement === "bottom"
        ? "top-full left-1/2 mt-3 -translate-x-1/2"
        : placement === "left"
          ? "right-full top-1/2 mr-3 -translate-y-1/2"
          : "bottom-full left-1/2 mb-3 -translate-x-1/2";

  return (
    <span
      ref={(ref: HTMLSpanElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className="relative inline-flex group"
      style={{ display: "inline-flex", fontFamily, fontStyle: textStyle }}
    >
      <span
        style={{
          display: "inline-flex",
          border: "1px dashed #94a3b8",
          padding: "8px 12px",
          borderRadius: "8px",
        }}
      >
        {targetText}
      </span>
      <span
        className={`pointer-events-none absolute z-10 hidden whitespace-nowrap rounded-md border px-3 py-2 text-xs shadow-lg group-hover:block`}
        style={{ ...tooltipStyle, borderColor: tooltipStyle.borderColor }}
      >
        <span className={`absolute ${positionClass}`} />
        {tooltipText}
      </span>
    </span>
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
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.placement ?? "top"}
          onChange={(e) =>
            setProp(
              (p: TooltipProps) =>
                (p.placement = e.target.value as TooltipProps["placement"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="top">Top</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
        </select>
        <select
          value={props.tooltipTone ?? "neutral"}
          onChange={(e) =>
            setProp(
              (p: TooltipProps) =>
                (p.tooltipTone = e.target.value as TooltipProps["tooltipTone"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="neutral">Neutral</option>
          <option value="brand">Brand</option>
          <option value="success">Success</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={props.fontFamily ?? "inherit"}
          onChange={(e) =>
            setProp((p: TooltipProps) => (p.fontFamily = e.target.value))
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          {FONT_FAMILY_OPTIONS.map((font) => (
            <option key={`tooltip-${font}`} value={font}>
              {font}
            </option>
          ))}
        </select>
        <select
          value={props.textStyle ?? "normal"}
          onChange={(e) =>
            setProp(
              (p: TooltipProps) =>
                (p.textStyle = e.target.value as TooltipProps["textStyle"]),
            )
          }
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="normal">Normal Text</option>
          <option value="italic">Italic Text</option>
        </select>
      </div>
    </div>
  );
};

(Tooltip as any).craft = {
  displayName: "Tooltip",
  props: {
    targetText: "Hover this text",
    tooltipText: "Tooltip content",
    placement: "top",
    tooltipTone: "neutral",
    fontFamily: "inherit",
    textStyle: "normal",
  },
  related: {
    toolbar: TooltipSettings,
  },
};
