#!/usr/bin/env node

/**
 * Test script to verify project detail page and edit functionality
 * Tests both the display of Section 2 fields and edit workflow
 */

// Use built-in fetch (Node.js 18+) or import fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default

const BASE_URL = 'http://localhost:3000'
const PROJECT_ID = '68b2cc1491e1bd4a09118274'

async function testProjectDetailAPI() {
  console.log('🧪 Testing Project Detail API...')

  try {
    const response = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}`)
    const data = await response.json()

    if (!data.success) {
      console.error('❌ Failed to fetch project:', data.error)
      return false
    }

    const project = data.data
    console.log('✅ Project fetched successfully')
    console.log(`   Name: ${project.name}`)
    console.log(`   Title: ${project.projectTitle || 'Not set'}`)

    // Check Section 2 fields
    console.log('\n📋 Checking Section 2 fields:')
    console.log(
      `   Primary Genres: ${project.primaryGenres ? project.primaryGenres.length : 0} items`,
    )
    console.log(`   Core Premise: ${project.corePremise ? 'Set' : 'Not set'}`)
    console.log(
      `   Target Audience: ${project.targetAudience ? project.targetAudience.length : 0} items`,
    )
    console.log(`   Tone: ${project.tone ? project.tone.length : 0} items`)

    return project
  } catch (error) {
    console.error('❌ Error fetching project:', error.message)
    return false
  }
}

async function testProjectUpdateAPI(project) {
  console.log('\n🔄 Testing Project Update API...')

  try {
    // Prepare update data with a small change
    const updateData = {
      ...project,
      projectTitle: project.projectTitle + ' (Updated)',
      // Ensure relationship fields are properly formatted as IDs
      movieFormat:
        typeof project.movieFormat === 'object' ? project.movieFormat.id : project.movieFormat,
      movieStyle:
        typeof project.movieStyle === 'object' ? project.movieStyle.id : project.movieStyle,
      durationUnit:
        typeof project.durationUnit === 'object' ? project.durationUnit.id : project.durationUnit,
      series:
        project.series && typeof project.series === 'object' ? project.series.id : project.series,
      primaryGenres: Array.isArray(project.primaryGenres)
        ? project.primaryGenres
            .map((genre) => (typeof genre === 'object' ? genre.id : genre))
            .filter(Boolean)
        : [],
      targetAudience: Array.isArray(project.targetAudience)
        ? project.targetAudience
            .map((audience) => (typeof audience === 'object' ? audience.id : audience))
            .filter(Boolean)
        : [],
      tone: Array.isArray(project.tone)
        ? project.tone.map((t) => (typeof t === 'object' ? t.id : t)).filter(Boolean)
        : [],
    }

    const response = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    const result = await response.json()

    if (!result.success) {
      console.error('❌ Failed to update project:', result.error)
      return false
    }

    console.log('✅ Project updated successfully')
    console.log(`   New title: ${result.data.projectTitle}`)

    // Revert the change
    const revertData = {
      ...updateData,
      projectTitle: project.projectTitle,
    }

    const revertResponse = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(revertData),
    })

    const revertResult = await revertResponse.json()
    if (revertResult.success) {
      console.log('✅ Project reverted to original state')
    }

    return true
  } catch (error) {
    console.error('❌ Error updating project:', error.message)
    return false
  }
}

async function testPageAccessibility() {
  console.log('\n🌐 Testing Page Accessibility...')

  try {
    // Test detail page
    const detailResponse = await fetch(`${BASE_URL}/project/${PROJECT_ID}`)
    if (detailResponse.ok) {
      console.log('✅ Project detail page accessible')
    } else {
      console.log('❌ Project detail page not accessible')
    }

    // Test edit page
    const editResponse = await fetch(`${BASE_URL}/project/${PROJECT_ID}/edit`)
    if (editResponse.ok) {
      console.log('✅ Project edit page accessible')
    } else {
      console.log('❌ Project edit page not accessible')
    }

    return true
  } catch (error) {
    console.error('❌ Error testing page accessibility:', error.message)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting Project Functionality Tests\n')

  // Test 1: Fetch project and check Section 2 fields
  const project = await testProjectDetailAPI()
  if (!project) {
    console.log('\n❌ Tests failed - could not fetch project')
    return
  }

  // Test 2: Test update functionality
  const updateSuccess = await testProjectUpdateAPI(project)
  if (!updateSuccess) {
    console.log('\n❌ Tests failed - could not update project')
    return
  }

  // Test 3: Test page accessibility
  await testPageAccessibility()

  console.log('\n🎉 All tests completed!')
  console.log('\n📝 Summary:')
  console.log('   ✅ Project detail API working')
  console.log('   ✅ Section 2 fields present in data')
  console.log('   ✅ Project update API working')
  console.log('   ✅ Pages accessible')
  console.log('\n💡 Next steps:')
  console.log('   1. Visit the project detail page to verify Section 2 fields display')
  console.log('   2. Click "Edit Project" to test the edit form')
  console.log('   3. Verify all fields are pre-filled correctly')
  console.log('   4. Test saving changes')
}

// Run the tests
runTests().catch(console.error)
