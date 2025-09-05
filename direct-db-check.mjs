#!/usr/bin/env node

/**
 * Direct database check using PayloadCMS without server
 */

import { getPayload } from 'payload'
import config from './dist/payload.config.js'

const projectId = '68b9d1457ae0c1549464f026'

async function checkStoryStatusDirect() {
  console.log('🔍 Direct Database Check for Screenplay Issue...\n')

  try {
    console.log('1. Initializing PayloadCMS...')
    const payload = await getPayload({ config })
    console.log('✅ PayloadCMS initialized')

    // Check project data
    console.log('\n2. Checking project data...')
    try {
      const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        depth: 2
      })
      
      console.log('✅ Project found:', project.name)
      console.log('   - Status:', project.status)
      console.log('   - Workflow Status:', JSON.stringify(project.workflowStatus, null, 4))
    } catch (error) {
      console.log('❌ Project not found:', error.message)
      return
    }

    // Check story data
    console.log('\n3. Checking story data...')
    const stories = await payload.find({
      collection: 'stories',
      where: {
        project: {
          equals: projectId
        }
      },
      depth: 1,
      limit: 1
    })
    
    if (!stories.docs || stories.docs.length === 0) {
      console.log('❌ No story found for this project')
      console.log('📋 DIAGNOSIS: Story development has not been started')
      console.log('🔧 SOLUTION: Go to /project/' + projectId + '/story and generate a story first')
      return
    }
    
    const story = stories.docs[0]
    console.log('✅ Story found:', story.id)
    console.log('   - Status:', story.status)
    console.log('   - Current Step:', story.currentStep, '/ 12')
    console.log('   - Content Length:', story.currentContent?.length || 0, 'characters')
    console.log('   - Quality Score:', story.qualityMetrics?.overallQuality || 'N/A')

    // Analyze screenplay validation logic
    console.log('\n4. Analyzing screenplay validation logic...')
    
    const hasContent = !!story.currentContent
    const statusNotInProgress = story.status !== 'in-progress'
    const hasValidStory = story && hasContent && statusNotInProgress
    
    console.log('   - Has content:', hasContent)
    console.log('   - Status is not "in-progress":', statusNotInProgress)
    console.log('   - Current status:', story.status)
    console.log('   - Passes screenplay validation:', hasValidStory)
    
    // Show the exact validation logic from the code
    console.log('\n5. Screenplay page validation logic:')
    console.log('   const hasStory = story && story.currentContent && story.status !== "in-progress"')
    console.log('   - story exists:', !!story)
    console.log('   - story.currentContent exists:', !!story.currentContent)
    console.log('   - story.status !== "in-progress":', story.status !== 'in-progress')
    console.log('   - Final result:', hasValidStory)
    
    // Provide diagnosis
    console.log('\n📋 DIAGNOSIS:')
    console.log('='.repeat(50))
    
    if (hasValidStory) {
      console.log('✅ Story should be valid for screenplay generation')
      console.log('🔧 POSSIBLE ISSUES:')
      console.log('   - Frontend caching issue - try hard refresh (Ctrl+F5)')
      console.log('   - API endpoint issue - check browser network tab')
      console.log('   - Component state issue - check React dev tools')
      console.log('   - Server not running - start with npm run dev')
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
          console.log('   Story is at step 12 but status is still in-progress - may need manual update')
        }
      }
    }
    
    // Check story completion criteria
    console.log('\n6. Story completion criteria analysis...')
    console.log('   - Current step:', story.currentStep, '(needs to be 12 for auto-completion)')
    console.log('   - Status:', story.status, '(should be "completed" for screenplay)')
    
    if (story.currentStep >= 12 && story.status === 'in-progress') {
      console.log('🔧 SPECIFIC ISSUE: Story reached step 12 but status not updated to "completed"')
      console.log('   This suggests the enhancement process completed but status update failed')
      console.log('   Manual fix needed: Update story status to "completed"')
    }

    // Show enhancement history if available
    if (story.enhancementHistory && story.enhancementHistory.length > 0) {
      console.log('\n7. Enhancement history (last 3 entries):')
      const recent = story.enhancementHistory.slice(-3)
      recent.forEach((entry, index) => {
        console.log(`   ${index + 1}. Step ${entry.stepNumber || entry.step}: ${entry.stepName || entry.focusArea}`)
        console.log(`      Quality: ${entry.qualityAfter?.overallQuality || 'N/A'}`)
      })
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message)
    console.error(error)
  }
}

// Run the diagnosis
checkStoryStatusDirect()
