#!/usr/bin/env node

/**
 * Quality Score Test Script
 *
 * This script tests the Quality Score functionality end-to-end to identify and fix errors.
 * It simulates the complete flow from form data validation to BAML function execution.
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

// Test configuration
const TEST_CONFIG = {
  projectId: '68ac4bc92381660fefe1e54d', // From the URL you provided
  apiUrl: process.env.SITE_URL || 'http://localhost:3001',
  verbose: true,
}

// Test data that matches the current project structure
const MOCK_FORM_DATA = {
  primaryGenres: ['action', 'drama'],
  corePremise:
    'A compelling story of martial arts mastery that explores the depths of human nature and the choices that define us.',
  targetAudience: {
    demographics: ['young-adults', 'adults'],
    psychographics:
      'Action-oriented viewers who appreciate character-driven narratives and high-stakes drama',
    customDescription:
      'Fans of martial arts films and underdog stories who appreciate authentic cultural representation',
  },
  toneAndMood: {
    tones: ['intense', 'dramatic'],
    moods: ['suspenseful', 'emotional'],
    emotionalArc: 'From desperation to triumph through perseverance and self-discovery',
  },
  visualStyle: {
    cinematographyStyle: 'dynamic-handheld',
    colorPalette: {
      dominance: 'warm',
      saturation: 'high',
      symbolicColors: 'Red for passion, gold for victory, deep blues for introspection',
    },
    lightingPreferences: 'High contrast with dramatic shadows and selective illumination',
    cameraMovement: 'Fluid tracking shots during action sequences with handheld intimacy',
  },
  references: {
    inspirationalMovies: [
      {
        title: 'Rocky',
        year: 1976,
        specificElements: 'Training montages and underdog story',
      },
      {
        title: 'The Karate Kid',
        year: 1984,
        specificElements: 'Mentor-student relationship',
      },
    ],
    visualReferences: 'Gritty urban environments with neon lighting and atmospheric haze',
    narrativeReferences:
      "Classic hero's journey with martial arts elements and character transformation",
  },
  themes: {
    centralThemes: ['perseverance', 'self-discovery'],
    moralQuestions: 'What price are we willing to pay for our dreams and ambitions?',
    messageTakeaway: 'True strength comes from within and the courage to never give up',
  },
}

const MOCK_PROJECT_DATA = {
  name: 'Martial Arts Mastery',
  movieFormat: 'feature-film',
  movieStyle: 'action-drama',
  durationUnit: 120,
  series: null,
}

// Utility functions
function log(message, ...args) {
  if (TEST_CONFIG.verbose) {
    console.log(`[TEST] ${message}`, ...args)
  }
}

function error(message, ...args) {
  console.error(`[ERROR] ${message}`, ...args)
}

function success(message, ...args) {
  console.log(`[SUCCESS] ${message}`, ...args)
}

// Test functions
async function testFormDataValidation() {
  log('Testing form data validation...')

  try {
    // Import the validation schema
    const { z } = await import('zod')

    // Recreate the validation schema from the API route
    const QualityScoreRequestSchema = z.object({
      projectName: z.string().min(1, 'Project name is required'),
      movieFormat: z.string().min(1, 'Movie format is required'),
      movieStyle: z.string().min(1, 'Movie style is required'),
      durationUnit: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseInt(val) : val)),
      series: z.string().optional().nullable(),
      formData: z.object({
        primaryGenres: z.array(z.string()).min(1, 'At least one genre is required'),
        corePremise: z.string().min(1, 'Core premise is required'),
        targetAudience: z.object({
          demographics: z.array(z.string()).min(1, 'At least one demographic is required'),
          psychographics: z.string().min(1, 'Psychographics is required'),
          customDescription: z.string().optional().default(''),
        }),
        toneAndMood: z.object({
          tones: z.array(z.string()).min(1, 'At least one tone is required'),
          moods: z.array(z.string()).min(1, 'At least one mood is required'),
          emotionalArc: z.string().min(1, 'Emotional arc is required'),
        }),
        visualStyle: z.object({
          cinematographyStyle: z.string().min(1, 'Cinematography style is required'),
          colorPalette: z.object({
            dominance: z.string().min(1, 'Color dominance is required'),
            saturation: z.string().min(1, 'Color saturation is required'),
            symbolicColors: z.string().min(1, 'Symbolic colors is required'),
          }),
          lightingPreferences: z.string().min(1, 'Lighting preferences is required'),
          cameraMovement: z.string().min(1, 'Camera movement is required'),
        }),
        references: z.object({
          inspirationalMovies: z
            .array(
              z.object({
                title: z.string(),
                year: z.number().nullable(),
                specificElements: z.string(),
              }),
            )
            .min(1, 'At least one inspirational movie is required'),
          visualReferences: z.string().min(1, 'Visual references is required'),
          narrativeReferences: z.string().min(1, 'Narrative references is required'),
        }),
        themes: z.object({
          centralThemes: z.array(z.string()).min(1, 'At least one central theme is required'),
          moralQuestions: z.string().min(1, 'Moral questions is required'),
          messageTakeaway: z.string().min(1, 'Message takeaway is required'),
        }),
      }),
    })

    const testPayload = {
      projectName: MOCK_PROJECT_DATA.name,
      movieFormat: MOCK_PROJECT_DATA.movieFormat,
      movieStyle: MOCK_PROJECT_DATA.movieStyle,
      durationUnit: MOCK_PROJECT_DATA.durationUnit,
      series: MOCK_PROJECT_DATA.series,
      formData: MOCK_FORM_DATA,
    }

    const validatedData = QualityScoreRequestSchema.parse(testPayload)
    success('Form data validation passed')
    return { success: true, data: validatedData }
  } catch (err) {
    error('Form data validation failed:', err.errors || err.message)
    return { success: false, error: err }
  }
}

async function testBAMLClientInitialization() {
  log('Testing BAML client initialization...')

  try {
    // Test if BAML client can be initialized (will fail if native bindings missing)
    const response = await fetch(`${TEST_CONFIG.apiUrl}/v1/initial-concepts/quality-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: 'Test Project',
        movieFormat: 'feature-film',
        movieStyle: 'drama',
        durationUnit: 90,
        series: null,
        formData: {
          primaryGenres: ['drama'],
          corePremise: 'Test premise',
          targetAudience: {
            demographics: ['adults'],
            psychographics: 'Test audience',
            customDescription: '',
          },
          toneAndMood: {
            tones: ['dramatic'],
            moods: ['emotional'],
            emotionalArc: 'Test arc',
          },
          visualStyle: {
            cinematographyStyle: 'traditional',
            colorPalette: {
              dominance: 'neutral',
              saturation: 'medium',
              symbolicColors: 'Test colors',
            },
            lightingPreferences: 'Test lighting',
            cameraMovement: 'Test movement',
          },
          references: {
            inspirationalMovies: [
              {
                title: 'Test Movie',
                year: 2020,
                specificElements: 'Test elements',
              },
            ],
            visualReferences: 'Test visual',
            narrativeReferences: 'Test narrative',
          },
          themes: {
            centralThemes: ['test'],
            moralQuestions: 'Test question',
            messageTakeaway: 'Test message',
          },
        },
      }),
    })

    if (response.ok) {
      success('BAML client initialization successful')
      return { success: true }
    } else {
      const errorData = await response.json()
      error('BAML client initialization failed:', errorData.error)
      return { success: false, error: errorData.error }
    }
  } catch (err) {
    error('BAML client test failed:', err.message)
    return { success: false, error: err }
  }
}

async function testQualityScoreAPI() {
  log('Testing Quality Score API endpoint...')

  try {
    const payload = {
      projectName: MOCK_PROJECT_DATA.name,
      movieFormat: MOCK_PROJECT_DATA.movieFormat,
      movieStyle: MOCK_PROJECT_DATA.movieStyle,
      durationUnit: MOCK_PROJECT_DATA.durationUnit,
      series: MOCK_PROJECT_DATA.series,
      formData: MOCK_FORM_DATA,
    }

    const response = await fetch(`${TEST_CONFIG.apiUrl}/v1/initial-concepts/quality-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      success('Quality Score API call successful')
      log('Quality Score:', result.data.qualityScore)
      log('Recommendations:', result.data.recommendations)
      return { success: true, data: result.data }
    } else {
      error('Quality Score API call failed:', result.error || 'Unknown error')
      if (result.details) {
        error('Validation details:', result.details)
      }
      return { success: false, error: result }
    }
  } catch (err) {
    error('Quality Score API request failed:', err.message)
    if (err.cause) {
      error('Cause:', err.cause.message)
    }
    if (err.code === 'ECONNREFUSED') {
      error(
        'Connection refused - make sure the development server is running on',
        TEST_CONFIG.apiUrl,
      )
    }
    return { success: false, error: err }
  }
}

async function testFormCompletionValidation() {
  log('Testing form completion validation (manual check)...')

  try {
    // Manual validation based on the form structure
    const requiredFields = [
      'primaryGenres',
      'corePremise',
      'targetAudience.demographics',
      'targetAudience.psychographics',
      'toneAndMood.tones',
      'toneAndMood.moods',
      'toneAndMood.emotionalArc',
      'visualStyle.cinematographyStyle',
      'visualStyle.colorPalette.dominance',
      'visualStyle.colorPalette.saturation',
      'visualStyle.colorPalette.symbolicColors',
      'visualStyle.lightingPreferences',
      'visualStyle.cameraMovement',
      'references.inspirationalMovies',
      'references.visualReferences',
      'references.narrativeReferences',
      'themes.centralThemes',
      'themes.moralQuestions',
      'themes.messageTakeaway',
    ]

    const missingFields = []

    for (const field of requiredFields) {
      const keys = field.split('.')
      let current = MOCK_FORM_DATA

      for (const key of keys) {
        if (current === null || current === undefined) {
          missingFields.push(field)
          break
        }
        current = current[key]
      }

      if (Array.isArray(current) && current.length === 0) {
        missingFields.push(field)
      } else if (typeof current === 'string' && current.trim().length === 0) {
        missingFields.push(field)
      } else if (!current) {
        missingFields.push(field)
      }
    }

    if (missingFields.length === 0) {
      success('Form completion validation passed')
      return { success: true }
    } else {
      error('Form completion validation failed. Missing fields:', missingFields)
      return { success: false, missingFields }
    }
  } catch (err) {
    error('Form completion validation test failed:', err.message)
    return { success: false, error: err }
  }
}

async function testEnvironmentVariables() {
  log('Testing environment variables...')

  const requiredEnvVars = [
    'OPENROUTER_BASE_URL',
    'OPENROUTER_API_KEY',
    'DATABASE_URI',
    'PAYLOAD_SECRET',
  ]

  const missing = []
  const present = []

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      present.push(envVar)
    } else {
      missing.push(envVar)
    }
  }

  if (missing.length === 0) {
    success('All required environment variables are present')
    return { success: true, present }
  } else {
    error('Missing environment variables:', missing)
    return { success: false, missing, present }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Quality Score Test Suite\n')

  const results = {
    environment: await testEnvironmentVariables(),
    formValidation: await testFormDataValidation(),
    formCompletion: await testFormCompletionValidation(),
    bamlClient: await testBAMLClientInitialization(),
    apiEndpoint: null, // Will be set conditionally
  }

  // Only test API if BAML client works
  if (results.bamlClient.success) {
    results.apiEndpoint = await testQualityScoreAPI()
  } else {
    log('Skipping API test due to BAML client failure')
    results.apiEndpoint = { success: false, error: 'BAML client not available' }
  }

  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('========================')

  Object.entries(results).forEach(([testName, result]) => {
    if (result) {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${testName}`)
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error.message || JSON.stringify(result.error)}`)
      }
    }
  })

  const allPassed = Object.values(results).every((result) => !result || result.success)

  if (allPassed) {
    console.log('\n🎉 All tests passed! Quality Score functionality is working correctly.')
  } else {
    console.log('\n🔧 Some tests failed. Check the errors above for debugging information.')
  }

  return results
}

// Always run tests for now
console.log('🧪 Quality Score Test Script Starting...')
runAllTests()
  .then((results) => {
    // Provide specific recommendations based on test results
    console.log('\n🔧 Recommendations:')
    console.log('==================')

    if (!results.bamlClient?.success || !results.apiEndpoint?.success) {
      console.log('❌ Quality Score functionality is failing')
      console.log('   This appears to be a BAML native binding issue on Windows.')
      console.log('   The BAML library cannot find the Windows-specific native modules.')
      console.log('')
      console.log('🛠️  Required fixes:')
      console.log('   1. Reinstall BAML with platform-specific binaries:')
      console.log('      pnpm remove @boundaryml/baml')
      console.log('      pnpm add @boundaryml/baml')
      console.log('')
      console.log('   2. Try clearing node_modules and reinstalling:')
      console.log('      rm -rf node_modules pnpm-lock.yaml')
      console.log('      pnpm install')
      console.log('')
      console.log('   3. Check if BAML supports your Windows architecture')
      console.log('   4. Consider using WSL2 for better BAML compatibility')
      console.log('')
      console.log('   5. Verify OpenRouter API key and credits are available')
    }

    if (results.environment?.success && results.formValidation?.success) {
      console.log('✅ Environment and validation are working correctly')
    }
  })
  .catch(console.error)

export { runAllTests, testFormDataValidation, testBAMLClientInitialization, testQualityScoreAPI }
