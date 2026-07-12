import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cloudinary domain untuk preview image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Suppress known Mongoose/serverless warning
  serverExternalPackages: ['mongoose'],
}

export default nextConfig
