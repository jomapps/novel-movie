#!/usr/bin/env node

/**
 * Fix story status for screenplay access
 * This script updates the story status from 'in-progress' to 'completed'
 * when quality metrics indicate the story is ready
 */

const projectId = '68ba6d7cab4c03313d505020'
const storyId = '68ba9be174adf7598be3a8fb'

async function fixStoryStatus() {
  console.log('🔧 Fixing Story Status for Screenplay Access...\n')

  try {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3001'

    // First, verify current story state
    console.log('1. Checking current story state...')
    const storyResponse = await fetch(
      `${baseUrl}/v1/stories?where[project][equals]=${projectId}&limit=1`,
    )

    if (!storyResponse.ok) {
      throw new Error(`Failed to fetch story: ${storyResponse.status}`)
    }

    const storyData = await storyResponse.json()

    if (!storyData.docs || storyData.docs.length === 0) {
      throw new Error('No story found for this project')
    }

    const story = storyData.docs[0]
    console.log('✅ Current story state:')
    console.log('   - Status:', story.status)
    console.log('   - Current Step:', story.currentStep, '/ 12')
    console.log('   - Overall Quality:', story.qualityMetrics?.overallQuality || 'N/A')

    // Check if story quality metrics indicate completion readiness
    const qualityMetrics = story.qualityMetrics || {}
    const isQualityReady =
      (qualityMetrics.structureScore || 0) >= 7 &&
      (qualityMetrics.characterDepth || 0) >= 7 &&
      (qualityMetrics.coherenceScore || 0) >= 7 &&
      (qualityMetrics.conflictTension || 0) >= 7 &&
      (qualityMetrics.dialogueQuality || 0) >= 7 &&
      (qualityMetrics.genreAlignment || 0) >= 7 &&
      (qualityMetrics.audienceEngagement || 0) >= 7 &&
      (qualityMetrics.visualStorytelling || 0) >= 7 &&
      (qualityMetrics.productionReadiness || 0) >= 8

    console.log('\n2. Quality assessment:')
    console.log('   - Quality metrics ready for production:', isQualityReady)

    if (!isQualityReady) {
      console.log('❌ Story quality metrics do not meet completion criteria')
      console.log('   Please continue story enhancement first')
      return
    }

    if (story.status === 'completed') {
      console.log('✅ Story is already marked as completed')
      console.log('🔧 The issue might be frontend caching - try hard refresh (Ctrl+F5)')
      return
    }

    // Update story status to completed
    console.log('\n3. Updating story status to "completed"...')

    const updateResponse = await fetch(`${baseUrl}/api/stories/${story.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
        currentStep: 12, // Also update to final step
      }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text()
      throw new Error(`Failed to update story: ${updateResponse.status} - ${errorData}`)
    }

    const updatedStory = await updateResponse.json()

    console.log('✅ Story status updated successfully!')
    console.log('   - New status:', updatedStory.status || 'completed')
    console.log('   - New step:', updatedStory.currentStep || 12)

    // Verify screenplay access
    console.log('\n4. Testing screenplay page access...')
    const screenplayResponse = await fetch(`${baseUrl}/project/${projectId}/screenplay`)

    if (screenplayResponse.ok) {
      console.log('✅ Screenplay page should now be accessible!')
      console.log('🎉 You can now access: https://novel.ft.tc/project/' + projectId + '/screenplay')
    } else {
      console.log('⚠️  Screenplay page might still have issues - try refreshing the page')
    }
  } catch (error) {
    console.error('❌ Failed to fix story status:', error.message)
    console.error(error)
  }
}

// Run the fix
fixStoryStatus()
