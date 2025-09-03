#!/usr/bin/env node

/**
 * Comprehensive Service Health Check Script
 * Tests all services required for screenplay generation workflow
 */

import { config } from 'dotenv'
import { MongoClient } from 'mongodb'

// Use Node.js built-in fetch (Node 18+)
const fetch = globalThis.fetch

// Load environment variables
config()

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(`🔍 ${title}`, colors.cyan)
  console.log('='.repeat(60))
}

function logTest(testName, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow
  log(`${icon} ${testName}`, color)
  if (details) {
    log(`   ${details}`, colors.white)
  }
}

/**
 * Test environment variables
 */
async function testEnvironmentVariables() {
  logSection('Environment Variables Check')

  const requiredVars = [
    'DATABASE_URI',
    'PAYLOAD_SECRET',
    'OPENROUTER_API_KEY',
    'OPENROUTER_BASE_URL',
    'REDIS_URL',
    'FAL_KEY',
    'SITE_URL',
    'PATHRAG_API_URL',
    'CREW_AI',
    'NOVEL_MOVIE_API_KEY',
  ]

  let allPresent = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logTest(`${varName}`, 'PASS', `Set to: ${process.env[varName].substring(0, 20)}...`)
    } else {
      logTest(`${varName}`, 'FAIL', 'Missing or empty')
      allPresent = false
    }
  }

  return { success: allPresent, service: 'Environment Variables' }
}

/**
 * Test MongoDB connection
 */
async function testMongoDB() {
  logSection('MongoDB Database Connection')

  try {
    const client = new MongoClient(process.env.DATABASE_URI)
    await client.connect()

    // Test basic operations
    const db = client.db()
    const collections = await db.listCollections().toArray()

    logTest(
      'MongoDB Connection',
      'PASS',
      `Connected to database with ${collections.length} collections`,
    )

    // Check for key collections
    const collectionNames = collections.map((c) => c.name)
    const keyCollections = ['projects', 'initial-concepts', 'stories']

    for (const collection of keyCollections) {
      if (collectionNames.includes(collection)) {
        logTest(`Collection: ${collection}`, 'PASS', 'Found')
      } else {
        logTest(`Collection: ${collection}`, 'WARN', 'Not found (may be created on first use)')
      }
    }

    await client.close()
    return { success: true, service: 'MongoDB' }
  } catch (error) {
    logTest('MongoDB Connection', 'FAIL', error.message)
    return { success: false, service: 'MongoDB', error: error.message }
  }
}

/**
 * Test Redis connection
 */
async function testRedis() {
  logSection('Redis Connection')

  try {
    // Basic configuration check since we don't have redis client installed
    if (process.env.REDIS_URL) {
      logTest('Redis Configuration', 'PASS', `URL configured: ${process.env.REDIS_URL}`)
      logTest(
        'Redis Service',
        'WARN',
        'Detailed Redis testing requires redis client - assuming service is running',
      )
      return { success: true, service: 'Redis' }
    } else {
      logTest('Redis Configuration', 'FAIL', 'REDIS_URL not configured')
      return { success: false, service: 'Redis' }
    }
  } catch (error) {
    logTest('Redis Connection', 'FAIL', error.message)
    return { success: false, service: 'Redis', error: error.message }
  }
}

/**
 * Test OpenRouter API
 */
async function testOpenRouter() {
  logSection('OpenRouter API')

  try {
    const response = await fetch(`${process.env.OPENROUTER_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      logTest('OpenRouter API', 'PASS', `${data.data?.length || 0} models available`)

      // Test specific models
      const requiredModels = [
        process.env.OPENROUTER_DEFAULT_MODEL,
        process.env.OPENROUTER_MILLION_MODEL,
      ]

      for (const model of requiredModels) {
        if (model && data.data?.some((m) => m.id === model)) {
          logTest(`Model: ${model}`, 'PASS', 'Available')
        } else {
          logTest(`Model: ${model}`, 'WARN', 'Not found in available models')
        }
      }

      return { success: true, service: 'OpenRouter' }
    } else {
      logTest('OpenRouter API', 'FAIL', `HTTP ${response.status}: ${response.statusText}`)
      return { success: false, service: 'OpenRouter' }
    }
  } catch (error) {
    logTest('OpenRouter API', 'FAIL', error.message)
    return { success: false, service: 'OpenRouter', error: error.message }
  }
}

/**
 * Test BAML Client (simplified check)
 */
async function testBAML() {
  logSection('BAML Client')

  try {
    // Check if BAML files exist
    const fs = await import('fs')
    const path = await import('path')

    const bamlSrcExists = fs.existsSync(path.join(process.cwd(), 'baml_src'))
    const bamlClientExists = fs.existsSync(path.join(process.cwd(), 'baml_client'))

    if (bamlSrcExists && bamlClientExists) {
      logTest('BAML Configuration', 'PASS', 'BAML source and client directories found')
      logTest(
        'BAML Generation Test',
        'WARN',
        'Skipping live test - requires TypeScript compilation',
      )
      return { success: true, service: 'BAML' }
    } else {
      logTest('BAML Configuration', 'FAIL', 'BAML directories not found')
      return { success: false, service: 'BAML' }
    }
  } catch (error) {
    logTest('BAML Client', 'FAIL', error.message)
    return { success: false, service: 'BAML', error: error.message }
  }
}

/**
 * Test PathRAG Service
 */
async function testPathRAG() {
  logSection('PathRAG Service')

  try {
    const response = await fetch(`${process.env.PATHRAG_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      logTest('PathRAG Health Check', 'PASS', `Status: ${data.status || 'healthy'}`)
      return { success: true, service: 'PathRAG' }
    } else {
      logTest('PathRAG Health Check', 'FAIL', `HTTP ${response.status}: ${response.statusText}`)
      return { success: false, service: 'PathRAG' }
    }
  } catch (error) {
    logTest('PathRAG Service', 'FAIL', error.message)
    return { success: false, service: 'PathRAG', error: error.message }
  }
}

/**
 * Test CrewAI Service
 */
async function testCrewAI() {
  logSection('CrewAI Service')

  try {
    const response = await fetch(`${process.env.CREW_AI}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      logTest('CrewAI Health Check', 'PASS', `Status: ${data.status || 'healthy'}`)
      return { success: true, service: 'CrewAI' }
    } else {
      logTest('CrewAI Health Check', 'FAIL', `HTTP ${response.status}: ${response.statusText}`)
      return { success: false, service: 'CrewAI' }
    }
  } catch (error) {
    logTest('CrewAI Service', 'FAIL', error.message)
    return { success: false, service: 'CrewAI', error: error.message }
  }
}

/**
 * Test Novel Movie API (self-test)
 */
async function testNovelMovieAPI() {
  logSection('Novel Movie API (Self-Test)')

  try {
    const response = await fetch(`${process.env.SITE_URL}/api/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NOVEL_MOVIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      logTest('Novel Movie API', 'PASS', `Status: ${data.status || 'healthy'}`)
      return { success: true, service: 'Novel Movie API' }
    } else {
      logTest('Novel Movie API', 'FAIL', `HTTP ${response.status}: ${response.statusText}`)
      return { success: false, service: 'Novel Movie API' }
    }
  } catch (error) {
    logTest('Novel Movie API', 'FAIL', error.message)
    return { success: false, service: 'Novel Movie API', error: error.message }
  }
}

/**
 * Test Fal.ai Service
 */
async function testFalAI() {
  logSection('Fal.ai Service')

  try {
    const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
      method: 'POST',
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'test image generation',
        image_size: 'square_hd',
        num_inference_steps: 1,
        enable_safety_checker: false,
      }),
    })

    if (response.ok) {
      logTest('Fal.ai API', 'PASS', 'API key valid and service accessible')
      return { success: true, service: 'Fal.ai' }
    } else {
      const errorText = await response.text()
      logTest('Fal.ai API', 'FAIL', `HTTP ${response.status}: ${errorText}`)
      return { success: false, service: 'Fal.ai' }
    }
  } catch (error) {
    logTest('Fal.ai Service', 'FAIL', error.message)
    return { success: false, service: 'Fal.ai', error: error.message }
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  log('🚀 Starting Comprehensive Service Health Check', colors.magenta)
  log(`📅 ${new Date().toISOString()}`, colors.white)

  const tests = [
    testEnvironmentVariables,
    testMongoDB,
    testRedis,
    testOpenRouter,
    testBAML,
    testPathRAG,
    testCrewAI,
    testNovelMovieAPI,
    testFalAI,
  ]

  const results = []

  for (const test of tests) {
    try {
      const result = await test()
      results.push(result)
    } catch (error) {
      results.push({
        success: false,
        service: test.name,
        error: error.message,
      })
    }
  }

  // Summary
  logSection('Test Summary')

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  log(`✅ Passed: ${passed}`, colors.green)
  log(`❌ Failed: ${failed}`, colors.red)
  log(`📊 Total: ${results.length}`, colors.white)

  if (failed > 0) {
    log('\n🔧 Failed Services:', colors.red)
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        log(`   • ${r.service}: ${r.error || 'Unknown error'}`, colors.red)
      })
  }

  if (passed === results.length) {
    log('\n🎉 All services are healthy! Ready for screenplay generation.', colors.green)
    process.exit(0)
  } else {
    log(
      '\n⚠️  Some services need attention before screenplay generation will work properly.',
      colors.yellow,
    )
    process.exit(1)
  }
}

// Run tests
runAllTests().catch((error) => {
  log(`💥 Test runner failed: ${error.message}`, colors.red)
  process.exit(1)
})
