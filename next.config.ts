import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.magnific.com" },
      { protocol: "https", hostname: "example.com" },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    useTypeScriptCli: false,
  },
};

export default nextConfig;
