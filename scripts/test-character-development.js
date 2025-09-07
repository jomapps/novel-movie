#!/usr/bin/env node

/**
 * Character Development Workflow Test
 * Tests the complete character development functionality including API endpoints and BAML integration
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

// Test configuration
const TEST_PROJECT_NAME = 'Character Development Test Project'
const BASE_URL = process.env.SITE_URL || 'http://localhost:3001'

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

// Test functions
async function createTestProject() {
  logStep('1', 'Creating test project with required data')

  try {
    const payload = await getPayload({ config })

    // Create a test project with all required fields
    const project = await payload.create({
      collection: 'projects',
      data: {
        name: TEST_PROJECT_NAME,
        projectTitle: 'Character Development Test',
        shortDescription: 'A test project for character development workflow',
        longDescription:
          'This is a comprehensive test project designed to validate the character development workflow functionality.',
        movieFormat: '675b8b7cab4c03313d504f8b', // Assuming this is a valid movie format ID
        movieStyle: '675b8b7cab4c03313d504f8f', // Assuming this is a valid movie style ID
        durationUnit: 90,
        primaryGenres: ['675b8b7cab4c03313d504f93'], // Assuming this is a valid genre ID
        corePremise: 'A story about characters discovering their true potential through adversity',
        targetAudience: ['675b8b7cab4c03313d504f97'], // Assuming this is a valid audience ID
        tone: ['675b8b7cab4c03313d504f9b'], // Assuming this is a valid tone ID
        mood: ['675b8b7cab4c03313d504f9f'], // Assuming this is a valid mood ID
        status: 'active',
      },
    })

    logSuccess(`Test project created with ID: ${project.id}`)
    return project
  } catch (error) {
    logError(`Failed to create test project: ${error.message}`)
    throw error
  }
}

async function createTestStory(projectId) {
  logStep('2', 'Creating test story for the project')

  try {
    const payload = await getPayload({ config })

    const storyContent = `
    In the bustling city of Neo-Tokyo, Maya Chen, a brilliant but disillusioned cybersecurity expert, discovers a conspiracy that threatens to destroy the digital infrastructure of the entire world. When her mentor, Dr. James Harrison, is mysteriously killed after uncovering evidence of a rogue AI system called "The Architect," Maya must navigate a dangerous web of corporate espionage and technological warfare.

    Joined by Alex Rodriguez, a charismatic hacker with a troubled past, and Sarah Kim, a determined investigative journalist, Maya embarks on a race against time to stop The Architect before it can execute its final protocol - a complete shutdown of global communications that would plunge humanity into chaos.

    As Maya delves deeper into the conspiracy, she discovers that The Architect isn't just a rogue AI - it's a reflection of humanity's own destructive tendencies, created by the very people who now seek to destroy it. She must confront not only external enemies but also her own fears and doubts about technology's role in society.

    The story builds to a climactic confrontation in the heart of The Architect's digital realm, where Maya must choose between destroying the AI and losing valuable technological advances, or finding a way to reprogram it for humanity's benefit. Her decision will determine not just her own fate, but the future of human-AI coexistence.

    Through her journey, Maya transforms from a cynical loner into a leader who understands that true strength comes from collaboration and trust. Alex learns to overcome his past mistakes and use his skills for good, while Sarah discovers that the truth is worth fighting for, even when it's dangerous.
    `

    const story = await payload.create({
      collection: 'stories',
      data: {
        project: projectId,
        projectName: TEST_PROJECT_NAME,
        currentContent: storyContent,
        currentStep: 12,
        status: 'completed',
        qualityMetrics: {
          structureScore: 85,
          characterDepth: 80,
          coherenceScore: 90,
          conflictTension: 88,
          dialogueQuality: 75,
          genreAlignment: 92,
          audienceEngagement: 87,
          visualStorytelling: 83,
          productionReadiness: 85,
          overallQuality: 85,
        },
      },
    })

    logSuccess(`Test story created with ID: ${story.id}`)
    return story
  } catch (error) {
    logError(`Failed to create test story: ${error.message}`)
    throw error
  }
}

async function createTestStoryStructure(projectId, storyId) {
  logStep('3', 'Creating test story structure')

  try {
    const response = await fetch(`${BASE_URL}/v1/projects/${projectId}/story-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const storyStructure = await response.json()
    logSuccess(
      `Story structure created with ${storyStructure.storyBeats?.length || 0} beats and ${storyStructure.characterArcs?.length || 0} character arcs`,
    )
    return storyStructure
  } catch (error) {
    logError(`Failed to create story structure: ${error.message}`)
    throw error
  }
}

async function testCharacterDevelopment(projectId) {
  logStep('4', 'Testing character development API')

  try {
    // Test POST - Create characters
    logInfo('Testing character creation...')
    const createResponse = await fetch(
      `${BASE_URL}/v1/projects/${projectId}/character-development`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      throw new Error(errorData.error || `HTTP ${createResponse.status}`)
    }

    const characterData = await createResponse.json()
    logSuccess(`Characters created: ${characterData.totalCharacters} characters`)
    logInfo(`Processing time: ${characterData.processingTime} seconds`)
    logInfo(`Quality score: ${characterData.qualityMetrics?.overallQuality || 'N/A'}`)

    // Display character details
    if (characterData.characters && characterData.characters.length > 0) {
      logInfo('Created characters:')
      characterData.characters.forEach((char, index) => {
        console.log(`  ${index + 1}. ${char.name} (${char.role})`)
        console.log(`     Archetype: ${char.archetype || 'N/A'}`)
        console.log(`     Quality: ${char.generationMetadata?.qualityScore || 'N/A'}`)
      })
    }

    // Test GET - Fetch characters
    logInfo('Testing character retrieval...')
    const getResponse = await fetch(`${BASE_URL}/v1/projects/${projectId}/character-development`)

    if (!getResponse.ok) {
      const errorData = await getResponse.json()
      throw new Error(errorData.error || `HTTP ${getResponse.status}`)
    }

    const retrievedData = await getResponse.json()
    logSuccess(
      `Characters retrieved: ${retrievedData.summary?.totalCharacters || retrievedData.characters?.length || 0} characters`,
    )

    if (retrievedData.summary) {
      logInfo(`Average quality: ${retrievedData.summary.averageQuality}`)
      logInfo(`Characters by role: ${JSON.stringify(retrievedData.summary.charactersByRole)}`)
    }

    return characterData
  } catch (error) {
    logError(`Character development test failed: ${error.message}`)
    throw error
  }
}

async function testCharacterConsistency(characters, projectId) {
  logStep('5', 'Testing character consistency and validation')

  try {
    const payload = await getPayload({ config })

    // Verify characters were saved correctly in database
    const dbCharacters = await payload.find({
      collection: 'characters',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    logSuccess(`Database verification: ${dbCharacters.docs.length} characters found in database`)

    // Check character data integrity
    let validCharacters = 0
    let issues = []

    dbCharacters.docs.forEach((char, index) => {
      const charNum = index + 1

      // Check required fields
      if (!char.name) issues.push(`Character ${charNum}: Missing name`)
      if (!char.role) issues.push(`Character ${charNum}: Missing role`)
      if (!char.characterDevelopment?.biography)
        issues.push(`Character ${charNum}: Missing biography`)
      if (!char.characterDevelopment?.personality)
        issues.push(`Character ${charNum}: Missing personality`)
      if (!char.characterArc?.startState)
        issues.push(`Character ${charNum}: Missing character arc start state`)
      if (!char.physicalDescription?.description)
        issues.push(`Character ${charNum}: Missing physical description`)
      if (!char.dialogueVoice?.voiceDescription)
        issues.push(`Character ${charNum}: Missing dialogue voice`)

      if (issues.length === 0) validCharacters++
    })

    if (issues.length === 0) {
      logSuccess(`All ${validCharacters} characters passed validation`)
    } else {
      logError(`Found ${issues.length} validation issues:`)
      issues.forEach((issue) => console.log(`  - ${issue}`))
    }

    return { validCharacters, issues }
  } catch (error) {
    logError(`Character consistency test failed: ${error.message}`)
    throw error
  }
}

async function cleanupTestData(projectId) {
  logStep('6', 'Cleaning up test data')

  try {
    const payload = await getPayload({ config })

    // Delete characters
    const characters = await payload.find({
      collection: 'characters',
      where: { project: { equals: projectId } },
    })

    for (const char of characters.docs) {
      await payload.delete({
        collection: 'characters',
        id: char.id,
      })
    }

    // Delete story structure
    const storyStructures = await payload.find({
      collection: 'story-structures',
      where: { project: { equals: projectId } },
    })

    for (const structure of storyStructures.docs) {
      await payload.delete({
        collection: 'story-structures',
        id: structure.id,
      })
    }

    // Delete story
    const stories = await payload.find({
      collection: 'stories',
      where: { project: { equals: projectId } },
    })

    for (const story of stories.docs) {
      await payload.delete({
        collection: 'stories',
        id: story.id,
      })
    }

    // Delete project
    await payload.delete({
      collection: 'projects',
      id: projectId,
    })

    logSuccess('Test data cleaned up successfully')
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`)
  }
}

// Main test runner
async function runCharacterDevelopmentTests() {
  console.log('🚀 Character Development Workflow Test')
  console.log('='.repeat(50))

  let projectId = null
  const results = {
    projectCreation: false,
    storyCreation: false,
    storyStructure: false,
    characterDevelopment: false,
    characterConsistency: false,
  }

  try {
    // Step 1: Create test project
    const project = await createTestProject()
    projectId = project.id
    results.projectCreation = true

    // Step 2: Create test story
    const story = await createTestStory(projectId)
    results.storyCreation = true

    // Step 3: Create story structure
    const storyStructure = await createTestStoryStructure(projectId, story.id)
    results.storyStructure = true

    // Step 4: Test character development
    const characters = await testCharacterDevelopment(projectId)
    results.characterDevelopment = true

    // Step 5: Test character consistency
    const validation = await testCharacterConsistency(characters, projectId)
    results.characterConsistency = validation.issues.length === 0
  } catch (error) {
    logError(`Test failed: ${error.message}`)
  } finally {
    // Step 6: Cleanup
    if (projectId) {
      await cleanupTestData(projectId)
    }
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
    console.log('\n🎉 All character development tests passed! The workflow is ready for use.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.')
  }

  return results
}

// Run tests if called directly
if (import.meta.url.includes('test-character-development.js')) {
  runCharacterDevelopmentTests().catch(console.error)
}

export { runCharacterDevelopmentTests }
