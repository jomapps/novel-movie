#!/usr/bin/env node

/**
 * Standalone BAML Test - Independent from the main application
 * This test verifies that BAML client can be loaded and used successfully
 */

// Load environment variables
import { config } from 'dotenv'
config()

console.log('🧪 Starting Standalone BAML Test\n')

async function testBAMLClientImport() {
  console.log('1️⃣ Testing BAML Client Import...')

  try {
    // Test direct import from baml_client (TypeScript files)
    const { b } = await import('./baml_client/index.ts')
    console.log('✅ BAML client imported successfully')
    console.log('📋 Available functions:', Object.keys(b))
    return { success: true, client: b }
  } catch (error) {
    console.error('❌ BAML client import failed:', error.message)
    console.error('🔍 Full error:', error)
    return { success: false, error: error.message }
  }
}

async function testSimpleBAMLFunction(client) {
  console.log('\n2️⃣ Testing Simple BAML Function Call...')

  try {
    // Test a simple function that should exist in the BAML config
    if (typeof client.GenerateCorePremise === 'function') {
      console.log('🔄 Calling GenerateCorePremise function...')

      const result = await client.GenerateCorePremise(
        'Test Movie Project',
        'short-film',
        'cinematic-realism',
        null, // series
        5, // durationUnit
        ['Action', 'Drama'], // primaryGenres
        null, // existingPremise
      )

      console.log('✅ BAML function call successful!')
      console.log('📄 Result:', result)
      return { success: true, result }
    } else {
      console.log('⚠️  GenerateCorePremise function not found')
      console.log('📋 Available functions:', Object.keys(client))
      return { success: false, error: 'GenerateCorePremise function not available' }
    }
  } catch (error) {
    console.error('❌ BAML function call failed:', error.message)
    console.error('🔍 Full error:', error)
    return { success: false, error: error.message }
  }
}

async function testQualityScoreFunction(client) {
  console.log('\n3️⃣ Testing Quality Score BAML Function...')

  try {
    if (typeof client.AssessProjectQuality === 'function') {
      console.log('🔄 Calling AssessProjectQuality function...')

      const result = await client.AssessProjectQuality(
        'Test Movie Project',
        'short-film',
        'cinematic-realism',
        null, // series
        5, // durationUnit
        ['Action', 'Drama'], // primaryGenres
        'A test premise about action and drama', // corePremise
        'Adults 25-45 - Action movie fans', // targetAudience
        'Suspenseful and intense', // toneAndMood
        'Dark and gritty cinematography', // visualStyle
        'Good vs evil, redemption', // themes
        'Hero, villain, mentor', // characterArchetypes
        'Modern urban setting', // settingElements
        'Fast-paced with intense climax', // pacingElements
        'Die Hard, John Wick', // references
      )

      console.log('✅ Quality Score function call successful!')
      console.log('📊 Quality Score:', result.qualityScore)
      console.log('💡 Recommendations:', result.recommendations)
      return { success: true, result }
    } else {
      console.log('⚠️  AssessProjectQuality function not found')
      return { success: false, error: 'AssessProjectQuality function not available' }
    }
  } catch (error) {
    console.error('❌ Quality Score function call failed:', error.message)
    console.error('🔍 Full error:', error)
    return { success: false, error: error.message }
  }
}

async function testEnvironmentVariables() {
  console.log('\n4️⃣ Testing Environment Variables...')

  const requiredEnvVars = ['OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL']

  const missingVars = []
  const presentVars = []

  for (const varName of requiredEnvVars) {
    if (process.env[varName]) {
      presentVars.push(varName)
      console.log(`✅ ${varName}: Present`)
    } else {
      missingVars.push(varName)
      console.log(`❌ ${varName}: Missing`)
    }
  }

  if (missingVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`)
    return { success: false, missingVars }
  } else {
    console.log('✅ All required environment variables are present')
    return { success: true, presentVars }
  }
}

async function main() {
  console.log('🚀 BAML Standalone Test Suite')
  console.log('='.repeat(50))

  // Test 1: Environment Variables
  const envTest = await testEnvironmentVariables()

  // Test 2: BAML Client Import
  const importTest = await testBAMLClientImport()

  if (!importTest.success) {
    console.log('\n❌ Cannot proceed with function tests - BAML client import failed')
    console.log('\n📊 FINAL RESULTS:')
    console.log('='.repeat(50))
    console.log(`Environment Variables: ${envTest.success ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`BAML Client Import:    ❌ FAIL`)
    console.log(`BAML Function Calls:   ⏭️  SKIPPED`)
    return
  }

  // Test 3: Simple Function Call
  const simpleFunctionTest = await testSimpleBAMLFunction(importTest.client)

  // Test 4: Quality Score Function Call
  const qualityScoreTest = await testQualityScoreFunction(importTest.client)

  // Final Results
  console.log('\n📊 FINAL RESULTS:')
  console.log('='.repeat(50))
  console.log(`Environment Variables:     ${envTest.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`BAML Client Import:        ${importTest.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Simple Function Call:      ${simpleFunctionTest.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Quality Score Function:    ${qualityScoreTest.success ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed =
    envTest.success && importTest.success && simpleFunctionTest.success && qualityScoreTest.success

  console.log('\n🎯 OVERALL RESULT:')
  console.log('='.repeat(50))
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! BAML is working correctly.')
    console.log('✅ Both AI Auto-fill and Quality Score should now work in the app.')
  } else {
    console.log('❌ Some tests failed. BAML may not work correctly in the app.')

    if (!envTest.success) {
      console.log('🔧 Fix: Set missing environment variables in .env file')
    }
    if (!importTest.success) {
      console.log('🔧 Fix: Try reinstalling BAML or check Windows compatibility')
    }
    if (!simpleFunctionTest.success || !qualityScoreTest.success) {
      console.log('🔧 Fix: Check BAML configuration and API credentials')
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main().catch((error) => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
