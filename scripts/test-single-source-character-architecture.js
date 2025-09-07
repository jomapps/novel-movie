#!/usr/bin/env node

/**
 * Test Script for Single-Source Character Architecture
 *
 * This script tests the new character architecture where:
 * 1. Character Library is the single source of truth
 * 2. Novel Movie stores only minimal references
 * 3. All character operations go through Character Library
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const CHARACTER_LIBRARY_URL = process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc'

async function testCharacterLibraryEndpoints() {
  console.log('🧪 Testing Character Library Endpoints...')

  // Test 1: Health Check
  try {
    const healthResponse = await fetch(`${CHARACTER_LIBRARY_URL}/health`)
    if (healthResponse.ok) {
      console.log('✅ Character Library health check passed')
    } else {
      console.log('❌ Character Library health check failed:', healthResponse.status)
      return false
    }
  } catch (error) {
    console.log('❌ Character Library is not accessible:', error.message)
    return false
  }

  // Test 2: Novel Movie Character Creation Endpoint
  try {
    const testCharacterData = {
      projectId: 'test-project-123',
      projectName: 'Test Project',
      characterData: {
        name: 'Test Character',
        biography: {
          root: {
            children: [
              {
                children: [
                  {
                    text: 'A brave warrior from the northern lands.',
                    type: 'text',
                    version: 1,
                  },
                ],
                type: 'paragraph',
                version: 1,
              },
            ],
            type: 'root',
            version: 1,
          },
        },
        personality: {
          root: {
            children: [
              {
                children: [
                  {
                    text: 'Courageous, loyal, and sometimes impulsive.',
                    type: 'text',
                    version: 1,
                  },
                ],
                type: 'paragraph',
                version: 1,
              },
            ],
            type: 'root',
            version: 1,
          },
        },
        age: 28,
        height: '6\'0"',
        eyeColor: 'blue',
        hairColor: 'brown',
      },
      sourceApplication: 'novel-movie',
    }

    const createResponse = await fetch(`${CHARACTER_LIBRARY_URL}/api/v1/characters/novel-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCharacterData),
    })

    if (createResponse.ok) {
      const result = await createResponse.json()
      console.log('✅ Character creation endpoint working:', result.id)
      return result.id
    } else {
      const error = await createResponse.text()
      console.log('❌ Character creation failed:', createResponse.status, error)
      return null
    }
  } catch (error) {
    console.log('❌ Character creation endpoint error:', error.message)
    return null
  }
}

async function testNovelMovieCharacterReferences() {
  console.log('🧪 Testing Novel Movie Character References Collection...')

  try {
    // Test the character references API endpoint instead of direct Payload access
    const testResponse = await fetch('http://localhost:3001/api/character-references', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (testResponse.ok) {
      const result = await testResponse.json()
      console.log(
        `✅ Character references collection accessible: ${result.docs?.length || 0} references found`,
      )
      return true
    } else {
      console.log('❌ Character references collection not accessible:', testResponse.status)
      return false
    }
  } catch (error) {
    console.log('❌ Character references test failed:', error.message)
    return false
  }
}

async function testCharacterGenerationWorkflow() {
  console.log('🧪 Testing Character Generation Workflow...')

  try {
    // Test the character development API endpoint
    const testRequest = {
      characters: ['Test Character'],
    }

    const response = await fetch(
      'http://localhost:3001/v1/projects/test-project-id/character-development',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest),
      },
    )

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Character generation workflow test passed')
      console.log('📊 Results:', result.summary)
      return true
    } else {
      const error = await response.text()
      console.log('❌ Character generation workflow failed:', response.status, error)
      return false
    }
  } catch (error) {
    console.log('❌ Character generation workflow error:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting Single-Source Character Architecture Tests\n')

  const results = {
    characterLibraryEndpoints: false,
    characterReferences: false,
    generationWorkflow: false,
  }

  // Test 1: Character Library Endpoints
  console.log('='.repeat(60))
  const libraryCharacterId = await testCharacterLibraryEndpoints()
  results.characterLibraryEndpoints = !!libraryCharacterId

  // Test 2: Novel Movie Character References
  console.log('\n' + '='.repeat(60))
  results.characterReferences = await testNovelMovieCharacterReferences()

  // Test 3: Character Generation Workflow (only if server is running)
  console.log('\n' + '='.repeat(60))
  results.generationWorkflow = await testCharacterGenerationWorkflow()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))

  console.log(
    `Character Library Endpoints: ${results.characterLibraryEndpoints ? '✅ PASS' : '❌ FAIL'}`,
  )
  console.log(
    `Character References Collection: ${results.characterReferences ? '✅ PASS' : '❌ FAIL'}`,
  )
  console.log(
    `Character Generation Workflow: ${results.generationWorkflow ? '✅ PASS' : '❌ FAIL'}`,
  )

  const passCount = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`)

  if (passCount === totalTests) {
    console.log('🎉 All tests passed! Single-source character architecture is ready.')
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.')
  }

  return results
}

// Run tests directly
runTests().catch(console.error)

export { runTests }
