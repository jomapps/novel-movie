'use client'

import { useState, ReactNode } from 'react'
import Sidebar from './Sidebar'
import FieldStatusSidebar from './FieldStatusSidebar'
import DashboardHeader from './DashboardHeader'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
  showSearch?: boolean
  formData?: any // For field status sidebar
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  showSearch = true,
  formData,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { selectedProject } = useSelectedProject()
  const pathname = usePathname()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Check if we're on the Initial Concept page
  const isInitialConceptPage = pathname.includes('/initial-concept')
  // Check if we're on the Story page (it has its own sidebar)
  const isStoryPage = pathname.includes('/story')

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar - conditionally show field status or navigation */}
        {selectedProject && !isStoryPage && (
          <>
            {isInitialConceptPage && formData ? (
              <FieldStatusSidebar
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
                pageTitle={title}
                formData={formData}
              />
            ) : (
              <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} pageTitle={title} />
            )}
          </>
        )}

        {/* Main content */}
        <div className={selectedProject && !isStoryPage ? 'lg:pl-64' : ''}>
          {/* Header */}
          <DashboardHeader
            title={title}
            subtitle={subtitle}
            onMenuToggle={toggleSidebar}
            actions={actions}
            showSearch={showSearch}
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
