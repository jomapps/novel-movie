#!/usr/bin/env node

/**
 * Test script to verify story enhancement workflow
 */

const projectId = '68b9d1457ae0c1549464f026'
const baseUrl = 'http://localhost:3000'

async function testStoryEnhancement() {
  console.log('🧪 Testing Story Enhancement Workflow...\n')

  try {
    // Step 1: Get current story status
    console.log('1. Checking current story status...')
    const storiesResponse = await fetch(`${baseUrl}/v1/stories?where[project][equals]=${projectId}&limit=1`)
    const storiesData = await storiesResponse.json()
    
    if (!storiesData.docs || storiesData.docs.length === 0) {
      console.log('❌ No story found for this project')
      return
    }
    
    const story = storiesData.docs[0]
    console.log('✅ Story found:', story.id)
    console.log('   - Current Step:', story.currentStep, '/ 12')
    console.log('   - Status:', story.status)
    console.log('   - Quality Score:', story.qualityMetrics?.overallQuality || 'N/A')
    
    // Show current quality metrics
    console.log('\n📊 Current Quality Metrics:')
    const metrics = story.qualityMetrics || {}
    console.log('   - Structure Score:', metrics.structureScore || 'N/A')
    console.log('   - Character Depth:', metrics.characterDepth || 'N/A')
    console.log('   - Coherence Score:', metrics.coherenceScore || 'N/A')
    console.log('   - Conflict Tension:', metrics.conflictTension || 'N/A')
    console.log('   - Dialogue Quality:', metrics.dialogueQuality || 'N/A')
    console.log('   - Genre Alignment:', metrics.genreAlignment || 'N/A')
    console.log('   - Audience Engagement:', metrics.audienceEngagement || 'N/A')
    console.log('   - Visual Storytelling:', metrics.visualStorytelling || 'N/A')
    console.log('   - Production Readiness:', metrics.productionReadiness || 'N/A')

    // Step 2: Test enhancement API
    if (story.currentStep < 12) {
      console.log(`\n2. Testing enhancement from step ${story.currentStep} to ${story.currentStep + 1}...`)
      
      const enhanceResponse = await fetch(`${baseUrl}/v1/stories/${story.id}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!enhanceResponse.ok) {
        const errorData = await enhanceResponse.json()
        console.log('❌ Enhancement failed:', errorData.error)
        return
      }

      const enhancedStory = await enhanceResponse.json()
      console.log('✅ Enhancement successful!')
      console.log('   - New Step:', enhancedStory.currentStep, '/ 12')
      console.log('   - New Status:', enhancedStory.status)
      console.log('   - New Quality Score:', enhancedStory.qualityMetrics?.overallQuality || 'N/A')
      
      // Show quality improvements
      console.log('\n📈 Quality Improvements:')
      const newMetrics = enhancedStory.qualityMetrics || {}
      const improvements = []
      
      Object.keys(metrics).forEach(key => {
        if (newMetrics[key] && metrics[key] && newMetrics[key] > metrics[key]) {
          improvements.push(`${key}: ${metrics[key]} → ${newMetrics[key]} (+${newMetrics[key] - metrics[key]})`)
        }
      })
      
      if (improvements.length > 0) {
        improvements.forEach(improvement => console.log('   ✅', improvement))
      } else {
        console.log('   ℹ️  No quality score improvements detected')
      }

      // Step 3: Check if story is now complete
      if (enhancedStory.status === 'completed') {
        console.log('\n🎉 Story is now COMPLETED!')
        console.log('✅ Screenplay generation should now be unlocked')
        
        // Test screenplay page access
        console.log('\n3. Testing screenplay page access...')
        const screenplayResponse = await fetch(`${baseUrl}/project/${projectId}/screenplay`)
        
        if (screenplayResponse.ok) {
          console.log('✅ Screenplay page should now be accessible')
        } else {
          console.log('❌ Screenplay page still not accessible')
        }
      } else {
        console.log(`\n📝 Story still in progress (step ${enhancedStory.currentStep}/12)`)
        console.log('   Continue enhancing to reach completion')
      }

    } else {
      console.log('\n✅ Story is already at maximum step (12/12)')
      
      if (story.status !== 'completed') {
        console.log('⚠️  Story should be marked as completed but status is:', story.status)
      }
    }

    // Step 4: Test sidebar step visibility
    console.log('\n4. Testing sidebar step calculations...')
    const sidebarSteps = calculateSidebarSteps(story)
    console.log('📊 Sidebar Steps Status:')
    sidebarSteps.forEach((step, index) => {
      const statusIcon = step.status === 'completed' ? '✅' : 
                        step.status === 'in-progress' ? '🔄' : '⭕'
      console.log(`   ${index + 1}. ${statusIcon} ${step.label} (${step.status})`)
      if (step.score !== undefined) {
        console.log(`      Score: ${step.score}/10`)
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error)
  }
}

function calculateSidebarSteps(story) {
  const steps = []
  const metrics = story.qualityMetrics || {}

  // Project Setup
  steps.push({
    label: 'Project Setup',
    status: 'completed', // Assuming project is set up
  })

  // Story Generation
  steps.push({
    label: 'Story Generation',
    status: story ? 'completed' : 'not-started',
    score: metrics.overallQuality,
  })

  // Story Structure
  steps.push({
    label: 'Story Structure',
    status: metrics.structureScore >= 7 ? 'completed' : 
            metrics.structureScore > 0 ? 'in-progress' : 'not-started',
    score: metrics.structureScore,
  })

  // Character Development
  steps.push({
    label: 'Character Development',
    status: metrics.characterDepth >= 7 ? 'completed' : 
            metrics.characterDepth > 0 ? 'in-progress' : 'not-started',
    score: metrics.characterDepth,
  })

  // Story Coherence
  steps.push({
    label: 'Story Coherence',
    status: metrics.coherenceScore >= 7 ? 'completed' : 
            metrics.coherenceScore > 0 ? 'in-progress' : 'not-started',
    score: metrics.coherenceScore,
  })

  // Conflict & Tension
  steps.push({
    label: 'Conflict & Tension',
    status: metrics.conflictTension >= 7 ? 'completed' : 
            metrics.conflictTension > 0 ? 'in-progress' : 'not-started',
    score: metrics.conflictTension,
  })

  // Dialogue Quality
  steps.push({
    label: 'Dialogue Quality',
    status: metrics.dialogueQuality >= 7 ? 'completed' : 
            metrics.dialogueQuality > 0 ? 'in-progress' : 'not-started',
    score: metrics.dialogueQuality,
  })

  // Genre Alignment
  steps.push({
    label: 'Genre Alignment',
    status: metrics.genreAlignment >= 7 ? 'completed' : 
            metrics.genreAlignment > 0 ? 'in-progress' : 'not-started',
    score: metrics.genreAlignment,
  })

  // Visual Storytelling
  steps.push({
    label: 'Visual Storytelling',
    status: metrics.visualStorytelling >= 7 ? 'completed' : 
            metrics.visualStorytelling > 0 ? 'in-progress' : 'not-started',
    score: metrics.visualStorytelling,
  })

  // Audience Engagement
  steps.push({
    label: 'Audience Engagement',
    status: metrics.audienceEngagement >= 7 ? 'completed' : 
            metrics.audienceEngagement > 0 ? 'in-progress' : 'not-started',
    score: metrics.audienceEngagement,
  })

  // Production Ready
  steps.push({
    label: 'Production Ready',
    status: metrics.productionReadiness >= 8 ? 'completed' : 
            metrics.productionReadiness > 0 ? 'in-progress' : 'not-started',
    score: metrics.productionReadiness,
  })

  return steps
}

// Run the test
testStoryEnhancement()
