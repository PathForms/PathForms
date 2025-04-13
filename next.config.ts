import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  // This is commented out for local testing!
  // For development, uncomment this line!
  // basePath: '/PathForms',
  trailingSlash: true, // recommended for static hosting
};

export default nextConfig;
