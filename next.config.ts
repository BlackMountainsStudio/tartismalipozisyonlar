import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build için (kendi hosting'de çalışması için)
  output: "standalone",

  // Production optimizations
  compress: true,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // OAuth profil resimleri (Google, Facebook)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
