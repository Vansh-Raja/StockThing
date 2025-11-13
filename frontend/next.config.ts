import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In production, proxy API requests to backend
    // This allows the frontend to use relative URLs (/api/*) which work with HTTPS
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
