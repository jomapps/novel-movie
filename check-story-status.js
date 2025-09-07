#!/usr/bin/env node

/**
 * Check the specific project and story status for screenplay diagnosis
 */

const projectId = '68ba6d7cab4c03313d505020'

async function checkStoryStatus() {
  console.log('🔍 Diagnosing Screenplay Page Issue...\n')

  try {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3001'

    // Test server connectivity
    console.log('1. Testing server connectivity...')
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`)
      if (!healthResponse.ok) {
        throw new Error(`Server not responding: HTTP ${healthResponse.status}`)
      }
      console.log('✅ Server is running')
    } catch (error) {
      console.log('❌ Server not accessible:', error.message)
      console.log('ℹ️  Please start the server with: npm run dev')
      return
    }

    // Check project data
    console.log('\n2. Checking project data...')
    const projectResponse = await fetch(`${baseUrl}/v1/projects/${projectId}`)

    if (!projectResponse.ok) {
      console.log('❌ Project API failed:', projectResponse.status)
      return
    }

    const projectData = await projectResponse.json()

    if (!projectData.success) {
      console.log('❌ Project not found:', projectData.error)
      return
    }

    const project = projectData.data
    console.log('✅ Project found:', project.name)
    console.log('   - Status:', project.status)
    console.log('   - Workflow Status:', JSON.stringify(project.workflowStatus, null, 4))

    // Check story data
    console.log('\n3. Checking story data...')
    const storiesResponse = await fetch(
      `${baseUrl}/v1/stories?where[project][equals]=${projectId}&limit=1`,
    )

    if (!storiesResponse.ok) {
      console.log('❌ Stories API failed:', storiesResponse.status)
      return
    }

    const storiesData = await storiesResponse.json()

    if (!storiesData.docs || storiesData.docs.length === 0) {
      console.log('❌ No story found for this project')
      console.log('📋 DIAGNOSIS: Story development has not been started')
      console.log('🔧 SOLUTION: Go to /project/' + projectId + '/story and generate a story first')
      return
    }

    const story = storiesData.docs[0]
    console.log('✅ Story found:', story.id)
    console.log('   - Status:', story.status)
    console.log('   - Current Step:', story.currentStep, '/ 12')
    console.log('   - Content Length:', story.currentContent?.length || 0, 'characters')
    console.log('   - Quality Score:', story.qualityMetrics?.overallQuality || 'N/A')
    console.log('   - Quality Metrics:', JSON.stringify(story.qualityMetrics, null, 2))

    // Analyze screenplay validation logic
    console.log('\n4. Analyzing screenplay validation logic...')

    const hasContent = !!story.currentContent
    const statusNotInProgress = story.status !== 'in-progress'
    const hasValidStory = story && hasContent && statusNotInProgress

    console.log('   - Has content:', hasContent)
    console.log('   - Status is not "in-progress":', statusNotInProgress)
    console.log('   - Passes screenplay validation:', hasValidStory)

    // Provide diagnosis
    console.log('\n📋 DIAGNOSIS:')
    console.log('='.repeat(50))

    if (hasValidStory) {
      console.log('✅ Story should be valid for screenplay generation')
      console.log('🔧 POSSIBLE ISSUES:')
      console.log('   - Frontend caching issue - try hard refresh (Ctrl+F5)')
      console.log('   - API endpoint issue - check browser network tab')
      console.log('   - Component state issue - check React dev tools')
    } else {
      if (!hasContent) {
        console.log('❌ ISSUE: Story has no content')
        console.log('🔧 SOLUTION: Regenerate the story content')
      }

      if (!statusNotInProgress) {
        console.log('❌ ISSUE: Story status is "in-progress"')
        console.log('🔧 SOLUTION: Complete story development or manually update status')
        console.log('   Current status:', story.status)
        console.log('   Required status: completed, paused, needs-review, or approved')

        if (story.currentStep < 12) {
          console.log('   Story is at step', story.currentStep, 'of 12 - needs more enhancement')
        } else {
          console.log(
            '   Story is at step 12 but status is still in-progress - may need manual update',
          )
        }
      }
    }

    // Check story completion criteria
    console.log('\n5. Story completion criteria analysis...')
    console.log('   - Current step:', story.currentStep, '(needs to be 12 for auto-completion)')
    console.log('   - Status:', story.status, '(should be "completed" for screenplay)')

    if (story.currentStep >= 12 && story.status === 'in-progress') {
      console.log('🔧 SPECIFIC ISSUE: Story reached step 12 but status not updated to "completed"')
      console.log('   This suggests the enhancement process completed but status update failed')
    }
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message)
    console.error(error)
  }
}

// Run the diagnosis
checkStoryStatus()
