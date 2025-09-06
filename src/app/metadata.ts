import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Novel Movie',
  description: 'AI-powered movie production platform',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        sizes: '32x32',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#e50914',
  colorScheme: 'dark',
  viewport: 'width=device-width, initial-scale=1',
}
