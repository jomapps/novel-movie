import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  isStoryReadyForCompletion,
  getCompletionReason,
  getEnhancementRecommendation,
  type Story as StoryCompletionType
} from '@/lib/story-completion'
import { Story } from '@/payload-types'

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const storyId = resolvedParams.id

    // Fetch the current story
    const story = await payload.findByID({
      collection: 'stories',
      id: storyId,
      depth: 2,
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Check if story is ready for completion
    const storyForCompletion = convertToStoryCompletionType(story)
    if (!isStoryReadyForCompletion(storyForCompletion)) {
      const recommendation = getEnhancementRecommendation(storyForCompletion)
      return NextResponse.json({
        error: 'Story not ready for completion',
        reason: 'Story does not meet completion criteria',
        recommendation: recommendation.recommendation,
        canContinue: recommendation.canContinue,
        currentStep: story.currentStep,
        qualityMetrics: story.qualityMetrics
      }, { status: 400 })
    }

    // Story is ready - mark as completed
    const updatedStory = await payload.update({
      collection: 'stories',
      id: storyId,
      data: {
        status: 'completed',
      },
    })

    const completionReason = getCompletionReason(convertToStoryCompletionType(story))

    return NextResponse.json({
      success: true,
      story: updatedStory,
      completionReason,
      message: 'Story marked as completed and ready for screenplay generation'
    })

  } catch (error) {
    console.error('Error completing story:', error)
    return NextResponse.json({ error: 'Failed to complete story' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const storyId = resolvedParams.id

    // Fetch the current story
    const story = await payload.findByID({
      collection: 'stories',
      id: storyId,
      depth: 2,
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const storyForCompletion = convertToStoryCompletionType(story)
    const recommendation = getEnhancementRecommendation(storyForCompletion)
    const completionReason = getCompletionReason(storyForCompletion)

    return NextResponse.json({
      storyId: story.id,
      currentStep: story.currentStep,
      status: story.status,
      qualityMetrics: story.qualityMetrics,
      isReadyForCompletion: isStoryReadyForCompletion(storyForCompletion),
      completionReason,
      recommendation: recommendation.recommendation,
      canComplete: recommendation.canComplete,
      canContinue: recommendation.canContinue
    })

  } catch (error) {
    console.error('Error checking story completion status:', error)
    return NextResponse.json({ error: 'Failed to check story status' }, { status: 500 })
  }
}
