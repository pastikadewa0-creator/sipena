import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  }
})

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
  turbopack: {},
}

export default withPWA(nextConfig)
