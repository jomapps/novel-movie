'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { MovieFormat, MovieStyle, Series } from '@/payload-types'
import FormField from '@/components/forms/FormField'
import Input from '@/components/forms/Input'
import Textarea from '@/components/forms/Textarea'
import Select from '@/components/forms/Select'
import SelectWithCreate from '@/components/ui/SelectWithCreate'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ToastContainer, { useToast } from '@/components/ui/ToastContainer'
import CreateSeriesModal from '@/components/modals/CreateSeriesModal'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface FormData {
  name: string
  projectTitle: string
  shortDescription: string
  longDescription: string
  movieFormat: string
  series: string
  movieStyle: string
  durationUnit: string
}

interface FormErrors {
  [key: string]: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    projectTitle: '',
    shortDescription: '',
    longDescription: '',
    movieFormat: '',
    series: '',
    movieStyle: '',
    durationUnit: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [movieFormats, setMovieFormats] = useState<MovieFormat[]>([])
  const [movieStyles, setMovieStyles] = useState<MovieStyle[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [showSeriesField, setShowSeriesField] = useState(false)
  const [showCreateSeriesModal, setShowCreateSeriesModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formatsRes, stylesRes, seriesRes] = await Promise.all([
          fetch('/v1/movie-formats'),
          fetch('/v1/movie-styles'),
          fetch('/v1/series'),
        ])

        const [formatsData, stylesData, seriesData] = await Promise.all([
          formatsRes.json(),
          stylesRes.json(),
          seriesRes.json(),
        ])

        if (formatsData.success) setMovieFormats(formatsData.data.docs)
        if (stylesData.success) setMovieStyles(stylesData.data.docs)
        if (seriesData.success) setSeriesList(seriesData.data.docs)
      } catch (error) {
        console.error('Error fetching form data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Check if selected movie format is "series"
    const selectedFormat = movieFormats.find((format) => format.id === formData.movieFormat)
    setShowSeriesField(selectedFormat?.slug === 'series')

    // Clear series selection if not needed
    if (selectedFormat?.slug !== 'series') {
      setFormData((prev) => ({ ...prev, series: '' }))
    }
  }, [formData.movieFormat, movieFormats])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSeriesCreated = (newSeries: { id: string; name: string }) => {
    // Add the new series to the list
    setSeriesList((prev) => [...prev, { id: newSeries.id, name: newSeries.name } as Series])
    // Select the newly created series
    setFormData((prev) => ({ ...prev, series: newSeries.id }))
    // Close the modal
    setShowCreateSeriesModal(false)
    // Show success message
    success(
      'Series created successfully!',
      `"${newSeries.name}" has been added to your series list.`,
    )
  }

  // Check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    const requiredFields = ['name', 'movieFormat', 'movieStyle', 'durationUnit']
    const allBasicFieldsFilled = requiredFields.every((field) =>
      formData[field as keyof FormData]?.trim(),
    )

    // If series field is shown, it must also be filled
    if (showSeriesField) {
      return allBasicFieldsFilled && formData.series?.trim()
    }

    return allBasicFieldsFilled
  }

  // Handle AI auto-fill (placeholder for your logic)
  const handleAIAutoFill = () => {
    // TODO: Add your AI logic here
    console.log('AI Auto-fill triggered with required fields:', {
      name: formData.name,
      movieFormat: formData.movieFormat,
      movieStyle: formData.movieStyle,
      durationUnit: formData.durationUnit,
      ...(showSeriesField && { series: formData.series }),
    })
    // Placeholder success message
    success('AI Auto-fill', 'This feature will be implemented with your AI logic.')
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!formData.movieFormat) {
      newErrors.movieFormat = 'Movie format is required'
    }

    if (!formData.movieStyle) {
      newErrors.movieStyle = 'Movie style is required'
    }

    if (!formData.durationUnit) {
      newErrors.durationUnit = 'Duration unit is required'
    }

    if (showSeriesField && !formData.series) {
      newErrors.series = 'Series is required when movie format is "Series"'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        // Only include series if it's needed
        ...(showSeriesField ? { series: formData.series } : {}),
      }

      const response = await fetch('/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        success('Project created successfully!', 'Redirecting to projects page...')
        setTimeout(() => router.push('/projects'), 1000)
      } else {
        error('Failed to create project', result.error || 'Please check your input and try again.')
        setErrors({ submit: result.error || 'Failed to create project' })
      }
    } catch (err) {
      console.error('Error creating project:', err)
      error('Failed to create project', 'Please try again.')
      setErrors({ submit: 'Failed to create project. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <DashboardLayout
        title="Create New Project"
        subtitle="Fill in the details to create your movie project"
      >
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  const movieFormatOptions = movieFormats.map((format) => ({
    value: format.id,
    label: format.name,
  }))

  const movieStyleOptions = movieStyles.map((style) => ({
    value: style.id,
    label: style.name,
  }))

  const seriesOptions = seriesList.map((series) => ({
    value: series.id,
    label: series.name,
  }))

  return (
    <DashboardLayout
      title="Create New Project"
      subtitle="Fill in the details to create your movie project"
      showSearch={false}
    >
      {/* Full-width multi-column layout */}
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Required Fields Section - Highlighted */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Required Information</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Please fill in all required fields to create your project
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                label="Project Name"
                required
                error={errors.name}
                description="A unique identifier for your project"
              >
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter project name"
                  error={!!errors.name}
                />
              </FormField>

              <FormField
                label="Movie Format"
                required
                error={errors.movieFormat}
                description="The format type for this project"
              >
                <Select
                  value={formData.movieFormat}
                  onChange={(e) => handleInputChange('movieFormat', e.target.value)}
                  options={movieFormatOptions}
                  placeholder="Select movie format"
                  error={!!errors.movieFormat}
                />
              </FormField>

              {showSeriesField && (
                <FormField
                  label="Series"
                  required
                  error={errors.series}
                  description="Associated series for this episode"
                >
                  <SelectWithCreate
                    value={formData.series}
                    onChange={(value) => handleInputChange('series', value)}
                    options={seriesOptions}
                    placeholder="Select series"
                    error={!!errors.series}
                    onCreateClick={() => setShowCreateSeriesModal(true)}
                    createLabel="Create New Series"
                  />
                </FormField>
              )}

              <FormField
                label="Movie Style"
                required
                error={errors.movieStyle}
                description="Visual/artistic style for AI generation"
              >
                <Select
                  value={formData.movieStyle}
                  onChange={(e) => handleInputChange('movieStyle', e.target.value)}
                  options={movieStyleOptions}
                  placeholder="Select movie style"
                  error={!!errors.movieStyle}
                />
              </FormField>

              <FormField
                label="Duration (Minutes)"
                required
                error={errors.durationUnit}
                description="Suggested duration for this project in minutes"
              >
                <Input
                  type="number"
                  value={formData.durationUnit}
                  onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                  placeholder="Enter duration in minutes"
                  error={!!errors.durationUnit}
                  min="1"
                  step="1"
                />
              </FormField>
            </div>
          </div>

          {/* Optional Project Details Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Additional information about your project (optional)
                  </p>
                </div>

                {/* AI Auto-fill Button - appears when required fields are filled */}
                {areRequiredFieldsFilled() && (
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAIAutoFill}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-300"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Auto-fill
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Project Title"
                error={errors.projectTitle}
                description="The actual title of the movie/episode (can be auto-generated)"
              >
                <Input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                  placeholder="Enter project title"
                  error={!!errors.projectTitle}
                />
              </FormField>

              <FormField
                label="Short Description"
                error={errors.shortDescription}
                description="Brief summary of the project"
              >
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Enter a brief description"
                  rows={3}
                  error={!!errors.shortDescription}
                />
              </FormField>

              <div className="lg:col-span-2">
                <FormField
                  label="Long Description"
                  error={errors.longDescription}
                  description="Detailed description or synopsis of the project"
                >
                  <Textarea
                    value={formData.longDescription}
                    onChange={(e) => handleInputChange('longDescription', e.target.value)}
                    placeholder="Enter detailed description"
                    rows={4}
                    error={!!errors.longDescription}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-600 text-sm">{errors.submit}</div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Project
              </Button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <CreateSeriesModal
        isOpen={showCreateSeriesModal}
        onClose={() => setShowCreateSeriesModal(false)}
        onSeriesCreated={handleSeriesCreated}
      />
    </DashboardLayout>
  )
}
