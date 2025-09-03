#!/usr/bin/env node

/**
 * Check if database has been properly seeded with required collections
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

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

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

async function checkCollection(name, endpoint, minExpected = 1) {
  try {
    const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}${endpoint}`)

    if (!response.ok) {
      logError(`${name}: HTTP ${response.status}`)
      return false
    }

    const data = await response.json()

    if (data.success) {
      const count = data.data?.docs?.length || data.data?.length || 0
      if (count >= minExpected) {
        logSuccess(`${name}: ${count} items`)
        return true
      } else {
        logWarning(`${name}: Only ${count} items (expected at least ${minExpected})`)
        return false
      }
    } else {
      logError(`${name}: API returned error - ${data.error}`)
      return false
    }
  } catch (error) {
    logError(`${name}: ${error.message}`)
    return false
  }
}

async function checkDatabaseSeed() {
  log('\n🗄️  Checking Database Seed Status', colors.magenta)
  log('='.repeat(50), colors.white)

  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'
  logInfo(`Testing connection to: ${baseUrl}`)

  // Test basic connectivity first
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    if (!healthResponse.ok) {
      throw new Error(`Server not responding: HTTP ${healthResponse.status}`)
    }
    logSuccess('Server is running')
  } catch (error) {
    logError(`Cannot connect to server: ${error.message}`)
    logInfo('Make sure your development server is running with: npm run dev')
    return false
  }

  const collections = [
    { name: 'Movie Formats', endpoint: '/v1/movie-formats', minExpected: 5 },
    { name: 'Movie Styles', endpoint: '/v1/movie-styles', minExpected: 5 },
    { name: 'Genres', endpoint: '/v1/config/genres', minExpected: 10 },
    { name: 'Audience Demographics', endpoint: '/v1/config/audience-demographics', minExpected: 5 },
    { name: 'Tone Options', endpoint: '/v1/config/tone-options', minExpected: 5 },
    { name: 'Central Themes', endpoint: '/v1/config/central-themes', minExpected: 5 },
    { name: 'Mood Descriptors', endpoint: '/v1/config/mood-descriptors', minExpected: 5 },
    { name: 'Cinematography Styles', endpoint: '/v1/config/cinematography-styles', minExpected: 5 },
  ]

  let allGood = true
  const results = []

  for (const collection of collections) {
    const result = await checkCollection(
      collection.name,
      collection.endpoint,
      collection.minExpected,
    )
    results.push({ ...collection, success: result })
    if (!result) allGood = false
  }

  log('\n📊 Summary', colors.magenta)
  log('='.repeat(20), colors.white)

  if (allGood) {
    logSuccess('All collections are properly seeded!')
    logInfo('Your database is ready for project creation.')
  } else {
    logWarning('Some collections are missing or incomplete.')
    logInfo('Run the seed script to populate the database:')
    log('  npm run db:seed', colors.cyan)
    log('  # or', colors.gray)
    log('  pnpm run db:seed', colors.cyan)
  }

  // Show failed collections
  const failed = results.filter((r) => !r.success)
  if (failed.length > 0) {
    log('\n❌ Collections needing attention:', colors.red)
    failed.forEach((collection) => {
      log(`  • ${collection.name}`, colors.yellow)
    })
  }

  return allGood
}

// Always run the check when this script is executed directly
checkDatabaseSeed()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    logError(`Check failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  })

export { checkDatabaseSeed }
