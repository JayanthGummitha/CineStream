import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
  // Empty turbopack config to silence webpack warning (Turbopack is default in Next.js 16)
  turbopack: {},
  webpack: (config) => {
    // Optimize GSAP for tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'gsap/ScrollTrigger': 'gsap/ScrollTrigger',
      'gsap/TextPlugin': 'gsap/TextPlugin',
      'gsap/MotionPathPlugin': 'gsap/MotionPathPlugin',
    };
    
    return config;
  },
  experimental: {
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ['gsap'],
  },
};

export default nextConfig;
