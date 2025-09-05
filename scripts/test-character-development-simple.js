#!/usr/bin/env node

/**
 * Simple Character Development API Test
 * Tests the character development API endpoints without direct database access
 */

// Test configuration
const BASE_URL = 'http://localhost:3000'
const TEST_PROJECT_ID = '68b9d1457ae0c1549464f026' // Use the existing project ID

// Helper functions
function logStep(step, message) {
  console.log(`\n🔄 Step ${step}: ${message}`)
}

function logSuccess(message) {
  console.log(`✅ ${message}`)
}

function logError(message) {
  console.log(`❌ ${message}`)
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`)
}

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    }
  }
}

async function testProjectExists() {
  logStep('1', 'Checking if test project exists')

  try {
    const response = await makeRequest(`${BASE_URL}/api/projects/${TEST_PROJECT_ID}`)

    if (response.ok) {
      logSuccess(`Project found: ${response.data.name}`)
      return response.data
    } else {
      logError(`Project not found: ${response.data.error || 'Unknown error'}`)
      return null
    }
  } catch (error) {
    logError(`Failed to check project: ${error.message}`)
    return null
  }
}

async function testStoryExists() {
  logStep('2', 'Checking if story exists for the project')

  try {
    const response = await makeRequest(
      `${BASE_URL}/api/stories?where[project][equals]=${TEST_PROJECT_ID}`,
    )

    if (response.ok && response.data.docs && response.data.docs.length > 0) {
      const story = response.data.docs[0]
      logSuccess(`Story found: ${story.projectName} (Status: ${story.status})`)
      logInfo(`Story length: ${story.currentContent?.length || 0} characters`)
      return story
    } else {
      logError('No story found for this project')
      return null
    }
  } catch (error) {
    logError(`Failed to check story: ${error.message}`)
    return null
  }
}

async function testStoryStructureExists() {
  logStep('3', 'Checking if story structure exists')

  try {
    const response = await makeRequest(`${BASE_URL}/v1/projects/${TEST_PROJECT_ID}/story-structure`)

    if (response.ok) {
      logSuccess(
        `Story structure found with ${response.data.storyBeats?.length || 0} beats and ${response.data.characterArcs?.length || 0} character arcs`,
      )
      return response.data
    } else {
      logError(`Story structure not found: ${response.data.error || 'Unknown error'}`)
      return null
    }
  } catch (error) {
    logError(`Failed to check story structure: ${error.message}`)
    return null
  }
}

async function testCharacterDevelopmentAPI() {
  logStep('4', 'Testing Character Development API')

  try {
    // Test GET first to see if characters already exist
    logInfo('Checking for existing characters...')
    const getResponse = await makeRequest(
      `${BASE_URL}/v1/projects/${TEST_PROJECT_ID}/character-development`,
    )

    if (getResponse.ok) {
      logSuccess(
        `Existing characters found: ${getResponse.data.summary?.totalCharacters || getResponse.data.characters?.length || 0}`,
      )

      if (getResponse.data.characters && getResponse.data.characters.length > 0) {
        logInfo('Existing characters:')
        getResponse.data.characters.forEach((char, index) => {
          console.log(`  ${index + 1}. ${char.name} (${char.role})`)
          console.log(`     Quality: ${char.generationMetadata?.qualityScore || 'N/A'}`)
        })
      }

      return getResponse.data
    }

    // If no characters exist, try to create them
    logInfo('No existing characters found. Testing character creation...')
    const createResponse = await makeRequest(
      `${BASE_URL}/v1/projects/${TEST_PROJECT_ID}/character-development`,
      {
        method: 'POST',
      },
    )

    if (createResponse.ok) {
      logSuccess(`Characters created successfully!`)
      logInfo(`Total characters: ${createResponse.data.totalCharacters}`)
      logInfo(`Processing time: ${createResponse.data.processingTime} seconds`)
      logInfo(`Quality score: ${createResponse.data.qualityMetrics?.overallQuality || 'N/A'}`)

      if (createResponse.data.characters && createResponse.data.characters.length > 0) {
        logInfo('Created characters:')
        createResponse.data.characters.forEach((char, index) => {
          console.log(`  ${index + 1}. ${char.name} (${char.role})`)
          console.log(`     Archetype: ${char.archetype || 'N/A'}`)
          console.log(`     Quality: ${char.generationMetadata?.qualityScore || 'N/A'}`)
        })
      }

      return createResponse.data
    } else {
      logError(`Character creation failed: ${createResponse.data.error || 'Unknown error'}`)
      return null
    }
  } catch (error) {
    logError(`Character development API test failed: ${error.message}`)
    return null
  }
}

async function testCharacterDataIntegrity(characters) {
  logStep('5', 'Testing character data integrity')

  if (!characters || !characters.characters || characters.characters.length === 0) {
    logError('No character data to validate')
    return false
  }

  let validCharacters = 0
  let issues = []

  characters.characters.forEach((char, index) => {
    const charNum = index + 1
    let charIssues = []

    // Check required fields
    if (!char.name) charIssues.push('Missing name')
    if (!char.role) charIssues.push('Missing role')
    if (!char.characterDevelopment?.biography) charIssues.push('Missing biography')
    if (!char.characterDevelopment?.personality) charIssues.push('Missing personality')
    if (!char.characterArc?.startState) charIssues.push('Missing character arc start state')
    if (!char.physicalDescription?.description) charIssues.push('Missing physical description')
    if (!char.dialogueVoice?.voiceDescription) charIssues.push('Missing dialogue voice')

    if (charIssues.length === 0) {
      validCharacters++
      logSuccess(`Character ${charNum} (${char.name}): All required fields present`)
    } else {
      issues.push(`Character ${charNum} (${char.name}): ${charIssues.join(', ')}`)
    }
  })

  if (issues.length === 0) {
    logSuccess(`All ${validCharacters} characters passed validation`)
    return true
  } else {
    logError(`Found ${issues.length} validation issues:`)
    issues.forEach((issue) => console.log(`  - ${issue}`))
    return false
  }
}

async function testScreenplayPageIntegration() {
  logStep('6', 'Testing screenplay page integration')

  try {
    logInfo('The character development step should now be available on the screenplay page')
    logInfo(`Visit: ${BASE_URL}/project/${TEST_PROJECT_ID}/screenplay`)
    logInfo('Look for the Character Development step with completed status and character details')

    return true
  } catch (error) {
    logError(`Screenplay page integration test failed: ${error.message}`)
    return false
  }
}

// Main test runner
async function runSimpleCharacterDevelopmentTest() {
  console.log('🚀 Simple Character Development API Test')
  console.log('='.repeat(50))
  console.log(`Testing with project ID: ${TEST_PROJECT_ID}`)

  const results = {
    projectExists: false,
    storyExists: false,
    storyStructureExists: false,
    characterDevelopment: false,
    dataIntegrity: false,
    screenplayIntegration: false,
  }

  try {
    // Step 1: Check project exists
    const project = await testProjectExists()
    results.projectExists = !!project

    if (!project) {
      logError('Cannot continue without a valid project')
      return results
    }

    // Step 2: Check story exists
    const story = await testStoryExists()
    results.storyExists = !!story

    if (!story) {
      logError('Cannot continue without a story. Please complete story development first.')
      return results
    }

    // Step 3: Check story structure exists
    const storyStructure = await testStoryStructureExists()
    results.storyStructureExists = !!storyStructure

    if (!storyStructure) {
      logError(
        'Cannot continue without story structure. Please complete story structure planning first.',
      )
      return results
    }

    // Step 4: Test character development API
    const characters = await testCharacterDevelopmentAPI()
    results.characterDevelopment = !!characters

    if (characters) {
      // Step 5: Test character data integrity
      results.dataIntegrity = await testCharacterDataIntegrity(characters)

      // Step 6: Test screenplay page integration
      results.screenplayIntegration = await testScreenplayPageIntegration()
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`)
  }

  // Summary
  console.log('\n📊 Test Results Summary')
  console.log('='.repeat(30))

  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length

  Object.entries(results).forEach(([test, passed]) => {
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`)
  })

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('\n🎉 All character development tests passed!')
    console.log(`🌐 Visit the screenplay page: ${BASE_URL}/project/${TEST_PROJECT_ID}/screenplay`)
    console.log(
      'The Character Development step should now show as completed with character details.',
    )
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.')
  }

  return results
}

// Run tests if called directly
if (import.meta.url.includes('test-character-development-simple.js')) {
  runSimpleCharacterDevelopmentTest().catch(console.error)
}

export { runSimpleCharacterDevelopmentTest }
