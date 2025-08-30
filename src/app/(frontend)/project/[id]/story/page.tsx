'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, InitialConcept, Story } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StoryStatusSidebar from '@/components/story/StoryStatusSidebar'
import StoryContent from '@/components/story/StoryContent'
import { AlertCircle } from 'lucide-react'

export default function StoryPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [initialConcept, setInitialConcept] = useState<InitialConcept | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch project
        const projectResponse = await fetch(`/api/projects/${projectId}`)
        if (!projectResponse.ok) {
          throw new Error('Failed to fetch project')
        }
        const projectData = await projectResponse.json()
        setProject(projectData)

        // Fetch initial concept
        const conceptResponse = await fetch(
          `/api/initial-concepts?where[project][equals]=${projectId}`,
        )
        if (!conceptResponse.ok) {
          throw new Error('Failed to fetch initial concept')
        }
        const conceptData = await conceptResponse.json()

        if (conceptData.docs && conceptData.docs.length > 0) {
          setInitialConcept(conceptData.docs[0])
        }

        // Fetch story if it exists
        const storyResponse = await fetch(`/api/stories?where[project][equals]=${projectId}`)
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

  // Check if project has required data for story generation
  const hasRequiredProjectData = () => {
    if (!project) return false

    // Check for essential fields in project
    const hasGenres = project.primaryGenres && project.primaryGenres.length > 0
    const hasPremise = project.corePremise && project.corePremise.trim().length > 0
    const hasAudience = project.targetAudience && project.targetAudience.trim().length > 0

    return hasGenres && hasPremise && hasAudience
  }

  if (loading) {
    return (
      <DashboardLayout
        title="Story"
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
        title="Story"
        subtitle={project ? `Project: ${project.name}` : 'Error'}
        showSearch={false}
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Story</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout title="Story" subtitle="Project not found" showSearch={false}>
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

  // Show popup message if project data is missing
  if (!hasRequiredProjectData()) {
    return (
      <DashboardLayout title="Story" subtitle={`Project: ${project.name}`} showSearch={false}>
        <div className="flex justify-center items-center h-64">
          <div className="max-w-md mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Data Required</h3>
            <p className="text-gray-600 mb-4">
              Before you can view or generate stories, you need to complete the project with all
              essential fields: genres, premise, and target audience.
            </p>
            <a
              href={`/projects`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Project
            </a>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Story Status Sidebar */}
      <StoryStatusSidebar
        project={project}
        initialConcept={initialConcept}
        story={story}
        onStoryUpdate={setStory}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Story</h1>
            <p className="text-gray-600">{`Project: ${project.name}`}</p>
          </div>
        </div>

        <StoryContent
          project={project}
          initialConcept={initialConcept}
          story={story}
          onStoryUpdate={setStory}
        />
      </div>
    </div>
  )
}
