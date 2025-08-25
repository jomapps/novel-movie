'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Project } from '@/payload-types'
import ProjectCard from '@/components/projects/ProjectCard'
import EmptyState from '@/components/projects/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface ProjectsResponse {
  success: boolean
  data: {
    docs: Project[]
    totalDocs: number
    limit: number
    totalPages: number
    page: number
    pagingCounter: number
    hasPrevPage: boolean
    hasNextPage: boolean
    prevPage: number | null
    nextPage: number | null
  }
  error?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)

  const fetchProjects = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/v1/projects?page=${page}&limit=12`)
      const data: ProjectsResponse = await response.json()

      if (data.success) {
        setProjects(data.data.docs)
        setTotalPages(data.data.totalPages)
        setHasNextPage(data.data.hasNextPage)
        setHasPrevPage(data.data.hasPrevPage)
        setCurrentPage(data.data.page)
      } else {
        setError(data.error || 'Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handlePageChange = (page: number) => {
    fetchProjects(page)
  }

  const headerActions = (
    <Link href="/project/create">
      <Button>Create New Project</Button>
    </Link>
  )

  if (loading) {
    return (
      <DashboardLayout
        title="Projects"
        subtitle="Manage your movie projects"
        actions={headerActions}
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        title="Projects"
        subtitle="Manage your movie projects"
        actions={headerActions}
      >
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => fetchProjects(currentPage)}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Projects" subtitle="Manage your movie projects" actions={headerActions}>
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
