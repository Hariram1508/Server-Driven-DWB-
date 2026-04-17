"use client";
/* eslint-disable */

import React from "react";
import { useEditor, useNode } from "@craftjs/core";

interface VideoProps {
  src?: string;
  title?: string;
  ratio?: "16:9" | "4:3" | "1:1";
  width?: string;
  height?: string;
  heightMode?: "ratio" | "fixed";
  borderRadius?: string;
  positionMode?: "flow" | "absolute";
  x?: string;
  y?: string;
  zIndex?: string;
}

const ratioMap: Record<NonNullable<VideoProps["ratio"]>, string> = {
  "16:9": "56.25%",
  "4:3": "75%",
  "1:1": "100%",
};

export const Video = ({
  src = "",
  title = "Video",
  ratio = "16:9",
  width = "100%",
  height = "360px",
  heightMode = "ratio",
  borderRadius = "16px",
  positionMode = "flow",
  x = "0px",
  y = "0px",
  zIndex = "1",
}: VideoProps) => {
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const videoClass = `sdui-video-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const normalizeVideoUrl = (value?: string) => {
    const raw = (value ?? "").trim();
    if (!raw) return "";

    const watchMatch = raw.match(/youtube\.com\/watch\?v=([\w-]+)/i);
    if (watchMatch?.[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    const shortMatch = raw.match(/youtu\.be\/([\w-]+)/i);
    if (shortMatch?.[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    return raw;
  };

  const embedUrl = normalizeVideoUrl(src);
  const hasVideo = embedUrl.length > 0;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`w-full ${videoClass}-wrapper`}
    >
      <style>{`
        .${videoClass}-wrapper {
          position: ${positionMode === "absolute" ? "absolute" : "relative"};
          left: ${positionMode === "absolute" ? x : "auto"};
          top: ${positionMode === "absolute" ? y : "auto"};
          z-index: ${Number(zIndex) || 1};
        }
        .${videoClass} {
          position: relative;
          width: ${width};
          padding-top: ${heightMode === "ratio" ? ratioMap[ratio] : "0"};
          height: ${heightMode === "fixed" ? height : "auto"};
          border-radius: ${borderRadius};
          overflow: hidden;
        }
        .${videoClass} iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          pointer-events: ${enabled ? "none" : "auto"};
        }
      `}</style>

      <div className={videoClass}>
        {hasVideo ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center px-4 border border-dashed border-gray-300">
            Add a video URL in settings to display the video
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Embed URL
        </label>
        <input
          value={props.src ?? ""}
          onChange={(e) => setProp((p: any) => (p.src = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Video embed URL"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Video Title
        </label>
        <input
          value={props.title ?? "Video"}
          onChange={(e) => setProp((p: any) => (p.title = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Video title"
          placeholder="Video"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          Aspect Ratio
        </label>
        <select
          value={props.ratio ?? "16:9"}
          onChange={(e) => setProp((p: any) => (p.ratio = e.target.value))}
          className="w-full px-3 py-2 border rounded text-sm"
          title="Video aspect ratio"
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
        </select>
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
            title="Video width"
            placeholder="100%"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Height Mode
          </label>
          <select
            value={props.heightMode ?? "ratio"}
            onChange={(e) =>
              setProp((p: any) => (p.heightMode = e.target.value))
            }
            className="w-full px-3 py-2 border rounded text-sm"
            title="Video height mode"
          >
            <option value="ratio">Aspect Ratio</option>
            <option value="fixed">Fixed Height</option>
          </select>
        </div>
      </div>

      {(props.heightMode ?? "ratio") === "fixed" && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Height
          </label>
          <input
            value={props.height ?? "360px"}
            onChange={(e) => setProp((p: any) => (p.height = e.target.value))}
            className="w-full px-3 py-2 border rounded text-sm"
            title="Video height"
            placeholder="360px"
          />
        </div>
      )}

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
          title="Video border radius"
          placeholder="16px"
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
          title="Video position mode"
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
          title="Video z-index"
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
              title="Video X position"
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
              title="Video Y position"
              placeholder="0px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

Video.craft = {
  displayName: "Video",
  props: {
    src: "",
    title: "Video",
    ratio: "16:9",
    width: "100%",
    height: "360px",
    heightMode: "ratio",
    borderRadius: "16px",
    positionMode: "flow",
    x: "0px",
    y: "0px",
    zIndex: "1",
  },
  related: { toolbar: VideoSettings },
};
