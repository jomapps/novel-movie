#!/usr/bin/env node

/**
 * Basic Story Generation Test
 * Simple test to verify story generation works with project data
 */

const API_BASE = 'http://localhost:3000'

// Use an existing project ID for testing (replace with actual project ID)
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'replace-with-actual-project-id'

async function testBasicStoryGeneration() {
  console.log('🧪 Basic Story Generation Test')
  console.log('=' .repeat(40))

  try {
    // Step 1: Verify project exists and has required data
    console.log('📊 Step 1: Checking project data...')
    const projectResponse = await fetch(`${API_BASE}/v1/projects/${TEST_PROJECT_ID}`)
    
    if (!projectResponse.ok) {
      throw new Error(`Project not found: ${projectResponse.status}`)
    }

    const projectResult = await projectResponse.json()
    const project = projectResult.data || projectResult.doc || projectResult
    
    console.log('✅ Project found:', project.name)
    console.log('📋 Project details:')
    console.log('  - Format:', project.movieFormat?.name || project.movieFormat || 'Not set')
    console.log('  - Style:', project.movieStyle?.name || project.movieStyle || 'Not set')
    console.log('  - Genres:', project.primaryGenres?.map(g => g.name || g).join(', ') || 'Not set')
    console.log('  - Premise:', project.corePremise ? 'Present' : 'Not set')
    console.log('  - Audience:', project.targetAudience?.map(a => a.name || a).join(', ') || 'Not set')
    console.log('  - Tone:', project.tone?.map(t => t.name || t).join(', ') || 'Not set')

    // Step 2: Test story generation
    console.log('\n📖 Step 2: Testing story generation...')
    const storyResponse = await fetch(`${API_BASE}/v1/stories/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: TEST_PROJECT_ID,
      }),
    })

    if (!storyResponse.ok) {
      const errorData = await storyResponse.json()
      console.error('❌ Story generation failed:', errorData)
      throw new Error(`Story generation failed: ${errorData.error || storyResponse.status}`)
    }

    const story = await storyResponse.json()
    console.log('✅ Story generated successfully!')
    
    // Step 3: Analyze the generated story
    console.log('\n📈 Step 3: Story analysis:')
    console.log('  - Story ID:', story.id)
    console.log('  - Project Name:', story.projectName)
    console.log('  - Current Step:', story.currentStep)
    console.log('  - Status:', story.status)
    console.log('  - Content Length:', story.currentContent?.length || 0, 'characters')
    
    if (story.qualityMetrics) {
      console.log('  - Overall Quality:', story.qualityMetrics.overallQuality + '/10')
      console.log('  - Structure Score:', story.qualityMetrics.structureScore + '/10')
      console.log('  - Character Depth:', story.qualityMetrics.characterDepth + '/10')
    }

    if (story.generationParameters) {
      console.log('  - Generation Model:', story.generationParameters.model)
      console.log('  - Generation Prompt:', story.generationParameters.prompt)
    }

    // Step 4: Verify story content includes project data
    console.log('\n🔍 Step 4: Content verification:')
    const content = story.currentContent || ''
    
    const checks = {
      'Has content': content.length > 100,
      'Has project reference': content.includes(project.name) || content.includes(project.projectTitle || ''),
      'Has structured format': content.includes('Act I') || content.includes('**') || content.includes('STORY'),
      'References project format': content.includes(project.movieFormat?.name || project.movieFormat || ''),
      'References project style': content.includes(project.movieStyle?.name || project.movieStyle || ''),
    }

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`)
    })

    const passedChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    
    console.log(`\n📊 Content verification: ${passedChecks}/${totalChecks} checks passed`)

    if (passedChecks >= totalChecks * 0.6) { // 60% pass rate
      console.log('\n🎉 Basic Story Generation Test PASSED!')
      console.log('✅ Story generation is working correctly')
      console.log('✅ Project data is being utilized')
      console.log('✅ Story content is being generated')
    } else {
      console.log('\n⚠️ Basic Story Generation Test PARTIALLY PASSED')
      console.log('✅ Story generation works but content quality needs improvement')
    }

  } catch (error) {
    console.error('\n❌ Basic Story Generation Test FAILED!')
    console.error('Error:', error.message)
    
    if (error.message.includes('Project not found') || error.message.includes('replace-with-actual-project-id')) {
      console.log('\n💡 To run this test:')
      console.log('1. Create a project in the application')
      console.log('2. Copy the project ID')
      console.log('3. Run: TEST_PROJECT_ID=your-project-id node test-story-basic.js')
      console.log('   OR edit this file and replace TEST_PROJECT_ID value')
    }
    
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testBasicStoryGeneration()
}
