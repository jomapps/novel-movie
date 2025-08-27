#!/usr/bin/env node

/**
 * Debug script to test Quality Score vs AI Auto-fill BAML functionality
 * This will help identify why one works and the other doesn't
 */

const API_BASE = 'http://localhost:3000'
const PROJECT_ID = '68ac4bc92381660fefe1e54d' // From the URL provided
const CONCEPT_ID = '68ae72d6973984ebecf606b2' // From the API response

async function testBAMLClient() {
  console.log('🔍 Testing BAML Client Import...')

  try {
    // Test direct BAML client import (same as used in both routes)
    const { getBamlClient } = await import('./src/lib/ai/initial-concept-autofill.ts')
    const bamlClient = await getBamlClient()
    console.log('✅ BAML Client imported successfully')
    console.log('📋 Available functions:', Object.keys(bamlClient))
    return { success: true, client: bamlClient }
  } catch (error) {
    console.error('❌ BAML Client import failed:', error.message)
    return { success: false, error: error.message }
  }
}

async function getProjectData() {
  console.log('📊 Fetching project data...')

  try {
    const response = await fetch(`${API_BASE}/v1/projects/${PROJECT_ID}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const project = data.data || data.doc || data
    console.log('✅ Project fetched:', project.name)
    return { success: true, project }
  } catch (error) {
    console.error('❌ Failed to fetch project:', error.message)
    return { success: false, error: error.message }
  }
}

async function getInitialConcept() {
  console.log('📋 Fetching initial concept...')

  try {
    const response = await fetch(`${API_BASE}/v1/initial-concepts/${CONCEPT_ID}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const concept = data.data || data.doc || data

    if (!concept) {
      console.log('⚠️  No initial concept found')
      return { success: false, error: 'No initial concept found' }
    }

    console.log('✅ Initial concept fetched')
    return { success: true, concept }
  } catch (error) {
    console.error('❌ Failed to fetch initial concept:', error.message)
    return { success: false, error: error.message }
  }
}

// Transform form data to match API expectations
function transformFormData(formData) {
  if (!formData) return formData

  const transformed = { ...formData }

  // Transform arrays of objects to arrays of strings (slugs)
  const transformArray = (arr) => {
    if (!Array.isArray(arr)) return arr
    return arr.map((item) => {
      if (typeof item === 'object' && item.slug) return item.slug
      if (typeof item === 'object' && item.name) return item.name
      return item
    })
  }

  // Transform single object to string
  const transformSingle = (obj) => {
    if (typeof obj === 'object' && obj.slug) return obj.slug
    if (typeof obj === 'object' && obj.name) return obj.name
    return obj
  }

  // Transform all relationship fields
  if (transformed.primaryGenres) {
    transformed.primaryGenres = transformArray(transformed.primaryGenres)
  }

  if (transformed.targetAudience?.demographics) {
    transformed.targetAudience.demographics = transformArray(
      transformed.targetAudience.demographics,
    )
  }

  if (transformed.toneAndMood?.tones) {
    transformed.toneAndMood.tones = transformArray(transformed.toneAndMood.tones)
  }

  if (transformed.toneAndMood?.moods) {
    transformed.toneAndMood.moods = transformArray(transformed.toneAndMood.moods)
  }

  if (transformed.visualStyle?.cinematographyStyle) {
    transformed.visualStyle.cinematographyStyle = transformSingle(
      transformed.visualStyle.cinematographyStyle,
    )
  }

  if (transformed.themes?.centralThemes) {
    transformed.themes.centralThemes = transformArray(transformed.themes.centralThemes)
  }

  return transformed
}

async function testAIAutoFill(project, concept) {
  console.log('\n🤖 Testing AI Auto-fill endpoint...')

  try {
    const payload = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.description || '',
      movieFormat:
        typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
      movieStyle:
        typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
      durationUnit: project.durationUnit,
      series: typeof project.series === 'object' ? project.series?.slug : project.series,
      formData: transformFormData(concept),
    }

    console.log('📤 Sending AI Auto-fill request...')
    const response = await fetch(`${API_BASE}/v1/initial-concepts/ai-autofill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ AI Auto-fill successful')
      return { success: true, data: result }
    } else {
      console.log('❌ AI Auto-fill failed:', result.error)
      return { success: false, error: result.error, details: result }
    }
  } catch (error) {
    console.error('❌ AI Auto-fill request failed:', error.message)
    return { success: false, error: error.message }
  }
}

async function testQualityScore(project, concept) {
  console.log('\n⭐ Testing Quality Score endpoint...')

  try {
    const payload = {
      projectName: project.name,
      movieFormat:
        typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
      movieStyle:
        typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
      durationUnit: project.durationUnit,
      series: typeof project.series === 'object' ? project.series?.slug : project.series,
      formData: transformFormData(concept),
    }

    console.log('📤 Sending Quality Score request...')
    const response = await fetch(`${API_BASE}/v1/initial-concepts/quality-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Quality Score successful')
      console.log('📊 Score:', result.data?.qualityScore)
      return { success: true, data: result }
    } else {
      console.log('❌ Quality Score failed:', result.error)
      console.log('🔍 Error details:', JSON.stringify(result, null, 2))
      return { success: false, error: result.error, details: result }
    }
  } catch (error) {
    console.error('❌ Quality Score request failed:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting BAML Quality Score Debug Test\n')

  // Test 1: BAML Client Import
  const bamlTest = await testBAMLClient()

  // Test 2: Get Project Data
  const projectResult = await getProjectData()
  if (!projectResult.success) {
    console.log('❌ Cannot continue without project data')
    return
  }

  // Test 3: Get Initial Concept
  const conceptResult = await getInitialConcept()
  if (!conceptResult.success) {
    console.log('❌ Cannot continue without initial concept data')
    return
  }

  // Test 4: AI Auto-fill (working)
  const autoFillResult = await testAIAutoFill(projectResult.project, conceptResult.concept)

  // Test 5: Quality Score (not working)
  const qualityResult = await testQualityScore(projectResult.project, conceptResult.concept)

  // Summary
  console.log('\n📊 SUMMARY:')
  console.log('='.repeat(50))
  console.log(`BAML Client Import: ${bamlTest.success ? '✅ SUCCESS' : '❌ FAILED'}`)
  console.log(`AI Auto-fill:       ${autoFillResult.success ? '✅ SUCCESS' : '❌ FAILED'}`)
  console.log(`Quality Score:      ${qualityResult.success ? '✅ SUCCESS' : '❌ FAILED'}`)

  if (!qualityResult.success && autoFillResult.success) {
    console.log('\n🔍 ANALYSIS:')
    console.log('- AI Auto-fill works, Quality Score fails')
    console.log('- Both use the same BAML client import')
    console.log('- Issue is likely in the Quality Score route implementation')

    if (qualityResult.details) {
      console.log('\n🐛 Quality Score Error Details:')
      console.log(JSON.stringify(qualityResult.details, null, 2))
    }
  }
}

main().catch(console.error)
