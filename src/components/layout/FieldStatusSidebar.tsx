'use client'

import { Check, X } from 'lucide-react'

interface FieldStatus {
  name: string
  label: string
  filled: boolean
  required?: boolean
  sectionId: string // ID for navigation
}

interface FieldStatusSidebarProps {
  isOpen: boolean
  onToggle: () => void
  pageTitle: string
  formData: any
}

export default function FieldStatusSidebar({
  isOpen,
  onToggle,
  pageTitle,
  formData,
}: FieldStatusSidebarProps) {
  // Navigate to field section
  const navigateToField = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })

      // Add temporary highlight effect
      element.classList.add('field-highlight')
      setTimeout(() => {
        element.classList.remove('field-highlight')
      }, 2000)
    }
  }

  // Define all form fields for Initial Concept
  const getFieldStatus = (): FieldStatus[] => {
    if (!formData) return []

    return [
      {
        name: 'status',
        label: 'Development Status',
        filled: !!formData.status,
        required: true,
        sectionId: 'concept-status-section',
      },
      {
        name: 'primaryGenres',
        label: 'Primary Genres',
        filled: formData.primaryGenres && formData.primaryGenres.length > 0,
        required: true,
        sectionId: 'primary-genres-section',
      },
      {
        name: 'corePremise',
        label: 'Core Premise',
        filled: !!formData.corePremise?.trim(),
        required: true,
        sectionId: 'core-premise-section',
      },
      {
        name: 'targetAudience.demographics',
        label: 'Demographics',
        filled:
          formData.targetAudience?.demographics && formData.targetAudience.demographics.length > 0,
        required: true,
        sectionId: 'target-audience-section',
      },
      {
        name: 'targetAudience.psychographics',
        label: 'Psychographics',
        filled: !!formData.targetAudience?.psychographics?.trim(),
        sectionId: 'target-audience-section',
      },
      {
        name: 'targetAudience.customDescription',
        label: 'Custom Audience Description',
        filled: !!formData.targetAudience?.customDescription?.trim(),
        sectionId: 'target-audience-section',
      },
      {
        name: 'toneAndMood.tones',
        label: 'Tone Options',
        filled: formData.toneAndMood?.tones && formData.toneAndMood.tones.length > 0,
        sectionId: 'tone-mood-section',
      },
      {
        name: 'toneAndMood.moods',
        label: 'Mood Descriptors',
        filled: formData.toneAndMood?.moods && formData.toneAndMood.moods.length > 0,
        sectionId: 'tone-mood-section',
      },
      {
        name: 'toneAndMood.emotionalArc',
        label: 'Emotional Arc',
        filled: !!formData.toneAndMood?.emotionalArc?.trim(),
        sectionId: 'tone-mood-section',
      },
      {
        name: 'visualStyle.cinematographyStyle',
        label: 'Cinematography Style',
        filled: !!formData.visualStyle?.cinematographyStyle,
        required: true,
        sectionId: 'visual-style-section',
      },
      {
        name: 'visualStyle.colorPalette.dominance',
        label: 'Color Dominance',
        filled: !!formData.visualStyle?.colorPalette?.dominance,
        sectionId: 'visual-style-section',
      },
      {
        name: 'visualStyle.colorPalette.saturation',
        label: 'Color Saturation',
        filled: !!formData.visualStyle?.colorPalette?.saturation,
        sectionId: 'visual-style-section',
      },
      {
        name: 'visualStyle.colorPalette.symbolicColors',
        label: 'Symbolic Colors',
        filled: !!formData.visualStyle?.colorPalette?.symbolicColors?.trim(),
        sectionId: 'visual-style-section',
      },
      {
        name: 'visualStyle.lightingPreferences',
        label: 'Lighting Preferences',
        filled: !!formData.visualStyle?.lightingPreferences?.trim(),
        sectionId: 'visual-style-section',
      },
      {
        name: 'visualStyle.cameraMovement',
        label: 'Camera Movement',
        filled: !!formData.visualStyle?.cameraMovement,
        sectionId: 'visual-style-section',
      },
      {
        name: 'themes.centralThemes',
        label: 'Central Themes',
        filled: formData.themes?.centralThemes && formData.themes.centralThemes.length > 0,
        required: true,
        sectionId: 'themes-section',
      },
      {
        name: 'themes.moralQuestions',
        label: 'Moral Questions',
        filled: !!formData.themes?.moralQuestions?.trim(),
        sectionId: 'themes-section',
      },
      {
        name: 'themes.messageTakeaway',
        label: 'Message/Takeaway',
        filled: !!formData.themes?.messageTakeaway?.trim(),
        required: true,
        sectionId: 'themes-section',
      },
      {
        name: 'references.visualReferences',
        label: 'Visual References',
        filled: !!formData.references?.visualReferences?.trim(),
        sectionId: 'references-section',
      },
      {
        name: 'references.narrativeReferences',
        label: 'Narrative References',
        filled: !!formData.references?.narrativeReferences?.trim(),
        sectionId: 'references-section',
      },
    ]
  }

  const fieldStatuses = getFieldStatus()
  const filledCount = fieldStatuses.filter((field) => field.filled).length
  const totalCount = fieldStatuses.length
  const requiredFields = fieldStatuses.filter((field) => field.required)
  const filledRequiredCount = requiredFields.filter((field) => field.filled).length

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Summary */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {filledCount}/{totalCount} fields completed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(filledCount / totalCount) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Required: {filledRequiredCount}/{requiredFields.length}
            </div>
          </div>

          {/* Field Status List */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {fieldStatuses.map((field) => (
              <button
                key={field.name}
                onClick={() => navigateToField(field.sectionId)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:shadow-sm cursor-pointer ${
                  field.filled
                    ? 'bg-green-50 text-green-800 hover:bg-green-100'
                    : field.required
                      ? 'bg-red-50 text-red-800 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`mr-3 flex-shrink-0 ${
                    field.filled
                      ? 'text-green-600'
                      : field.required
                        ? 'text-red-600'
                        : 'text-gray-400'
                  }`}
                >
                  {field.filled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </span>
                <span className="flex-1 text-xs leading-tight">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
