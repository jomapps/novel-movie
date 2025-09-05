'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, Story } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import StoryStatusSidebar from '@/components/story/StoryStatusSidebar'
import StoryContent from '@/components/story/StoryContent'
import { useSelectedProject } from '@/contexts/SelectedProjectContext'
import { AlertCircle } from 'lucide-react'

export default function StoryPage() {
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
        // Set the project as selected in the context
        selectProject(projectData)

        // Fetch story if it exists
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

  // Check if project has required data for story generation
  const hasRequiredProjectData = () => {
    if (!project) return false

    // Check for essential fields in project
    const hasName = project.name && project.name.trim().length > 0
    const hasFormat = project.movieFormat
    const hasStyle = project.movieStyle

    return hasName && hasFormat && hasStyle
  }

  // Get missing project fields for better user messaging
  const getMissingFields = () => {
    if (!project) return []

    const missing = []
    if (!project.name || project.name.trim().length === 0) missing.push('Project Name')
    if (!project.movieFormat) missing.push('Movie Format')
    if (!project.movieStyle) missing.push('Movie Style')
    if (!project.primaryGenres || project.primaryGenres.length === 0) missing.push('Primary Genres')
    if (!project.corePremise || project.corePremise.trim().length === 0)
      missing.push('Core Premise')
    if (!project.targetAudience || project.targetAudience.length === 0)
      missing.push('Target Audience')
    if (!project.tone || project.tone.length === 0) missing.push('Tone')

    return missing
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

  // Show message if project data is missing
  if (!hasRequiredProjectData()) {
    const missingFields = getMissingFields()
    const hasOptionalFields = missingFields.length > 3 // More than just the required fields

    return (
      <DashboardLayout
        title="Story"
        subtitle={`Project: ${project?.name || 'Unknown'}`}
        showSearch={false}
      >
        <div className="flex justify-center items-center min-h-64">
          <div className="max-w-lg mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Setup Required</h3>
            <p className="text-gray-600 mb-4">
              {hasOptionalFields
                ? 'Your project needs some essential fields to generate stories. While you can generate stories with basic project info, adding more details will significantly improve story quality.'
                : 'Your project is missing some required fields for story generation.'}
            </p>
            {missingFields.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Missing fields:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {missingFields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <a
                href={`/projects`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Project
              </a>
              {hasOptionalFields && (
                <button
                  onClick={() => {
                    // Allow story generation with minimal data
                    // The API will handle validation and show appropriate errors
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Continue Anyway
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Story" subtitle={`Project: ${project.name}`} showSearch={false}>
      <div className="flex">
        {/* Story Status Sidebar */}
        <StoryStatusSidebar project={project} story={story} onStoryUpdate={setStory} />

        {/* Main Content */}
        <div className="ml-64 flex-1">
          <StoryContent project={project} story={story} onStoryUpdate={setStory} />
        </div>
      </div>
    </DashboardLayout>
  )
}
