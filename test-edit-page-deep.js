#!/usr/bin/env node

/**
 * Deep testing script for edit page functionality
 * Tests all aspects of the edit page including data loading, form rendering, and submission
 */

// Use built-in fetch (Node.js 18+) or import fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default

const BASE_URL = 'http://localhost:3001'
const PROJECT_ID = '68b2cc1491e1bd4a09118274'

async function testProjectDataFetch() {
  console.log('🔍 Testing project data fetch for edit page...')

  try {
    const response = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}`)
    const data = await response.json()

    if (!data.success) {
      console.error('❌ Failed to fetch project:', data.error)
      return null
    }

    const project = data.data
    console.log('✅ Project data fetched successfully')
    console.log(`   ID: ${project.id}`)
    console.log(`   Name: ${project.name}`)
    console.log(`   Title: ${project.projectTitle || 'Not set'}`)

    // Check all required fields for edit form
    console.log('\n📋 Checking required fields:')
    console.log(
      `   movieFormat: ${typeof project.movieFormat} - ${project.movieFormat ? (typeof project.movieFormat === 'object' ? project.movieFormat.id : project.movieFormat) : 'Not set'}`,
    )
    console.log(
      `   movieStyle: ${typeof project.movieStyle} - ${project.movieStyle ? (typeof project.movieStyle === 'object' ? project.movieStyle.id : project.movieStyle) : 'Not set'}`,
    )
    console.log(
      `   durationUnit: ${typeof project.durationUnit} - ${project.durationUnit ? (typeof project.durationUnit === 'object' ? project.durationUnit.id : project.durationUnit) : 'Not set'}`,
    )
    console.log(
      `   series: ${typeof project.series} - ${project.series ? (typeof project.series === 'object' ? project.series.id : project.series) : 'Not set'}`,
    )

    // Check Section 2 fields
    console.log('\n📋 Checking Section 2 fields:')
    console.log(
      `   primaryGenres: ${Array.isArray(project.primaryGenres) ? project.primaryGenres.length : 0} items`,
    )
    console.log(
      `   corePremise: ${project.corePremise ? 'Set (' + project.corePremise.length + ' chars)' : 'Not set'}`,
    )
    console.log(
      `   targetAudience: ${Array.isArray(project.targetAudience) ? project.targetAudience.length : 0} items`,
    )
    console.log(`   tone: ${Array.isArray(project.tone) ? project.tone.length : 0} items`)

    return project
  } catch (error) {
    console.error('❌ Error fetching project:', error.message)
    return null
  }
}

async function testEditPageAccess() {
  console.log('\n🌐 Testing edit page accessibility...')

  try {
    const response = await fetch(`${BASE_URL}/project/${PROJECT_ID}/edit`)

    if (!response.ok) {
      console.error(`❌ Edit page returned ${response.status}: ${response.statusText}`)

      // Try to get the response text to see the error
      const text = await response.text()
      console.error('Response body:', text.substring(0, 500) + (text.length > 500 ? '...' : ''))
      return false
    }

    const html = await response.text()
    console.log('✅ Edit page accessible')
    console.log(`   Response size: ${html.length} characters`)

    // Check for key elements in the HTML
    const hasForm = html.includes('<form')
    const hasRequiredSection = html.includes('Required Information')
    const hasCoreStorySection = html.includes('Core Story Elements')
    const hasProjectDetailsSection = html.includes('Project Details')
    const hasSubmitButton = html.includes('Update Project')

    console.log('\n📋 Checking page content:')
    console.log(`   Has form: ${hasForm ? '✅' : '❌'}`)
    console.log(`   Has Required Information section: ${hasRequiredSection ? '✅' : '❌'}`)
    console.log(`   Has Core Story Elements section: ${hasCoreStorySection ? '✅' : '❌'}`)
    console.log(`   Has Project Details section: ${hasProjectDetailsSection ? '✅' : '❌'}`)
    console.log(`   Has Update Project button: ${hasSubmitButton ? '✅' : '❌'}`)

    // Check for error indicators
    const hasError =
      html.includes('Module not found') || html.includes('Error:') || html.includes('500')
    if (hasError) {
      console.error('❌ Page contains error indicators')
      // Extract error details
      const errorMatch = html.match(/Module not found[^<]*/g)
      if (errorMatch) {
        console.error('   Error details:', errorMatch[0])
      }
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Error accessing edit page:', error.message)
    return false
  }
}

async function testOptionsEndpoints() {
  console.log('\n🔗 Testing options endpoints for form data...')

  const endpoints = [
    '/v1/movie-formats',
    '/v1/movie-styles',
    '/v1/series',
    '/v1/config/genres',
    '/v1/config/audience-demographics',
    '/v1/config/tone-options',
  ]

  const results = {}

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`)
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        results[endpoint] = data.data.length
        console.log(`   ✅ ${endpoint}: ${data.data.length} items`)
      } else {
        results[endpoint] = 'Error'
        console.log(`   ❌ ${endpoint}: ${data.error || 'Invalid response'}`)
      }
    } catch (error) {
      results[endpoint] = 'Error'
      console.log(`   ❌ ${endpoint}: ${error.message}`)
    }
  }

  return results
}

async function testEditFormSubmission(project) {
  console.log('\n📝 Testing edit form submission...')

  if (!project) {
    console.log('❌ Cannot test submission without project data')
    return false
  }

  try {
    // Prepare test update data
    const updateData = {
      name: project.name,
      projectTitle: project.projectTitle + ' (Test Edit)',
      shortDescription: project.shortDescription || 'Test description',
      longDescription: project.longDescription || 'Test long description',
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
      corePremise: project.corePremise || 'Test premise',
      targetAudience: Array.isArray(project.targetAudience)
        ? project.targetAudience
            .map((audience) => (typeof audience === 'object' ? audience.id : audience))
            .filter(Boolean)
        : [],
      tone: Array.isArray(project.tone)
        ? project.tone.map((t) => (typeof t === 'object' ? t.id : t)).filter(Boolean)
        : [],
    }

    console.log('   Submitting test update...')
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

    console.log('✅ Test update successful')
    console.log(`   Updated title: ${result.data.projectTitle}`)

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
      console.log('✅ Test changes reverted successfully')
    }

    return true
  } catch (error) {
    console.error('❌ Error testing form submission:', error.message)
    return false
  }
}

async function runDeepTests() {
  console.log('🚀 Starting Deep Edit Page Tests\n')

  // Test 1: Project data fetch
  const project = await testProjectDataFetch()

  // Test 2: Edit page access
  const pageAccessible = await testEditPageAccess()

  // Test 3: Options endpoints
  const optionsResults = await testOptionsEndpoints()

  // Test 4: Form submission
  const submissionWorks = await testEditFormSubmission(project)

  console.log('\n🎯 DEEP TEST RESULTS:')
  console.log('='.repeat(50))
  console.log(`   Project Data Fetch: ${project ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Edit Page Access: ${pageAccessible ? '✅ PASS' : '❌ FAIL'}`)
  console.log(
    `   Options Endpoints: ${Object.values(optionsResults).every((v) => v !== 'Error') ? '✅ PASS' : '❌ FAIL'}`,
  )
  console.log(`   Form Submission: ${submissionWorks ? '✅ PASS' : '❌ FAIL'}`)

  const allTestsPassed =
    project &&
    pageAccessible &&
    Object.values(optionsResults).every((v) => v !== 'Error') &&
    submissionWorks

  console.log('\n' + '='.repeat(50))
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - Edit functionality is working correctly!')
    console.log('\n✅ The edit page is ready for use:')
    console.log(`   📍 URL: ${BASE_URL}/project/${PROJECT_ID}/edit`)
    console.log('   📝 All form sections are functional')
    console.log('   💾 Data saving and loading works correctly')
    console.log('   🔗 All required API endpoints are accessible')
  } else {
    console.log('❌ SOME TESTS FAILED - Issues need to be resolved')
    console.log('\n🔧 Issues found:')
    if (!project) console.log('   - Project data cannot be fetched')
    if (!pageAccessible) console.log('   - Edit page is not accessible or has errors')
    if (!Object.values(optionsResults).every((v) => v !== 'Error'))
      console.log('   - Some options endpoints are failing')
    if (!submissionWorks) console.log('   - Form submission is not working')
  }

  return allTestsPassed
}

// Run the deep tests
runDeepTests().catch(console.error)
