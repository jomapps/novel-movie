import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getStoryCompletionStatus } from '@/lib/story-completion'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Determine the next enhancement step
    const nextStep = Math.min(story.currentStep + 1, 12)
    const enhancementFocus = getEnhancementFocus(nextStep)

    // Generate enhanced content
    const enhancedContent = await enhanceStoryContent(
      story.currentContent,
      enhancementFocus,
      story.qualityMetrics
    )

    // Calculate new quality metrics
    const newQualityMetrics = calculateEnhancedQualityMetrics(
      story.qualityMetrics,
      enhancementFocus
    )

    // Create enhancement history entry
    const enhancementEntry = {
      step: nextStep,
      focusArea: enhancementFocus.name,
      timestamp: new Date().toISOString(),
      qualityBefore: story.qualityMetrics,
      qualityAfter: newQualityMetrics,
      changes: enhancementFocus.description,
    }

    // Determine the new status using improved completion logic
    const updatedStoryData = {
      currentContent: enhancedContent,
      currentStep: nextStep,
      status: story.status, // Include current status for completion check
      qualityMetrics: newQualityMetrics,
    }
    const newStatus = getStoryCompletionStatus(updatedStoryData)

    // Update the story
    const updatedStory = await payload.update({
      collection: 'stories',
      id: storyId,
      data: {
        ...updatedStoryData,
        enhancementHistory: [
          ...(story.enhancementHistory || []),
          enhancementEntry,
        ],
        status: newStatus,
      },
    })

    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error('Error enhancing story:', error)
    return NextResponse.json(
      { error: 'Failed to enhance story' },
      { status: 500 }
    )
  }
}

function getEnhancementFocus(step: number) {
  const enhancementSteps = {
    4: {
      name: 'Story Structure',
      description: 'Improved narrative flow and pacing',
      targetMetrics: ['structureScore'],
    },
    5: {
      name: 'Character Development',
      description: 'Enhanced character depth and motivations',
      targetMetrics: ['characterDepth'],
    },
    6: {
      name: 'Story Coherence',
      description: 'Better plot consistency and logical flow',
      targetMetrics: ['coherenceScore'],
    },
    7: {
      name: 'Conflict & Tension',
      description: 'Heightened dramatic tension and stakes',
      targetMetrics: ['conflictTension'],
    },
    8: {
      name: 'Dialogue Quality',
      description: 'More natural and engaging dialogue',
      targetMetrics: ['dialogueQuality'],
    },
    9: {
      name: 'Genre Alignment',
      description: 'Better adherence to genre conventions',
      targetMetrics: ['genreAlignment'],
    },
    10: {
      name: 'Audience Engagement',
      description: 'Enhanced emotional connection and relatability',
      targetMetrics: ['audienceEngagement'],
    },
    11: {
      name: 'Visual Storytelling',
      description: 'Improved cinematic descriptions and visual elements',
      targetMetrics: ['visualStorytelling'],
    },
    12: {
      name: 'Production Readiness',
      description: 'Final polish for production requirements',
      targetMetrics: ['productionReadiness'],
    },
  }

  return enhancementSteps[step as keyof typeof enhancementSteps] || {
    name: 'General Enhancement',
    description: 'Overall story improvement',
    targetMetrics: ['overallQuality'],
  }
}

async function enhanceStoryContent(
  currentContent: string,
  enhancementFocus: any,
  currentMetrics: any
): Promise<string> {
  // This is a placeholder for the actual AI enhancement
  // In a real implementation, this would call your AI service with specific prompts
  // based on the enhancement focus
  
  const enhancementNote = `\n\n**[ENHANCEMENT - ${enhancementFocus.name}]**\n${enhancementFocus.description}\n\n`
  
  // For demonstration, we'll add enhancement notes to the content
  // In reality, this would be a sophisticated AI rewrite
  return currentContent + enhancementNote + generateEnhancementContent(enhancementFocus)
}

function generateEnhancementContent(enhancementFocus: any): string {
  const enhancements = {
    'Story Structure': `
**ENHANCED STRUCTURE:**
- Refined three-act structure with clearer turning points
- Improved pacing with better balance of action and reflection
- Stronger scene transitions and narrative flow
- More compelling opening hook and satisfying conclusion`,

    'Character Development': `
**ENHANCED CHARACTERS:**
- Deeper character backstories and motivations
- More distinct character voices and personalities
- Stronger character arcs with meaningful growth
- Better character relationships and dynamics`,

    'Story Coherence': `
**ENHANCED COHERENCE:**
- Resolved plot inconsistencies and logical gaps
- Improved cause-and-effect relationships
- Better foreshadowing and payoff moments
- Clearer story logic and world-building rules`,

    'Conflict & Tension': `
**ENHANCED TENSION:**
- Heightened stakes and consequences
- More compelling obstacles and challenges
- Better conflict escalation throughout the story
- Stronger emotional and physical jeopardy`,

    'Dialogue Quality': `
**ENHANCED DIALOGUE:**
- More natural and character-specific speech patterns
- Better subtext and emotional depth in conversations
- Improved dialogue tags and action beats
- Stronger conflict and revelation through dialogue`,

    'Visual Storytelling': `
**ENHANCED VISUALS:**
- More vivid and cinematic scene descriptions
- Better use of visual metaphors and symbolism
- Improved action sequences and visual flow
- Stronger atmosphere and mood through imagery`,
  }

  return enhancements[enhancementFocus.name as keyof typeof enhancements] || 
         `**ENHANCED CONTENT:**\nGeneral improvements applied to enhance overall story quality.`
}

function calculateEnhancedQualityMetrics(currentMetrics: any, enhancementFocus: any) {
  const newMetrics = { ...currentMetrics }
  
  // Improve the target metrics for this enhancement step
  enhancementFocus.targetMetrics.forEach((metric: string) => {
    if (newMetrics[metric] !== undefined) {
      // Increase by 1-2 points, but cap at 10
      newMetrics[metric] = Math.min(10, newMetrics[metric] + Math.floor(Math.random() * 2) + 1)
    }
  })

  // Recalculate overall quality
  const weights = {
    structureScore: 0.2,
    characterDepth: 0.18,
    coherenceScore: 0.15,
    conflictTension: 0.12,
    dialogueQuality: 0.1,
    genreAlignment: 0.1,
    audienceEngagement: 0.08,
    visualStorytelling: 0.04,
    productionReadiness: 0.03,
  }

  let overallQuality = 0
  Object.entries(weights).forEach(([metric, weight]) => {
    if (newMetrics[metric] !== undefined) {
      overallQuality += newMetrics[metric] * weight
    }
  })

  newMetrics.overallQuality = Math.round(overallQuality)

  return newMetrics
}
