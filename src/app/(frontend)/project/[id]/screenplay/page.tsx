'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, Story } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ScreenplayStatusSidebar from '@/components/screenplay/ScreenplayStatusSidebar'
import ScreenplayContent from '@/components/screenplay/ScreenplayContent'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'
import { AlertCircle, BookOpen } from 'lucide-react'

export default function ScreenplayPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectProject } = useSelectedProject()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch project with depth to include related data
        const projectResponse = await fetch(`/v1/projects/${projectId}`)
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project')
        }
        const projectResult = await projectResponse.json()
        const projectData = projectResult.data || projectResult.doc || projectResult
        setProject(projectData)

        // Set as selected project
        selectProject(projectData)

        // Fetch story data
        const storyResponse = await fetch(`/v1/stories?where[project][equals]=${projectId}&limit=1`)
        if (storyResponse.ok) {
          const storyData = await storyResponse.json()
          if (storyData.docs && storyData.docs.length > 0) {
            setStory(storyData.docs[0])
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchData()
    }
  }, [projectId])

  // Check if story is available (prerequisite for screenplay)
  const hasStory = story && story.currentContent && story.status !== 'in-progress'

  if (loading) {
    return (
      <DashboardLayout
        title="Screenplay"
        subtitle={project ? `Project: ${project.name}` : 'Loading...'}
        showSearch={false}
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
        title="Screenplay"
        subtitle={project ? `Project: ${project.name}` : 'Error'}
        showSearch={false}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Screenplay</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout title="Screenplay" subtitle="Project not found" showSearch={false}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
            <p className="text-gray-600">The requested project could not be found.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show message if story is not ready
  if (!hasStory) {
    return (
      <DashboardLayout
        title="Screenplay"
        subtitle={`Project: ${project?.name || 'Unknown'}`}
        showSearch={false}
      >
        <div className="flex justify-center items-center min-h-64">
          <div className="max-w-lg mx-auto text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
            <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Story Required</h3>
            <p className="text-gray-600 mb-4">
              A completed story is required before screenplay generation can begin. Please complete
              your story development first.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Current Status:</strong>{' '}
                {!story
                  ? 'No story generated'
                  : `Story ${story.status} (Step ${story.currentStep}/12)`}
              </p>
            </div>
            <div className="mt-6">
              <a
                href={`/project/${projectId}/story`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Go to Story Development
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Screenplay" subtitle={`Project: ${project.name}`} showSearch={false}>
      <div className="flex">
        {/* Screenplay Status Sidebar */}
        <ScreenplayStatusSidebar project={project} story={story} />

        {/* Main Content */}
        <div className="ml-64 flex-1">
          <ScreenplayContent project={project} story={story} />
        </div>
      </div>
    </DashboardLayout>
  )
}
