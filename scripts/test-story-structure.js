#!/usr/bin/env node

/**
 * Test script for story structure planning functionality
 * Tests the API endpoint directly without importing payload config
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

async function testStoryStructurePlanning() {
  console.log('🎬 Testing Story Structure Planning API...\n')

  try {
    // First, get a list of projects to find one with a story
    console.log('📋 Finding projects...')
    const projectsResponse = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/api/projects?limit=10`,
    )

    if (!projectsResponse.ok) {
      console.log('❌ Failed to fetch projects. Make sure the server is running.')
      return
    }

    const projectsData = await projectsResponse.json()

    if (projectsData.docs.length === 0) {
      console.log('❌ No projects found. Please create a project first.')
      return
    }

    const project = projectsData.docs[0]
    console.log(`📖 Testing with project: ${project.name} (ID: ${project.id})`)

    // Check if this project has a story
    console.log('📚 Checking for existing story...')
    const storiesResponse = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/api/stories?where[project][equals]=${project.id}`,
    )

    if (!storiesResponse.ok) {
      console.log('❌ Failed to fetch stories.')
      return
    }

    const storiesData = await storiesResponse.json()

    if (storiesData.docs.length === 0) {
      console.log('❌ No stories found for this project. Please generate a story first.')
      return
    }

    const story = storiesData.docs[0]
    console.log(`📚 Found story with ${story.currentContent.length} characters`)
    console.log(`📊 Story status: ${story.status}, Step: ${story.currentStep}/12`)

    // Check if story structure already exists
    console.log('🔍 Checking for existing story structure...')
    const existingResponse = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/v1/projects/${project.id}/story-structure`,
    )

    if (existingResponse.ok) {
      const structure = await existingResponse.json()
      console.log('✅ Story structure already exists!')
      console.log(`📈 Quality Score: ${structure.generationMetadata?.qualityScore || 'N/A'}/100`)
      console.log(`🎭 Story Beats: ${structure.storyBeats?.length || 0}`)
      console.log(`👥 Character Arcs: ${structure.characterArcs?.length || 0}`)
      console.log(`📖 Subplots: ${structure.subplots?.length || 0}`)
      return
    }

    // Test the API endpoint
    console.log('\n🚀 Testing story structure generation API...')

    const apiUrl = `${process.env.SITE_URL || 'http://localhost:3001'}/v1/projects/${project.id}/story-structure`
    console.log(`📡 Making POST request to: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log(`❌ API Error: ${response.status} - ${errorData.error}`)
      return
    }

    const structure = await response.json()
    console.log('✅ Story structure generated successfully!')

    // Display results
    console.log('\n📊 GENERATION RESULTS:')
    console.log(`📈 Quality Score: ${structure.generationMetadata?.qualityScore || 'N/A'}/100`)
    console.log(`⏱️  Processing Time: ${structure.generationMetadata?.processingTime || 0}s`)
    console.log(`🎭 Story Beats: ${structure.storyBeats?.length || 0}`)
    console.log(`👥 Character Arcs: ${structure.characterArcs?.length || 0}`)
    console.log(`📖 Subplots: ${structure.subplots?.length || 0}`)

    // Display act structure
    console.log('\n🎬 THREE-ACT STRUCTURE:')
    if (structure.actStructure) {
      console.log(`📍 Act 1 Duration: ${structure.actStructure.act1?.duration || 0} min`)
      console.log(`📍 Act 2 Duration: ${structure.actStructure.act2?.duration || 0} min`)
      console.log(`📍 Act 3 Duration: ${structure.actStructure.act3?.duration || 0} min`)
    }

    // Display first few story beats
    if (structure.storyBeats && structure.storyBeats.length > 0) {
      console.log('\n🎵 STORY BEATS (first 3):')
      structure.storyBeats.slice(0, 3).forEach((beat, index) => {
        console.log(`${index + 1}. ${beat.beat} (${beat.timing}min) - ${beat.emotionalTone}`)
        console.log(`   ${beat.description.substring(0, 100)}...`)
      })
    }

    // Display character arcs
    if (structure.characterArcs && structure.characterArcs.length > 0) {
      console.log('\n👥 CHARACTER ARCS:')
      structure.characterArcs.forEach((arc, index) => {
        console.log(`${index + 1}. ${arc.character}`)
        console.log(`   Start: ${arc.startState.substring(0, 80)}...`)
        console.log(`   End: ${arc.endState.substring(0, 80)}...`)
      })
    }

    console.log('\n✅ Story structure planning test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', await error.response.text())
    }
  }
}

// Run the test
testStoryStructurePlanning()
  .then(() => {
    console.log('\n🎉 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed with error:', error)
    process.exit(1)
  })
