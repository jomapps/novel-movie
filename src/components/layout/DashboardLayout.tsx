'use client'

import { useState, ReactNode } from 'react'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main content */}
        <div className="dashboard-main-content lg:pl-64">
          {/* Header */}
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            onMenuToggle={toggleSidebar}
            actions={actions}
          />

          {/* Page content */}
          <main className="flex-1">
            <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
