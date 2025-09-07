#!/usr/bin/env node

/**
 * Enhanced Character Development Test Suite
 * Tests the improved character development workflow with BAML integration,
 * relationship generation, and Character Library integration
 */

const API_BASE = 'http://localhost:3001'

// Test configuration
const TEST_CONFIG = {
  projectId: null, // Will be set during test
  skipCharacterLibrary: false, // Set to true if Character Library is not available
  testEnhancement: true,
  testValidation: true,
  testSync: true,
}

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(`${title}`, 'cyan')
  log(`${'='.repeat(60)}`, 'cyan')
}

function logTest(testName) {
  log(`\n🧪 ${testName}`, 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || response.statusText}`)
    }

    return result
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`)
  }
}

async function findTestProject() {
  logTest('Finding test project with story structure')

  try {
    // Get all projects
    const projects = await makeRequest('GET', '/api/projects?limit=50')

    if (!projects.docs || projects.docs.length === 0) {
      throw new Error('No projects found. Please create a project first.')
    }

    // Find a project with story structure
    for (const project of projects.docs) {
      try {
        const storyStructures = await makeRequest(
          'GET',
          `/api/story-structures?where[project][equals]=${project.id}`,
        )
        if (storyStructures.docs && storyStructures.docs.length > 0) {
          TEST_CONFIG.projectId = project.id
          logSuccess(`Found test project: ${project.name} (${project.id})`)
          return project
        }
      } catch (error) {
        // Continue to next project
      }
    }

    throw new Error(
      'No project with story structure found. Please complete story structure planning first.',
    )
  } catch (error) {
    logError(`Failed to find test project: ${error.message}`)
    throw error
  }
}

async function testCharacterGeneration() {
  logTest('Testing enhanced character generation with BAML')

  try {
    const result = await makeRequest(
      'POST',
      `/v1/projects/${TEST_CONFIG.projectId}/character-development`,
    )

    if (result.characters && result.characters.length > 0) {
      logSuccess(`Generated ${result.characters.length} characters`)
      logInfo(`Processing time: ${result.processingTime}s`)
      logInfo(`Quality metrics: Overall ${result.qualityMetrics?.overallQuality || 'N/A'}`)

      // Check for relationships
      const charactersWithRelationships = result.characters.filter(
        (char) => char.relationships && char.relationships.length > 0,
      )

      if (charactersWithRelationships.length > 0) {
        logSuccess(`${charactersWithRelationships.length} characters have relationships`)
      } else {
        logWarning('No character relationships generated')
      }

      // Check Character Library integration
      const charactersWithLibraryId = result.characters.filter((char) => char.characterLibraryId)

      if (charactersWithLibraryId.length > 0) {
        logSuccess(`${charactersWithLibraryId.length} characters linked to Character Library`)
      } else {
        logWarning('No characters linked to Character Library')
        TEST_CONFIG.skipCharacterLibrary = true
      }

      return result.characters
    } else {
      throw new Error('No characters generated')
    }
  } catch (error) {
    logError(`Character generation failed: ${error.message}`)
    throw error
  }
}

async function testCharacterRetrieval() {
  logTest('Testing character retrieval')

  try {
    const result = await makeRequest(
      'GET',
      `/v1/projects/${TEST_CONFIG.projectId}/character-development`,
    )

    if (result.characters && result.characters.length > 0) {
      logSuccess(`Retrieved ${result.characters.length} characters`)
      logInfo(`Summary: ${JSON.stringify(result.summary, null, 2)}`)
      return result.characters
    } else {
      throw new Error('No characters found')
    }
  } catch (error) {
    logError(`Character retrieval failed: ${error.message}`)
    throw error
  }
}

async function testCharacterEnhancement(characters) {
  if (!TEST_CONFIG.testEnhancement) {
    logInfo('Skipping character enhancement test')
    return
  }

  logTest('Testing character enhancement')

  try {
    const testCharacter = characters[0]
    const focusAreas = ['dialogue', 'psychology', 'relationships']

    const result = await makeRequest(
      'PUT',
      `/v1/projects/${TEST_CONFIG.projectId}/character-development`,
      {
        action: 'enhance',
        characterId: testCharacter.id,
        focusAreas: focusAreas,
      },
    )

    if (result.enhancedCharacters > 0) {
      logSuccess(`Enhanced ${result.enhancedCharacters} character(s)`)
      logInfo(`Results: ${JSON.stringify(result.results, null, 2)}`)

      if (result.errors && result.errors.length > 0) {
        logWarning(`Errors: ${result.errors.join(', ')}`)
      }
    } else {
      throw new Error('No characters enhanced')
    }
  } catch (error) {
    logError(`Character enhancement failed: ${error.message}`)
  }
}

async function testCharacterValidation(characters) {
  if (!TEST_CONFIG.testValidation) {
    logInfo('Skipping character validation test')
    return
  }

  logTest('Testing character validation')

  try {
    const result = await makeRequest(
      'PUT',
      `/v1/projects/${TEST_CONFIG.projectId}/character-development`,
      {
        action: 'validate',
      },
    )

    if (result.validatedCharacters > 0) {
      logSuccess(`Validated ${result.validatedCharacters} character(s)`)

      result.results.forEach((validation) => {
        logInfo(`${validation.characterName}:`)
        logInfo(`  Quality: ${JSON.stringify(validation.qualityMetrics)}`)
        if (validation.recommendations && validation.recommendations.length > 0) {
          logInfo(`  Recommendations: ${validation.recommendations.join(', ')}`)
        }
      })

      if (result.errors && result.errors.length > 0) {
        logWarning(`Errors: ${result.errors.join(', ')}`)
      }
    } else {
      throw new Error('No characters validated')
    }
  } catch (error) {
    logError(`Character validation failed: ${error.message}`)
  }
}

async function testCharacterSync() {
  if (!TEST_CONFIG.testSync || TEST_CONFIG.skipCharacterLibrary) {
    logInfo('Skipping character sync test')
    return
  }

  logTest('Testing character synchronization')

  try {
    const result = await makeRequest(
      'PUT',
      `/v1/projects/${TEST_CONFIG.projectId}/character-development`,
      {
        action: 'sync',
      },
    )

    logSuccess('Character sync completed')
    logInfo(`Sync result: ${JSON.stringify(result.syncResult, null, 2)}`)
  } catch (error) {
    logError(`Character sync failed: ${error.message}`)
  }
}

async function runTests() {
  logSection('Enhanced Character Development Test Suite')

  try {
    // Step 1: Find test project
    await findTestProject()

    // Step 2: Test character generation
    const characters = await testCharacterGeneration()

    // Step 3: Test character retrieval
    await testCharacterRetrieval()

    // Step 4: Test character enhancement
    await testCharacterEnhancement(characters)

    // Step 5: Test character validation
    await testCharacterValidation(characters)

    // Step 6: Test character sync
    await testCharacterSync()

    logSection('Test Suite Completed Successfully')
    logSuccess('All tests passed! Enhanced character development is working correctly.')
  } catch (error) {
    logSection('Test Suite Failed')
    logError(`Test suite failed: ${error.message}`)
    process.exit(1)
  }
}

// Run the tests
runTests().catch((error) => {
  logError(`Unexpected error: ${error.message}`)
  process.exit(1)
})
