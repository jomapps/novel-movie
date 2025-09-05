#!/usr/bin/env node

/**
 * Test the new story completion logic
 */

// Import the completion logic (simulated since we can't import TS directly)
function meetsQualityCriteria(qualityMetrics) {
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
  ]

  return requiredMetrics.every(metric => {
    const score = qualityMetrics[metric] || 0
    return score >= 8
  })
}

function meetsStepCriteria(currentStep) {
  return currentStep >= 12
}

function isStoryReadyForCompletion(story) {
  const hasContent = !!(story.currentContent && story.currentContent.trim().length > 0)
  const meetsSteps = meetsStepCriteria(story.currentStep)
  const meetsQuality = meetsQualityCriteria(story.qualityMetrics)
  
  return hasContent && (meetsSteps || meetsQuality)
}

function getCompletionReason(story) {
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

async function testCompletionLogic() {
  console.log('🧪 Testing New Story Completion Logic...\n')

  // Test with your actual story data
  const yourStory = {
    currentStep: 5,
    status: 'in-progress',
    currentContent: 'A substantial story with 13415 characters...',
    qualityMetrics: {
      structureScore: 10,
      characterDepth: 10,
      coherenceScore: 10,
      conflictTension: 10,
      dialogueQuality: 10,
      genreAlignment: 9,
      audienceEngagement: 10,
      visualStorytelling: 10,
      productionReadiness: 10,
      overallQuality: 10
    }
  }

  console.log('📊 Your Story Analysis:')
  console.log('   - Current Step:', yourStory.currentStep, '/ 12')
  console.log('   - Status:', yourStory.status)
  console.log('   - Content Length:', yourStory.currentContent.length, 'characters')
  
  console.log('\n🔍 Quality Criteria Check:')
  const meetsQuality = meetsQualityCriteria(yourStory.qualityMetrics)
  console.log('   - Meets quality criteria (all ≥8):', meetsQuality)
  
  Object.entries(yourStory.qualityMetrics).forEach(([metric, score]) => {
    if (metric !== 'overallQuality') {
      const passes = score >= 8
      console.log(`   - ${metric}: ${score}/10 ${passes ? '✅' : '❌'}`)
    }
  })

  console.log('\n🔍 Step Criteria Check:')
  const meetsSteps = meetsStepCriteria(yourStory.currentStep)
  console.log('   - Meets step criteria (≥12):', meetsSteps)
  console.log('   - Current step:', yourStory.currentStep, '/ 12')

  console.log('\n🎯 Final Assessment:')
  const isReady = isStoryReadyForCompletion(yourStory)
  const reason = getCompletionReason(yourStory)
  
  console.log('   - Ready for completion:', isReady ? '✅ YES' : '❌ NO')
  console.log('   - Reason:', reason)

  if (isReady) {
    console.log('\n🎉 RESULT: Your story SHOULD be ready for screenplay generation!')
    console.log('   The new logic recognizes that your excellent quality (all metrics ≥8)')
    console.log('   makes the story ready for completion, even at step 5/12.')
  } else {
    console.log('\n❌ RESULT: Story not ready yet.')
  }

  // Test edge cases
  console.log('\n🧪 Testing Edge Cases:')
  
  // Story at step 12 but poor quality
  const step12Story = { ...yourStory, currentStep: 12, qualityMetrics: { structureScore: 5 } }
  console.log('   - Step 12 + poor quality:', isStoryReadyForCompletion(step12Story) ? '✅' : '❌')
  
  // Story at step 3 but excellent quality
  const step3Story = { ...yourStory, currentStep: 3 }
  console.log('   - Step 3 + excellent quality:', isStoryReadyForCompletion(step3Story) ? '✅' : '❌')
  
  // Story with no content
  const noContentStory = { ...yourStory, currentContent: '' }
  console.log('   - No content + excellent quality:', isStoryReadyForCompletion(noContentStory) ? '✅' : '❌')
}

testCompletionLogic()
