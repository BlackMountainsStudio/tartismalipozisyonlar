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

  // 301 redirects for old/English URLs
  async redirects() {
    return [
      { source: "/commentators", destination: "/yorumcular", permanent: true },
      { source: "/commentators/:slug", destination: "/yorumcular/:slug", permanent: true },
    ];
  },

  // OAuth profil resimleri (Google) + YouTube thumbnail'lar
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
