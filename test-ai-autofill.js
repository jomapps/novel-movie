#!/usr/bin/env node

/**
 * Test script for AI Auto-fill functionality
 * This script directly calls the AI autofill API to test the complete flow
 */

// Using native fetch (Node.js 18+)

const PROJECT_ID = '68ac4bc92381660fefe1e54d'
const API_BASE = 'http://localhost:3001'

async function testAIAutofill() {
  console.log('🚀 Starting AI Auto-fill test...')

  try {
    // Step 1: Get project data
    console.log('📊 Fetching project data...')
    const projectResponse = await fetch(`${API_BASE}/v1/projects/${PROJECT_ID}`)
    if (!projectResponse.ok) {
      throw new Error(`Failed to fetch project: ${projectResponse.status}`)
    }
    const projectData = await projectResponse.json()
    const project = projectData.data || projectData.doc || projectData // Handle different response formats
    console.log('✅ Project fetched:', project.name)

    // Step 2: Get existing initial concept
    console.log('📋 Fetching existing initial concept...')
    const conceptResponse = await fetch(`${API_BASE}/v1/initial-concepts?project=${PROJECT_ID}`)
    if (!conceptResponse.ok) {
      throw new Error(`Failed to fetch initial concept: ${conceptResponse.status}`)
    }
    const conceptData = await conceptResponse.json()
    const initialConcept =
      conceptData.docs && conceptData.docs.length > 0 ? conceptData.docs[0] : null

    if (initialConcept) {
      console.log('✅ Found existing initial concept:', initialConcept.id)
    } else {
      console.log('ℹ️ No existing initial concept found')
    }

    // Step 3: Prepare clean form data
    const currentFormData = initialConcept
      ? {
          status: initialConcept.status || 'ai-generated',
          primaryGenres: initialConcept.primaryGenres || [],
          corePremise: initialConcept.corePremise || '',
          targetAudience: {
            demographics: initialConcept.targetAudience?.demographics || [],
            psychographics: initialConcept.targetAudience?.psychographics || '',
            customDescription: initialConcept.targetAudience?.customDescription || '',
          },
          toneAndMood: {
            tones: initialConcept.toneAndMood?.tones || [],
            moods: initialConcept.toneAndMood?.moods || [],
            emotionalArc: initialConcept.toneAndMood?.emotionalArc || '',
          },
          visualStyle: {
            cinematographyStyle: initialConcept.visualStyle?.cinematographyStyle || '',
            colorPalette: {
              dominance: initialConcept.visualStyle?.colorPalette?.dominance || '',
              saturation: initialConcept.visualStyle?.colorPalette?.saturation || '',
              symbolicColors: initialConcept.visualStyle?.colorPalette?.symbolicColors || '',
            },
            lightingPreferences: initialConcept.visualStyle?.lightingPreferences || '',
            cameraMovement: initialConcept.visualStyle?.cameraMovement || '',
          },
          references: {
            inspirationalMovies: initialConcept.references?.inspirationalMovies || [],
            visualReferences: initialConcept.references?.visualReferences || '',
            narrativeReferences: initialConcept.references?.narrativeReferences || '',
          },
          themes: {
            centralThemes: initialConcept.themes?.centralThemes || [],
            moralQuestions: initialConcept.themes?.moralQuestions || '',
            messageTakeaway: initialConcept.themes?.messageTakeaway || '',
          },
        }
      : {
          status: 'ai-generated',
          primaryGenres: [],
          corePremise: '',
          targetAudience: {
            demographics: [],
            psychographics: '',
            customDescription: '',
          },
          toneAndMood: {
            tones: [],
            moods: [],
            emotionalArc: '',
          },
          visualStyle: {
            cinematographyStyle: '',
            colorPalette: {
              dominance: '',
              saturation: '',
              symbolicColors: '',
            },
            lightingPreferences: '',
            cameraMovement: '',
          },
          references: {
            inspirationalMovies: [],
            visualReferences: '',
            narrativeReferences: '',
          },
          themes: {
            centralThemes: [],
            moralQuestions: '',
            messageTakeaway: '',
          },
        }

    // Step 4: Prepare the request payload
    const payload = {
      projectId: project.id,
      projectName: project.name,
      projectDescription: project.shortDescription || '',
      movieFormat: project.movieFormat?.slug || project.movieFormat,
      movieStyle: project.movieStyle?.slug || project.movieStyle,
      durationUnit: project.durationUnit,
      formData: currentFormData,
    }

    console.log('📤 Sending AI autofill request...')
    console.log('Payload:', JSON.stringify(payload, null, 2))

    // Step 5: Call the AI autofill API
    const autofillResponse = await fetch(`${API_BASE}/v1/initial-concepts/ai-autofill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!autofillResponse.ok) {
      const errorText = await autofillResponse.text()
      throw new Error(`AI autofill failed: ${autofillResponse.status} - ${errorText}`)
    }

    const result = await autofillResponse.json()
    console.log('✅ AI autofill completed successfully!')
    console.log('Result:', JSON.stringify(result, null, 2))

    // Step 6: Verify all fields are populated
    console.log('🔍 Verifying field population...')
    const record = result.data.record
    const verification = {
      corePremise: !!record.corePremise,
      primaryGenres: record.primaryGenres && record.primaryGenres.length > 0,
      targetAudience: {
        demographics:
          record.targetAudience?.demographics && record.targetAudience.demographics.length > 0,
        psychographics: !!record.targetAudience?.psychographics,
        customDescription: !!record.targetAudience?.customDescription,
      },
      toneAndMood: {
        tones: record.toneAndMood?.tones && record.toneAndMood.tones.length > 0,
        moods: record.toneAndMood?.moods && record.toneAndMood.moods.length > 0,
        emotionalArc: !!record.toneAndMood?.emotionalArc,
      },
      visualStyle: {
        cinematographyStyle: !!record.visualStyle?.cinematographyStyle,
        colorPalette: {
          dominance: !!record.visualStyle?.colorPalette?.dominance,
          saturation: !!record.visualStyle?.colorPalette?.saturation,
          symbolicColors: !!record.visualStyle?.colorPalette?.symbolicColors,
        },
        lightingPreferences: !!record.visualStyle?.lightingPreferences,
        cameraMovement: !!record.visualStyle?.cameraMovement,
      },
      references: {
        inspirationalMovies:
          record.references?.inspirationalMovies &&
          record.references.inspirationalMovies.length > 0,
        visualReferences: !!record.references?.visualReferences,
        narrativeReferences: !!record.references?.narrativeReferences,
      },
      themes: {
        centralThemes: record.themes?.centralThemes && record.themes.centralThemes.length > 0,
        moralQuestions: !!record.themes?.moralQuestions,
        messageTakeaway: !!record.themes?.messageTakeaway,
      },
    }

    console.log('📊 Field verification results:')
    console.log(JSON.stringify(verification, null, 2))

    // Count populated fields
    let totalFields = 0
    let populatedFields = 0

    function countFields(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key
        if (typeof value === 'object' && value !== null) {
          countFields(value, currentPath)
        } else {
          totalFields++
          if (value) {
            populatedFields++
            console.log(`✅ ${currentPath}: populated`)
          } else {
            console.log(`❌ ${currentPath}: empty`)
          }
        }
      }
    }

    countFields(verification)

    const completionPercentage = Math.round((populatedFields / totalFields) * 100)
    console.log(
      `\n📈 Completion: ${populatedFields}/${totalFields} fields (${completionPercentage}%)`,
    )

    if (completionPercentage === 100) {
      console.log('🎉 SUCCESS: All fields are populated!')
    } else {
      console.log('⚠️ WARNING: Some fields are missing data')
    }

    return result
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    throw error
  }
}

// Run the test
testAIAutofill()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })

export { testAIAutofill }
