import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Novel Movie - AI-powered movie production platform',
  title: 'Novel Movie',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
