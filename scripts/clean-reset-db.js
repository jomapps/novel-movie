#!/usr/bin/env node

/**
 * Clean Database Reset Script
 * Drops the entire database and reseeds with fresh data
 * Use this during development when you don't need to preserve any data
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
  reset: '\x1b[0m'
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

async function cleanResetDatabase() {
  log('\n🔄 Clean Database Reset', colors.magenta)
  log('='.repeat(50), colors.white)

  logWarning('This will PERMANENTLY DELETE all data in the database!')
  logInfo('This is intended for development use only.')

  try {
    // Step 1: Drop the database
    logInfo('Step 1: Dropping database...')
    const { spawn } = await import('child_process')
    
    const dropProcess = spawn('npm', ['run', 'db:drop'], {
      stdio: 'inherit',
      shell: true
    })

    await new Promise((resolve, reject) => {
      dropProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Database dropped successfully')
          resolve()
        } else {
          reject(new Error(`Database drop failed with code ${code}`))
        }
      })
    })

    // Step 2: Seed the database
    logInfo('Step 2: Seeding database with fresh data...')
    
    const seedProcess = spawn('npm', ['run', 'db:seed'], {
      stdio: 'inherit',
      shell: true
    })

    await new Promise((resolve, reject) => {
      seedProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Database seeded successfully')
          resolve()
        } else {
          reject(new Error(`Database seed failed with code ${code}`))
        }
      })
    })

    // Step 3: Verify the reset
    logInfo('Step 3: Verifying database reset...')
    
    const checkProcess = spawn('npm', ['run', 'db:seed-check'], {
      stdio: 'inherit',
      shell: true
    })

    await new Promise((resolve, reject) => {
      checkProcess.on('close', (code) => {
        if (code === 0) {
          logSuccess('Database verification completed')
          resolve()
        } else {
          logWarning('Database verification had issues (check output above)')
          resolve() // Don't fail the whole process
        }
      })
    })

    // Success summary
    log('\n🎉 Clean Database Reset Complete!', colors.green)
    log('='.repeat(40), colors.white)
    logSuccess('Database has been completely reset with fresh data')
    logInfo('You can now:')
    logInfo('1. Create new projects with separated Tone and Mood fields')
    logInfo('2. Test the updated project creation form')
    logInfo('3. Verify AI generation works with both fields')
    
    log('\n🔗 Next Steps:', colors.cyan)
    logInfo('• Start your development server: npm run dev')
    logInfo('• Visit: https://local.ft.tc/project/create')
    logInfo('• Test the separated Tone and Mood fields')

  } catch (error) {
    logError(`Clean reset failed: ${error.message}`)
    logInfo('You may need to:')
    logInfo('1. Ensure your development server is stopped')
    logInfo('2. Check your database connection')
    logInfo('3. Verify npm scripts are working')
    process.exit(1)
  }
}

// Run the clean reset
cleanResetDatabase().catch(console.error)
