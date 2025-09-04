'use client'

import { useState } from 'react'
import { Bell, X, Plus, User, Menu } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { selectedProject, deselectProject } = useSelectedProject()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu toggle and navigation */}
          <div className="flex items-center space-x-6">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="w-6 h-6" />
            </button>

            {/* Main Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/projects"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Projects
              </Link>

              {/* Project-specific menu items - only visible when project is selected */}
              {selectedProject && (
                <>
                  <Link
                    href={`/project/${selectedProject.id}`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Project
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/initial-concept`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Initial Concept
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/story`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Story
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/screenplay`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Screenplay
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/scenes`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Scenes
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/media`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Media
                  </Link>
                  <Link
                    href={`/project/${selectedProject.id}/settings`}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Settings
                  </Link>
                </>
              )}
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

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <Link
              href="/projects"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>

            {/* Project-specific menu items - only visible when project is selected */}
            {selectedProject && (
              <>
                <Link
                  href={`/project/${selectedProject.id}`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Project
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/initial-concept`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Initial Concept
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/story`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Story
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/screenplay`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Screenplay
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/scenes`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Scenes
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/media`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Media
                </Link>
                <Link
                  href={`/project/${selectedProject.id}/settings`}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
