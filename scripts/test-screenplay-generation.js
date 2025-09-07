#!/usr/bin/env node

/**
 * Comprehensive Screenplay Generation Testing Suite
 * Tests all external services step-by-step for screenplay generation
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

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

function logStep(step, message) {
  log(`\n🔸 Step ${step}: ${message}`, colors.cyan)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

/**
 * Phase 1: Service Health Verification
 */
async function testServiceHealth() {
  log('\n🚀 Phase 1: Service Health Verification', colors.magenta)
  log('=' * 50, colors.white)

  const services = [
    {
      name: 'Novel Movie API',
      url: `${process.env.SITE_URL || 'http://localhost:3001'}/api/health`,
      required: true,
    },
    {
      name: 'CrewAI Server',
      url: `${process.env.CREW_AI || 'http://localhost:5001'}/health`,
      required: true,
    },
    {
      name: 'PathRAG Service',
      url: `${process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'}/health`,
      required: true,
    },
    {
      name: 'DINOv3 Service',
      url: `${process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'}/health`,
      required: false,
    },
    { name: 'Redis', url: process.env.REDIS_URL || 'redis://localhost:6379', required: true },
  ]

  const results = []

  for (const service of services) {
    logStep('1.1', `Testing ${service.name}`)

    try {
      if (service.name === 'Redis') {
        // Test Redis connection
        const redis = require('redis')
        const client = redis.createClient({ url: service.url })
        await client.connect()
        await client.ping()
        await client.disconnect()
        logSuccess(`${service.name} is accessible`)
        results.push({ service: service.name, status: 'healthy' })
      } else {
        // Test HTTP services
        const response = await fetch(service.url, {
          method: 'GET',
          timeout: 10000,
        })

        if (response.ok) {
          logSuccess(`${service.name} is healthy`)
          results.push({ service: service.name, status: 'healthy' })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      }
    } catch (error) {
      if (service.required) {
        logError(`${service.name} is not accessible: ${error.message}`)
        results.push({ service: service.name, status: 'error', error: error.message })
      } else {
        logWarning(`${service.name} is not accessible (optional): ${error.message}`)
        results.push({ service: service.name, status: 'warning', error: error.message })
      }
    }
  }

  return results
}

/**
 * Phase 2: Configure Digital Asset Detection
 */
async function configureDigitalAssetDetection() {
  log('\n🔧 Phase 2: Configure Digital Asset Detection', colors.magenta)
  log('=' * 50, colors.white)

  logStep('2.1', 'Configuring DINOv3 for character detection only')

  try {
    // Configure DINOv3 to use only character detection
    const dinoConfig = {
      enabled_services: ['character_detection'],
      disabled_services: [
        'object_detection',
        'scene_analysis',
        'quality_analysis',
        'similarity_matching',
        'video_shot_analysis',
      ],
      character_detection: {
        enabled: true,
        confidence_threshold: 0.7,
        max_detections: 10,
      },
    }

    // Apply configuration to DINOv3 service
    const response = await fetch('http://movie.ft.tc:5000/api/v1/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dinoConfig),
    })

    if (response.ok) {
      logSuccess('DINOv3 configured for character detection only')
      return { success: true, config: dinoConfig }
    } else {
      throw new Error(`Configuration failed: HTTP ${response.status}`)
    }
  } catch (error) {
    logWarning(`DINOv3 configuration failed: ${error.message}`)
    logWarning('Proceeding without DINOv3 configuration')
    return { success: false, error: error.message }
  }
}

/**
 * Phase 3: Test Individual Services
 */
async function testIndividualServices() {
  log('\n🧪 Phase 3: Individual Service Testing', colors.magenta)
  log('=' * 50, colors.white)

  const testResults = {}

  // Test 3.1: BAML Service
  logStep('3.1', 'Testing BAML AI Generation')
  try {
    const bamlTest = await fetch('http://localhost:3001/api/test/baml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Generate a simple test story premise',
        function: 'GenerateCorePremise',
      }),
    })

    if (bamlTest.ok) {
      const result = await bamlTest.json()
      logSuccess('BAML service is working')
      testResults.baml = { status: 'success', result }
    } else {
      throw new Error(`HTTP ${bamlTest.status}`)
    }
  } catch (error) {
    logError(`BAML test failed: ${error.message}`)
    testResults.baml = { status: 'error', error: error.message }
  }

  // Test 3.2: OpenRouter API
  logStep('3.2', 'Testing OpenRouter API')
  try {
    const openRouterTest = await fetch('http://localhost:3001/api/test/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Say "OpenRouter test successful"',
        model: 'anthropic/claude-sonnet-4',
      }),
    })

    if (openRouterTest.ok) {
      const result = await openRouterTest.json()
      logSuccess('OpenRouter API is working')
      testResults.openrouter = { status: 'success', result }
    } else {
      throw new Error(`HTTP ${openRouterTest.status}`)
    }
  } catch (error) {
    logError(`OpenRouter test failed: ${error.message}`)
    testResults.openrouter = { status: 'error', error: error.message }
  }

  // Test 3.3: PathRAG Service
  logStep('3.3', 'Testing PathRAG Service')
  try {
    const pathragTest = await fetch('http://movie.ft.tc:5000/api/v1/health', {
      method: 'GET',
    })

    if (pathragTest.ok) {
      logSuccess('PathRAG service is accessible')
      testResults.pathrag = { status: 'success' }
    } else {
      throw new Error(`HTTP ${pathragTest.status}`)
    }
  } catch (error) {
    logError(`PathRAG test failed: ${error.message}`)
    testResults.pathrag = { status: 'error', error: error.message }
  }

  // Test 3.4: CrewAI Server
  logStep('3.4', 'Testing CrewAI Server')
  try {
    const crewaiTest = await fetch('http://localhost:5001/health', {
      method: 'GET',
    })

    if (crewaiTest.ok) {
      logSuccess('CrewAI server is accessible')
      testResults.crewai = { status: 'success' }
    } else {
      throw new Error(`HTTP ${crewaiTest.status}`)
    }
  } catch (error) {
    logError(`CrewAI test failed: ${error.message}`)
    testResults.crewai = { status: 'error', error: error.message }
  }

  // Test 3.5: Character Detection (DINOv3)
  logStep('3.5', 'Testing Character Detection')
  try {
    // This would require uploading a test image and running character detection
    logWarning('Character detection test requires manual image upload - skipping for now')
    testResults.character_detection = { status: 'skipped', reason: 'Manual test required' }
  } catch (error) {
    logError(`Character detection test failed: ${error.message}`)
    testResults.character_detection = { status: 'error', error: error.message }
  }

  return testResults
}

/**
 * Phase 4: Test Screenplay Generation Workflow
 */
async function testScreenplayWorkflow(projectId) {
  log('\n📝 Phase 4: Screenplay Generation Workflow', colors.magenta)
  log('=' * 50, colors.white)

  const workflowResults = {}

  // Test 4.1: Story Generation
  logStep('4.1', 'Testing Story Generation')
  try {
    const storyResponse = await fetch('http://localhost:3001/api/stories/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })

    if (storyResponse.ok) {
      const story = await storyResponse.json()
      logSuccess('Story generation completed')
      workflowResults.story_generation = { status: 'success', story }
    } else {
      throw new Error(`HTTP ${storyResponse.status}`)
    }
  } catch (error) {
    logError(`Story generation failed: ${error.message}`)
    workflowResults.story_generation = { status: 'error', error: error.message }
  }

  // Test 4.2: Architect Crew Execution
  logStep('4.2', 'Testing Architect Crew')
  try {
    const architectResponse = await fetch('http://localhost:5001/crews/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crew_type: 'architect',
        project_id: projectId,
        user_id: 'test-user',
        input_data: {
          story_text: 'Test story for architect crew',
          preferences: { style: 'cinematic' },
        },
        config: { temperature: 0.7, verbose: true },
      }),
    })

    if (architectResponse.ok) {
      const result = await architectResponse.json()
      logSuccess(`Architect crew queued: ${result.job_id}`)
      workflowResults.architect_crew = { status: 'success', job_id: result.job_id }
    } else {
      throw new Error(`HTTP ${architectResponse.status}`)
    }
  } catch (error) {
    logError(`Architect crew failed: ${error.message}`)
    workflowResults.architect_crew = { status: 'error', error: error.message }
  }

  // Test 4.3: Director Crew Execution
  logStep('4.3', 'Testing Director Crew')
  try {
    const directorResponse = await fetch('http://localhost:5001/crews/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crew_type: 'director',
        project_id: projectId,
        user_id: 'test-user',
        input_data: {
          story_text: 'Test story for director crew',
          preferences: { style: 'cinematic' },
        },
        config: { temperature: 0.7, verbose: true },
      }),
    })

    if (directorResponse.ok) {
      const result = await directorResponse.json()
      logSuccess(`Director crew queued: ${result.job_id}`)
      workflowResults.director_crew = { status: 'success', job_id: result.job_id }
    } else {
      throw new Error(`HTTP ${directorResponse.status}`)
    }
  } catch (error) {
    logError(`Director crew failed: ${error.message}`)
    workflowResults.director_crew = { status: 'error', error: error.message }
  }

  return workflowResults
}

/**
 * Main test runner
 */
async function runScreenplayTests() {
  log('🎬 Starting Screenplay Generation Testing Suite', colors.magenta)
  log(`📅 ${new Date().toISOString()}`, colors.white)

  try {
    // Phase 1: Service Health
    const healthResults = await testServiceHealth()

    // Phase 2: Configure Digital Assets
    const configResults = await configureDigitalAssetDetection()

    // Phase 3: Individual Services
    const serviceResults = await testIndividualServices()

    // Phase 4: Workflow Testing (requires existing project)
    const projectId = process.argv[2] || 'test-project-id'
    const workflowResults = await testScreenplayWorkflow(projectId)

    // Generate final report
    log('\n📊 Final Test Report', colors.magenta)
    log('=' * 50, colors.white)

    console.log(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          health_check: healthResults,
          digital_asset_config: configResults,
          service_tests: serviceResults,
          workflow_tests: workflowResults,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    logError(`Test suite failed: ${error.message}`)
    process.exit(1)
  }
}

// Run the test suite
if (require.main === module) {
  runScreenplayTests().catch(console.error)
}

module.exports = {
  testServiceHealth,
  configureDigitalAssetDetection,
  testIndividualServices,
  testScreenplayWorkflow,
}
