#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates a backup of the current MongoDB database using mongodump
 * Saves backup to /backups/db/ directory with timestamp
 * 
 * Usage: npm run db:backup
 */

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const DATABASE_URI = process.env.DATABASE_URI

if (!DATABASE_URI) {
  console.error('❌ DATABASE_URI not found in environment variables')
  process.exit(1)
}

function parseMongoUri(uri) {
  // Parse MongoDB URI: mongodb://host:port/database
  const match = uri.match(/mongodb:\/\/([^\/]+)\/(.+)/)
  if (!match) {
    throw new Error('Invalid MongoDB URI format')
  }
  
  const [, hostPort, database] = match
  const [host, port = '27017'] = hostPort.split(':')
  
  return { host, port, database }
}

async function createBackup() {
  try {
    const { host, port, database } = parseMongoUri(DATABASE_URI)
    
    // Create timestamp for backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupName = `${database}_${timestamp}`
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.resolve(__dirname, '../backups/db')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
      console.log('📁 Created backups directory:', backupsDir)
    }
    
    const backupPath = path.join(backupsDir, backupName)
    
    console.log('🔗 Starting database backup...')
    console.log(`   Database: ${database}`)
    console.log(`   Host: ${host}:${port}`)
    console.log(`   Backup path: ${backupPath}`)
    
    // Run mongodump command
    const mongodumpArgs = [
      '--host', `${host}:${port}`,
      '--db', database,
      '--out', backupPath
    ]
    
    console.log(`\n🚀 Running: mongodump ${mongodumpArgs.join(' ')}`)
    
    const mongodump = spawn('mongodump', mongodumpArgs, {
      stdio: ['inherit', 'pipe', 'pipe']
    })
    
    let output = ''
    let errorOutput = ''
    
    mongodump.stdout.on('data', (data) => {
      output += data.toString()
      process.stdout.write(data)
    })
    
    mongodump.stderr.on('data', (data) => {
      errorOutput += data.toString()
      process.stderr.write(data)
    })
    
    mongodump.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Database backup completed successfully!')
        console.log(`   Backup saved to: ${backupPath}`)
        
        // Show backup size
        try {
          const stats = fs.statSync(path.join(backupPath, database))
          console.log(`   Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
        } catch (e) {
          // Ignore size calculation errors
        }
        
        console.log(`\n📋 To restore this backup, run:`)
        console.log(`   npm run db:restore ${backupName}`)
        
      } else {
        console.error(`\n❌ mongodump exited with code ${code}`)
        if (errorOutput) {
          console.error('Error output:', errorOutput)
        }
        process.exit(1)
      }
    })
    
    mongodump.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.error('\n❌ mongodump command not found!')
        console.error('   Please install MongoDB tools: https://docs.mongodb.com/database-tools/')
        console.error('   Or install via: brew install mongodb/brew/mongodb-database-tools')
      } else {
        console.error('\n❌ Error running mongodump:', error.message)
      }
      process.exit(1)
    })
    
  } catch (error) {
    console.error('❌ Error creating backup:', error.message)
    process.exit(1)
  }
}

// Run the script
createBackup()
