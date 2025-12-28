import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ TypeScript build errors ignore (LAST option)
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    domains: [
      "via.placeholder.com", // placeholder images
      "cdn.pixabay.com",     // product images
      // add other domains as needed
    ],
  },
};

export default nextConfig;
