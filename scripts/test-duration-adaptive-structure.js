#!/usr/bin/env node

/**
 * Test Duration-Adaptive Story Structure Generation
 * Tests the new comprehensive narrative structure system
 */

const PROJECT_ID = '68b9d1457ae0c1549464f026' // 1-minute project
const BASE_URL = 'http://localhost:3000'

async function testDurationAdaptiveStructure() {
  console.log('🎬 Testing Duration-Adaptive Story Structure Generation')
  console.log('=' .repeat(60))

  try {
    // Step 1: Get project details to verify duration
    console.log('\n📋 Step 1: Fetching project details...')
    const projectResponse = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}`)
    
    if (!projectResponse.ok) {
      throw new Error(`Failed to fetch project: ${projectResponse.status}`)
    }
    
    const projectData = await projectResponse.json()
    const project = projectData.data
    
    console.log(`✅ Project: ${project.name}`)
    console.log(`⏱️  Duration: ${project.durationUnit} minutes`)
    console.log(`🎭 Format: ${typeof project.movieFormat === 'object' ? project.movieFormat.name : project.movieFormat}`)
    console.log(`🎨 Style: ${typeof project.movieStyle === 'object' ? project.movieStyle.name : project.movieStyle}`)

    // Step 2: Check if story exists
    console.log('\n📖 Step 2: Checking story status...')
    const storyResponse = await fetch(`${BASE_URL}/v1/stories?where[project][equals]=${PROJECT_ID}`)
    
    if (!storyResponse.ok) {
      throw new Error(`Failed to fetch story: ${storyResponse.status}`)
    }
    
    const storyData = await storyResponse.json()
    
    if (storyData.data.docs.length === 0) {
      console.log('❌ No story found for this project')
      console.log('💡 Please generate a story first before testing structure generation')
      return
    }
    
    const story = storyData.data.docs[0]
    console.log(`✅ Story found: ${story.status} (Step ${story.currentStep}/12)`)
    console.log(`📝 Content length: ${story.currentContent?.length || 0} characters`)

    // Step 3: Generate story structure with duration-adaptive system
    console.log('\n🏗️  Step 3: Generating duration-adaptive story structure...')
    console.log('⚡ This will show the parameter establishment step in console logs')
    
    const structureResponse = await fetch(`${BASE_URL}/v1/projects/${PROJECT_ID}/story-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!structureResponse.ok) {
      const errorData = await structureResponse.json()
      throw new Error(`Structure generation failed: ${structureResponse.status} - ${errorData.error}`)
    }
    
    const structure = await structureResponse.json()
    
    // Step 4: Analyze the generated structure
    console.log('\n📊 Step 4: Analyzing generated structure...')
    console.log(`✅ Structure generated successfully`)
    console.log(`🏛️  Structure Type: ${structure.narrativeStructureType || 'Not specified'}`)
    
    // Check duration compliance
    if (structure.durationCompliance) {
      const compliance = structure.durationCompliance
      console.log(`\n🎯 Duration Compliance Analysis:`)
      console.log(`📂 Format Category: ${compliance.formatCategory}`)
      console.log(`⏱️  Target Duration: ${compliance.targetDuration} minutes`)
      console.log(`✅ Compliant: ${compliance.isCompliant ? 'YES' : 'NO'}`)
      console.log(`🎚️  Complexity Level: ${compliance.complexityLevel}`)
      
      console.log(`\n📏 Constraints vs Actual:`)
      console.log(`Story Beats: ${compliance.actualMetrics.storyBeatsCount}/${compliance.constraints.maxStoryBeats}`)
      console.log(`Characters: ${compliance.actualMetrics.characterCount}/${compliance.constraints.maxCharacters}`)
      console.log(`Subplots: ${compliance.actualMetrics.subplotCount}/${compliance.constraints.maxSubplots}`)
      console.log(`Pacing: ${compliance.actualMetrics.averageBeatsPerMinute.toFixed(2)}/${compliance.constraints.beatsPerMinute} beats/min`)
      
      if (compliance.warnings && compliance.warnings.length > 0) {
        console.log(`\n⚠️  Warnings:`)
        compliance.warnings.forEach((w, i) => {
          console.log(`${i + 1}. ${w.warning}`)
        })
      }
      
      if (compliance.recommendations && compliance.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`)
        compliance.recommendations.forEach((r, i) => {
          console.log(`${i + 1}. ${r.recommendation}`)
        })
      }
    }
    
    // Check adaptive structure
    if (structure.adaptiveStructure) {
      const adaptive = structure.adaptiveStructure
      console.log(`\n🏗️  Adaptive Structure Details:`)
      console.log(`📋 Structure Type: ${adaptive.structureType}`)
      console.log(`🎭 Acts: ${adaptive.acts?.length || 0}`)
      
      if (adaptive.acts && adaptive.acts.length > 0) {
        console.log(`\n🎬 Act Breakdown:`)
        adaptive.acts.forEach((act, i) => {
          console.log(`Act ${act.actNumber}: ${act.name} (${act.duration} min) - ${act.description?.substring(0, 100)}...`)
        })
      }
      
      if (adaptive.sequences && adaptive.sequences.length > 0) {
        console.log(`\n🎞️  Sequences: ${adaptive.sequences.length}`)
      }
      
      if (adaptive.saveTheCatBeats && adaptive.saveTheCatBeats.length > 0) {
        console.log(`\n📝 Save the Cat Beats: ${adaptive.saveTheCatBeats.length}`)
      }
    }
    
    // Step 5: Validate for 1-minute constraints
    console.log('\n🎯 Step 5: 1-Minute Format Validation...')
    
    const storyBeats = structure.storyBeats?.length || 0
    const characterArcs = structure.characterArcs?.length || 0
    const subplots = structure.subplots?.length || 0
    
    console.log(`\n📊 Final Validation Results:`)
    console.log(`Story Beats: ${storyBeats} ${storyBeats <= 4 ? '✅' : '❌'} (should be ≤4 for 1-minute)`)
    console.log(`Character Arcs: ${characterArcs} ${characterArcs <= 2 ? '✅' : '❌'} (should be ≤2 for 1-minute)`)
    console.log(`Subplots: ${subplots} ${subplots === 0 ? '✅' : '❌'} (should be 0 for 1-minute)`)
    
    const isValid = storyBeats <= 4 && characterArcs <= 2 && subplots === 0
    console.log(`\n🎉 Overall Result: ${isValid ? '✅ SUCCESS' : '❌ NEEDS ADJUSTMENT'}`)
    
    if (isValid) {
      console.log('🎊 The duration-adaptive system is working correctly!')
      console.log('🎬 1-minute constraints are properly respected')
    } else {
      console.log('⚠️  The system needs further adjustment for 1-minute format')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the test
testDurationAdaptiveStructure()
