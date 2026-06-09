import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // Foto (ridotte lato client) e scansioni PDF del libretto restano sotto questo limite.
      bodySizeLimit: "10mb",
      allowedOrigins:
        process.env.NODE_ENV === "production"
          ? (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS?.split(",") ?? [])
          : [],
    },
  },
};

export default nextConfig;
