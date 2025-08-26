'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Project, InitialConcept } from '@/payload-types'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import ToastContainer, { useToast } from '@/components/ui/ToastContainer'
import InitialConceptForm from '@/components/forms/InitialConceptForm'

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
        const conceptData: InitialConceptResponse = await conceptResponse.json()

        if (conceptData.success && conceptData.data) {
          setInitialConcept(conceptData.data)
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

  // Handle AI auto-fill (placeholder for now)
  const handleAIAutoFill = async () => {
    setAiLoading(true)
    try {
      // TODO: Implement AI auto-fill functionality
      success('AI Auto-fill', 'AI functionality will be implemented in the next step')
    } catch (err) {
      error('AI Auto-fill Error', 'Failed to generate content')
    } finally {
      setAiLoading(false)
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
      formData={initialConcept}
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
            />
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </DashboardLayout>
  )
}
