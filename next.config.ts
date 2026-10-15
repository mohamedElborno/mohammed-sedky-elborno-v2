import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Uploaded images are served by the Convex deployment, so the allowed host
// follows whichever deployment this build points at.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexPattern = convexUrl ? new URL(convexUrl) : null;

const nextConfig: NextConfig = {
  // Lets a phone on the same network open the dev server by its local address;
  // without this Next blocks the dev scripts and the page never starts.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      ...(convexPattern
        ? [
            {
              protocol: convexPattern.protocol.replace(":", "") as
                "http" | "https",
              hostname: convexPattern.hostname,
              port: convexPattern.port,
              pathname: "/api/storage/**",
            },
          ]
        : []),
      {
        protocol: "https" as const,
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
