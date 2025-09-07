#!/usr/bin/env node

/**
 * Credit Check Test Script
 *
 * Tests if we have sufficient OpenRouter credits by attempting a simple AI generation.
 * This script uses the same BAML client and API endpoints as the main application.
 *
 * Usage:
 *   npm run credit:check
 *   node scripts/test-credit-check.js
 *
 * Requirements:
 *   - Development server must be running (npm run dev)
 *   - OPENROUTER_API_KEY and OPENROUTER_BASE_URL environment variables
 *
 * Exit Codes:
 *   0 = Credits available and AI service working
 *   1 = Credits not available or service issues
 *
 * Error Types:
 *   - INSUFFICIENT_CREDITS: Need to add credits to OpenRouter account
 *   - INVALID_API_KEY: API key is wrong or expired
 *   - RATE_LIMITED: Too many requests, wait and retry
 *   - SERVICE_UNAVAILABLE: BAML service temporarily down
 *   - SERVER_NOT_RUNNING: Start development server first
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
config({ path: resolve(projectRoot, '.env') })

// Color logging utilities
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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

/**
 * Test environment variables
 */
async function testEnvironmentVariables() {
  log('🔍 Checking environment variables...', colors.cyan)

  const requiredVars = ['OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL']

  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, colors.red)
    return { success: false, error: `Missing: ${missing.join(', ')}` }
  }

  log('✅ All required environment variables are present', colors.green)
  return { success: true }
}

/**
 * Test BAML client initialization by making a simple API call
 */
async function testBAMLClientInitialization() {
  log('🔧 Testing BAML client initialization...', colors.cyan)

  try {
    // Test if BAML client can be initialized by making a simple API call
    const response = await fetch('http://localhost:3001/v1/initial-concepts/ai-autofill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: 'BAML Test',
        movieFormat: 'short-film',
        movieStyle: 'cinematic-realism',
        durationUnit: 2,
        formData: {
          primaryGenres: ['Drama'],
          corePremise: 'A simple test story for BAML initialization',
          targetAudience: {
            demographics: ['General'],
            psychographics: 'Family-friendly',
          },
          themes: {
            centralThemes: ['Friendship'],
          },
          visualStyle: {
            cinematographyStyle: 'Natural lighting',
          },
        },
      }),
    })

    if (response.ok) {
      log('✅ BAML client initialized successfully', colors.green)
      return { success: true }
    } else {
      const errorData = await response.json()
      log(`❌ BAML client initialization failed: ${errorData.error}`, colors.red)
      return { success: false, error: errorData.error }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ BAML client test failed: Server not running', colors.red)
      return {
        success: false,
        error: 'Server not running - please start the development server first',
      }
    }
    log(`❌ BAML client initialization failed: ${error.message}`, colors.red)
    return { success: false, error: error.message }
  }
}

/**
 * Test credit availability by attempting a simple generation
 */
async function testCreditAvailability() {
  log('💳 Testing credit availability with simple generation...', colors.cyan)

  try {
    const response = await fetch('http://localhost:3001/v1/initial-concepts/ai-autofill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: 'Credit Check Test',
        movieFormat: 'short-film',
        movieStyle: 'cinematic-realism',
        durationUnit: 2,
        formData: {
          primaryGenres: ['Drama'],
          corePremise: 'A simple test story about friendship to check credits',
          targetAudience: {
            demographics: ['General'],
            psychographics: 'Family-friendly',
          },
          themes: {
            centralThemes: ['Friendship'],
          },
          visualStyle: {
            cinematographyStyle: 'Natural lighting',
          },
        },
      }),
    })

    const data = await response.json()

    if (response.ok) {
      log('✅ Credit check successful - AI generation completed', colors.green)
      log(`📝 Generated sample data available`, colors.blue)

      return {
        success: true,
        message: 'Credits are available and AI service is working',
        sampleResult: data,
      }
    } else {
      log(`❌ Credit check failed: ${data.error || 'Unknown error'}`, colors.red)

      // Check for specific error types based on status code and error data
      if (response.status === 402 || data.errorType === 'INSUFFICIENT_CREDITS') {
        return {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: 'OpenRouter account has insufficient credits',
          userMessage:
            data.userMessage ||
            'Please add credits to your OpenRouter account to continue using AI features.',
          supportUrl: data.supportUrl || 'https://openrouter.ai/settings/credits',
        }
      }

      if (response.status === 401) {
        return {
          success: false,
          error: 'INVALID_API_KEY',
          message: 'OpenRouter API key is invalid or expired',
          userMessage: 'Please check your OpenRouter API key configuration.',
        }
      }

      if (response.status === 429) {
        return {
          success: false,
          error: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          userMessage: 'Too many requests. Please wait a moment and try again.',
        }
      }

      if (response.status === 503 || data.errorType === 'SERVICE_UNAVAILABLE') {
        return {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: data.error || 'AI service temporarily unavailable',
          userMessage:
            data.userMessage ||
            'The AI service is temporarily unavailable. Please try again later.',
        }
      }

      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: data.error || 'Unknown error occurred',
        userMessage: data.userMessage || 'An unexpected error occurred while checking credits.',
      }
    }
  } catch (error) {
    log(`❌ Credit check failed: ${error.message}`, colors.red)

    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'SERVER_NOT_RUNNING',
        message: 'Development server is not running',
        userMessage: 'Please start the development server with "npm run dev" first.',
      }
    }

    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message,
      userMessage: 'Network error occurred while checking credits.',
    }
  }
}

/**
 * Test API endpoint directly (optional additional check)
 */
async function testAPIEndpoint() {
  log('🌐 Testing API endpoint directly...', colors.cyan)

  try {
    const response = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/v1/initial-concepts/ai-autofill`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: 'Credit Check Test',
          movieFormat: 'short-film',
          movieStyle: 'cinematic-realism',
          durationUnit: 5,
          formData: {
            primaryGenres: ['Drama'],
            corePremise: 'A simple test story',
            targetAudience: {
              demographics: ['General'],
              psychographics: 'Family-friendly',
            },
            themes: {
              centralThemes: ['Friendship'],
            },
            visualStyle: {
              cinematographyStyle: 'Natural lighting',
            },
          },
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 402) {
        log('❌ API endpoint reports insufficient credits', colors.red)
        return {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: 'API endpoint confirms insufficient credits',
        }
      }
      throw new Error(`API returned ${response.status}: ${data.error || 'Unknown error'}`)
    }

    log('✅ API endpoint test successful', colors.green)
    return { success: true, message: 'API endpoint is working and credits are available' }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('⚠️ API endpoint test skipped - server not running', colors.yellow)
      return { success: false, error: 'SERVER_NOT_RUNNING', skipped: true }
    }

    log(`❌ API endpoint test failed: ${error.message}`, colors.red)
    return { success: false, error: error.message }
  }
}

/**
 * Main test runner
 */
async function runCreditCheck() {
  log('💳 Starting Credit Check Test Suite\n', colors.bright)

  const results = {
    environment: await testEnvironmentVariables(),
    bamlClient: await testBAMLClientInitialization(),
    creditCheck: null,
    apiEndpoint: null,
  }

  // Only proceed if environment and BAML client are working
  if (results.environment.success && results.bamlClient.success) {
    results.creditCheck = await testCreditAvailability()
    results.apiEndpoint = await testAPIEndpoint()
  } else {
    log('Skipping credit check due to setup failures', colors.yellow)
  }

  // Print summary
  log('\n📊 Credit Check Summary:', colors.bright)
  log('========================', colors.bright)

  if (results.environment.success) {
    log('✅ Environment: OK', colors.green)
  } else {
    log(`❌ Environment: ${results.environment.error}`, colors.red)
  }

  if (results.bamlClient.success) {
    log('✅ BAML Client: OK', colors.green)
  } else {
    log(`❌ BAML Client: ${results.bamlClient.error}`, colors.red)
  }

  if (results.creditCheck) {
    if (results.creditCheck.success) {
      log('✅ Credits: Available', colors.green)
    } else {
      log(`❌ Credits: ${results.creditCheck.error}`, colors.red)
      if (results.creditCheck.userMessage) {
        log(`   ${results.creditCheck.userMessage}`, colors.yellow)
      }
      if (results.creditCheck.supportUrl) {
        log(`   Support: ${results.creditCheck.supportUrl}`, colors.blue)
      }
    }
  }

  if (results.apiEndpoint && !results.apiEndpoint.skipped) {
    if (results.apiEndpoint.success) {
      log('✅ API Endpoint: OK', colors.green)
    } else {
      log(`❌ API Endpoint: ${results.apiEndpoint.error}`, colors.red)
    }
  } else if (results.apiEndpoint?.skipped) {
    log('⚠️ API Endpoint: Skipped (server not running)', colors.yellow)
  }

  // Overall status
  const overallSuccess =
    results.environment.success && results.bamlClient.success && results.creditCheck?.success

  log('\n🎯 Overall Status:', colors.bright)
  if (overallSuccess) {
    log('✅ CREDITS AVAILABLE - AI features are ready to use!', colors.green)
    return 0
  } else {
    log('❌ CREDITS NOT AVAILABLE - AI features may not work', colors.red)
    return 1
  }
}

// Run the test if this script is executed directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMainModule) {
  runCreditCheck()
    .then((exitCode) => {
      process.exit(exitCode)
    })
    .catch((error) => {
      log(`\n💥 Unexpected error: ${error.message}`, colors.red)
      console.error(error)
      process.exit(1)
    })
}

export { runCreditCheck }
