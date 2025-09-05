'use client'

import { useState } from 'react'
import { CheckCircle, Play, AlertCircle, Info } from 'lucide-react'
import { Story } from '@/payload-types'
import {
  isStoryReadyForCompletion,
  getEnhancementRecommendation,
  getCompletionReason,
  canContinueEnhancing,
  type Story as StoryCompletionType
} from '@/lib/story-completion'

// Helper function to convert payload Story to story-completion Story type
function convertToStoryCompletionType(story: Story): StoryCompletionType {
  return {
    currentStep: story.currentStep,
    status: story.status,
    currentContent: story.currentContent,
    qualityMetrics: story.qualityMetrics ? {
      structureScore: story.qualityMetrics.structureScore ?? undefined,
      characterDepth: story.qualityMetrics.characterDepth ?? undefined,
      coherenceScore: story.qualityMetrics.coherenceScore ?? undefined,
      conflictTension: story.qualityMetrics.conflictTension ?? undefined,
      dialogueQuality: story.qualityMetrics.dialogueQuality ?? undefined,
      genreAlignment: story.qualityMetrics.genreAlignment ?? undefined,
      audienceEngagement: story.qualityMetrics.audienceEngagement ?? undefined,
      visualStorytelling: story.qualityMetrics.visualStorytelling ?? undefined,
      productionReadiness: story.qualityMetrics.productionReadiness ?? undefined,
      overallQuality: story.qualityMetrics.overallQuality ?? undefined,
    } : undefined
  }
}

interface StoryCompletionControlsProps {
  story: Story
  onStoryUpdate: (story: Story) => void
  onEnhance: () => void
}

export default function StoryCompletionControls({ 
  story, 
  onStoryUpdate, 
  onEnhance 
}: StoryCompletionControlsProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storyForCompletion = convertToStoryCompletionType(story)
  const isReady = isStoryReadyForCompletion(storyForCompletion)
  const canContinue = canContinueEnhancing(storyForCompletion)
  const recommendation = getEnhancementRecommendation(storyForCompletion)
  const completionReason = getCompletionReason(storyForCompletion)

  const handleComplete = async () => {
    if (!isReady) return

    setIsCompleting(true)
    setError(null)

    try {
      const response = await fetch(`/v1/stories/${story.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete story')
      }

      const result = await response.json()
      onStoryUpdate(result.story)
      
    } catch (err) {
      console.error('Error completing story:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete story')
    } finally {
      setIsCompleting(false)
    }
  }

  if (story.status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Story Complete</h3>
            <p className="text-sm text-green-700 mt-1">
              Your story is ready for screenplay generation!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Information */}
      <div className={`border rounded-lg p-4 ${
        isReady ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start">
          <Info className={`w-5 h-5 mr-2 mt-0.5 ${
            isReady ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${
              isReady ? 'text-blue-800' : 'text-gray-700'
            }`}>
              Story Status
            </h3>
            <p className={`text-sm mt-1 ${
              isReady ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {recommendation.recommendation}
            </p>
            {isReady && (
              <p className="text-xs text-blue-600 mt-2">
                {completionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Complete Story Button */}
        {isReady && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isCompleting ? 'Completing...' : 'Mark as Complete'}
          </button>
        )}

        {/* Continue Enhancement Button */}
        {canContinue && (
          <button
            onClick={onEnhance}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Continue Enhancing
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Quality Metrics Summary */}
      {story.qualityMetrics && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Metrics</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>Structure: {story.qualityMetrics.structureScore || 0}/10</div>
            <div>Characters: {story.qualityMetrics.characterDepth || 0}/10</div>
            <div>Coherence: {story.qualityMetrics.coherenceScore || 0}/10</div>
            <div>Conflict: {story.qualityMetrics.conflictTension || 0}/10</div>
            <div>Dialogue: {story.qualityMetrics.dialogueQuality || 0}/10</div>
            <div>Genre: {story.qualityMetrics.genreAlignment || 0}/10</div>
            <div>Engagement: {story.qualityMetrics.audienceEngagement || 0}/10</div>
            <div>Visual: {story.qualityMetrics.visualStorytelling || 0}/10</div>
            <div>Production: {story.qualityMetrics.productionReadiness || 0}/10</div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300">
            <div className="text-sm font-medium">
              Overall Quality: {story.qualityMetrics.overallQuality || 0}/10
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
