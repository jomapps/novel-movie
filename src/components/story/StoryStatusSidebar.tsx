'use client'

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
  CheckCircle,
  Zap,
  MessageSquare,
  Tag,
} from 'lucide-react'
import { Project, Story } from '@/payload-types'

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
  story: Story | null
  onStoryUpdate: (story: Story) => void
}

export default function StoryStatusSidebar({
  project,
  story,
  onStoryUpdate,
}: StoryStatusSidebarProps) {
  // Generate status items based on current data
  const getStatusItems = (): StoryStatusItem[] => {
    const items: StoryStatusItem[] = []

    // Project Setup Status
    const hasRequiredFields = project.name && project.movieFormat && project.movieStyle
    const hasOptionalFields =
      (project.primaryGenres?.length ?? 0) > 0 &&
      project.corePremise &&
      (project.targetAudience?.length ?? 0) > 0

    items.push({
      id: 'project-setup',
      label: '1. Project Setup',
      status: hasRequiredFields ? (hasOptionalFields ? 'completed' : 'in-progress') : 'not-started',
      icon: <Lightbulb className="w-4 h-4" />,
      metrics: {
        details: hasOptionalFields
          ? 'All fields complete'
          : hasRequiredFields
            ? 'Basic setup complete'
            : 'Setup required',
      },
    })

    // Story Generation Status
    items.push({
      id: 'story-generation',
      label: '2. Story Generation',
      status: story ? 'completed' : 'not-started',
      icon: <BookOpen className="w-4 h-4" />,
      metrics: story
        ? {
            score: story.qualityMetrics?.overallQuality ?? undefined,
            details: `Step ${story.currentStep}/12`,
          }
        : undefined,
    })

    // Story Structure (Step 4)
    items.push({
      id: 'story-structure',
      label: '3. Story Structure',
      status: story?.qualityMetrics?.structureScore
        ? story.qualityMetrics.structureScore >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Target className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.structureScore
        ? {
            score: story.qualityMetrics.structureScore,
            details: 'Structure quality score',
          }
        : undefined,
    })

    // Character Development
    items.push({
      id: 'character-development',
      label: '4. Character Development',
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

    // Story Coherence (Step 6)
    items.push({
      id: 'story-coherence',
      label: '5. Story Coherence',
      status: story?.qualityMetrics?.coherenceScore
        ? story.qualityMetrics.coherenceScore >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <CheckCircle className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.coherenceScore
        ? {
            score: story.qualityMetrics.coherenceScore,
            details: 'Coherence quality score',
          }
        : undefined,
    })

    // Conflict & Tension (Step 7)
    items.push({
      id: 'conflict-tension',
      label: '6. Conflict & Tension',
      status: story?.qualityMetrics?.conflictTension
        ? story.qualityMetrics.conflictTension >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Zap className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.conflictTension
        ? {
            score: story.qualityMetrics.conflictTension,
            details: 'Conflict tension score',
          }
        : undefined,
    })

    // Dialogue Quality (Step 8)
    items.push({
      id: 'dialogue-quality',
      label: '7. Dialogue Quality',
      status: story?.qualityMetrics?.dialogueQuality
        ? story.qualityMetrics.dialogueQuality >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <MessageSquare className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.dialogueQuality
        ? {
            score: story.qualityMetrics.dialogueQuality,
            details: 'Dialogue quality score',
          }
        : undefined,
    })

    // Genre Alignment (Step 9)
    items.push({
      id: 'genre-alignment',
      label: '8. Genre Alignment',
      status: story?.qualityMetrics?.genreAlignment
        ? story.qualityMetrics.genreAlignment >= 7
          ? 'completed'
          : 'in-progress'
        : 'not-started',
      icon: <Tag className="w-4 h-4" />,
      metrics: story?.qualityMetrics?.genreAlignment
        ? {
            score: story.qualityMetrics.genreAlignment,
            details: 'Genre alignment score',
          }
        : undefined,
    })

    // Visual Storytelling
    items.push({
      id: 'visual-storytelling',
      label: '9. Visual Storytelling',
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
      label: '10. Audience Engagement',
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
      label: '11. Production Ready',
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
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl border-r border-gray-200 overflow-y-auto z-40">
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
