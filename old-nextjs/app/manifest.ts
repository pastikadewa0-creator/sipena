import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIPENA - Sistem Absensi',
    short_name: 'SIPENA',
    description: 'Sistem Absensi Karyawan',
    start_url: '/login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4F46E5', // match with the primary color
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
