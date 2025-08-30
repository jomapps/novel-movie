#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores MongoDB database from backup using mongorestore
 * Can restore latest backup or specific backup file
 * 
 * Usage: 
 *   npm run db:restore                    # Restore latest backup
 *   npm run db:restore backup_name        # Restore specific backup
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

function findLatestBackup(backupsDir) {
  if (!fs.existsSync(backupsDir)) {
    throw new Error('Backups directory does not exist. Run "npm run db:backup" first.')
  }
  
  const backups = fs.readdirSync(backupsDir)
    .filter(name => fs.statSync(path.join(backupsDir, name)).isDirectory())
    .sort()
    .reverse()
  
  if (backups.length === 0) {
    throw new Error('No backups found. Run "npm run db:backup" first.')
  }
  
  return backups[0]
}

async function restoreDatabase() {
  try {
    const { host, port, database } = parseMongoUri(DATABASE_URI)
    
    // Get backup name from command line argument or find latest
    const backupName = process.argv[2]
    const backupsDir = path.resolve(__dirname, '../backups/db')
    
    let selectedBackup
    if (backupName) {
      selectedBackup = backupName
      const backupPath = path.join(backupsDir, selectedBackup)
      if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup "${selectedBackup}" not found in ${backupsDir}`)
        console.log('\n📋 Available backups:')
        const availableBackups = fs.readdirSync(backupsDir)
          .filter(name => fs.statSync(path.join(backupsDir, name)).isDirectory())
        availableBackups.forEach(backup => console.log(`   - ${backup}`))
        process.exit(1)
      }
    } else {
      selectedBackup = findLatestBackup(backupsDir)
      console.log(`🔍 No backup specified, using latest: ${selectedBackup}`)
    }
    
    const backupPath = path.join(backupsDir, selectedBackup, database)
    
    console.log('🔗 Starting database restore...')
    console.log(`   Database: ${database}`)
    console.log(`   Host: ${host}:${port}`)
    console.log(`   Backup: ${selectedBackup}`)
    console.log(`   Backup path: ${backupPath}`)
    
    // Verify backup path exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup data not found at: ${backupPath}`)
    }
    
    // Run mongorestore command
    const mongorestoreArgs = [
      '--host', `${host}:${port}`,
      '--db', database,
      '--drop', // Drop existing collections before restoring
      backupPath
    ]
    
    console.log(`\n🚀 Running: mongorestore ${mongorestoreArgs.join(' ')}`)
    
    const mongorestore = spawn('mongorestore', mongorestoreArgs, {
      stdio: ['inherit', 'pipe', 'pipe']
    })
    
    let output = ''
    let errorOutput = ''
    
    mongorestore.stdout.on('data', (data) => {
      output += data.toString()
      process.stdout.write(data)
    })
    
    mongorestore.stderr.on('data', (data) => {
      errorOutput += data.toString()
      process.stderr.write(data)
    })
    
    mongorestore.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Database restore completed successfully!')
        console.log(`   Database "${database}" has been restored from backup: ${selectedBackup}`)
        
      } else {
        console.error(`\n❌ mongorestore exited with code ${code}`)
        if (errorOutput) {
          console.error('Error output:', errorOutput)
        }
        process.exit(1)
      }
    })
    
    mongorestore.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.error('\n❌ mongorestore command not found!')
        console.error('   Please install MongoDB tools: https://docs.mongodb.com/database-tools/')
        console.error('   Or install via: brew install mongodb/brew/mongodb-database-tools')
      } else {
        console.error('\n❌ Error running mongorestore:', error.message)
      }
      process.exit(1)
    })
    
  } catch (error) {
    console.error('❌ Error restoring database:', error.message)
    process.exit(1)
  }
}

// Run the script
restoreDatabase()
