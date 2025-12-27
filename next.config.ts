import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "via.placeholder.com", // for placeholder images
      "cdn.pixabay.com", // for product images from Pixabay
      // add other domains as needed
    ],
  },
};

export default nextConfig;
