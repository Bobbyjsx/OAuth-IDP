import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const isCloudflareBuild = process.env.CLOUDFLARE === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  compress: true,
  env: {
    CLOUDFLARE: process.env.CLOUDFLARE ?? "",
  },
  images: {
    unoptimized: isCloudflareBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@tanstack/react-query", "sonner"],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();
