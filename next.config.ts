import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const basePathValue = isProduction ? "/PathForms" : "";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  // basePath: basePathValue,
  trailingSlash: true, // recommended for static hosting
  env: {
    NEXT_PUBLIC_BASE_PATH: basePathValue,
  },
};

export default nextConfig;
