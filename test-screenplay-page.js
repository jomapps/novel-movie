/**
 * Test script to verify the screenplay page is working correctly
 * Run with: node test-screenplay-page.js
 */

const projectId = '68b9d1457ae0c1549464f026'

async function testScreenplayPageAPIs() {
  console.log('🧪 Testing Screenplay Page APIs...\n')

  try {
    // Test 1: Check if project exists
    console.log('1. Testing project API...')
    const projectResponse = await fetch(`http://localhost:3000/v1/projects/${projectId}`)
    const projectData = await projectResponse.json()
    
    if (projectData.success) {
      console.log('✅ Project API working - Project found:', projectData.data.name)
    } else {
      console.log('❌ Project API failed:', projectData.error)
      return
    }

    // Test 2: Check if stories API is working
    console.log('\n2. Testing stories API...')
    const storiesResponse = await fetch(`http://localhost:3000/v1/stories?where[project][equals]=${projectId}&limit=1`)
    const storiesData = await storiesResponse.json()
    
    if (storiesResponse.ok) {
      console.log('✅ Stories API working')
      if (storiesData.docs && storiesData.docs.length > 0) {
        const story = storiesData.docs[0]
        console.log(`   - Story found: Status=${story.status}, Step=${story.currentStep}/12`)
        console.log(`   - Quality: ${story.qualityMetrics?.overallQuality || 'N/A'}`)
      } else {
        console.log('   - No story found for this project')
      }
    } else {
      console.log('❌ Stories API failed:', storiesData.error)
    }

    // Test 3: Check if the page would load correctly
    console.log('\n3. Testing page load conditions...')
    const hasStory = storiesData.docs && storiesData.docs.length > 0
    const story = hasStory ? storiesData.docs[0] : null
    const hasValidStory = story && story.currentContent && story.status !== 'in-progress'
    
    console.log(`   - Has story: ${hasStory}`)
    console.log(`   - Story status: ${story?.status || 'N/A'}`)
    console.log(`   - Has content: ${!!story?.currentContent}`)
    console.log(`   - Valid for screenplay: ${hasValidStory}`)
    
    if (hasValidStory) {
      console.log('✅ Page should load screenplay interface')
    } else {
      console.log('ℹ️  Page should show "Story Required" message')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run the test
testScreenplayPageAPIs()
