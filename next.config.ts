import type { NextConfig } from "next";

const browserHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=0, must-revalidate",
  },
];

function taggedCdnHeaders(tag: string) {
  return [
    ...browserHeaders,
    {
      key: "Vercel-CDN-Cache-Control",
      value: "public, max-age=31536000",
    },
    {
      key: "Vercel-Cache-Tag",
      value: tag,
    },
    {
      key: "X-Repro-Tag",
      value: tag,
    },
    {
      key: "X-Repro-Tag-Source",
      value: "next-config",
    },
  ];
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/",
        headers: taggedCdnHeaders("cdn-home"),
      },
      {
        source: "/route",
        headers: taggedCdnHeaders("cdn-route"),
      },
      {
        source: "/control/page-add-cache-tag",
        headers: [
          ...browserHeaders,
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, max-age=31536000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
