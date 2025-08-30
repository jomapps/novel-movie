#!/usr/bin/env node

/**
 * Database Drop Script
 * Completely drops/deletes the entire MongoDB database
 * 
 * Usage: npm run db:drop
 */

import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const DATABASE_URI = process.env.DATABASE_URI

if (!DATABASE_URI) {
  console.error('❌ DATABASE_URI not found in environment variables')
  process.exit(1)
}

async function dropDatabase() {
  let client

  try {
    console.log('🔗 Connecting to MongoDB...')
    client = new MongoClient(DATABASE_URI)
    await client.connect()

    // Extract database name from URI
    const dbName = DATABASE_URI.split('/').pop()
    console.log(`🎯 Target database: ${dbName}`)

    const db = client.db(dbName)
    
    // List all collections before dropping
    const collections = await db.listCollections().toArray()
    console.log(`📋 Found ${collections.length} collections:`)
    collections.forEach(col => console.log(`   - ${col.name}`))

    // Confirm before dropping
    console.log('\n⚠️  WARNING: This will permanently delete ALL data in the database!')
    console.log('   This action cannot be undone.')
    
    // In development, we'll proceed automatically
    // In production, you might want to add a confirmation prompt
    
    console.log('\n🗑️  Dropping database...')
    await db.dropDatabase()
    
    console.log('✅ Database dropped successfully!')
    console.log(`   Database "${dbName}" and all its collections have been deleted.`)
    
  } catch (error) {
    console.error('❌ Error dropping database:', error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run the script
dropDatabase()
