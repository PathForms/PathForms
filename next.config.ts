import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  // basePath: '/PathForms',
  trailingSlash: true, // recommended for static hosting
};

export default nextConfig;
