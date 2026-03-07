import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build için (kendi hosting'de çalışması için)
  output: 'standalone',
  
  // Production optimizations
  compress: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
