/**
 * Story completion logic utilities
 * Determines when a story is ready for screenplay generation
 */

export interface QualityMetrics {
  structureScore?: number
  characterDepth?: number
  coherenceScore?: number
  conflictTension?: number
  dialogueQuality?: number
  genreAlignment?: number
  audienceEngagement?: number
  visualStorytelling?: number
  productionReadiness?: number
  overallQuality?: number
}

export interface Story {
  currentStep: number
  status: string
  qualityMetrics?: QualityMetrics
  currentContent?: string
}

/**
 * Check if story meets quality criteria for completion
 * All metrics should be >= 8 for production readiness
 */
export function meetsQualityCriteria(qualityMetrics?: QualityMetrics): boolean {
  if (!qualityMetrics) return false

  const requiredMetrics = [
    'structureScore',
    'characterDepth', 
    'coherenceScore',
    'conflictTension',
    'dialogueQuality',
    'genreAlignment',
    'audienceEngagement',
    'visualStorytelling',
    'productionReadiness'
  ] as const

  return requiredMetrics.every(metric => {
    const score = qualityMetrics[metric] || 0
    return score >= 8
  })
}

/**
 * Check if story meets step criteria for completion
 * Story should reach step 12 for full enhancement cycle
 */
export function meetsStepCriteria(currentStep: number): boolean {
  return currentStep >= 12
}

/**
 * Determine if story is ready for completion
 * Story is ready if EITHER condition is met:
 * 1. Reached step 12 (full enhancement cycle), OR
 * 2. All quality metrics >= 8 (production ready)
 */
export function isStoryReadyForCompletion(story: Story): boolean {
  const hasContent = !!(story.currentContent && story.currentContent.trim().length > 0)
  const meetsSteps = meetsStepCriteria(story.currentStep)
  const meetsQuality = meetsQualityCriteria(story.qualityMetrics)
  
  return hasContent && (meetsSteps || meetsQuality)
}

/**
 * Get completion status for a story
 * Returns the appropriate status based on completion criteria
 * Only returns valid payload status values
 */
export function getStoryCompletionStatus(story: Story): 'completed' | 'in-progress' {
  if (!story.currentContent || story.currentContent.trim().length === 0) {
    return 'in-progress' // Changed from 'not-started' to valid payload status
  }

  if (isStoryReadyForCompletion(story)) {
    return 'completed'
  }

  return 'in-progress'
}

/**
 * Get completion reason for display purposes
 */
export function getCompletionReason(story: Story): string {
  if (!isStoryReadyForCompletion(story)) {
    return 'Story not yet ready for completion'
  }
  
  const meetsSteps = meetsStepCriteria(story.currentStep)
  const meetsQuality = meetsQualityCriteria(story.qualityMetrics)
  
  if (meetsSteps && meetsQuality) {
    return 'Story completed: Full enhancement cycle AND excellent quality'
  } else if (meetsSteps) {
    return 'Story completed: Full enhancement cycle (12 steps)'
  } else if (meetsQuality) {
    return 'Story completed: Excellent quality (all metrics ≥8)'
  }
  
  return 'Story ready for completion'
}

/**
 * Check if user can optionally continue enhancing
 * Even if story is ready for completion, user might want to continue
 */
export function canContinueEnhancing(story: Story): boolean {
  return story.currentStep < 12
}

/**
 * Get next enhancement recommendation
 */
export function getEnhancementRecommendation(story: Story): {
  canComplete: boolean
  canContinue: boolean
  recommendation: string
} {
  const canComplete = isStoryReadyForCompletion(story)
  const canContinue = canContinueEnhancing(story)
  
  if (canComplete && canContinue) {
    return {
      canComplete: true,
      canContinue: true,
      recommendation: 'Your story is ready for screenplay generation! You can proceed now or continue enhancing if desired.'
    }
  } else if (canComplete) {
    return {
      canComplete: true,
      canContinue: false,
      recommendation: 'Your story is complete and ready for screenplay generation.'
    }
  } else if (canContinue) {
    return {
      canComplete: false,
      canContinue: true,
      recommendation: 'Continue enhancing your story to improve quality or reach completion.'
    }
  } else {
    return {
      canComplete: false,
      canContinue: false,
      recommendation: 'Story enhancement cycle is complete.'
    }
  }
}
