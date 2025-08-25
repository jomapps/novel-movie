'use client'

import { useState } from 'react'
import { Bell, X, Plus, User } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onMenuToggle: () => void
  actions?: React.ReactNode
  showSearch?: boolean
}

export default function DashboardHeader({
  title,
  subtitle,
  onMenuToggle,
  actions,
  showSearch = true,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedProject, deselectProject } = useSelectedProject()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu toggle and navigation */}
          <div className="flex items-center space-x-6">
            {/* Menu toggle - only show when project is selected */}
            {selectedProject && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Main Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/projects"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Projects
              </Link>
            </nav>
          </div>

          {/* Right side - Project name, Add project, Notifications, User */}
          <div className="flex items-center space-x-4">
            {/* Selected Project Name */}
            {selectedProject && (
              <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">
                    {selectedProject.projectTitle || selectedProject.name}
                  </span>
                  <button
                    onClick={deselectProject}
                    className="ml-2 p-0.5 rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Deselect project"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Add New Project Icon */}
            <Link href="/project/create">
              <button
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                title="Create new project"
              >
                <Plus className="w-5 h-5" />
              </button>
            </Link>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">User</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
