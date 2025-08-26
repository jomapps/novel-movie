'use client'

import { useState, useEffect } from 'react'
import {
  Genre,
  AudienceDemographic,
  ToneOption,
  MoodDescriptor,
  CentralTheme,
  CinematographyStyle,
  InitialConcept,
} from '@/payload-types'
import FormField from '@/components/forms/FormField'
import Input from '@/components/forms/Input'
import Textarea from '@/components/forms/Textarea'
import Select from '@/components/forms/Select'
import MultiSelect from '@/components/forms/MultiSelect'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface InitialConceptFormData {
  status: string
  primaryGenres: string[]
  corePremise: string
  targetAudience: {
    demographics: string[]
    psychographics: string
    customDescription: string
  }
  toneAndMood: {
    tones: string[]
    moods: string[]
    emotionalArc: string
  }
  visualStyle: {
    cinematographyStyle: string
    colorPalette: {
      dominance: string
      saturation: string
      symbolicColors: string
    }
    lightingPreferences: string
    cameraMovement: string
  }
  references: {
    inspirationalMovies: Array<{
      title: string
      year: number | null
      specificElements: string
    }>
    visualReferences: string
    narrativeReferences: string
  }
  themes: {
    centralThemes: string[]
    moralQuestions: string
    messageTakeaway: string
  }
}

interface InitialConceptFormProps {
  initialData?: InitialConcept | null
  onSubmit: (data: InitialConceptFormData) => Promise<void>
  loading?: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function InitialConceptForm({
  initialData,
  onSubmit,
  loading = false,
}: InitialConceptFormProps) {
  const [formData, setFormData] = useState<InitialConceptFormData>({
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
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [lookupData, setLookupData] = useState({
    genres: [] as Genre[],
    demographics: [] as AudienceDemographic[],
    toneOptions: [] as ToneOption[],
    moodDescriptors: [] as MoodDescriptor[],
    centralThemes: [] as CentralTheme[],
    cinematographyStyles: [] as CinematographyStyle[],
  })
  const [lookupLoading, setLookupLoading] = useState(true)

  // Load lookup data
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [
          genresRes,
          demographicsRes,
          toneOptionsRes,
          moodDescriptorsRes,
          centralThemesRes,
          cinematographyStylesRes,
        ] = await Promise.all([
          fetch('/v1/config/genres'),
          fetch('/v1/config/audience-demographics'),
          fetch('/v1/config/tone-options'),
          fetch('/v1/config/mood-descriptors'),
          fetch('/v1/config/central-themes'),
          fetch('/v1/config/cinematography-styles'),
        ])

        const [
          genres,
          demographics,
          toneOptions,
          moodDescriptors,
          centralThemes,
          cinematographyStyles,
        ] = await Promise.all([
          genresRes.json(),
          demographicsRes.json(),
          toneOptionsRes.json(),
          moodDescriptorsRes.json(),
          centralThemesRes.json(),
          cinematographyStylesRes.json(),
        ])

        setLookupData({
          genres: genres.success ? genres.data : [],
          demographics: demographics.success ? demographics.data : [],
          toneOptions: toneOptions.success ? toneOptions.data : [],
          moodDescriptors: moodDescriptors.success ? moodDescriptors.data : [],
          centralThemes: centralThemes.success ? centralThemes.data : [],
          cinematographyStyles: cinematographyStyles.success ? cinematographyStyles.data : [],
        })
      } catch (error) {
        console.error('Error loading lookup data:', error)
      } finally {
        setLookupLoading(false)
      }
    }

    loadLookupData()
  }, [])

  // Populate form with initial data
  useEffect(() => {
    if (initialData) {
      // TODO: Map initialData to formData structure
      // This will be implemented when we have actual data structure
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: FormErrors = {}

    if (formData.primaryGenres.length === 0) {
      newErrors.primaryGenres = 'At least one genre is required'
    }

    if (!formData.corePremise.trim()) {
      newErrors.corePremise = 'Core premise is required'
    }

    if (formData.targetAudience.demographics.length === 0) {
      newErrors['targetAudience.demographics'] = 'At least one demographic is required'
    }

    if (!formData.visualStyle.cinematographyStyle) {
      newErrors['visualStyle.cinematographyStyle'] = 'Cinematography style is required'
    }

    if (formData.themes.centralThemes.length === 0) {
      newErrors['themes.centralThemes'] = 'At least one central theme is required'
    }

    if (!formData.themes.messageTakeaway.trim()) {
      newErrors['themes.messageTakeaway'] = 'Message/takeaway is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData)
    }
  }

  if (lookupLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading form data...</span>
      </div>
    )
  }

  // Convert lookup data to options format
  const genreOptions = lookupData.genres.map((g) => ({ value: g.id, label: g.name }))
  const demographicOptions = lookupData.demographics.map((d) => ({ value: d.id, label: d.name }))
  const toneOptions = lookupData.toneOptions.map((t) => ({ value: t.id, label: t.name }))
  const moodOptions = lookupData.moodDescriptors.map((m) => ({ value: m.id, label: m.name }))
  const themeOptions = lookupData.centralThemes.map((t) => ({ value: t.id, label: t.name }))
  const cinematographyOptions = lookupData.cinematographyStyles.map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'ai-generated', label: 'AI Generated' },
    { value: 'user-refined', label: 'User Refined' },
    { value: 'ready', label: 'Ready for Story Generation' },
    { value: 'approved', label: 'Approved' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status */}
      <div
        id="concept-status-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          Concept Status
        </h3>
        <FormField
          label="Development Status"
          required
          error={errors.status}
          description="Current status of the concept development"
        >
          <Select
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            options={statusOptions}
            error={!!errors.status}
          />
        </FormField>
      </div>

      {/* Primary Genres */}
      <div
        id="primary-genres-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
          Primary Genres
        </h3>
        <FormField
          label="Genres"
          required
          error={errors.primaryGenres}
          description="Select up to 3 genres in order of importance"
        >
          <MultiSelect
            value={formData.primaryGenres}
            onChange={(values) =>
              setFormData((prev) => ({
                ...prev,
                primaryGenres: values.slice(0, 3), // Limit to 3
              }))
            }
            options={genreOptions}
            placeholder="Select genres"
            maxSelections={3}
            error={!!errors.primaryGenres}
          />
        </FormField>
      </div>

      {/* Core Premise */}
      <div
        id="core-premise-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
          Core Premise
        </h3>
        <FormField
          label="Central Story Concept"
          required
          error={errors.corePremise}
          description="The central story concept and main conflict (50-500 words)"
        >
          <Textarea
            value={formData.corePremise}
            onChange={(e) => setFormData((prev) => ({ ...prev, corePremise: e.target.value }))}
            placeholder="Describe the central story concept, main conflict, and what drives the narrative..."
            rows={6}
            error={!!errors.corePremise}
          />
        </FormField>
      </div>

      {/* Target Audience */}
      <div
        id="target-audience-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          Target Audience
        </h3>
        <div className="space-y-4">
          <FormField
            label="Demographics"
            required
            error={errors['targetAudience.demographics']}
            description="Primary demographic groups"
          >
            <MultiSelect
              value={formData.targetAudience.demographics}
              onChange={(values) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, demographics: values },
                }))
              }
              options={demographicOptions}
              placeholder="Select demographics"
              error={!!errors['targetAudience.demographics']}
            />
          </FormField>

          <FormField
            label="Psychographics"
            error={errors['targetAudience.psychographics']}
            description="Audience interests and values"
          >
            <Textarea
              value={formData.targetAudience.psychographics}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, psychographics: e.target.value },
                }))
              }
              placeholder="Describe audience interests, values, lifestyle preferences..."
              rows={3}
              error={!!errors['targetAudience.psychographics']}
            />
          </FormField>

          <FormField
            label="Custom Description"
            error={errors['targetAudience.customDescription']}
            description="Additional audience details not covered by selections"
          >
            <Textarea
              value={formData.targetAudience.customDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAudience: { ...prev.targetAudience, customDescription: e.target.value },
                }))
              }
              placeholder="Any additional audience characteristics or considerations..."
              rows={3}
              error={!!errors['targetAudience.customDescription']}
            />
          </FormField>
        </div>
      </div>

      {/* Tone and Mood */}
      <div
        id="tone-mood-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
          Tone & Mood
        </h3>
        <div className="space-y-4">
          <FormField
            label="Tone Options"
            error={errors['toneAndMood.tones']}
            description="Overall tone of the story"
          >
            <MultiSelect
              value={formData.toneAndMood.tones}
              onChange={(values) =>
                setFormData((prev) => ({
                  ...prev,
                  toneAndMood: { ...prev.toneAndMood, tones: values },
                }))
              }
              options={toneOptions}
              placeholder="Select tone options"
              error={!!errors['toneAndMood.tones']}
            />
          </FormField>

          <FormField
            label="Mood Descriptors"
            error={errors['toneAndMood.moods']}
            description="Emotional atmosphere of the story"
          >
            <MultiSelect
              value={formData.toneAndMood.moods}
              onChange={(values) =>
                setFormData((prev) => ({
                  ...prev,
                  toneAndMood: { ...prev.toneAndMood, moods: values },
                }))
              }
              options={moodOptions}
              placeholder="Select mood descriptors"
              error={!!errors['toneAndMood.moods']}
            />
          </FormField>

          <FormField
            label="Emotional Arc"
            error={errors['toneAndMood.emotionalArc']}
            description="How the emotional journey progresses throughout the story"
          >
            <Textarea
              value={formData.toneAndMood.emotionalArc}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  toneAndMood: { ...prev.toneAndMood, emotionalArc: e.target.value },
                }))
              }
              placeholder="Describe the emotional journey from beginning to end..."
              rows={4}
              error={!!errors['toneAndMood.emotionalArc']}
            />
          </FormField>
        </div>
      </div>

      {/* Visual Style */}
      <div
        id="visual-style-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
          Visual Style Direction
        </h3>
        <div className="space-y-4">
          <FormField
            label="Cinematography Style"
            required
            error={errors['visualStyle.cinematographyStyle']}
            description="Overall visual approach"
          >
            <Select
              value={formData.visualStyle.cinematographyStyle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  visualStyle: { ...prev.visualStyle, cinematographyStyle: e.target.value },
                }))
              }
              options={cinematographyOptions}
              placeholder="Select cinematography style"
              error={!!errors['visualStyle.cinematographyStyle']}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Color Dominance"
              error={errors['visualStyle.colorPalette.dominance']}
              description="Primary color approach"
            >
              <Select
                value={formData.visualStyle.colorPalette.dominance}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visualStyle: {
                      ...prev.visualStyle,
                      colorPalette: { ...prev.visualStyle.colorPalette, dominance: e.target.value },
                    },
                  }))
                }
                options={[
                  { value: 'warm', label: 'Warm Colors' },
                  { value: 'cool', label: 'Cool Colors' },
                  { value: 'neutral', label: 'Neutral Tones' },
                  { value: 'monochromatic', label: 'Monochromatic' },
                  { value: 'high-contrast', label: 'High Contrast' },
                ]}
                placeholder="Select color dominance"
                error={!!errors['visualStyle.colorPalette.dominance']}
              />
            </FormField>

            <FormField
              label="Saturation"
              error={errors['visualStyle.colorPalette.saturation']}
              description="Color intensity level"
            >
              <Select
                value={formData.visualStyle.colorPalette.saturation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visualStyle: {
                      ...prev.visualStyle,
                      colorPalette: {
                        ...prev.visualStyle.colorPalette,
                        saturation: e.target.value,
                      },
                    },
                  }))
                }
                options={[
                  { value: 'desaturated', label: 'Desaturated' },
                  { value: 'natural', label: 'Natural' },
                  { value: 'vibrant', label: 'Vibrant' },
                  { value: 'oversaturated', label: 'Oversaturated' },
                ]}
                placeholder="Select saturation level"
                error={!!errors['visualStyle.colorPalette.saturation']}
              />
            </FormField>

            <FormField
              label="Camera Movement"
              error={errors['visualStyle.cameraMovement']}
              description="Camera movement style"
            >
              <Select
                value={formData.visualStyle.cameraMovement}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visualStyle: { ...prev.visualStyle, cameraMovement: e.target.value },
                  }))
                }
                options={[
                  { value: 'static', label: 'Static/Locked' },
                  { value: 'smooth', label: 'Smooth/Fluid' },
                  { value: 'handheld', label: 'Handheld/Shaky' },
                  { value: 'dynamic', label: 'Dynamic/Active' },
                  { value: 'mixed', label: 'Mixed Approach' },
                ]}
                placeholder="Select camera movement"
                error={!!errors['visualStyle.cameraMovement']}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Symbolic Colors"
              error={errors['visualStyle.colorPalette.symbolicColors']}
              description="Colors with specific meaning in the story"
            >
              <Textarea
                value={formData.visualStyle.colorPalette.symbolicColors}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visualStyle: {
                      ...prev.visualStyle,
                      colorPalette: {
                        ...prev.visualStyle.colorPalette,
                        symbolicColors: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="Describe any colors that have symbolic meaning..."
                rows={3}
                error={!!errors['visualStyle.colorPalette.symbolicColors']}
              />
            </FormField>

            <FormField
              label="Lighting Preferences"
              error={errors['visualStyle.lightingPreferences']}
              description="Lighting style and mood"
            >
              <Textarea
                value={formData.visualStyle.lightingPreferences}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visualStyle: { ...prev.visualStyle, lightingPreferences: e.target.value },
                  }))
                }
                placeholder="Describe preferred lighting style, mood, and techniques..."
                rows={3}
                error={!!errors['visualStyle.lightingPreferences']}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Thematic Elements */}
      <div
        id="themes-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
          Thematic Elements
        </h3>
        <div className="space-y-4">
          <FormField
            label="Central Themes"
            required
            error={errors['themes.centralThemes']}
            description="Primary themes explored in the story"
          >
            <MultiSelect
              value={formData.themes.centralThemes}
              onChange={(values) =>
                setFormData((prev) => ({
                  ...prev,
                  themes: { ...prev.themes, centralThemes: values },
                }))
              }
              options={themeOptions}
              placeholder="Select central themes"
              error={!!errors['themes.centralThemes']}
            />
          </FormField>

          <FormField
            label="Moral Questions"
            error={errors['themes.moralQuestions']}
            description="Ethical dilemmas characters will face"
          >
            <Textarea
              value={formData.themes.moralQuestions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  themes: { ...prev.themes, moralQuestions: e.target.value },
                }))
              }
              placeholder="What moral dilemmas or ethical questions will characters face?"
              rows={4}
              error={!!errors['themes.moralQuestions']}
            />
          </FormField>

          <FormField
            label="Message/Takeaway"
            required
            error={errors['themes.messageTakeaway']}
            description="What should audiences feel or learn from this story?"
          >
            <Textarea
              value={formData.themes.messageTakeaway}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  themes: { ...prev.themes, messageTakeaway: e.target.value },
                }))
              }
              placeholder="What message or feeling should audiences take away from this story?"
              rows={4}
              error={!!errors['themes.messageTakeaway']}
            />
          </FormField>
        </div>
      </div>

      {/* References */}
      <div
        id="references-section"
        className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
          Reference Materials
        </h3>
        <div className="space-y-4">
          <FormField
            label="Visual References"
            error={errors['references.visualReferences']}
            description="Art styles, photography, design movements that inspire the visual approach"
          >
            <Textarea
              value={formData.references.visualReferences}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  references: { ...prev.references, visualReferences: e.target.value },
                }))
              }
              placeholder="Describe visual inspirations, art styles, photography references..."
              rows={4}
              error={!!errors['references.visualReferences']}
            />
          </FormField>

          <FormField
            label="Narrative References"
            error={errors['references.narrativeReferences']}
            description="Books, plays, real events that inspire the story structure or themes"
          >
            <Textarea
              value={formData.references.narrativeReferences}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  references: { ...prev.references, narrativeReferences: e.target.value },
                }))
              }
              placeholder="Books, plays, historical events, or other narratives that inspire this story..."
              rows={4}
              error={!!errors['references.narrativeReferences']}
            />
          </FormField>
        </div>
      </div>

      {/* Form Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Concept'}
          </button>
        </div>
      </div>
    </form>
  )
}
