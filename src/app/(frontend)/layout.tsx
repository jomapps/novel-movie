import React from 'react'
import ClientProviders from '@/components/providers/ClientProviders'
import './styles.css'

export const metadata = {
  title: 'Novel Movie',
  description: 'Novel Movie - AI-powered movie production platform',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
