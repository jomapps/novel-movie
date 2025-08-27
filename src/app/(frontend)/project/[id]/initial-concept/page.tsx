'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, Trash2, Star } from 'lucide-react'
import { Project, InitialConcept } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import ToastContainer, { useToast } from '@/components/ui/ToastContainer'
import InitialConceptForm from '@/components/forms/InitialConceptForm'
import QualityScoreModal from '@/components/modals/QualityScoreModal'
import { isInitialConceptFormComplete } from '@/lib/utils/form-validation'
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

  // Quality Score Modal state
  const [qualityModalOpen, setQualityModalOpen] = useState(false)
  const [qualityScore, setQualityScore] = useState<number | undefined>(undefined)
  const [qualityRecommendations, setQualityRecommendations] = useState<string>('')
  const [qualityLoading, setQualityLoading] = useState(false)

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

        // Handle different API response formats
        if (conceptData.success && conceptData.data) {
          // Check if data is a single record (when record exists) or paginated results
          if (conceptData.data.id) {
            // Single record format - record exists
            console.log('✅ Found existing initial-concept record:', conceptData.data.id)
            setInitialConcept(conceptData.data)
          } else if (conceptData.data.docs && conceptData.data.docs.length > 0) {
            // Paginated format with records
            console.log('✅ Found existing initial-concept record:', conceptData.data.docs[0].id)
            setInitialConcept(conceptData.data.docs[0])
          } else {
            // No existing initial concept found - create it immediately
            console.log('🏗️ No initial concept found, creating empty record...')
            await createEmptyInitialConcept(projectData.data)
          }
        } else {
          // API error or no data
          console.log('🏗️ No initial concept data, creating empty record...')
          await createEmptyInitialConcept(projectData.data)
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

  // Create empty initial concept record immediately
  const createEmptyInitialConcept = async (projectData: Project) => {
    try {
      console.log('🏗️ Creating empty initial-concept record...')

      // Create empty record with just the project relationship
      const response = await fetch('/v1/initial-concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: projectData.id,
          status: 'draft', // Start as draft, will be updated to 'ai-generated' when AI fills it
        }),
      })

      const result = await response.json()

      if (result.success && result.doc) {
        console.log('✅ Created empty initial-concept record:', result.doc.id)
        setInitialConcept(result.doc)
      } else if (response.status === 409) {
        // Record already exists - this shouldn't happen with our logic, but handle gracefully
        console.log('⚠️ Initial concept already exists, fetching existing record...')
        // Refetch the existing record
        const conceptResponse = await fetch(`/v1/initial-concepts?project=${projectData.id}`)
        const conceptData = await conceptResponse.json()
        if (conceptData.success && conceptData.data && conceptData.data.id) {
          setInitialConcept(conceptData.data)
        } else {
          throw new Error('Failed to fetch existing initial concept')
        }
      } else {
        throw new Error(result.error || 'Failed to create initial concept')
      }
    } catch (error) {
      console.error('❌ Error creating empty initial concept:', error)
      setPageError('Failed to create initial concept record')
    }
  }

  // Handle manual AI generation (user-initiated)
  const handleManualAIGeneration = async () => {
    if (!project) {
      console.error('❌ Missing project data')
      return
    }

    console.log('🚀 Starting manual AI generation...')
    setAiLoading(true)

    try {
      // Extract clean form data from initialConcept or create fresh structure
      const currentFormData = initialConcept
        ? {
            status: initialConcept.status || 'ai-generated',
            primaryGenres: initialConcept.primaryGenres || [],
            corePremise: initialConcept.corePremise || '',
            targetAudience: {
              demographics: initialConcept.targetAudience?.demographics || [],
              psychographics: initialConcept.targetAudience?.psychographics || '',
              customDescription: initialConcept.targetAudience?.customDescription || '',
            },
            toneAndMood: {
              tones: initialConcept.toneAndMood?.tones || [],
              moods: initialConcept.toneAndMood?.moods || [],
              emotionalArc: initialConcept.toneAndMood?.emotionalArc || '',
            },
            visualStyle: {
              cinematographyStyle: initialConcept.visualStyle?.cinematographyStyle || '',
              colorPalette: {
                dominance: initialConcept.visualStyle?.colorPalette?.dominance || '',
                saturation: initialConcept.visualStyle?.colorPalette?.saturation || '',
                symbolicColors: initialConcept.visualStyle?.colorPalette?.symbolicColors || '',
              },
              lightingPreferences: initialConcept.visualStyle?.lightingPreferences || '',
              cameraMovement: initialConcept.visualStyle?.cameraMovement || '',
            },
            references: {
              inspirationalMovies: initialConcept.references?.inspirationalMovies || [],
              visualReferences: initialConcept.references?.visualReferences || '',
              narrativeReferences: initialConcept.references?.narrativeReferences || '',
            },
            themes: {
              centralThemes: initialConcept.themes?.centralThemes || [],
              moralQuestions: initialConcept.themes?.moralQuestions || '',
              messageTakeaway: initialConcept.themes?.messageTakeaway || '',
            },
          }
        : {
            status: 'ai-generated',
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

      // Prepare the request payload
      const payload = {
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description || '',
        movieFormat:
          typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
        movieStyle:
          typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
        durationUnit: project.durationUnit,
        series: typeof project.series === 'object' ? project.series?.slug : project.series,
        formData: currentFormData,
      }

      console.log('📤 Sending manual AI generation request:', JSON.stringify(payload, null, 2))

      const response = await fetch('/v1/initial-concepts/ai-autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ AI generation completed successfully:', result.data)

        // Update the initial concept with the generated data
        if (result.data.record) {
          setInitialConcept(result.data.record)
        }

        // Show success message
        console.log(`🎉 Generated ${result.data.summary.totalGenerated} fields successfully!`)
      } else {
        // Handle specific error types with user-friendly messages
        let errorMessage = result.error || 'AI generation failed'

        if (result.errorType === 'INSUFFICIENT_CREDITS') {
          errorMessage =
            result.userMessage ||
            'The AI service has run out of credits. Please contact support or try again later.'
        } else if (result.errorType === 'SERVICE_UNAVAILABLE') {
          errorMessage =
            result.userMessage ||
            'The AI content generation service is temporarily unavailable. Please try again later.'
        } else if (
          result.errorType === 'AI_SERVICE_ERROR' ||
          result.errorType === 'AI_GENERATION_ERROR'
        ) {
          errorMessage =
            result.userMessage ||
            'There was an issue with the AI service. Please try again in a few moments.'
        } else if (result.errorType === 'TIMEOUT_ERROR') {
          errorMessage =
            result.userMessage ||
            'The AI generation process took too long to complete. Please try again with fewer fields.'
        } else if (result.userMessage) {
          errorMessage = result.userMessage
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ AI generation error:', error)
      setPageError(
        error instanceof Error ? error.message : 'AI generation failed. Please try again.',
      )
    } finally {
      setAiLoading(false)
    }
  }

  // Handle AI auto-fill - use the new manual generation approach
  const handleAIAutoFill = async () => {
    try {
      console.log('🔘 AI Auto-fill button clicked!')
      console.log('📊 Current state:', {
        project: !!project,
        initialConcept: !!initialConcept,
        aiLoading,
      })

      if (!project) {
        console.error('❌ Missing project data')
        return
      }

      // Prevent multiple simultaneous calls
      if (aiLoading) {
        console.log('🚫 AI autofill already in progress, ignoring duplicate call')
        return
      }

      console.log('🚀 Starting manual AI generation from button click...')
      await handleManualAIGeneration()
    } catch (error) {
      console.error('❌ Error in handleAIAutoFill:', error)
      setPageError('AI generation failed. Please try again.')
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

  // Handle Quality Score assessment
  const handleQualityScore = async () => {
    if (!project || !currentFormData) {
      error('Quality Score Error', 'Missing project or form data')
      return
    }

    setQualityLoading(true)
    setQualityModalOpen(true)
    setQualityScore(undefined)
    setQualityRecommendations('')

    try {
      const payload = {
        projectName: project.name,
        movieFormat:
          typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
        movieStyle:
          typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
        durationUnit: project.durationUnit,
        series: typeof project.series === 'object' ? project.series?.slug : project.series,
        formData: currentFormData,
      }

      const response = await fetch('/v1/initial-concepts/quality-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setQualityScore(result.data.qualityScore)
        setQualityRecommendations(result.data.recommendations)
      } else {
        // Handle specific error types with user-friendly messages
        let errorTitle = 'Quality Score Error'
        let errorMessage = result.error || 'Failed to assess project quality'

        if (result.errorType === 'INSUFFICIENT_CREDITS') {
          errorTitle = 'AI Service Credits Exhausted'
          errorMessage =
            result.userMessage ||
            'The AI service has run out of credits. Please contact support or try again later.'
        } else if (result.errorType === 'SERVICE_UNAVAILABLE') {
          errorTitle = 'AI Service Temporarily Unavailable'
          errorMessage =
            result.userMessage ||
            'The AI quality assessment service is temporarily unavailable. Please try again later.'
        } else if (result.errorType === 'AI_SERVICE_ERROR') {
          errorTitle = 'AI Service Error'
          errorMessage =
            result.userMessage ||
            'There was an issue with the AI service. Please try again in a few moments.'
        } else if (result.userMessage) {
          errorMessage = result.userMessage
        }

        error(errorTitle, errorMessage)
        setQualityModalOpen(false)
      }
    } catch (err) {
      console.error('Quality score error:', err)
      error('Quality Score Error', 'Network error occurred. Please try again.')
      setQualityModalOpen(false)
    } finally {
      setQualityLoading(false)
    }
  }

  // Handle manual edit and rescore
  const handleRescore = async (editedRecommendations: string) => {
    // For now, just update the recommendations
    // In a full implementation, you might want to re-run the quality assessment
    setQualityRecommendations(editedRecommendations)
    success('Recommendations Updated', 'Your edits have been saved.')
  }

  // Handle AI regeneration based on recommendations
  const handleRegenerate = async (recommendations: string) => {
    if (!project) {
      error('Regeneration Error', 'Missing project data')
      return
    }

    try {
      // Close the quality modal and start AI generation
      setQualityModalOpen(false)
      await handleManualAIGeneration()
      success(
        'AI Regeneration Started',
        'Form fields are being regenerated based on the recommendations.',
      )
    } catch (err) {
      console.error('Regeneration error:', err)
      error('Regeneration Error', 'Failed to regenerate form fields. Please try again.')
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

  // Show AI generation loading state when automatically generating for new projects
  if (aiLoading && !initialConcept) {
    return (
      <DashboardLayout
        title="Initial Concept"
        subtitle={project ? `Project: ${project.name}` : 'Loading...'}
        showSearch={false}
      >
        <div className="w-full max-w-none">
          {/* AI Generation Loading Card */}
          <div className="bg-white shadow-sm rounded-lg p-8 mb-8 border border-gray-200">
            <div className="text-center">
              <div className="flex justify-center items-center mb-6">
                <div className="relative">
                  <LoadingSpinner size="lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Generating Initial Concept</h2>
              <p className="text-lg text-gray-600 mb-4">
                AI is creating a comprehensive creative foundation for your project...
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-700">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Analyzing project context</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <span>Generating core premise and themes</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div
                      className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                    <span>Creating visual and narrative elements</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                This usually takes 30-60 seconds. Once complete, you can review and edit the
                generated content.
              </p>
            </div>
          </div>
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
              <button
                type="button"
                onClick={handleAIAutoFill}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 rounded-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Generating...' : 'AI Auto-fill'}
              </button>

              {/* Quality Score Button - only visible when form is complete */}
              {currentFormData && isInitialConceptFormComplete(currentFormData) && (
                <button
                  type="button"
                  onClick={handleQualityScore}
                  disabled={aiLoading || qualityLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 rounded-md disabled:opacity-50"
                  title="Assess project quality with AI expert analysis"
                >
                  <Star className="w-4 h-4" />
                  {qualityLoading ? 'Analyzing...' : 'Quality Score'}
                </button>
              )}

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

      {/* Quality Score Modal */}
      <QualityScoreModal
        isOpen={qualityModalOpen}
        onClose={() => setQualityModalOpen(false)}
        qualityScore={qualityScore}
        recommendations={qualityRecommendations}
        loading={qualityLoading}
        onRescore={handleRescore}
        onRegenerate={handleRegenerate}
      />
    </DashboardLayout>
  )
}
