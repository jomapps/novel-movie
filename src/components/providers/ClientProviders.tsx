'use client'

import { ReactNode } from 'react'
import { SelectedProjectProvider } from '@/contexts/SelectedProjectContext'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SelectedProjectProvider>
      {children}
    </SelectedProjectProvider>
  )
}
