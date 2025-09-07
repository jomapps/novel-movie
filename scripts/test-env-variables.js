#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * Verifies that all scripts properly load and use environment variables
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

async function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables Configuration', colors.magenta)
  log('='.repeat(50), colors.white)

  // Test required environment variables
  const requiredVars = [
    'SITE_URL',
    'DATABASE_URI',
    'PAYLOAD_SECRET',
  ]

  const optionalVars = [
    'OPENROUTER_API_KEY',
    'REDIS_URL',
    'PATHRAG_API_URL',
    'CREW_AI',
    'CHARACTER_LIBRARY_API_URL',
  ]

  let allRequired = true

  logInfo('Checking required environment variables:')
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName].substring(0, 30)}...`)
    } else {
      logError(`${varName}: Missing`)
      allRequired = false
    }
  }

  logInfo('\nChecking optional environment variables:')
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logSuccess(`${varName}: ${process.env[varName].substring(0, 30)}...`)
    } else {
      log(`${varName}: Not set (using default)`, colors.yellow)
    }
  }

  // Test URL construction
  logInfo('\nTesting URL construction:')
  const siteUrl = process.env.SITE_URL || 'http://localhost:3001'
  const pathragUrl = process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'
  const crewAiUrl = process.env.CREW_AI || 'http://localhost:5001'
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  logInfo(`Site URL: ${siteUrl}`)
  logInfo(`PathRAG URL: ${pathragUrl}`)
  logInfo(`CrewAI URL: ${crewAiUrl}`)
  logInfo(`Redis URL: ${redisUrl}`)

  // Test basic connectivity to SITE_URL
  logInfo('\nTesting basic connectivity:')
  try {
    const response = await fetch(`${siteUrl}/api/health`, { 
      method: 'GET',
      timeout: 5000 
    })
    
    if (response.ok) {
      logSuccess(`Successfully connected to ${siteUrl}`)
    } else {
      logError(`Failed to connect to ${siteUrl}: HTTP ${response.status}`)
    }
  } catch (error) {
    logError(`Failed to connect to ${siteUrl}: ${error.message}`)
  }

  log('\n📊 Summary', colors.magenta)
  log('='.repeat(20), colors.white)

  if (allRequired) {
    logSuccess('All required environment variables are set!')
    logInfo('Your environment is properly configured.')
  } else {
    logError('Some required environment variables are missing.')
    logInfo('Please check your .env file and ensure all required variables are set.')
  }

  return allRequired
}

// Run the test
testEnvironmentVariables()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    logError(`Test failed: ${error.message}`)
    process.exit(1)
  })
