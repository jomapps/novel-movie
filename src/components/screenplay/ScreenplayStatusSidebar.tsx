'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  X,
  Loader2,
  BookOpen,
  Users,
  Palette,
  Target,
  Lightbulb,
  Film,
  FileText,
  Clapperboard,
  Video,
  Package,
} from 'lucide-react'
import { Project, Story } from '@/payload-types'

interface ScreenplayStep {
  id: string
  label: string
  description: string
  status: 'completed' | 'not-started' | 'in-progress' | 'error'
  icon: React.ReactNode
  dependencies?: string[]
  estimatedTime?: string
  metrics?: {
    score?: number
    details?: string
  }
}

interface ScreenplayStatusSidebarProps {
  project: Project
  story: Story
}

export default function ScreenplayStatusSidebar({ project, story }: ScreenplayStatusSidebarProps) {
  const [storyStructure, setStoryStructure] = useState<any>(null)

  // Fetch story structure status
  useEffect(() => {
    const fetchStoryStructure = async () => {
      try {
        const response = await fetch(`/v1/projects/${project.id}/story-structure`)
        if (response.ok) {
          const structure = await response.json()
          setStoryStructure(structure)
        }
      } catch (error) {
        console.error('Error fetching story structure:', error)
      }
    }

    fetchStoryStructure()
  }, [project.id])

  // Define the screenplay generation workflow steps
  const getScreenplaySteps = (): ScreenplayStep[] => {
    const steps: ScreenplayStep[] = [
      {
        id: 'story-foundation',
        label: 'Story Foundation',
        description: 'Completed story serves as the foundation',
        status: story && story.status === 'completed' ? 'completed' : 'not-started',
        icon: <BookOpen className="w-4 h-4" />,
        estimatedTime: 'Complete',
        metrics: story
          ? {
              score: story.qualityMetrics?.overallQuality ?? undefined,
              details: `Step ${story.currentStep}/12`,
            }
          : undefined,
      },
      {
        id: 'story-structure',
        label: 'Story Structure Planning',
        description: 'Three-act structure, story beats, character arcs',
        status: storyStructure ? 'completed' : 'not-started',
        icon: <Target className="w-4 h-4" />,
        dependencies: ['story-foundation'],
        estimatedTime: '5-10 min',
        metrics: storyStructure
          ? {
              score: storyStructure.generationMetadata?.qualityScore,
              details: `${storyStructure.storyBeats?.length || 0} beats, ${storyStructure.characterArcs?.length || 0} arcs`,
            }
          : undefined,
      },
      {
        id: 'character-development',
        label: 'Character Development',
        description: 'Detailed character profiles, relationships, dialogue voice',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Users className="w-4 h-4" />,
        dependencies: ['story-structure'],
        estimatedTime: '10-15 min',
      },
      {
        id: 'story-outline',
        label: 'Story Outline Creation',
        description: 'Scene-by-scene outline with character presence',
        status: 'not-started', // TODO: Check actual status from database
        icon: <FileText className="w-4 h-4" />,
        dependencies: ['character-development'],
        estimatedTime: '8-12 min',
      },
      {
        id: 'screenplay-generation',
        label: 'Screenplay Generation',
        description: 'Full screenplay in industry standard format',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Film className="w-4 h-4" />,
        dependencies: ['story-outline'],
        estimatedTime: '15-20 min',
      },
      {
        id: 'screenplay-revision',
        label: 'Screenplay Revision',
        description: 'Quality review, revisions, and improvements',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Lightbulb className="w-4 h-4" />,
        dependencies: ['screenplay-generation'],
        estimatedTime: '10-15 min',
      },
      {
        id: 'scene-planning',
        label: 'Scene Planning & Breakdown',
        description: 'Visual scene descriptions, shot planning',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Clapperboard className="w-4 h-4" />,
        dependencies: ['screenplay-revision'],
        estimatedTime: '20-30 min',
      },
      {
        id: 'media-generation',
        label: 'Media Generation',
        description: 'Scene images, video sequences, audio integration',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Video className="w-4 h-4" />,
        dependencies: ['scene-planning'],
        estimatedTime: '30-60 min',
      },
      {
        id: 'final-assembly',
        label: 'Final Assembly',
        description: 'Complete movie assembly and post-production',
        status: 'not-started', // TODO: Check actual status from database
        icon: <Package className="w-4 h-4" />,
        dependencies: ['media-generation'],
        estimatedTime: '15-25 min',
      },
    ]

    return steps
  }

  const getStatusIcon = (status: ScreenplayStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'in-progress':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'error':
        return <X className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: ScreenplayStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600'
    }
  }

  const isStepAvailable = (step: ScreenplayStep, allSteps: ScreenplayStep[]) => {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true
    }

    return step.dependencies.every((depId) => {
      const depStep = allSteps.find((s) => s.id === depId)
      return depStep && depStep.status === 'completed'
    })
  }

  const screenplaySteps = getScreenplaySteps()
  const completedCount = screenplaySteps.filter((step) => step.status === 'completed').length
  const totalCount = screenplaySteps.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl border-r border-gray-200 overflow-y-auto z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Screenplay Progress</h2>
          <p className="text-sm text-gray-600 mt-1">{project.name}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}% complete</p>
        </div>

        {/* Screenplay Steps */}
        <div className="flex-1 px-4 py-6 space-y-3">
          {screenplaySteps.map((step, index) => {
            const isAvailable = isStepAvailable(step, screenplaySteps)
            const isDisabled = !isAvailable && step.status === 'not-started'

            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  isDisabled ? 'bg-gray-50 border-gray-100 opacity-60' : getStatusColor(step.status)
                } ${isAvailable && step.status === 'not-started' ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="mr-2">{getStatusIcon(step.status)}</span>
                    <span className="mr-2 text-gray-400">{step.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium block">{step.label}</span>
                      <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
                </div>

                <p className="text-xs text-gray-600 mb-2 ml-8">{step.description}</p>

                {step.metrics && (
                  <div className="ml-8 text-xs">
                    {step.metrics.score && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full mr-2">
                        Quality: {step.metrics.score}/100
                      </span>
                    )}
                    {step.metrics.details && (
                      <span className="text-gray-500">{step.metrics.details}</span>
                    )}
                  </div>
                )}

                {isDisabled && step.dependencies && (
                  <div className="ml-8 mt-2 text-xs text-gray-500">
                    Requires:{' '}
                    {step.dependencies
                      .map((depId) => {
                        const depStep = screenplaySteps.find((s) => s.id === depId)
                        return depStep?.label
                      })
                      .join(', ')}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Each step builds upon the previous ones.
            <br />
            Click available steps to begin.
          </p>
        </div>
      </div>
    </div>
  )
}
