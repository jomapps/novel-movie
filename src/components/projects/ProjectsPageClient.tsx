'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Project } from '@/payload-types'
import ProjectCard from '@/components/projects/ProjectCard'
import EmptyState from '@/components/projects/EmptyState'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectsPagination from '@/components/projects/ProjectsPagination'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ToastContainer, { useToast } from '@/components/ui/ToastContainer'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'

interface ProjectsPageClientProps {
  initialProjects: {
    docs: Project[]
    totalPages: number
    page: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
  const router = useRouter()
  const { selectedProject, deselectProject } = useSelectedProject()
  const { toasts, removeToast, success, error } = useToast()
  const [projects, setProjects] = useState(initialProjects)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    projectId: string
    projectName: string
  }>({
    isOpen: false,
    projectId: '',
    projectName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (projectId: string) => {
    const project = projects.docs.find((p) => p.id === projectId)
    if (project) {
      setDeleteDialog({
        isOpen: true,
        projectId,
        projectName: project.projectTitle || project.name,
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.projectId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/v1/projects/${deleteDialog.projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete project')
      }

      // Remove project from local state
      setProjects((prev) => ({
        ...prev,
        docs: prev.docs.filter((p) => p.id !== deleteDialog.projectId),
      }))

      // If the deleted project was selected, deselect it
      if (selectedProject?.id === deleteDialog.projectId) {
        deselectProject()
      }

      // Close dialog
      setDeleteDialog({ isOpen: false, projectId: '', projectName: '' })

      // Show success message
      success('Project Deleted', `"${deleteDialog.projectName}" has been permanently deleted.`)

      // Refresh the page to get updated data
      router.refresh()
    } catch (err) {
      console.error('Error deleting project:', err)
      error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, projectId: '', projectName: '' })
  }

  if (projects.docs.length === 0) {
    return (
      <DashboardLayout title="Projects" subtitle="Manage your movie projects" showSearch={false}>
        <EmptyState />
      </DashboardLayout>
    )
  }

  return (
    <>
      <DashboardLayout title="Projects" subtitle="Manage your movie projects" showSearch={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {projects.docs.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDeleteClick} />
          ))}
        </div>

        {projects.totalPages > 1 && (
          <ProjectsPagination
            currentPage={projects.page}
            totalPages={projects.totalPages}
            hasNextPage={projects.hasNextPage}
            hasPrevPage={projects.hasPrevPage}
          />
        )}
      </DashboardLayout>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Are you sure you want to delete the project &quot;{deleteDialog.projectName}&quot;?
            </p>
            <p className="text-sm text-red-600 font-medium">This action cannot be undone.</p>
          </div>
        }
        confirmText="Delete"
        confirmVariant="secondary"
        loading={isDeleting}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}
