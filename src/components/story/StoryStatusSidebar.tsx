'use client'

import { Check, X, Loader2, BookOpen, Users, Palette, Target, Lightbulb, Film } from 'lucide-react'
import { Project, InitialConcept, Story } from '@/payload-types'

interface StoryStatusItem {
  id: string
  label: string
  status: 'completed' | 'not-started' | 'in-progress'
  icon: React.ReactNode
  metrics?: {
    score?: number
    details?: string
  }
}

interface StoryStatusSidebarProps {
  project: Project
  initialConcept: InitialConcept | null
  story: Story | null
  onStoryUpdate: (story: Story) => void
}

export default function StoryStatusSidebar({
  project,
  initialConcept,
  story,
  onStoryUpdate,
}: StoryStatusSidebarProps) {
  // Generate status items based on current data
  const getStatusItems = (): StoryStatusItem[] => {
    const items: StoryStatusItem[] = []

    // Initial Concept Status
    items.push({
      id: 'initial-concept',
      label: 'Initial Concept',
      status: initialConcept ? 'completed' : 'not-started',
      icon: <Lightbulb className="w-4 h-4" />,
      metrics: initialConcept
        ? {
            details: `Status: ${initialConcept.status || 'draft'}`,
          }
        : undefined,
    })

    // Story Generation Status
    items.push({
      id: 'story-generation',
      label: 'Story Generation',
      status: story ? 'completed' : 'not-started',
      icon: <BookOpen className="w-4 h-4" />,
      metrics: story
        ? {
            score: story.qualityMetrics?.overallQuality,
            details: `Step ${story.currentStep}/12`,
          }
        : undefined,
    })

    // Character Development
    items.push({
      id: 'character-development',
      label: 'Character Development',
      status: story?.qualityMetrics?.characterDepth
        ? story.qualityMetrics.characterDepth >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Users className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.characterDepth
        ? {
            score: story.qualityMetrics.characterDepth,
            details: 'Character depth score',
          }
        : undefined,
    })

    // Visual Storytelling
    items.push({
      id: 'visual-storytelling',
      label: 'Visual Storytelling',
      status: story?.qualityMetrics?.visualStorytelling
        ? story.qualityMetrics.visualStorytelling >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Palette className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.visualStorytelling
        ? {
            score: story.qualityMetrics.visualStorytelling,
            details: 'Visual storytelling score',
          }
        : undefined,
    })

    // Audience Engagement
    items.push({
      id: 'audience-engagement',
      label: 'Audience Engagement',
      status: story?.qualityMetrics?.audienceEngagement
        ? story.qualityMetrics.audienceEngagement >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Target className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.audienceEngagement
        ? {
            score: story.qualityMetrics.audienceEngagement,
            details: 'Audience engagement score',
          }
        : undefined,
    })

    // Production Readiness
    items.push({
      id: 'production-readiness',
      label: 'Production Ready',
      status: story?.qualityMetrics?.productionReadiness
        ? story.qualityMetrics.productionReadiness >= 8
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Film className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.productionReadiness
        ? {
            score: story.qualityMetrics.productionReadiness,
            details: 'Production readiness score',
          }
        : undefined,
    })

    return items
  }

  const statusItems = getStatusItems()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'in-progress':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'not-started':
      default:
        return <X className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'not-started':
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const completedCount = statusItems.filter((item) => item.status === 'completed').length
  const totalCount = statusItems.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 overflow-y-auto z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Story Progress</h2>
          <p className="text-sm text-gray-600 mt-1">{project.name}</p>
        </div>

        {/* Progress Summary */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">
            Progress: {completedCount}/{totalCount} completed
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>

        {/* Status Items */}
        <div className="flex-1 px-4 py-6 space-y-3">
          {statusItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(item.status)}</span>
                  <span className="mr-2 text-gray-400">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </div>

              {item.metrics && (
                <div className="ml-8 text-xs">
                  {item.metrics.score && (
                    <div className="flex items-center justify-between">
                      <span>Score:</span>
                      <span className="font-medium">{item.metrics.score}/10</span>
                    </div>
                  )}
                  {item.metrics.details && (
                    <div className="text-gray-500 mt-1">{item.metrics.details}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall Quality Score */}
        {story?.qualityMetrics?.overallQuality && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {story.qualityMetrics.overallQuality}/10
              </div>
              <div className="text-sm text-gray-600">Overall Quality</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
