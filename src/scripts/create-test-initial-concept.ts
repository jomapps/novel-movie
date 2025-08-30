/**
 * Create Test Initial Concept Script
 * Creates a minimal initial concept record for testing AI auto-fill
 * 
 * Usage: payload run src/scripts/create-test-initial-concept.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// Get project ID from command line or use default for testing
const projectId = process.argv[2] || '68b250c3e4dbb7b901bb137c'

console.log(`🎯 Using project ID: ${projectId}`)

async function createTestInitialConcept() {
  try {
    console.log('🔗 Connecting to Payload...')
    const payload = await getPayload({ config })

    console.log(`🎯 Creating initial concept for project: ${projectId}`)

    // Get some seed data for the required fields
    const genres = await payload.find({
      collection: 'genres',
      limit: 3,
    })

    const audienceDemographics = await payload.find({
      collection: 'audience-demographics',
      limit: 2,
    })

    const toneOptions = await payload.find({
      collection: 'tone-options',
      limit: 2,
    })

    if (genres.docs.length === 0 || audienceDemographics.docs.length === 0 || toneOptions.docs.length === 0) {
      console.error('❌ Missing seed data. Please run: npm run db:seed')
      process.exit(1)
    }

    // Check if initial concept already exists
    const existing = await payload.find({
      collection: 'initial-concepts',
      where: {
        project: {
          equals: projectId,
        },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log('✅ Initial concept already exists!')
      console.log(`   ID: ${existing.docs[0].id}`)
      console.log(`   Project: ${projectId}`)
      return
    }

    // Create initial concept with minimal valid data
    const initialConcept = await payload.create({
      collection: 'initial-concepts',
      data: {
        project: projectId,
        primaryGenres: [genres.docs[0].id, genres.docs[1].id],
        corePremise: 'A compelling story waiting to be developed.',
        targetAudience: [audienceDemographics.docs[0].id],
        tone: [toneOptions.docs[0].id],
      },
    })

    console.log('✅ Initial concept created successfully!')
    console.log(`   ID: ${initialConcept.id}`)
    console.log(`   Project: ${projectId}`)
    console.log(`   Genres: ${genres.docs.slice(0, 2).map((g: any) => g.name).join(', ')}`)
    console.log(`   Target Audience: ${audienceDemographics.docs[0].name}`)
    console.log(`   Tone: ${toneOptions.docs[0].name}`)
    console.log(`\n🧪 Now you can test AI auto-fill by:`)
    console.log(`   1. Clearing some fields in the form`)
    console.log(`   2. Clicking the AI Auto-fill button`)
    console.log(`   3. Watching it generate missing content`)

  } catch (error: any) {
    console.error('❌ Error creating initial concept:', error.message)
    process.exit(1)
  }
}

// Run the script
createTestInitialConcept()
