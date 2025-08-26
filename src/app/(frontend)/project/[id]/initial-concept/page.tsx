'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Trash2 } from 'lucide-react'
import { Project, InitialConcept } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import ToastContainer, { useToast } from '@/components/ui/ToastContainer'
import InitialConceptForm from '@/components/forms/InitialConceptForm'
// Removed problematic PayloadCMS client-side import

interface InitialConceptResponse {
  success: boolean
  data?: InitialConcept
  error?: string
}

interface ProjectResponse {
  success: boolean
  data?: Project
  error?: string
}

export default function InitialConceptPage() {
  const params = useParams()
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [initialConcept, setInitialConcept] = useState<InitialConcept | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [currentFormData, setCurrentFormData] = useState<any>(null) // Track form state for sidebar

  // Fetch project and initial concept data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch project details
        const projectResponse = await fetch(`/v1/projects/${params.id}`)
        const projectData: ProjectResponse = await projectResponse.json()

        if (!projectData.success || !projectData.data) {
          setPageError(projectData.error || 'Project not found')
          return
        }

        setProject(projectData.data)

        // Fetch existing initial concept for this project
        const conceptResponse = await fetch(`/v1/initial-concepts?project=${params.id}`)
        const conceptData = await conceptResponse.json()

        // PayloadCMS returns paginated results, extract the first document if it exists
        if (
          conceptData.success &&
          conceptData.data &&
          conceptData.data.docs &&
          conceptData.data.docs.length > 0
        ) {
          setInitialConcept(conceptData.data.docs[0])
        } else {
          // No existing initial concept found - this will trigger smart defaults
          setInitialConcept(null)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setPageError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  // Handle AI auto-fill - completely regenerate all data from project context
  const handleAIAutoFill = async () => {
    if (!project) return

    // Prevent multiple simultaneous calls
    if (aiLoading) {
      console.log('🚫 AI autofill already in progress, ignoring duplicate call')
      return
    }

    const requestId = Math.random().toString(36).substr(2, 9)
    console.log(`🚀 Starting AI autofill request ${requestId}`)

    setAiLoading(true)
    try {
      // Create fresh form data structure for complete regeneration
      // AI will populate all fields based purely on project context
      const freshFormData = {
        status: 'ai-generated',
        primaryGenres: [], // AI will determine appropriate genres
        corePremise: '',
        targetAudience: {
          demographics: [],
          psychographics: '',
          customDescription: '',
        },
        toneAndMood: {
          tones: [],
          moods: [],
          emotionalArc: '',
        },
        visualStyle: {
          cinematographyStyle: '',
          colorPalette: {
            dominance: '',
            saturation: '',
            symbolicColors: '',
          },
          lightingPreferences: '',
          cameraMovement: '',
        },
        references: {
          inspirationalMovies: [], // Will be populated by AI as array of {title, year, specificElements}
          visualReferences: '',
          narrativeReferences: '',
        },
        themes: {
          centralThemes: [],
          moralQuestions: '',
          messageTakeaway: '',
        },
      }

      // Prepare the request payload with project context only
      const payload = {
        projectName: project.name,
        projectDescription: project.description || '', // Include project description if available
        movieFormat:
          typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
        movieStyle:
          typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
        durationUnit: project.durationUnit,
        series: typeof project.series === 'object' ? project.series?.slug : project.series,
        formData: freshFormData, // Use fresh data structure for complete regeneration
      }

      console.log(`📤 Sending AI autofill request ${requestId}:`, JSON.stringify(payload, null, 2))

      const response = await fetch('/v1/initial-concepts/ai-autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        // Update the initial concept with generated fields
        const updatedConcept = { ...freshFormData }

        // Apply generated fields to the concept
        Object.entries(result.data.generatedFields).forEach(([fieldPath, value]) => {
          const keys = fieldPath.split('.')
          let current: any = updatedConcept

          // Navigate to the parent object
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {}
            }
            current = current[keys[i]]
          }

          // Set the value
          current[keys[keys.length - 1]] = value
        })

        // Update the state - preserve existing InitialConcept properties
        const updatedInitialConcept = {
          ...initialConcept,
          ...updatedConcept,
          id: initialConcept?.id || '',
          project: initialConcept?.project || params.id,
        }
        setInitialConcept(updatedInitialConcept as any)

        // Update status to indicate AI generation
        if (updatedConcept.status === 'draft') {
          updatedConcept.status = 'ai-generated'
        }

        success(
          'AI Auto-fill Complete',
          `Successfully generated ${result.data.summary.totalGenerated} field(s). Review and refine the content as needed.`,
        )
      } else {
        error('AI Auto-fill Error', result.error || 'Failed to generate content')
      }
    } catch (err) {
      console.error('AI auto-fill error:', err)
      error('AI Auto-fill Error', 'Failed to generate content. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  // Handle clear/reset all content
  const handleClearContent = async () => {
    if (
      !confirm(
        'Are you sure you want to clear all content from this form? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      // Reset to empty form data
      const emptyFormData = {
        status: 'draft',
        primaryGenres: [],
        corePremise: '',
        targetAudience: {
          demographics: [],
          psychographics: '',
          customDescription: '',
        },
        toneAndMood: {
          tones: [],
          moods: [],
          emotionalArc: '',
        },
        visualStyle: {
          cinematographyStyle: '',
          colorPalette: {
            dominance: '',
            saturation: '',
            symbolicColors: '',
          },
          lightingPreferences: '',
          cameraMovement: '',
        },
        references: {
          inspirationalMovies: [],
          visualReferences: '',
          narrativeReferences: '',
        },
        themes: {
          centralThemes: [],
          moralQuestions: '',
          messageTakeaway: '',
        },
      }

      // Create a proper InitialConcept object for clearing
      const clearedConcept = {
        ...emptyFormData,
        id: initialConcept?.id || '',
        project: initialConcept?.project || params.id,
        projectName: initialConcept?.projectName || null,
        characterArchetypes: null,
        setting: null,
        pacing: null,
        contentGuidelines: null,
        updatedAt: new Date().toISOString(),
        createdAt: initialConcept?.createdAt || new Date().toISOString(),
      }
      setInitialConcept(clearedConcept as any)
      success('Content Cleared', 'All form content has been cleared.')
    } catch (err) {
      console.error('Clear content error:', err)
      error('Clear Error', 'Failed to clear content. Please try again.')
    }
  }

  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    setSaving(true)
    try {
      const url = initialConcept
        ? `/v1/initial-concepts?project=${params.id}`
        : '/v1/initial-concepts'

      const method = initialConcept ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          project: params.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setInitialConcept(result.data)
        success(
          'Initial Concept Saved',
          initialConcept ? 'Concept updated successfully!' : 'Concept created successfully!',
        )
      } else {
        error('Save Error', result.error || 'Failed to save concept')
      }
    } catch (err) {
      console.error('Error saving concept:', err)
      error('Save Error', 'Network error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Initial Concept" subtitle="Loading..." showSearch={false}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (pageError || !project) {
    return (
      <DashboardLayout title="Initial Concept" subtitle="Error" showSearch={false}>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Initial Concept</h3>
          <p className="text-gray-500 mb-4">{pageError}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Initial Concept"
      subtitle={`Project: ${project.name}`}
      showSearch={false}
      formData={currentFormData} // Use form state instead of database object
    >
      <div className="w-full max-w-none">
        {/* Header Section - Full Width Card */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Initial Concept Development</h1>
              <p className="text-lg text-gray-600 mb-2">
                Define the creative foundation for your project:{' '}
                <span className="font-semibold text-gray-900">
                  {project.projectTitle || project.name}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Complete the form fields to build a comprehensive creative blueprint for AI-powered
                story generation.
              </p>
            </div>

            {/* AI Auto-fill Button - positioned prominently */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIAutoFill}
                loading={aiLoading}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Generating...' : 'AI Auto-fill'}
              </Button>

              {/* Clear Content Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearContent}
                disabled={aiLoading}
                className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                title="Clear all form content"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Multi-Column Form Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="xl:col-span-2">
            <InitialConceptForm
              initialData={initialConcept}
              onSubmit={handleFormSubmit}
              loading={saving}
              onFormDataChange={setCurrentFormData} // Track form state changes
            />
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  )
}
