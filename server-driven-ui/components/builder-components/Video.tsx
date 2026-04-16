"use client";
/* eslint-disable */

import React from "react";
import { useNode } from "@craftjs/core";

interface VideoProps {
  src?: string;
  title?: string;
  ratio?: "16:9" | "4:3" | "1:1";
  borderRadius?: string;
}

const ratioMap: Record<NonNullable<VideoProps["ratio"]>, string> = {
  "16:9": "56.25%",
  "4:3": "75%",
  "1:1": "100%",
};

export const Video = ({
  src = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  title = "Video",
  ratio = "16:9",
  borderRadius = "16px",
}: VideoProps) => {
  const {
    id,
    connectors: { connect, drag },
  } = useNode((node) => ({ id: node.id }));

  const videoClass = `sdui-video-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="w-full"
    >
      <style>{`
        .${videoClass} {
          position: relative;
          width: 100%;
          padding-top: ${ratioMap[ratio]};
          border-radius: ${borderRadius};
          overflow: hidden;
        }
        .${videoClass} iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
      <div className={videoClass}>
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
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
          placeholder="https://..."
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
    </div>
  );
};

Video.craft = {
  displayName: "Video",
  props: {
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Video",
    ratio: "16:9",
    borderRadius: "16px",
  },
  related: { toolbar: VideoSettings },
};
