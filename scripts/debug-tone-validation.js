#!/usr/bin/env node

/**
 * Debug script to check tone field validation issues
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
}

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function debugToneValidation() {
  log('\n🔍 Debugging Tone Field Validation', colors.magenta)
  log('='.repeat(50), colors.white)

  try {
    // Test 1: Check if tone-options collection exists and has data
    logInfo('Checking tone-options collection...')
    const baseUrl = process.env.SITE_URL || 'http://localhost:3001'
    const toneOptionsResponse = await fetch(`${baseUrl}/v1/config/tone-options`)

    if (!toneOptionsResponse.ok) {
      logError(`Failed to fetch tone options: HTTP ${toneOptionsResponse.status}`)
      return
    }

    const toneOptionsData = await toneOptionsResponse.json()
    if (toneOptionsData.success && toneOptionsData.data.length > 0) {
      logSuccess(`Found ${toneOptionsData.data.length} tone options`)

      // Show first few tone options
      logInfo('Available tone options:')
      toneOptionsData.data.slice(0, 5).forEach((tone) => {
        log(`  • ${tone.name} (ID: ${tone.id})`, colors.cyan)
      })
    } else {
      logError('No tone options found in database')
      logWarning('Run the seed script: npm run seed')
      return
    }

    // Test 2: Try creating a minimal project with tone field
    logInfo('Testing project creation with tone field...')

    // First get required data
    const movieFormatsResponse = await fetch(`${baseUrl}/v1/movie-formats`)
    const movieStylesResponse = await fetch(`${baseUrl}/v1/movie-styles`)

    if (!movieFormatsResponse.ok || !movieStylesResponse.ok) {
      logError('Failed to fetch required movie formats or styles')
      return
    }

    const movieFormatsData = await movieFormatsResponse.json()
    const movieStylesData = await movieStylesResponse.json()

    if (
      !movieFormatsData.success ||
      !movieStylesData.success ||
      movieFormatsData.data.docs.length === 0 ||
      movieStylesData.data.docs.length === 0
    ) {
      logError('No movie formats or styles found')
      logWarning('Run the seed script: npm run seed')
      return
    }

    // Test 3: Create project with valid tone IDs
    const testProjectData = {
      name: `Test Project ${Date.now()}`,
      movieFormat: movieFormatsData.data.docs[0].id,
      movieStyle: movieStylesData.data.docs[0].id,
      durationUnit: 90,
      tone: [toneOptionsData.data[0].id], // Use first tone option ID
    }

    logInfo('Testing project creation with tone field...')
    logInfo(`Using tone ID: ${testProjectData.tone[0]}`)

    const createResponse = await fetch(`${baseUrl}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProjectData),
    })

    if (createResponse.ok) {
      const result = await createResponse.json()
      logSuccess('Project created successfully with tone field!')
      logInfo(`Project ID: ${result.data.id}`)

      // Clean up - delete the test project
      try {
        await fetch(`${baseUrl}/api/projects/${result.data.id}`, {
          method: 'DELETE',
        })
        logInfo('Test project cleaned up')
      } catch (e) {
        logWarning('Could not clean up test project')
      }
    } else {
      const errorData = await createResponse.json()
      logError('Project creation failed!')
      logError(`Status: ${createResponse.status}`)
      logError(`Error: ${JSON.stringify(errorData, null, 2)}`)
    }

    // Test 4: Test with empty tone array
    logInfo('Testing project creation with empty tone array...')
    const testProjectDataEmpty = {
      ...testProjectData,
      name: `Test Project Empty ${Date.now()}`,
      tone: [],
    }

    const createEmptyResponse = await fetch(`${baseUrl}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProjectDataEmpty),
    })

    if (createEmptyResponse.ok) {
      const result = await createEmptyResponse.json()
      logSuccess('Project created successfully with empty tone array!')

      // Clean up
      try {
        await fetch(`${baseUrl}/api/projects/${result.data.id}`, {
          method: 'DELETE',
        })
      } catch (e) {
        // Ignore cleanup errors
      }
    } else {
      const errorData = await createEmptyResponse.json()
      logError('Project creation with empty tone failed!')
      logError(`Error: ${JSON.stringify(errorData, null, 2)}`)
    }

    // Test 5: Test with invalid tone ID
    logInfo('Testing project creation with invalid tone ID...')
    const testProjectDataInvalid = {
      ...testProjectData,
      name: `Test Project Invalid ${Date.now()}`,
      tone: ['invalid-tone-id'],
    }

    const createInvalidResponse = await fetch(`${baseUrl}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProjectDataInvalid),
    })

    if (!createInvalidResponse.ok) {
      const errorData = await createInvalidResponse.json()
      logWarning('Project creation with invalid tone ID failed (expected)')
      logInfo(`Error: ${JSON.stringify(errorData, null, 2)}`)
    } else {
      logWarning('Project creation with invalid tone ID succeeded (unexpected)')
    }
  } catch (error) {
    logError(`Debug script failed: ${error.message}`)
    logInfo('Make sure your development server is running: npm run dev')
  }
}

// Always run the debug script when executed directly
debugToneValidation().catch(console.error)

export { debugToneValidation }
