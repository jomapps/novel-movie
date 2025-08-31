/**
 * Test PathRAG Integration with Novel Movie Stories
 * This script tests the PathRAG service integration and story processing
 */

// Import using require for Node.js compatibility
const { PathRAGService } = require('./agents/services/pathrag-service.ts')
const { DataService } = require('./agents/services/data-service.ts')

// Test configuration
const TEST_PROJECT_ID = '68b2cc1491e1bd4a09118274' // The Magician project ID from the API response

async function testPathRAGConnectivity() {
  console.log('🔍 Testing PathRAG Connectivity...')

  try {
    const connectionTest = await PathRAGService.testConnection()

    if (connectionTest.healthy) {
      console.log('✅ PathRAG is healthy and connected')
      console.log('📊 PathRAG Stats:', {
        documents: connectionTest.stats?.total_documents,
        entities: connectionTest.stats?.total_entities,
        relationships: connectionTest.stats?.total_relationships,
        cacheHitRate: connectionTest.stats?.cache_hit_rate,
      })
      return true
    } else {
      console.log('❌ PathRAG connection failed:', connectionTest.error)
      return false
    }
  } catch (error) {
    console.log('❌ PathRAG connectivity test failed:', error.message)
    return false
  }
}

async function testStoryDataRetrieval() {
  console.log('\n📖 Testing Story Data Retrieval...')

  try {
    const storyData = await DataService.getStoryData(TEST_PROJECT_ID)

    if (storyData) {
      console.log('✅ Story data retrieved successfully')
      console.log('📝 Story Info:', {
        projectName: storyData.projectName,
        currentStep: storyData.currentStep,
        status: storyData.status,
        overallQuality: storyData.qualityMetrics?.overallQuality,
        contentLength: storyData.currentContent?.length,
      })
      return storyData
    } else {
      console.log('❌ No story found for project:', TEST_PROJECT_ID)
      return null
    }
  } catch (error) {
    console.log('❌ Story data retrieval failed:', error.message)
    return null
  }
}

async function testStoryParsing(storyData) {
  console.log('\n🔍 Testing Story Parsing...')

  try {
    const storyGraph = DataService.parseStoryIntoScenes(storyData.currentContent, TEST_PROJECT_ID)

    console.log('✅ Story parsed successfully')
    console.log('📊 Story Graph:', {
      scenes: storyGraph.scenes.length,
      characters: storyGraph.characters.length,
      locations: storyGraph.locations.length,
      themes: storyGraph.themes.length,
      relationships: storyGraph.relationships.length,
    })

    console.log(
      '👥 Characters found:',
      storyGraph.characters.map((c) => c.name),
    )
    console.log(
      '📍 Locations found:',
      storyGraph.locations.map((l) => l.name),
    )
    console.log(
      '🎭 Themes found:',
      storyGraph.themes.map((t) => t.name),
    )

    return storyGraph
  } catch (error) {
    console.log('❌ Story parsing failed:', error.message)
    return null
  }
}

async function testPathRAGInsertion(storyGraph) {
  console.log('\n💾 Testing PathRAG Knowledge Graph Insertion...')

  try {
    const result = await DataService.saveStoryGraph(TEST_PROJECT_ID, storyGraph)

    console.log('✅ Story graph saved to PathRAG successfully')
    console.log('📊 Insertion Results:', {
      entities: result.entities_count,
      relationships: result.relationships_count,
      chunks: result.chunks_count,
      message: result.message,
    })

    return true
  } catch (error) {
    console.log('❌ PathRAG insertion failed:', error.message)
    return false
  }
}

async function testPathRAGQuerying() {
  console.log('\n🔍 Testing PathRAG Natural Language Querying...')

  const testQueries = [
    'What characters are in The Magician project?',
    'Describe the main scene in the theatre',
    'What themes are explored in this story?',
    'What is the emotional arc of the protagonist?',
    'What locations are featured in the story?',
  ]

  for (const query of testQueries) {
    try {
      console.log(`\n❓ Query: "${query}"`)

      const result = await DataService.queryStoryElements(TEST_PROJECT_ID, query)

      console.log('✅ Query successful')
      console.log('📝 Response:', result.result?.substring(0, 200) + '...')

      // Small delay between queries
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ Query failed: ${error.message}`)
    }
  }
}

async function testSceneContextRetrieval() {
  console.log('\n🎬 Testing Scene Context Retrieval...')

  try {
    const sceneContext = await DataService.getSceneContext(TEST_PROJECT_ID, 'scene_001')

    console.log('✅ Scene context retrieved successfully')
    console.log('📝 Context:', sceneContext.result?.substring(0, 300) + '...')

    return true
  } catch (error) {
    console.log('❌ Scene context retrieval failed:', error.message)
    return false
  }
}

async function runFullTest() {
  console.log('🚀 Starting PathRAG Integration Test Suite')
  console.log('='.repeat(50))

  // Test 1: PathRAG Connectivity
  const isConnected = await testPathRAGConnectivity()
  if (!isConnected) {
    console.log('\n❌ Aborting tests - PathRAG not accessible')
    return
  }

  // Test 2: Story Data Retrieval
  const storyData = await testStoryDataRetrieval()
  if (!storyData) {
    console.log('\n❌ Aborting tests - No story data available')
    return
  }

  // Test 3: Story Parsing
  const storyGraph = await testStoryParsing(storyData)
  if (!storyGraph) {
    console.log('\n❌ Aborting tests - Story parsing failed')
    return
  }

  // Test 4: PathRAG Insertion
  const insertionSuccess = await testPathRAGInsertion(storyGraph)
  if (!insertionSuccess) {
    console.log('\n❌ PathRAG insertion failed, but continuing with query tests')
  }

  // Test 5: PathRAG Querying
  await testPathRAGQuerying()

  // Test 6: Scene Context Retrieval
  await testSceneContextRetrieval()

  console.log('\n' + '='.repeat(50))
  console.log('🎉 PathRAG Integration Test Suite Complete!')
  console.log('\n📋 Summary:')
  console.log(`✅ PathRAG Connected: ${isConnected}`)
  console.log(`✅ Story Data Retrieved: ${!!storyData}`)
  console.log(`✅ Story Parsed: ${!!storyGraph}`)
  console.log(`✅ Knowledge Graph Inserted: ${insertionSuccess}`)
  console.log('\n🔗 Next Steps:')
  console.log('1. Review query results for accuracy')
  console.log('2. Implement CrewAI agents using this PathRAG integration')
  console.log('3. Test with additional stories')
  console.log('4. Deploy to Ubuntu server when ready')
}

// Run the test suite
runFullTest().catch((error) => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
