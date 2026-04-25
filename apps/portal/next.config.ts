import type { NextConfig } from "next";

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/pilot/:path*",
        destination: `${apiBaseUrl}/api/pilot/:path*`,
      },
      {
        source: "/api/internal/:path*",
        destination: `${apiBaseUrl}/api/internal/:path*`,
      },
    ];
  },
};

export default nextConfig;
