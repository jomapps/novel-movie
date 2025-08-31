/**
 * Simple PathRAG Integration Test (ES Module)
 * Tests basic connectivity and functionality
 */

// Simple PathRAG service implementation for testing
class PathRAGService {
  static baseUrl = process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'

  static async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) {
      throw new Error(`PathRAG health check failed: ${response.statusText}`)
    }
    return await response.json()
  }

  static async getStats() {
    const response = await fetch(`${this.baseUrl}/stats`)
    if (!response.ok) {
      throw new Error(`PathRAG stats failed: ${response.statusText}`)
    }
    return await response.json()
  }

  static async insertDocuments(documents) {
    const response = await fetch(`${this.baseUrl}/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents }),
    })

    if (!response.ok) {
      throw new Error(`PathRAG insert failed: ${response.statusText}`)
    }

    return await response.json()
  }

  static async insertCustomKG(customKG) {
    const response = await fetch(`${this.baseUrl}/insert_custom_kg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_kg: customKG }),
    })

    if (!response.ok) {
      throw new Error(`PathRAG custom KG insert failed: ${response.statusText}`)
    }

    return await response.json()
  }

  static async query(query, params = {}) {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params }),
    })

    if (!response.ok) {
      throw new Error(`PathRAG query failed: ${response.statusText}`)
    }

    return await response.json()
  }
}

async function testBasicConnectivity() {
  console.log('🔍 Testing PathRAG Basic Connectivity...')

  try {
    // Test health check
    const health = await PathRAGService.healthCheck()
    console.log('✅ PathRAG Health Check:', health)

    // Skip stats test as endpoint may not be available
    console.log('ℹ️ Skipping stats check - endpoint may not be available')

    return true
  } catch (error) {
    console.log('❌ PathRAG connectivity failed:', error.message)
    return false
  }
}

async function testBasicInsertion() {
  console.log('\n💾 Testing Basic Document Insertion...')

  try {
    const testDocument = `
      Test Story: The Magician's Last Performance
      
      In a grand theatre, Alistair the Great prepares for his final escape trick.
      The audience watches in anticipation as he enters the water-filled coffin.
      But something goes wrong - the magic becomes real, and terror ensues.
      
      Characters: Alistair (protagonist), Elena (assistant), The Audience
      Location: Grand Theatre, Water Tank, Stage
      Themes: Magic vs Reality, Hubris, Performance, Death
    `

    const result = await PathRAGService.insertDocuments(testDocument)
    console.log('✅ Document inserted successfully:', result)

    return true
  } catch (error) {
    console.log('❌ Document insertion failed:', error.message)
    return false
  }
}

async function testBasicQuerying() {
  console.log('\n🔍 Testing Basic Querying...')

  const testQueries = [
    'Who is Alistair?',
    'What happens in the theatre?',
    'What are the main themes?',
    'Describe the water tank scene',
  ]

  for (const query of testQueries) {
    try {
      console.log(`\n❓ Query: "${query}"`)

      const result = await PathRAGService.query(query, {
        mode: 'hybrid',
        top_k: 5,
        response_type: 'Brief Answer',
      })

      console.log('✅ Full Response:', JSON.stringify(result, null, 2))
      if (result.result) {
        console.log('📝 Result Text:', result.result.substring(0, 150) + '...')
      }

      // Small delay between queries
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`❌ Query failed: ${error.message}`)
    }
  }
}

async function testCustomKnowledgeGraph() {
  console.log('\n🕸️ Testing Custom Knowledge Graph Insertion...')

  try {
    const customKG = {
      chunks: [
        'Scene 1: Alistair performs his final escape trick in a grand theatre',
        'Character: Alistair is a master magician who debunks supernatural claims',
        'Location: The theatre is old and atmospheric with a single spotlight',
      ],
      entities: [
        {
          name: 'Alistair_The_Great',
          type: 'Character',
          description: 'Master magician and protagonist of the story',
          metadata: { role: 'protagonist', age: '40s' },
        },
        {
          name: 'Grand_Theatre',
          type: 'Location',
          description: 'Old vaudeville theatre where the story takes place',
          metadata: { atmosphere: 'dramatic', condition: 'decaying' },
        },
        {
          name: 'Escape_Trick',
          type: 'Event',
          description: 'The final performance that goes terribly wrong',
          metadata: { type: 'underwater_escape', danger_level: 'high' },
        },
      ],
      relationships: [
        {
          source: 'Alistair_The_Great',
          target: 'Grand_Theatre',
          relation: 'PERFORMS_IN',
        },
        {
          source: 'Alistair_The_Great',
          target: 'Escape_Trick',
          relation: 'ATTEMPTS',
        },
        {
          source: 'Escape_Trick',
          target: 'Grand_Theatre',
          relation: 'TAKES_PLACE_IN',
        },
      ],
    }

    const result = await PathRAGService.insertCustomKG(customKG)
    console.log('✅ Custom Knowledge Graph inserted:', result)

    return true
  } catch (error) {
    console.log('❌ Custom KG insertion failed:', error.message)
    return false
  }
}

async function testAdvancedQuerying() {
  console.log('\n🧠 Testing Advanced Querying...')

  const advancedQueries = [
    'What is the relationship between Alistair and the theatre?',
    'Describe the escape trick and its dangers',
    'What entities are connected to the Grand Theatre?',
    'Find all characters and their roles',
  ]

  for (const query of advancedQueries) {
    try {
      console.log(`\n❓ Advanced Query: "${query}"`)

      const result = await PathRAGService.query(query, {
        mode: 'hybrid',
        top_k: 10,
        response_type: 'Detailed Analysis',
        only_need_context: false,
      })

      console.log('✅ Response:', result.result.substring(0, 200) + '...')

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ Advanced query failed: ${error.message}`)
    }
  }
}

async function runSimpleTest() {
  console.log('🚀 Starting Simple PathRAG Integration Test')
  console.log('='.repeat(50))

  // Test 1: Basic Connectivity
  const isConnected = await testBasicConnectivity()
  if (!isConnected) {
    console.log('\n❌ Aborting tests - PathRAG not accessible')
    return
  }

  // Test 2: Basic Document Insertion
  const insertionSuccess = await testBasicInsertion()

  // Test 3: Basic Querying
  await testBasicQuerying()

  // Test 4: Custom Knowledge Graph
  const kgSuccess = await testCustomKnowledgeGraph()

  // Test 5: Advanced Querying
  if (kgSuccess) {
    await testAdvancedQuerying()
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 Simple PathRAG Integration Test Complete!')
  console.log('\n📋 Summary:')
  console.log(`✅ PathRAG Connected: ${isConnected}`)
  console.log(`✅ Document Insertion: ${insertionSuccess}`)
  console.log(`✅ Knowledge Graph Insertion: ${kgSuccess}`)
  console.log('\n🔗 Next Steps:')
  console.log('1. Integrate with actual Novel Movie story data')
  console.log('2. Implement CrewAI agents using PathRAG')
  console.log('3. Test with full story processing pipeline')
}

// Run the test
runSimpleTest().catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
