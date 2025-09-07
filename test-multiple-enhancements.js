#!/usr/bin/env node

/**
 * Test script to run multiple enhancements to reach step 12
 */

const projectId = '68b9d1457ae0c1549464f026'
const baseUrl = 'http://localhost:3001'

async function runMultipleEnhancements() {
  console.log('🚀 Running Multiple Story Enhancements to Completion...\n')

  try {
    let currentStep = 0
    let maxEnhancements = 10 // Safety limit

    for (let i = 0; i < maxEnhancements; i++) {
      // Get current story status
      const storiesResponse = await fetch(
        `${baseUrl}/v1/stories?where[project][equals]=${projectId}&limit=1`,
      )
      const storiesData = await storiesResponse.json()

      if (!storiesData.docs || storiesData.docs.length === 0) {
        console.log('❌ No story found')
        break
      }

      const story = storiesData.docs[0]
      currentStep = story.currentStep

      console.log(`📊 Enhancement ${i + 1}: Step ${currentStep}/12, Status: ${story.status}`)

      // Check if story is completed
      if (story.status === 'completed' || currentStep >= 12) {
        console.log('🎉 Story is completed!')
        console.log(`✅ Final Step: ${currentStep}/12`)
        console.log(`✅ Final Status: ${story.status}`)
        console.log(`✅ Final Quality Score: ${story.qualityMetrics?.overallQuality || 'N/A'}`)

        // Test screenplay access
        console.log('\n🎬 Testing screenplay page access...')
        await testScreenplayAccess()
        break
      }

      // Run enhancement
      console.log(`   Enhancing from step ${currentStep} to ${currentStep + 1}...`)

      const enhanceResponse = await fetch(`${baseUrl}/v1/stories/${story.id}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!enhanceResponse.ok) {
        const errorData = await enhanceResponse.json()
        console.log(`   ❌ Enhancement failed: ${errorData.error}`)
        break
      }

      const enhancedStory = await enhanceResponse.json()
      console.log(`   ✅ Enhanced to step ${enhancedStory.currentStep}/12`)

      // Small delay between enhancements
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (error) {
    console.error('❌ Enhancement process failed:', error.message)
  }
}

async function testScreenplayAccess() {
  try {
    // Test the screenplay validation logic
    const storiesResponse = await fetch(
      `${baseUrl}/v1/stories?where[project][equals]=${projectId}&limit=1`,
    )
    const storiesData = await storiesResponse.json()
    const story = storiesData.docs[0]

    // This is the same logic used in the screenplay page
    const hasStory = story && story.currentContent && story.status !== 'in-progress'

    console.log('📋 Screenplay Access Validation:')
    console.log(`   - Story exists: ${!!story}`)
    console.log(`   - Has content: ${!!story?.currentContent}`)
    console.log(`   - Status not in-progress: ${story?.status !== 'in-progress'}`)
    console.log(`   - Current status: ${story?.status}`)
    console.log(`   - Screenplay accessible: ${hasStory}`)

    if (hasStory) {
      console.log('✅ Screenplay generation should now be unlocked!')
    } else {
      console.log('❌ Screenplay generation is still blocked')

      if (story?.status === 'in-progress') {
        console.log('   Issue: Story status is still "in-progress"')
        console.log('   Solution: Story needs to be marked as "completed"')
      }
    }
  } catch (error) {
    console.error('❌ Screenplay access test failed:', error.message)
  }
}

// Run the enhancements
runMultipleEnhancements()
