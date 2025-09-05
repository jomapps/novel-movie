#!/usr/bin/env node

/**
 * Debug Production Issues Script
 * Diagnoses the two main issues:
 * 1. Project ID becoming undefined when navigating between pages
 * 2. Story completion status not being recognized properly
 */

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
}

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`🔍 ${title}`, colors.cyan)
  log('='.repeat(60), colors.cyan)
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

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3000'
const PROJECT_ID = process.argv[2] || process.env.PROJECT_ID

async function debugProjectIdIssue() {
  logSection('Project ID Navigation Issue Diagnosis')
  
  if (!PROJECT_ID) {
    logError('No project ID provided. Usage: node debug-production-issues.js <project-id>')
    return false
  }
  
  try {
    // Test 1: Verify project exists
    logInfo(`Testing project ID: ${PROJECT_ID}`)
    const projectResponse = await fetch(`${API_BASE}/v1/projects/${PROJECT_ID}`)
    
    if (!projectResponse.ok) {
      logError(`Project not found: ${projectResponse.status} ${projectResponse.statusText}`)
      return false
    }
    
    const projectData = await projectResponse.json()
    logSuccess(`Project found: ${projectData.name || projectData.projectTitle || 'Unnamed'}`)
    
    // Test 2: Check project data structure
    logInfo('Analyzing project data structure...')
    console.log('Project ID:', projectData.id)
    console.log('Project Name:', projectData.name)
    console.log('Project Title:', projectData.projectTitle)
    console.log('Movie Format:', projectData.movieFormat)
    console.log('Movie Style:', projectData.movieStyle)
    
    // Test 3: Check if project has required fields for navigation
    const hasRequiredFields = projectData.id && (projectData.name || projectData.projectTitle)
    if (hasRequiredFields) {
      logSuccess('Project has required fields for navigation')
    } else {
      logWarning('Project missing required fields for navigation')
    }
    
    return true
    
  } catch (error) {
    logError(`Error testing project: ${error.message}`)
    return false
  }
}

async function debugStoryCompletionIssue() {
  logSection('Story Completion Status Issue Diagnosis')
  
  if (!PROJECT_ID) {
    logError('No project ID provided for story testing')
    return false
  }
  
  try {
    // Test 1: Fetch story data
    logInfo(`Fetching story for project: ${PROJECT_ID}`)
    const storyResponse = await fetch(`${API_BASE}/v1/stories?where[project][equals]=${PROJECT_ID}&limit=1`)
    
    if (!storyResponse.ok) {
      logError(`Failed to fetch story: ${storyResponse.status} ${storyResponse.statusText}`)
      return false
    }
    
    const storyData = await storyResponse.json()
    
    if (!storyData.docs || storyData.docs.length === 0) {
      logWarning('No story found for this project')
      return false
    }
    
    const story = storyData.docs[0]
    logSuccess(`Story found: ${story.id}`)
    
    // Test 2: Analyze story completion criteria
    logInfo('Analyzing story completion criteria...')
    console.log('Story Status:', story.status)
    console.log('Current Step:', story.currentStep, '/ 12')
    console.log('Has Content:', !!story.currentContent)
    console.log('Content Length:', story.currentContent?.length || 0, 'characters')
    console.log('Quality Score:', story.qualityMetrics?.overallQuality || 'N/A')
    
    // Test 3: Apply screenplay validation logic
    logInfo('Applying screenplay validation logic...')
    const hasStory = story && story.currentContent && story.status !== 'in-progress'
    
    console.log('Validation breakdown:')
    console.log('  - story exists:', !!story)
    console.log('  - story.currentContent exists:', !!story.currentContent)
    console.log('  - story.status !== "in-progress":', story.status !== 'in-progress')
    console.log('  - Final hasStory result:', hasStory)
    
    if (hasStory) {
      logSuccess('Story passes screenplay validation - should allow screenplay access')
    } else {
      logWarning('Story fails screenplay validation - screenplay access blocked')
      
      // Provide specific diagnosis
      if (!story.currentContent) {
        logError('Issue: Story has no content')
      }
      if (story.status === 'in-progress') {
        logError('Issue: Story status is still "in-progress"')
        if (story.currentStep >= 12) {
          logError('Specific problem: Story reached step 12 but status not updated to "completed"')
        }
      }
    }
    
    return hasStory
    
  } catch (error) {
    logError(`Error testing story: ${error.message}`)
    return false
  }
}

async function debugEnvironmentDifferences() {
  logSection('Environment Differences Analysis')
  
  try {
    // Test 1: Check API endpoints
    logInfo('Testing API endpoint accessibility...')
    
    const endpoints = [
      '/v1/projects',
      '/v1/stories',
      '/v1/health'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`)
        if (response.ok) {
          logSuccess(`${endpoint} - accessible`)
        } else {
          logWarning(`${endpoint} - ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        logError(`${endpoint} - ${error.message}`)
      }
    }
    
    // Test 2: Check for CORS issues
    logInfo('Checking for potential CORS issues...')
    logInfo(`API Base URL: ${API_BASE}`)
    
    // Test 3: Check localStorage simulation (for SSR issues)
    logInfo('Checking localStorage compatibility...')
    if (typeof localStorage !== 'undefined') {
      logSuccess('localStorage available')
    } else {
      logWarning('localStorage not available (SSR environment)')
    }
    
  } catch (error) {
    logError(`Error testing environment: ${error.message}`)
  }
}

async function provideSolutions() {
  logSection('Recommended Solutions')
  
  log('🔧 For Project ID becoming undefined:', colors.yellow)
  log('1. Add debugging to useParams() in both story and screenplay pages')
  log('2. Add console.log to track projectId value throughout navigation')
  log('3. Check if Next.js routing is working correctly in production')
  log('4. Verify that the [id] parameter is being passed correctly')
  log('5. Add fallback logic to get projectId from selectedProject context')
  
  log('\n🔧 For Story completion not being recognized:', colors.yellow)
  log('1. Check if story status is being updated correctly after completion')
  log('2. Verify the story enhancement process updates status to "completed"')
  log('3. Add manual story status update endpoint for fixing stuck stories')
  log('4. Consider adding a "force complete" option for debugging')
  log('5. Check if there are any race conditions in the story update process')
  
  log('\n🔧 General debugging steps:', colors.yellow)
  log('1. Add more detailed logging to both pages')
  log('2. Create a debug panel showing current state')
  log('3. Add error boundaries to catch navigation issues')
  log('4. Implement retry logic for failed API calls')
  log('5. Add health check endpoints for monitoring')
}

async function main() {
  log('🚀 Production Issues Debugging Tool', colors.magenta)
  log('This tool helps diagnose navigation and story completion issues\n')
  
  const projectIdOk = await debugProjectIdIssue()
  const storyOk = await debugStoryCompletionIssue()
  await debugEnvironmentDifferences()
  await provideSolutions()
  
  logSection('Summary')
  if (projectIdOk) {
    logSuccess('Project ID issue: No obvious problems detected')
  } else {
    logError('Project ID issue: Problems detected - see details above')
  }
  
  if (storyOk) {
    logSuccess('Story completion issue: Story should allow screenplay access')
  } else {
    logError('Story completion issue: Story blocking screenplay access - see details above')
  }
  
  log('\n💡 Next steps:', colors.cyan)
  log('1. Run this script with a specific project ID that has the issue')
  log('2. Check the browser console for additional error messages')
  log('3. Compare the API responses between dev and production')
  log('4. Implement the recommended debugging solutions')
}

// Run the debugging tool
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  debugProjectIdIssue,
  debugStoryCompletionIssue,
  debugEnvironmentDifferences
}
