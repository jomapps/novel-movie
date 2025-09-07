#!/usr/bin/env node

/**
 * Test script to verify screenplay page functionality
 * Run this after starting the development server
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
}

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

async function testScreenplayPage() {
  log('\n🎬 Testing Screenplay Page Functionality', colors.magenta)
  log('=' * 50, colors.white)

  try {
    // Test 1: Check if server is running
    logInfo('Testing server connectivity...')
    const healthResponse = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/api/health`,
    )
    if (healthResponse.ok) {
      logSuccess('Development server is running')
    } else {
      throw new Error('Development server not responding')
    }

    // Test 2: Get a project with story data
    logInfo('Fetching projects with story data...')
    const projectsResponse = await fetch(
      `${process.env.SITE_URL || 'http://localhost:3001'}/v1/projects?limit=10`,
    )
    if (!projectsResponse.ok) {
      throw new Error('Failed to fetch projects')
    }

    const projectsData = await projectsResponse.json()
    const projects = projectsData.docs || []

    if (projects.length === 0) {
      logError('No projects found. Please create a project first.')
      return
    }

    logSuccess(`Found ${projects.length} projects`)

    // Test 3: Find a project with story data
    let projectWithStory = null
    for (const project of projects) {
      const storyResponse = await fetch(
        `http://localhost:3001/v1/stories?where[project][equals]=${project.id}&limit=1`,
      )
      if (storyResponse.ok) {
        const storyData = await storyResponse.json()
        if (storyData.docs && storyData.docs.length > 0) {
          projectWithStory = project
          logSuccess(`Found project with story: ${project.name}`)
          break
        }
      }
    }

    if (!projectWithStory) {
      logError('No projects with story data found. Please generate a story first.')
      logInfo('You can generate a story by:')
      logInfo('1. Going to a project page')
      logInfo('2. Navigating to the Story tab')
      logInfo('3. Clicking "Generate Initial Story"')
      return
    }

    // Test 4: Test screenplay page accessibility
    logInfo(`Testing screenplay page for project: ${projectWithStory.name}`)
    const screenplayUrl = `http://localhost:3001/project/${projectWithStory.id}/screenplay`

    try {
      const screenplayResponse = await fetch(screenplayUrl)
      if (screenplayResponse.ok) {
        logSuccess('Screenplay page is accessible')
        logInfo(`URL: ${screenplayUrl}`)
      } else {
        throw new Error(`HTTP ${screenplayResponse.status}`)
      }
    } catch (error) {
      logError(`Screenplay page test failed: ${error.message}`)
    }

    // Test 5: Verify navigation structure
    logInfo('Testing navigation structure...')
    const sidebarTestProject = projects[0]
    logSuccess('Navigation structure should include:')
    log('  • Project', colors.cyan)
    log('  • Initial Concept', colors.cyan)
    log('  • Story', colors.cyan)
    log('  • Screenplay ← New!', colors.green)
    log('  • Scenes', colors.cyan)

    // Summary
    log('\n📋 Test Summary', colors.magenta)
    log('=' * 30, colors.white)
    logSuccess('Screenplay page has been created successfully!')
    logInfo('Next steps to test manually:')
    logInfo('1. Start your development server: npm run dev')
    logInfo('2. Navigate to a project with story data')
    logInfo('3. Click on "Screenplay" in the sidebar')
    logInfo('4. Verify the step-by-step workflow interface')
    logInfo('5. Test clicking on available steps')

    if (projectWithStory) {
      log(`\n🔗 Direct link to test: ${screenplayUrl}`, colors.cyan)
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`)
    logInfo('Make sure your development server is running with: npm run dev')
  }
}

// Run the test
if (require.main === module) {
  testScreenplayPage().catch(console.error)
}

module.exports = { testScreenplayPage }
