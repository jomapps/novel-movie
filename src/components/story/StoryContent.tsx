'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, BarChart3, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import { Project, InitialConcept, Story } from '@/payload-types'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  metrics?: {
    score?: number
    label?: string
  }
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  metrics,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <span className="mr-3 text-gray-400">{icon}</span>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {metrics && (
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {metrics.label}: {metrics.score}/10
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
    </div>
  )
}

interface StoryContentProps {
  project: Project
  initialConcept: InitialConcept | null
  story: Story | null
  onStoryUpdate: (story: Story) => void
}

export default function StoryContent({
  project,
  initialConcept,
  story,
  onStoryUpdate,
}: StoryContentProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)

  const handleGenerateStory = async () => {
    if (!initialConcept) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          initialConceptId: initialConcept.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate story')
      }

      const newStory = await response.json()
      onStoryUpdate(newStory)
    } catch (error) {
      console.error('Error generating story:', error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEnhanceStory = async () => {
    if (!story) return

    setIsEnhancing(true)
    try {
      const response = await fetch(`/api/stories/${story.id}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to enhance story')
      }

      const enhancedStory = await response.json()
      onStoryUpdate(enhancedStory)
    } catch (error) {
      console.error('Error enhancing story:', error)
      // TODO: Add proper error handling/toast
    } finally {
      setIsEnhancing(false)
    }
  }

  if (!story) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Story Generated Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Generate your first story based on the initial concept. The AI will create a complete
              narrative that you can then enhance through multiple iterations.
            </p>
            <Button
              onClick={handleGenerateStory}
              loading={isGenerating}
              size="lg"
              className="inline-flex items-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Initial Story
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Story Development</h1>
            <p className="text-gray-600">
              Current Step: {story.currentStep}/12 • Status: {story.status}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleEnhanceStory}
              loading={isEnhancing}
              variant="outline"
              className="inline-flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Enhance Story
            </Button>
          </div>
        </div>

        {/* Quality Metrics Overview */}
        {story.qualityMetrics && (
          <CollapsibleSection
            title="Quality Metrics"
            icon={<BarChart3 className="w-5 h-5" />}
            metrics={{
              score: story.qualityMetrics.overallQuality,
              label: 'Overall',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(story.qualityMetrics).map(([key, value]) => {
                if (key === 'overallQuality' || typeof value !== 'number') return null

                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())

                return (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">{label}</div>
                    <div className="text-lg font-semibold text-gray-900">{value}/10</div>
                  </div>
                )
              })}
            </div>
          </CollapsibleSection>
        )}

        {/* Current Story Content */}
        <CollapsibleSection
          title="Current Story"
          icon={<BookOpen className="w-5 h-5" />}
          defaultOpen={true}
        >
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {story.currentContent}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Enhancement History */}
        {story.enhancementHistory && story.enhancementHistory.length > 0 && (
          <CollapsibleSection title="Enhancement History" icon={<RefreshCw className="w-5 h-5" />}>
            <div className="mt-4 space-y-4">
              {story.enhancementHistory.map((enhancement: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Step {enhancement.step}: {enhancement.focusArea}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(enhancement.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {enhancement.qualityBefore && enhancement.qualityAfter && (
                    <div className="text-sm text-gray-600 mb-2">
                      Quality improved: {enhancement.qualityBefore.overallQuality}/10 →{' '}
                      {enhancement.qualityAfter.overallQuality}/10
                    </div>
                  )}
                  {enhancement.changes && (
                    <div className="text-sm text-gray-700">
                      <strong>Changes:</strong> {enhancement.changes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Generation Parameters */}
        {story.generationParameters && (
          <CollapsibleSection title="Generation Parameters" icon={<Sparkles className="w-5 h-5" />}>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(story.generationParameters, null, 2)}
              </pre>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}
