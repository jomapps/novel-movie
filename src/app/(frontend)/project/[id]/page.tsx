'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Project } from '@/payload-types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface ProjectResponse {
  success: boolean
  data: Project
  error?: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/v1/projects/${params.id}`)
        const data: ProjectResponse = await response.json()

        if (data.success) {
          setProject(data.data)
        } else {
          setError(data.error || 'Project not found')
        }
      } catch (err) {
        setError('Failed to fetch project')
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Fetching project details" showSearch={false}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout
        title="Project Not Found"
        subtitle="The requested project could not be found"
        showSearch={false}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const movieFormat = typeof project.movieFormat === 'object' ? project.movieFormat : null
  const movieStyle = typeof project.movieStyle === 'object' ? project.movieStyle : null
  const series = typeof project.series === 'object' ? project.series : null

  return (
    <DashboardLayout
      title={project.projectTitle || project.name}
      subtitle={`Project: ${project.name}`}
      showSearch={false}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.projectTitle || project.name}
                </h1>
                {project.projectTitle && project.name !== project.projectTitle && (
                  <p className="text-gray-600">Project: {project.name}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  project.status,
                )}`}
              >
                {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
              </span>
            </div>

            {project.shortDescription && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
                <p className="text-gray-700">{project.shortDescription}</p>
              </div>
            )}

            {project.longDescription && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <div className="prose max-w-none text-gray-700">
                  {/* For now, display as plain text. In a real app, you'd render the rich text properly */}
                  <p>{project.longDescription}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>

                {movieFormat && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Format</dt>
                    <dd className="text-sm text-gray-900">{movieFormat.name}</dd>
                    {movieFormat.description && (
                      <dd className="text-xs text-gray-600 mt-1">{movieFormat.description}</dd>
                    )}
                  </div>
                )}

                {movieStyle && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Style</dt>
                    <dd className="text-sm text-gray-900">{movieStyle.name}</dd>
                    {movieStyle.description && (
                      <dd className="text-xs text-gray-600 mt-1">{movieStyle.description}</dd>
                    )}
                  </div>
                )}

                {series && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Series</dt>
                    <dd className="text-sm text-gray-900">{series.name}</dd>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{formatDate(project.createdAt)}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">{formatDate(project.updatedAt)}</dd>
                </div>
              </div>
            </div>

            {project.generatedContent && (
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h2>

                {project.generatedContent.script && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Script</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">Script content available</p>
                    </div>
                  </div>
                )}

                {project.generatedContent.scenes && project.generatedContent.scenes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Scenes ({project.generatedContent.scenes.length})
                    </h3>
                    <div className="space-y-2">
                      {project.generatedContent.scenes.map((scene, index) => (
                        <div key={scene.id || index} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-900">
                              Scene {scene.sceneNumber}
                            </span>
                          </div>
                          {scene.description && (
                            <p className="text-sm text-gray-600 mt-1">{scene.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.generatedContent.finalVideo && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Final Video</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">Final video available</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button onClick={() => router.push(`/project/${project.id}/edit`)}>
                Edit Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
