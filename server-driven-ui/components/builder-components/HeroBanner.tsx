"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface HeroHeadingProps {
  text?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: "left" | "center" | "right";
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
  maxWidth?: string;
}

export const HeroHeading = ({
  text = "Welcome to Our Institution",
  color = "#ffffff",
  fontSize = "56px",
  fontWeight = "800",
  lineHeight = "1.1",
  textAlign = "center",
  paddingTop = "0px",
  paddingRight = "0px",
  paddingBottom = "0px",
  paddingLeft = "0px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "16px",
  marginLeft = "0px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  maxWidth = "100%",
}: HeroHeadingProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const headingClass = `sdui-hero-heading-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;
  const isAbsolute = positionMode === "absolute";
  const parsedZIndex = Number.parseInt(zIndex, 10);

  return (
    <>
      <style>{`
        .${headingClass} {
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          line-height: ${lineHeight};
          text-align: ${textAlign};
          padding: ${padding};
          margin: ${margin};
          max-width: ${maxWidth};
          position: ${isAbsolute ? "absolute" : "relative"};
          left: ${isAbsolute ? x : "auto"};
          top: ${isAbsolute ? y : "auto"};
          z-index: ${Number.isNaN(parsedZIndex) ? 1 : parsedZIndex};
        }
      `}</style>
      <h1
        ref={(ref: HTMLHeadingElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={headingClass}
      >
        {text}
      </h1>
    </>
  );
};

export const HeroHeadingSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Heading Text</label>
        <textarea
          value={props.text ?? "Welcome to Our Institution"}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          title="Hero heading text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Font Size</label>
        <input
          type="text"
          value={props.fontSize ?? "56px"}
          onChange={(e) => setProp((p: any) => (p.fontSize = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="56px"
          title="Hero heading font size"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Font Weight</label>
          <input
            type="text"
            value={props.fontWeight ?? "800"}
            onChange={(e) =>
              setProp((p: any) => (p.fontWeight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="800"
            title="Hero heading font weight"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Line Height</label>
          <input
            type="text"
            value={props.lineHeight ?? "1.1"}
            onChange={(e) =>
              setProp((p: any) => (p.lineHeight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="1.1"
            title="Hero heading line height"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Text Align</label>
        <select
          value={props.textAlign ?? "center"}
          onChange={(e) => setProp((p: any) => (p.textAlign = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          title="Hero heading text alignment"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <input
          type="color"
          value={props.color ?? "#ffffff"}
          onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          className="w-full h-10 border rounded cursor-pointer"
          title="Hero heading color"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Padding</label>
          <input
            type="text"
            value={props.paddingTop ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading top padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Right Padding
          </label>
          <input
            type="text"
            value={props.paddingRight ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading right padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Padding
          </label>
          <input
            type="text"
            value={props.paddingBottom ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading bottom padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Padding</label>
          <input
            type="text"
            value={props.paddingLeft ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading left padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Margin</label>
          <input
            type="text"
            value={props.marginTop ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading top margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Right Margin</label>
          <input
            type="text"
            value={props.marginRight ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading right margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Margin
          </label>
          <input
            type="text"
            value={props.marginBottom ?? "16px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="16px"
            title="Hero heading bottom margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Margin</label>
          <input
            type="text"
            value={props.marginLeft ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero heading left margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Position Mode
          </label>
          <select
            value={props.positionMode ?? "flow"}
            onChange={(e) =>
              setProp((p: any) => (p.positionMode = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            title="Hero heading position mode"
          >
            <option value="flow">Flow</option>
            <option value="absolute">Absolute</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Z Index</label>
          <input
            type="number"
            value={props.zIndex ?? "1"}
            onChange={(e) => setProp((p: any) => (p.zIndex = e.target.value))}
            className="w-full px-3 py-2 border rounded"
            placeholder="1"
            title="Hero heading z index"
          />
        </div>
      </div>
      {(props.positionMode ?? "flow") === "absolute" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">X</label>
            <input
              type="text"
              value={props.x ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero heading X position"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Y</label>
            <input
              type="text"
              value={props.y ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero heading Y position"
            />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Max Width</label>
        <input
          type="text"
          value={props.maxWidth ?? "100%"}
          onChange={(e) => setProp((p: any) => (p.maxWidth = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="100%"
          title="Hero heading max width"
        />
      </div>
    </div>
  );
};

HeroHeading.craft = {
  displayName: "Hero Heading",
  props: {
    text: "Welcome to Our Institution",
    color: "#ffffff",
    fontSize: "56px",
    fontWeight: "800",
    lineHeight: "1.1",
    textAlign: "center",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "16px",
    marginLeft: "0px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
    maxWidth: "100%",
  },
  related: {
    toolbar: HeroHeadingSettings,
  },
};

interface HeroSubheadingProps {
  text?: string;
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  textAlign?: "left" | "center" | "right";
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
  maxWidth?: string;
}

export const HeroSubheading = ({
  text = "Excellence in Education",
  color = "#ffffff",
  fontSize = "20px",
  lineHeight = "1.6",
  textAlign = "center",
  paddingTop = "0px",
  paddingRight = "0px",
  paddingBottom = "0px",
  paddingLeft = "0px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "24px",
  marginLeft = "0px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  maxWidth = "100%",
}: HeroSubheadingProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const subheadingClass = `sdui-hero-subheading-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;
  const isAbsolute = positionMode === "absolute";
  const parsedZIndex = Number.parseInt(zIndex, 10);

  return (
    <>
      <style>{`
        .${subheadingClass} {
          color: ${color};
          font-size: ${fontSize};
          line-height: ${lineHeight};
          text-align: ${textAlign};
          padding: ${padding};
          margin: ${margin};
          max-width: ${maxWidth};
          position: ${isAbsolute ? "absolute" : "relative"};
          left: ${isAbsolute ? x : "auto"};
          top: ${isAbsolute ? y : "auto"};
          z-index: ${Number.isNaN(parsedZIndex) ? 1 : parsedZIndex};
        }
      `}</style>
      <p
        ref={(ref: HTMLParagraphElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={subheadingClass}
      >
        {text}
      </p>
    </>
  );
};

export const HeroSubheadingSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-1">
          Subheading Text
        </label>
        <textarea
          value={props.text ?? "Excellence in Education"}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          title="Hero subheading text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Font Size</label>
        <input
          type="text"
          value={props.fontSize ?? "20px"}
          onChange={(e) => setProp((p: any) => (p.fontSize = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="20px"
          title="Hero subheading font size"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Line Height</label>
          <input
            type="text"
            value={props.lineHeight ?? "1.6"}
            onChange={(e) =>
              setProp((p: any) => (p.lineHeight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="1.6"
            title="Hero subheading line height"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Text Align</label>
          <select
            value={props.textAlign ?? "center"}
            onChange={(e) =>
              setProp((p: any) => (p.textAlign = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            title="Hero subheading text alignment"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <input
          type="color"
          value={props.color ?? "#ffffff"}
          onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          className="w-full h-10 border rounded cursor-pointer"
          title="Hero subheading color"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Padding</label>
          <input
            type="text"
            value={props.paddingTop ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading top padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Right Padding
          </label>
          <input
            type="text"
            value={props.paddingRight ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading right padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Padding
          </label>
          <input
            type="text"
            value={props.paddingBottom ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading bottom padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Padding</label>
          <input
            type="text"
            value={props.paddingLeft ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading left padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Margin</label>
          <input
            type="text"
            value={props.marginTop ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading top margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Right Margin</label>
          <input
            type="text"
            value={props.marginRight ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading right margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Margin
          </label>
          <input
            type="text"
            value={props.marginBottom ?? "24px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="24px"
            title="Hero subheading bottom margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Margin</label>
          <input
            type="text"
            value={props.marginLeft ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero subheading left margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Position Mode
          </label>
          <select
            value={props.positionMode ?? "flow"}
            onChange={(e) =>
              setProp((p: any) => (p.positionMode = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            title="Hero subheading position mode"
          >
            <option value="flow">Flow</option>
            <option value="absolute">Absolute</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Z Index</label>
          <input
            type="number"
            value={props.zIndex ?? "1"}
            onChange={(e) => setProp((p: any) => (p.zIndex = e.target.value))}
            className="w-full px-3 py-2 border rounded"
            placeholder="1"
            title="Hero subheading z index"
          />
        </div>
      </div>
      {(props.positionMode ?? "flow") === "absolute" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">X</label>
            <input
              type="text"
              value={props.x ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero subheading X position"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Y</label>
            <input
              type="text"
              value={props.y ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero subheading Y position"
            />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Max Width</label>
        <input
          type="text"
          value={props.maxWidth ?? "100%"}
          onChange={(e) => setProp((p: any) => (p.maxWidth = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="100%"
          title="Hero subheading max width"
        />
      </div>
    </div>
  );
};

HeroSubheading.craft = {
  displayName: "Hero Subheading",
  props: {
    text: "Excellence in Education",
    color: "#ffffff",
    fontSize: "20px",
    lineHeight: "1.6",
    textAlign: "center",
    paddingTop: "0px",
    paddingRight: "0px",
    paddingBottom: "0px",
    paddingLeft: "0px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "24px",
    marginLeft: "0px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
    maxWidth: "100%",
  },
  related: {
    toolbar: HeroSubheadingSettings,
  },
};

interface HeroCTAButtonProps {
  text?: string;
  href?: string;
  target?: "_self" | "_blank";
  backgroundColor?: string;
  textColor?: string;
  width?: string;
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
}

export const HeroCTAButton = ({
  text = "Learn More",
  href = "#",
  target = "_self",
  backgroundColor = "#2563eb",
  textColor = "#ffffff",
  width = "auto",
  borderRadius = "8px",
  paddingTop = "12px",
  paddingRight = "24px",
  paddingBottom = "12px",
  paddingLeft = "24px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "0px",
  marginLeft = "0px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: HeroCTAButtonProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const buttonClass = `sdui-hero-cta-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;
  const isAbsolute = positionMode === "absolute";
  const parsedZIndex = Number.parseInt(zIndex, 10);

  return (
    <>
      <style>{`
        .${buttonClass} {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: ${backgroundColor};
          color: ${textColor};
          width: ${width};
          border-radius: ${borderRadius};
          padding: ${padding};
          margin: ${margin};
          text-decoration: none;
          transition: all 0.2s ease-in-out;
          position: ${isAbsolute ? "absolute" : "relative"};
          left: ${isAbsolute ? x : "auto"};
          top: ${isAbsolute ? y : "auto"};
          z-index: ${Number.isNaN(parsedZIndex) ? 1 : parsedZIndex};
        }
        .${buttonClass}:hover {
          opacity: 0.9;
        }
      `}</style>
      <a
        ref={(ref: HTMLAnchorElement | null) => {
          if (ref) connect(drag(ref));
        }}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={buttonClass}
      >
        {text}
      </a>
    </>
  );
};

export const HeroCTAButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Button Text</label>
        <input
          type="text"
          value={props.text ?? "Learn More"}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="Learn More"
          title="Hero CTA button text"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Link</label>
        <input
          type="text"
          value={props.href ?? "#"}
          onChange={(e) => setProp((p: any) => (p.href = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="/admissions"
          title="Hero CTA link"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Target</label>
        <select
          value={props.target ?? "_self"}
          onChange={(e) => setProp((p: any) => (p.target = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          title="Hero CTA target"
        >
          <option value="_self">Same tab</option>
          <option value="_blank">New tab</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">BG Color</label>
          <input
            type="color"
            value={props.backgroundColor ?? "#2563eb"}
            onChange={(e) =>
              setProp((p: any) => (p.backgroundColor = e.target.value))
            }
            className="w-full h-10 border rounded cursor-pointer"
            title="Hero CTA background color"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Text Color</label>
          <input
            type="color"
            value={props.textColor ?? "#ffffff"}
            onChange={(e) =>
              setProp((p: any) => (p.textColor = e.target.value))
            }
            className="w-full h-10 border rounded cursor-pointer"
            title="Hero CTA text color"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Border Radius</label>
        <input
          type="text"
          value={props.borderRadius ?? "8px"}
          onChange={(e) =>
            setProp((p: any) => (p.borderRadius = e.target.value))
          }
          className="w-full px-3 py-2 border rounded"
          placeholder="8px"
          title="Hero CTA border radius"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Width</label>
        <input
          type="text"
          value={props.width ?? "auto"}
          onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
          className="w-full px-3 py-2 border rounded"
          placeholder="auto"
          title="Hero CTA width"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Padding</label>
          <input
            type="text"
            value={props.paddingTop ?? "12px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="12px"
            title="Hero CTA top padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Right Padding
          </label>
          <input
            type="text"
            value={props.paddingRight ?? "24px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="24px"
            title="Hero CTA right padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Padding
          </label>
          <input
            type="text"
            value={props.paddingBottom ?? "12px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="12px"
            title="Hero CTA bottom padding"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Padding</label>
          <input
            type="text"
            value={props.paddingLeft ?? "24px"}
            onChange={(e) =>
              setProp((p: any) => (p.paddingLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="24px"
            title="Hero CTA left padding"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Top Margin</label>
          <input
            type="text"
            value={props.marginTop ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginTop = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero CTA top margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Right Margin</label>
          <input
            type="text"
            value={props.marginRight ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginRight = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero CTA right margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Bottom Margin
          </label>
          <input
            type="text"
            value={props.marginBottom ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginBottom = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero CTA bottom margin"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Left Margin</label>
          <input
            type="text"
            value={props.marginLeft ?? "0px"}
            onChange={(e) =>
              setProp((p: any) => (p.marginLeft = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            placeholder="0px"
            title="Hero CTA left margin"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">
            Position Mode
          </label>
          <select
            value={props.positionMode ?? "flow"}
            onChange={(e) =>
              setProp((p: any) => (p.positionMode = e.target.value))
            }
            className="w-full px-3 py-2 border rounded"
            title="Hero CTA position mode"
          >
            <option value="flow">Flow</option>
            <option value="absolute">Absolute</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Z Index</label>
          <input
            type="number"
            value={props.zIndex ?? "1"}
            onChange={(e) => setProp((p: any) => (p.zIndex = e.target.value))}
            className="w-full px-3 py-2 border rounded"
            placeholder="1"
            title="Hero CTA z index"
          />
        </div>
      </div>
      {(props.positionMode ?? "flow") === "absolute" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">X</label>
            <input
              type="text"
              value={props.x ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero CTA X position"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Y</label>
            <input
              type="text"
              value={props.y ?? "0px"}
              onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
              className="w-full px-3 py-2 border rounded"
              placeholder="0px"
              title="Hero CTA Y position"
            />
          </div>
        </div>
      )}
    </div>
  );
};

HeroCTAButton.craft = {
  displayName: "Hero CTA Button",
  props: {
    text: "Learn More",
    href: "#",
    target: "_self",
    backgroundColor: "#2563eb",
    textColor: "#ffffff",
    width: "auto",
    borderRadius: "8px",
    paddingTop: "12px",
    paddingRight: "24px",
    paddingBottom: "12px",
    paddingLeft: "24px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "0px",
    marginLeft: "0px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: {
    toolbar: HeroCTAButtonSettings,
  },
};

interface HeroBannerProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  headingColor?: string;
  subheadingColor?: string;
  contentAlign?: "left" | "center" | "right";
  contentMaxWidth?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  headingLineHeight?: string;
  headingMarginBottom?: string;
  subheadingFontSize?: string;
  subheadingLineHeight?: string;
  subheadingMarginBottom?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderRadius?: string;
  ctaPaddingTop?: string;
  ctaPaddingRight?: string;
  ctaPaddingBottom?: string;
  ctaPaddingLeft?: string;
  ctaFontWeight?: string;
  backgroundColor?: string;
  color?: string;
  backgroundImage?: string;
  width?: string;
  minHeight?: string;
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
  ctaLink?: string;
  ctaTarget?: "_self" | "_blank";
}

export const HeroBanner = ({
  heading = "Welcome to Our Institution",
  subheading = "Excellence in Education",
  ctaText = "Learn More",
  headingColor = "",
  subheadingColor = "",
  contentAlign = "center",
  contentMaxWidth = "900px",
  headingFontSize = "56px",
  headingFontWeight = "800",
  headingLineHeight = "1.1",
  headingMarginBottom = "16px",
  subheadingFontSize = "20px",
  subheadingLineHeight = "1.6",
  subheadingMarginBottom = "24px",
  ctaBackgroundColor = "#2563eb",
  ctaTextColor = "#ffffff",
  ctaBorderRadius = "8px",
  ctaPaddingTop = "12px",
  ctaPaddingRight = "24px",
  ctaPaddingBottom = "12px",
  ctaPaddingLeft = "24px",
  ctaFontWeight = "600",
  backgroundColor = "transparent",
  color = "#ffffff",
  backgroundImage = "",
  width = "100%",
  minHeight = "400px",
  borderRadius = "0px",
  paddingTop = "60px",
  paddingRight = "20px",
  paddingBottom = "60px",
  paddingLeft = "20px",
  marginTop = "0px",
  marginRight = "0px",
  marginBottom = "0px",
  marginLeft = "0px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
  ctaLink = "#",
  ctaTarget = "_self",
}: HeroBannerProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const heroClass = `sdui-hero-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const padding = `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`;
  const margin = `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`;
  const isAbsolute = positionMode === "absolute";
  const parsedZIndex = Number.parseInt(zIndex, 10);

  return (
    <>
      <style>{`
        .${heroClass} {
          ${backgroundImage ? `background-image: url('${backgroundImage.replace(/'/g, "\\'")}');` : `background-color: ${backgroundColor};`}
          width: ${width};
          min-height: ${minHeight};
          border-radius: ${borderRadius};
          padding: ${padding};
          margin: ${margin};
          position: ${isAbsolute ? "absolute" : "relative"};
          left: ${isAbsolute ? x : "auto"};
          top: ${isAbsolute ? y : "auto"};
          z-index: ${Number.isNaN(parsedZIndex) ? 1 : parsedZIndex};
        }
        .${heroClass} .sdui-hero-title {
          color: ${headingColor || color};
          font-size: ${headingFontSize};
          font-weight: ${headingFontWeight};
          line-height: ${headingLineHeight};
          margin: 0 0 ${headingMarginBottom} 0;
          max-width: ${contentMaxWidth};
          text-align: ${contentAlign};
        }
        .${heroClass} .sdui-hero-subtitle {
          color: ${subheadingColor || color};
          font-size: ${subheadingFontSize};
          line-height: ${subheadingLineHeight};
          margin: 0 0 ${subheadingMarginBottom} 0;
          max-width: ${contentMaxWidth};
          text-align: ${contentAlign};
        }
        .${heroClass} .sdui-hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: ${ctaBackgroundColor};
          color: ${ctaTextColor};
          border-radius: ${ctaBorderRadius};
          padding: ${ctaPaddingTop} ${ctaPaddingRight} ${ctaPaddingBottom} ${ctaPaddingLeft};
          font-weight: ${ctaFontWeight};
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }
        .${heroClass} .sdui-hero-cta:hover {
          opacity: 0.9;
        }
      `}</style>
      <div
        ref={(ref: HTMLDivElement | null) => {
          if (ref) connect(drag(ref));
        }}
        className={`${heroClass} relative overflow-hidden bg-cover bg-center`}
      >
        {backgroundImage && (
          <div className="absolute inset-0 bg-black opacity-40" />
        )}
        <div
          className={`relative z-10 flex min-h-[inherit] flex-col justify-center px-4 ${
            contentAlign === "left"
              ? "items-start"
              : contentAlign === "right"
                ? "items-end"
                : "items-center"
          }`}
        >
          <h1 className="sdui-hero-title">{heading}</h1>
          <p className="sdui-hero-subtitle">{subheading}</p>
          <a
            href={ctaLink}
            target={ctaTarget}
            rel={ctaTarget === "_blank" ? "noopener noreferrer" : undefined}
            className="sdui-hero-cta"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </>
  );
};

export const HeroBannerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Background
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Background Color
            </label>
            <input
              type="color"
              value={props.backgroundColor ?? "transparent"}
              onChange={(e) =>
                setProp((p: any) => (p.backgroundColor = e.target.value))
              }
              className="w-full h-10 border rounded cursor-pointer"
              title="Choose background color"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Default Text Color
            </label>
            <input
              type="color"
              value={props.color ?? "#ffffff"}
              onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
              className="w-full h-10 border rounded cursor-pointer"
              title="Choose text color"
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
              className="w-full px-3 py-2 border rounded text-sm font-mono"
              placeholder="https://..."
              title="Enter background image URL"
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Content
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Heading
            </label>
            <textarea
              value={props.heading ?? "Welcome to Our Institution"}
              onChange={(e) =>
                setProp((p: any) => (p.heading = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
              title="Hero heading text"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Subheading
            </label>
            <textarea
              value={props.subheading ?? "Excellence in Education"}
              onChange={(e) =>
                setProp((p: any) => (p.subheading = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
              title="Hero subheading text"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Content Align
              </label>
              <select
                value={props.contentAlign ?? "center"}
                onChange={(e) =>
                  setProp((p: any) => (p.contentAlign = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                title="Hero content alignment"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Content Max Width
              </label>
              <input
                type="text"
                value={props.contentMaxWidth ?? "900px"}
                onChange={(e) =>
                  setProp((p: any) => (p.contentMaxWidth = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="900px"
                title="Hero content max width"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Heading Size
              </label>
              <input
                type="text"
                value={props.headingFontSize ?? "56px"}
                onChange={(e) =>
                  setProp((p: any) => (p.headingFontSize = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="56px"
                title="Hero heading font size"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Heading Color
              </label>
              <input
                type="color"
                value={props.headingColor ?? props.color ?? "#ffffff"}
                onChange={(e) =>
                  setProp((p: any) => (p.headingColor = e.target.value))
                }
                className="w-full h-10 border rounded cursor-pointer"
                title="Hero heading color"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Heading Weight
              </label>
              <input
                type="text"
                value={props.headingFontWeight ?? "800"}
                onChange={(e) =>
                  setProp((p: any) => (p.headingFontWeight = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="800"
                title="Hero heading font weight"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Heading Line Height
              </label>
              <input
                type="text"
                value={props.headingLineHeight ?? "1.1"}
                onChange={(e) =>
                  setProp((p: any) => (p.headingLineHeight = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="1.1"
                title="Hero heading line height"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Subheading Size
              </label>
              <input
                type="text"
                value={props.subheadingFontSize ?? "20px"}
                onChange={(e) =>
                  setProp((p: any) => (p.subheadingFontSize = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="20px"
                title="Hero subheading font size"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Subheading Color
              </label>
              <input
                type="color"
                value={props.subheadingColor ?? props.color ?? "#ffffff"}
                onChange={(e) =>
                  setProp((p: any) => (p.subheadingColor = e.target.value))
                }
                className="w-full h-10 border rounded cursor-pointer"
                title="Hero subheading color"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Subheading Line Height
              </label>
              <input
                type="text"
                value={props.subheadingLineHeight ?? "1.6"}
                onChange={(e) =>
                  setProp((p: any) => (p.subheadingLineHeight = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="1.6"
                title="Hero subheading line height"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Subheading Margin Bottom
              </label>
              <input
                type="text"
                value={props.subheadingMarginBottom ?? "24px"}
                onChange={(e) =>
                  setProp(
                    (p: any) => (p.subheadingMarginBottom = e.target.value),
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="24px"
                title="Hero subheading margin bottom"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          CTA Button
        </h4>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Text
              </label>
              <input
                type="text"
                value={props.ctaText ?? "Learn More"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaText = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Learn More"
                title="Hero CTA text"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Link
              </label>
              <input
                type="text"
                value={props.ctaLink ?? "#"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaLink = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="#"
                title="Hero CTA link"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button BG
              </label>
              <input
                type="color"
                value={props.ctaBackgroundColor ?? "#2563eb"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaBackgroundColor = e.target.value))
                }
                className="w-full h-10 border rounded cursor-pointer"
                title="Hero CTA background color"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Text Color
              </label>
              <input
                type="color"
                value={props.ctaTextColor ?? "#ffffff"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaTextColor = e.target.value))
                }
                className="w-full h-10 border rounded cursor-pointer"
                title="Hero CTA text color"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Radius
              </label>
              <input
                type="text"
                value={props.ctaBorderRadius ?? "8px"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaBorderRadius = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="8px"
                title="Hero CTA border radius"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Weight
              </label>
              <input
                type="text"
                value={props.ctaFontWeight ?? "600"}
                onChange={(e) =>
                  setProp((p: any) => (p.ctaFontWeight = e.target.value))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="600"
                title="Hero CTA font weight"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Padding Y
              </label>
              <input
                type="text"
                value={props.ctaPaddingTop ?? "12px"}
                onChange={(e) =>
                  setProp((p: any) => {
                    p.ctaPaddingTop = e.target.value;
                    p.ctaPaddingBottom = e.target.value;
                  })
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="12px"
                title="Hero CTA vertical padding"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Button Padding X
              </label>
              <input
                type="text"
                value={props.ctaPaddingRight ?? "24px"}
                onChange={(e) =>
                  setProp((p: any) => {
                    p.ctaPaddingRight = e.target.value;
                    p.ctaPaddingLeft = e.target.value;
                  })
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="24px"
                title="Hero CTA horizontal padding"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Layout
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Width
            </label>
            <input
              type="text"
              value={props.width ?? "100%"}
              onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="100%"
              title="Set hero banner width"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Min Height
            </label>
            <input
              type="text"
              value={props.minHeight ?? "400px"}
              onChange={(e) =>
                setProp((p: any) => (p.minHeight = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="400px"
              title="Set hero banner minimum height"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Border Radius
            </label>
            <input
              type="text"
              value={props.borderRadius ?? "0px"}
              onChange={(e) =>
                setProp((p: any) => (p.borderRadius = e.target.value))
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="0px"
              title="Set border radius"
            />
          </div>
        </div>
      </div>

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
              <input
                type="text"
                value={(props as any)[key] ?? "20px"}
                onChange={(e) =>
                  setProp((p: any) => ((p as any)[key] = e.target.value))
                }
                className="w-full px-2 py-1.5 border rounded text-xs"
                placeholder="20px"
                title={`Set padding for ${label}`}
              />
            </div>
          ))}
        </div>
      </div>

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
              <input
                type="text"
                value={(props as any)[key] ?? "0px"}
                onChange={(e) =>
                  setProp((p: any) => ((p as any)[key] = e.target.value))
                }
                className="w-full px-2 py-1.5 border rounded text-xs"
                placeholder="0px"
                title={`Set margin for ${label}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-b pb-4">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
          Position
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Mode
            </label>
            <select
              value={props.positionMode ?? "flow"}
              onChange={(e) =>
                setProp((p: any) => (p.positionMode = e.target.value))
              }
              className="w-full px-2 py-1.5 border rounded text-xs"
              title="Set hero position mode"
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
              onChange={(e) => setProp((p: any) => (p.zIndex = e.target.value))}
              className="w-full px-2 py-1.5 border rounded text-xs"
              placeholder="1"
              title="Set hero z-index"
            />
          </div>
        </div>
        {(props.positionMode ?? "flow") === "absolute" && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                X
              </label>
              <input
                type="text"
                value={props.x ?? "0px"}
                onChange={(e) => setProp((p: any) => (p.x = e.target.value))}
                className="w-full px-2 py-1.5 border rounded text-xs"
                placeholder="0px"
                title="Set hero X position"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Y
              </label>
              <input
                type="text"
                value={props.y ?? "0px"}
                onChange={(e) => setProp((p: any) => (p.y = e.target.value))}
                className="w-full px-2 py-1.5 border rounded text-xs"
                placeholder="0px"
                title="Set hero Y position"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

HeroBanner.craft = {
  displayName: "Hero Banner",
  isCanvas: true,
  props: {
    heading: "Welcome to Our Institution",
    subheading: "Excellence in Education",
    ctaText: "Learn More",
    headingColor: "",
    subheadingColor: "",
    contentAlign: "center",
    contentMaxWidth: "900px",
    headingFontSize: "56px",
    headingFontWeight: "800",
    headingLineHeight: "1.1",
    headingMarginBottom: "16px",
    subheadingFontSize: "20px",
    subheadingLineHeight: "1.6",
    subheadingMarginBottom: "24px",
    ctaBackgroundColor: "#2563eb",
    ctaTextColor: "#ffffff",
    ctaBorderRadius: "8px",
    ctaPaddingTop: "12px",
    ctaPaddingRight: "24px",
    ctaPaddingBottom: "12px",
    ctaPaddingLeft: "24px",
    ctaFontWeight: "600",
    backgroundColor: "transparent",
    color: "#ffffff",
    backgroundImage: "",
    width: "100%",
    minHeight: "400px",
    borderRadius: "0px",
    paddingTop: "60px",
    paddingRight: "20px",
    paddingBottom: "60px",
    paddingLeft: "20px",
    marginTop: "0px",
    marginRight: "0px",
    marginBottom: "0px",
    marginLeft: "0px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
    ctaLink: "#",
    ctaTarget: "_self",
  },
  related: {
    toolbar: HeroBannerSettings,
  },
};
