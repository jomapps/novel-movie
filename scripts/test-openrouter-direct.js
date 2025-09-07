#!/usr/bin/env node

/**
 * Direct OpenRouter Credit Check Test Script
 *
 * Tests OpenRouter API directly without BAML to isolate credit/API issues.
 * This bypasses all BAML layers and tests the raw OpenRouter API.
 *
 * Usage:
 *   npm run credit:check:direct
 *   node scripts/test-openrouter-direct.js
 *
 * Requirements:
 *   - OPENROUTER_API_KEY environment variable
 *
 * Exit Codes:
 *   0 = Credits available and OpenRouter API working
 *   1 = Credits not available or API issues
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

  const requiredVars = ['OPENROUTER_API_KEY']
  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    log(`❌ Missing environment variables: ${missing.join(', ')}`, colors.red)
    return { success: false, error: `Missing: ${missing.join(', ')}` }
  }

  // Check if API key looks valid
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey.startsWith('sk-or-v1-')) {
    log('⚠️ API key format looks unusual (expected to start with sk-or-v1-)', colors.yellow)
  }

  log('✅ All required environment variables are present', colors.green)
  log(
    `🔑 API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}`,
    colors.blue,
  )

  return { success: true }
}

/**
 * Test OpenRouter API directly with a minimal request
 */
async function testOpenRouterDirect() {
  log('🌐 Testing OpenRouter API directly...', colors.cyan)

  const apiKey = process.env.OPENROUTER_API_KEY
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'

  try {
    log(`📡 Making request to: ${baseUrl}/chat/completions`, colors.blue)

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3001',
        'X-Title': 'Novel Movie Credit Test',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello" - this is a credit test.',
          },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    })

    log(`📊 Response Status: ${response.status} ${response.statusText}`, colors.blue)

    // Log response headers for debugging
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    log(`📋 Response Headers: ${JSON.stringify(headers, null, 2)}`, colors.blue)

    const data = await response.json()
    log(`📄 Response Body: ${JSON.stringify(data, null, 2)}`, colors.blue)

    if (response.ok) {
      const content = data.choices?.[0]?.message?.content
      log('✅ OpenRouter API test successful!', colors.green)
      log(`🤖 AI Response: "${content}"`, colors.green)

      return {
        success: true,
        message: 'OpenRouter API is working and credits are available',
        response: data,
      }
    } else {
      log(`❌ OpenRouter API test failed: ${response.status} ${response.statusText}`, colors.red)

      // Handle specific error cases
      if (response.status === 402) {
        return {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: 'OpenRouter account has insufficient credits',
          userMessage:
            'Please add credits to your OpenRouter account: https://openrouter.ai/settings/credits',
          details: data,
        }
      }

      if (response.status === 401) {
        return {
          success: false,
          error: 'INVALID_API_KEY',
          message: 'OpenRouter API key is invalid or expired',
          userMessage: 'Please check your OPENROUTER_API_KEY in the .env file',
          details: data,
        }
      }

      if (response.status === 429) {
        return {
          success: false,
          error: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          userMessage: 'Too many requests. Please wait a moment and try again.',
          details: data,
        }
      }

      if (response.status === 400) {
        return {
          success: false,
          error: 'BAD_REQUEST',
          message: 'Invalid request format',
          userMessage: 'The request format is invalid. This might be a configuration issue.',
          details: data,
        }
      }

      return {
        success: false,
        error: 'API_ERROR',
        message: `OpenRouter API returned ${response.status}: ${response.statusText}`,
        userMessage: 'An unexpected API error occurred.',
        details: data,
      }
    }
  } catch (error) {
    log(`❌ Network error: ${error.message}`, colors.red)

    if (error.code === 'ENOTFOUND' || error.message.includes('fetch failed')) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Cannot reach OpenRouter API',
        userMessage: 'Check your internet connection and firewall settings.',
      }
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred while testing the API.',
    }
  }
}

/**
 * Test with different models to see if it's model-specific
 */
async function testDifferentModels() {
  log('🔄 Testing different models...', colors.cyan)

  const models = [
    'anthropic/claude-sonnet-4',
    'google/gemini-2.5-pro',
    'anthropic/claude-3.5-sonnet',
  ]

  const results = {}

  for (const model of models) {
    log(`🧪 Testing model: ${model}`, colors.blue)

    try {
      const response = await fetch(
        `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://localhost:3001',
            'X-Title': 'Novel Movie Model Test',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 5,
            temperature: 0.1,
          }),
        },
      )

      const data = await response.json()
      results[model] = {
        status: response.status,
        success: response.ok,
        error: response.ok ? null : data.error?.message || 'Unknown error',
      }

      if (response.ok) {
        log(`  ✅ ${model}: Working`, colors.green)
      } else {
        log(`  ❌ ${model}: ${response.status} - ${data.error?.message || 'Error'}`, colors.red)
      }
    } catch (error) {
      results[model] = {
        status: 'ERROR',
        success: false,
        error: error.message,
      }
      log(`  ❌ ${model}: ${error.message}`, colors.red)
    }
  }

  return results
}

/**
 * Main test runner
 */
async function runDirectCreditCheck() {
  log('🔬 Starting Direct OpenRouter Credit Check\n', colors.bright)

  const results = {
    environment: await testEnvironmentVariables(),
    directAPI: null,
    modelTests: null,
  }

  if (results.environment.success) {
    results.directAPI = await testOpenRouterDirect()
    results.modelTests = await testDifferentModels()
  } else {
    log('Skipping API tests due to environment issues', colors.yellow)
  }

  // Print summary
  log('\n📊 Direct OpenRouter Test Summary:', colors.bright)
  log('==================================', colors.bright)

  if (results.environment.success) {
    log('✅ Environment: OK', colors.green)
  } else {
    log(`❌ Environment: ${results.environment.error}`, colors.red)
  }

  if (results.directAPI) {
    if (results.directAPI.success) {
      log('✅ OpenRouter API: Working', colors.green)
      log('✅ Credits: Available', colors.green)
    } else {
      log(`❌ OpenRouter API: ${results.directAPI.error}`, colors.red)
      if (results.directAPI.userMessage) {
        log(`   ${results.directAPI.userMessage}`, colors.yellow)
      }
    }
  }

  // Overall status
  const overallSuccess = results.environment.success && results.directAPI?.success

  log('\n🎯 Overall Status:', colors.bright)
  if (overallSuccess) {
    log('✅ CREDITS AVAILABLE - OpenRouter API is working!', colors.green)
    return 0
  } else {
    log('❌ CREDITS NOT AVAILABLE - OpenRouter API issues detected', colors.red)
    return 1
  }
}

// Run the test if this script is executed directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMainModule) {
  runDirectCreditCheck()
    .then((exitCode) => {
      process.exit(exitCode)
    })
    .catch((error) => {
      log(`\n💥 Unexpected error: ${error.message}`, colors.red)
      console.error(error)
      process.exit(1)
    })
}

export { runDirectCreditCheck }
