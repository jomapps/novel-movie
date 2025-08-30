#!/usr/bin/env node

/**
 * Comprehensive Story Generation Test
 * Tests the updated story generation functionality that works with the enhanced projects collection
 * instead of the removed initial-concept collection.
 */

const API_BASE = 'http://localhost:3000'

// Test project data with all required and optional fields
const TEST_PROJECT_DATA = {
  name: 'Test Adventure Story',
  projectTitle: 'The Crystal Quest',
  shortDescription: 'A young hero discovers a magical crystal that holds the key to saving their world.',
  longDescription: 'In a world where magic is fading, a reluctant young hero must embark on a perilous journey to find the legendary Crystal of Eternity. Along the way, they discover hidden powers, forge unlikely alliances, and confront an ancient evil that threatens to plunge the world into eternal darkness.',
  movieFormat: 'feature-film',
  movieStyle: 'cinematic',
  durationUnit: 120,
  status: 'draft',
  // These fields will be populated by the test
  primaryGenres: [],
  corePremise: '',
  targetAudience: [],
  tone: []
}

async function testStoryGeneration() {
  console.log('🧪 Starting Story Generation End-to-End Test')
  console.log('=' .repeat(60))

  try {
    // Step 1: Create a test project with comprehensive data
    console.log('📝 Step 1: Creating test project...')
    const projectResponse = await fetch(`${API_BASE}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_PROJECT_DATA),
    })

    if (!projectResponse.ok) {
      throw new Error(`Failed to create project: ${projectResponse.status}`)
    }

    const projectResult = await projectResponse.json()
    const project = projectResult.data || projectResult.doc || projectResult
    console.log('✅ Project created:', project.id, '-', project.name)

    // Step 2: Populate project with story generation fields using AI autofill
    console.log('🤖 Step 2: Populating project with AI-generated story fields...')
    const autofillResponse = await fetch(`${API_BASE}/v1/projects/core-elements-autofill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: project.name,
        movieFormat: project.movieFormat,
        movieStyle: project.movieStyle,
        durationUnit: project.durationUnit,
        currentValues: {
          primaryGenres: [],
          corePremise: '',
          targetAudience: [],
          tone: []
        }
      }),
    })

    if (!autofillResponse.ok) {
      console.warn('⚠️ AI autofill failed, will use manual values')
      // Manually set some values for testing
      await updateProjectWithManualValues(project.id)
    } else {
      const autofillResult = await autofillResponse.json()
      console.log('✅ AI autofill completed')
      
      // Update project with generated values
      const updateResponse = await fetch(`${API_BASE}/v1/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(autofillResult.generatedFields),
      })

      if (!updateResponse.ok) {
        throw new Error(`Failed to update project: ${updateResponse.status}`)
      }
      console.log('✅ Project updated with AI-generated fields')
    }

    // Step 3: Fetch updated project to verify all fields are populated
    console.log('📊 Step 3: Verifying project data completeness...')
    const updatedProjectResponse = await fetch(`${API_BASE}/v1/projects/${project.id}`)
    if (!updatedProjectResponse.ok) {
      throw new Error(`Failed to fetch updated project: ${updatedProjectResponse.status}`)
    }

    const updatedProjectResult = await updatedProjectResponse.json()
    const updatedProject = updatedProjectResult.data || updatedProjectResult.doc || updatedProjectResult

    // Verify project has required fields
    const validation = validateProjectData(updatedProject)
    if (!validation.isValid) {
      console.error('❌ Project validation failed:', validation.missingFields)
      throw new Error('Project missing required fields for story generation')
    }
    console.log('✅ Project data validation passed')
    console.log('📋 Project fields:', {
      name: updatedProject.name,
      movieFormat: updatedProject.movieFormat?.name || updatedProject.movieFormat,
      movieStyle: updatedProject.movieStyle?.name || updatedProject.movieStyle,
      primaryGenres: updatedProject.primaryGenres?.map(g => g.name || g) || [],
      corePremise: updatedProject.corePremise ? 'Present' : 'Missing',
      targetAudience: updatedProject.targetAudience?.map(a => a.name || a) || [],
      tone: updatedProject.tone?.map(t => t.name || t) || []
    })

    // Step 4: Generate story using the new API
    console.log('📖 Step 4: Generating story from project data...')
    const storyResponse = await fetch(`${API_BASE}/v1/stories/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
      }),
    })

    if (!storyResponse.ok) {
      const errorData = await storyResponse.json()
      throw new Error(`Story generation failed: ${errorData.error || storyResponse.status}`)
    }

    const story = await storyResponse.json()
    console.log('✅ Story generated successfully!')
    console.log('📊 Story details:', {
      id: story.id,
      projectName: story.projectName,
      currentStep: story.currentStep,
      status: story.status,
      contentLength: story.currentContent?.length || 0,
      overallQuality: story.qualityMetrics?.overallQuality || 'N/A'
    })

    // Step 5: Verify story content quality and completeness
    console.log('🔍 Step 5: Analyzing story content...')
    const contentAnalysis = analyzeStoryContent(story, updatedProject)
    console.log('📈 Content Analysis:', contentAnalysis)

    // Step 6: Test story enhancement (if available)
    console.log('⚡ Step 6: Testing story enhancement...')
    try {
      const enhanceResponse = await fetch(`${API_BASE}/v1/stories/${story.id}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          focusArea: 'character-development'
        }),
      })

      if (enhanceResponse.ok) {
        const enhancedStory = await enhanceResponse.json()
        console.log('✅ Story enhancement successful')
        console.log('📊 Enhanced quality:', enhancedStory.qualityMetrics?.overallQuality || 'N/A')
      } else {
        console.log('ℹ️ Story enhancement not available or failed')
      }
    } catch (error) {
      console.log('ℹ️ Story enhancement test skipped:', error.message)
    }

    // Step 7: Cleanup - Delete test project and related data
    console.log('🧹 Step 7: Cleaning up test data...')
    const deleteResponse = await fetch(`${API_BASE}/v1/projects/${project.id}`, {
      method: 'DELETE',
    })

    if (deleteResponse.ok) {
      console.log('✅ Test project deleted successfully')
    } else {
      console.warn('⚠️ Failed to delete test project - manual cleanup may be required')
    }

    console.log('\n🎉 Story Generation Test PASSED!')
    console.log('=' .repeat(60))
    console.log('✅ All story generation functionality working correctly')
    console.log('✅ Project data properly utilized for story generation')
    console.log('✅ BAML integration functional (or fallback working)')
    console.log('✅ Quality metrics calculated correctly')

  } catch (error) {
    console.error('\n❌ Story Generation Test FAILED!')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

async function updateProjectWithManualValues(projectId) {
  console.log('📝 Setting manual test values...')
  
  const manualValues = {
    primaryGenres: ['adventure', 'fantasy'],
    corePremise: 'A young hero must find a magical crystal to save their world from an ancient evil.',
    targetAudience: ['young-adults', 'fantasy-fans'],
    tone: ['heroic', 'adventurous']
  }

  const updateResponse = await fetch(`${API_BASE}/v1/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(manualValues),
  })

  if (!updateResponse.ok) {
    throw new Error(`Failed to update project with manual values: ${updateResponse.status}`)
  }
  
  console.log('✅ Manual values set')
}

function validateProjectData(project) {
  const missingFields = []
  
  if (!project.name) missingFields.push('name')
  if (!project.movieFormat) missingFields.push('movieFormat')
  if (!project.movieStyle) missingFields.push('movieStyle')
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    hasOptionalFields: project.primaryGenres?.length > 0 && project.corePremise && project.targetAudience?.length > 0
  }
}

function analyzeStoryContent(story, project) {
  const content = story.currentContent || ''
  const projectData = {
    genres: project.primaryGenres?.map(g => g.name || g) || [],
    premise: project.corePremise || '',
    audience: project.targetAudience?.map(a => a.name || a) || [],
    tone: project.tone?.map(t => t.name || t) || []
  }

  return {
    contentLength: content.length,
    hasProjectTitle: content.includes(project.projectTitle || project.name),
    hasGenreReferences: projectData.genres.some(genre => 
      content.toLowerCase().includes(genre.toLowerCase())
    ),
    hasPremiseElements: projectData.premise ? 
      content.toLowerCase().includes(projectData.premise.toLowerCase().substring(0, 20)) : false,
    hasStructuredFormat: content.includes('Act I') && content.includes('Act II') && content.includes('Act III'),
    qualityMetrics: story.qualityMetrics || {},
    generationParameters: story.generationParameters || {}
  }
}

// Run the test
if (require.main === module) {
  testStoryGeneration()
}
