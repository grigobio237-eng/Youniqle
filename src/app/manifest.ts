import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Youniqle',
    short_name: 'Youniqle',
    description: '번아웃 극복을 위한 유니클 맞춤 회복 솔루션',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0D10',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/character/youniqle-1.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/character/youniqle-1.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
