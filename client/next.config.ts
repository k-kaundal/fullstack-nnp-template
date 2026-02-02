import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  reactStrictMode: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components/ui', '@/lib/utils'],
  },
};

export default nextConfig;
