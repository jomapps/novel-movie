'use client'

// Edit Project Page - allows updating existing project data
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project } from '@/payload-types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import FormField from '@/components/forms/FormField'
import Input from '@/components/forms/Input'
import Textarea from '@/components/forms/Textarea'
import Select from '@/components/forms/Select'
import MultiSelect from '@/components/forms/MultiSelect'
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
  // Core Required Fields for Story Generation
  primaryGenres: string[]
  corePremise: string
  targetAudience: string[]
  tone: string[]
  mood: string[]
}

interface FormErrors {
  [key: string]: string
}

interface ProjectResponse {
  success: boolean
  data: Project
  error?: string
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { toasts, removeToast, success, error } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    projectTitle: '',
    shortDescription: '',
    longDescription: '',
    movieFormat: '',
    series: '',
    movieStyle: '',
    durationUnit: '',
    // Core Required Fields for Story Generation
    primaryGenres: [],
    corePremise: '',
    targetAudience: [],
    tone: [],
    mood: [],
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showCreateSeriesModal, setShowCreateSeriesModal] = useState(false)

  // Options state
  const [movieFormats, setMovieFormats] = useState<any[]>([])
  const [movieStyles, setMovieStyles] = useState<any[]>([])
  const [seriesOptions, setSeriesOptions] = useState<any[]>([])
  const [genreOptions, setGenreOptions] = useState<any[]>([])
  const [audienceOptions, setAudienceOptions] = useState<any[]>([])
  const [toneOptions, setToneOptions] = useState<any[]>([])
  const [moodOptions, setMoodOptions] = useState<any[]>([])

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/v1/projects/${params.id}`)
        const data: ProjectResponse = await response.json()

        if (data.success) {
          setProject(data.data)
          // Pre-fill form data
          const projectData = data.data
          setFormData({
            name: projectData.name || '',
            projectTitle: projectData.projectTitle || '',
            shortDescription: projectData.shortDescription || '',
            longDescription: projectData.longDescription || '',
            movieFormat:
              typeof projectData.movieFormat === 'object'
                ? projectData.movieFormat.id
                : projectData.movieFormat || '',
            series:
              projectData.series && typeof projectData.series === 'object'
                ? projectData.series.id
                : projectData.series || '',
            movieStyle:
              typeof projectData.movieStyle === 'object'
                ? projectData.movieStyle.id
                : projectData.movieStyle || '',
            durationUnit: projectData.durationUnit ? projectData.durationUnit.toString() : '',
            primaryGenres: Array.isArray(projectData.primaryGenres)
              ? projectData.primaryGenres
                  .map((genre) => (typeof genre === 'object' ? genre.id : genre))
                  .filter(Boolean)
              : [],
            corePremise: projectData.corePremise || '',
            targetAudience: Array.isArray(projectData.targetAudience)
              ? projectData.targetAudience
                  .map((audience) => (typeof audience === 'object' ? audience.id : audience))
                  .filter(Boolean)
              : [],
            tone: Array.isArray(projectData.tone)
              ? projectData.tone.map((t) => (typeof t === 'object' ? t.id : t)).filter(Boolean)
              : [],
            mood: Array.isArray(projectData.mood)
              ? projectData.mood.map((m) => (typeof m === 'object' ? m.id : m)).filter(Boolean)
              : [],
          })
        } else {
          setFetchError(data.error || 'Project not found')
        }
      } catch (err) {
        setFetchError('Failed to fetch project')
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  // Fetch options data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [formatsRes, stylesRes, seriesRes, genresRes, audienceRes, toneRes, moodRes] =
          await Promise.all([
            fetch('/v1/movie-formats'),
            fetch('/v1/movie-styles'),
            fetch('/v1/series'),
            fetch('/v1/config/genres'),
            fetch('/v1/config/audience-demographics'),
            fetch('/v1/config/tone-options'),
            fetch('/v1/config/mood-descriptors'),
          ])

        const [formats, styles, series, genres, audience, tones, moods] = await Promise.all([
          formatsRes.json(),
          stylesRes.json(),
          seriesRes.json(),
          genresRes.json(),
          audienceRes.json(),
          toneRes.json(),
          moodRes.json(),
        ])

        if (formats.success) {
          // Handle PayloadCMS paginated response
          setMovieFormats(formats.data.docs || formats.data || [])
        }
        if (styles.success) {
          setMovieStyles(styles.data.docs || styles.data || [])
        }
        if (series.success) {
          setSeriesOptions(series.data.docs || series.data || [])
        }
        if (genres.success) {
          setGenreOptions(genres.data || [])
        }
        if (audience.success) {
          setAudienceOptions(audience.data || [])
        }
        if (tones.success) {
          setToneOptions(tones.data || [])
        }
        if (moods.success) {
          setMoodOptions(moods.data || [])
        }
      } catch (err) {
        console.error('Error fetching options:', err)
      }
    }

    fetchOptions()
  }, [])

  const showSeriesField =
    movieFormats.length > 0
      ? movieFormats.find((format) => format.id === formData.movieFormat)?.slug === 'series'
      : false

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleSeriesCreated = (newSeries: any) => {
    setSeriesOptions((prev) => [...prev, newSeries])
    setFormData((prev) => ({ ...prev, series: newSeries.id }))
    setShowCreateSeriesModal(false)
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

    setSaving(true)

    try {
      const submitData = {
        ...formData,
        // Only include series if it's needed
        ...(showSeriesField ? { series: formData.series } : {}),
      }

      const response = await fetch(`/v1/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        success('Project updated successfully!', 'Redirecting to project details...')
        setTimeout(() => router.push(`/project/${params.id}`), 1000)
      } else {
        error('Failed to update project', result.error || 'Please check your input and try again.')
        setErrors({ submit: result.error || 'Failed to update project' })
      }
    } catch (err) {
      console.error('Error updating project:', err)
      error('Update Error', 'Network error occurred. Please try again.')
      setErrors({ submit: 'Network error occurred. Please try again.' })
    } finally {
      setSaving(false)
    }
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

  if (fetchError || !project) {
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
          <p className="text-gray-500 mb-4">{fetchError}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Edit: ${project.projectTitle || project.name}`}
      subtitle="Update your project details"
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
                Please fill in all required fields to update your project
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Project Name"
                required
                error={errors.name}
                description="Internal name for organizing your projects"
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
                description="The type of content you're creating"
              >
                <Select
                  value={formData.movieFormat}
                  onChange={(value) => handleInputChange('movieFormat', value)}
                  options={movieFormats.map((format) => ({
                    value: format.id,
                    label: format.name,
                  }))}
                  placeholder="Select movie format"
                  error={!!errors.movieFormat}
                />
              </FormField>

              {showSeriesField && (
                <FormField
                  label="Series"
                  required
                  error={errors.series}
                  description="Select the series this project belongs to"
                >
                  <div className="flex gap-2">
                    <Select
                      value={formData.series}
                      onChange={(value) => handleInputChange('series', value)}
                      options={seriesOptions.map((series) => ({
                        value: series.id,
                        label: series.name,
                      }))}
                      placeholder="Select series"
                      error={!!errors.series}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateSeriesModal(true)}
                      className="px-3"
                      title="Create new series"
                    >
                      +
                    </Button>
                  </div>
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
                  onChange={(value) => handleInputChange('movieStyle', value)}
                  options={movieStyles.map((style) => ({
                    value: style.id,
                    label: style.name,
                  }))}
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

          {/* Core Story Elements Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Core Story Elements</h3>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Essential elements that drive story generation and AI content creation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormField
                label="Primary Genres"
                error={errors.primaryGenres}
                description="Select up to 3 genres in order of importance"
              >
                <MultiSelect
                  value={formData.primaryGenres}
                  onChange={(value) => handleInputChange('primaryGenres', value)}
                  options={genreOptions.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                  }))}
                  placeholder="Select primary genres"
                  maxSelections={3}
                  error={!!errors.primaryGenres}
                />
              </FormField>

              <FormField
                label="Target Audience"
                error={errors.targetAudience}
                description="Select primary demographic groups"
              >
                <MultiSelect
                  value={formData.targetAudience}
                  onChange={(value) => handleInputChange('targetAudience', value)}
                  options={audienceOptions.map((audience) => ({
                    value: audience.id,
                    label: audience.name,
                  }))}
                  placeholder="Select target audience"
                  maxSelections={3}
                  error={!!errors.targetAudience}
                />
              </FormField>

              <FormField
                label="Tone"
                error={errors.tone}
                description="Select tones that define how the story is told (narrative approach)"
              >
                <MultiSelect
                  value={formData.tone}
                  onChange={(value) => handleInputChange('tone', value)}
                  options={toneOptions.map((tone) => ({
                    value: tone.id,
                    label: tone.name,
                  }))}
                  placeholder="Select narrative tones"
                  maxSelections={2}
                  error={!!errors.tone}
                />
              </FormField>

              <FormField
                label="Mood"
                error={errors.mood}
                description="Select moods that define the emotional atmosphere and feeling"
              >
                <MultiSelect
                  value={formData.mood}
                  onChange={(value) => handleInputChange('mood', value)}
                  options={moodOptions.map((mood) => ({
                    value: mood.id,
                    label: mood.name,
                  }))}
                  placeholder="Select emotional moods"
                  maxSelections={2}
                  error={!!errors.mood}
                />
              </FormField>

              <FormField
                label="Core Premise"
                error={errors.corePremise}
                description="The central story concept and main conflict (50-500 words)"
              >
                <Textarea
                  value={formData.corePremise}
                  onChange={(e) => handleInputChange('corePremise', e.target.value)}
                  placeholder="Describe the core premise of your story..."
                  rows={4}
                  error={!!errors.corePremise}
                />
              </FormField>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Additional information about your project (optional)
              </p>
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

              <FormField
                label="Long Description"
                error={errors.longDescription}
                description="Detailed description of the project"
                className="lg:col-span-2"
              >
                <Textarea
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Enter a detailed description"
                  rows={4}
                  error={!!errors.longDescription}
                />
              </FormField>
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Update Project
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
