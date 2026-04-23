import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, immutable",
          },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/edit/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/login",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/register",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
