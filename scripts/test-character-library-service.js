#!/usr/bin/env node

/**
 * Character Library Service Connectivity Test
 * Tests basic API connectivity and functionality with the external character library service
 */

import https from 'https'
import http from 'http'

// Configuration
const CHARACTER_LIBRARY_API_URL = process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc'
const BASE_URL = CHARACTER_LIBRARY_API_URL

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Novel-Movie-Test-Client/1.0',
        ...options.headers,
      },
    }

    const req = client.request(requestOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message,
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

// Test functions
async function testBasicConnectivity() {
  console.log('\n🔍 Testing Basic Connectivity...')
  console.log(`Target URL: ${BASE_URL}`)

  try {
    const response = await makeRequest(`${BASE_URL}/api/characters`)
    console.log(`✅ Connection successful - Status: ${response.statusCode}`)

    if (response.statusCode === 200) {
      console.log(`📊 Response data type: ${typeof response.data}`)
      if (response.data && response.data.docs) {
        console.log(`📋 Characters found: ${response.data.docs.length}`)
      }
      return true
    } else {
      console.log(`⚠️  Unexpected status code: ${response.statusCode}`)
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    return false
  }
}

async function testCharacterQuery() {
  console.log('\n🔍 Testing Character Query API...')

  try {
    const queryPayload = {
      query: 'Tell me about available characters',
      options: {
        responseType: 'Multiple Paragraphs',
        topK: 10,
        onlyContext: false,
      },
    }

    const response = await makeRequest(`${BASE_URL}/api/characters/query`, {
      method: 'POST',
      body: queryPayload,
    })

    console.log(`✅ Query API response - Status: ${response.statusCode}`)

    if (response.statusCode === 200) {
      console.log(`📝 Query successful`)
      if (response.data && response.data.response) {
        console.log(`📄 Response length: ${response.data.response.length} characters`)
      }
      return true
    } else {
      console.log(`⚠️  Query failed - Status: ${response.statusCode}`)
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Query test failed: ${error.message}`)
    return false
  }
}

async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...')

  try {
    // Try common health check endpoints
    const healthEndpoints = ['/health', '/api/health', '/status', '/api/status']

    for (const endpoint of healthEndpoints) {
      try {
        const response = await makeRequest(`${BASE_URL}${endpoint}`)
        if (response.statusCode === 200) {
          console.log(`✅ Health check successful at ${endpoint}`)
          console.log(`📊 Health data: ${JSON.stringify(response.data, null, 2)}`)
          return true
        }
      } catch (error) {
        // Continue to next endpoint
      }
    }

    console.log(`⚠️  No standard health check endpoint found`)
    return false
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`)
    return false
  }
}

async function testServiceCapabilities() {
  console.log('\n🔍 Testing Service Capabilities...')

  try {
    // Test if we can get service info or documentation
    const infoEndpoints = ['/api', '/api/docs', '/docs', '/']

    for (const endpoint of infoEndpoints) {
      try {
        const response = await makeRequest(`${BASE_URL}${endpoint}`)
        if (response.statusCode === 200) {
          console.log(`✅ Service info available at ${endpoint}`)
          if (typeof response.data === 'object') {
            console.log(`📋 Available endpoints or info: ${Object.keys(response.data).join(', ')}`)
          }
          return true
        }
      } catch (error) {
        // Continue to next endpoint
      }
    }

    console.log(`⚠️  No service info endpoint found`)
    return false
  } catch (error) {
    console.log(`❌ Service capabilities test failed: ${error.message}`)
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Character Library Service Connectivity Test')
  console.log('='.repeat(50))

  const results = {
    connectivity: false,
    query: false,
    health: false,
    capabilities: false,
  }

  // Run all tests
  results.connectivity = await testBasicConnectivity()
  results.query = await testCharacterQuery()
  results.health = await testHealthCheck()
  results.capabilities = await testServiceCapabilities()

  // Summary
  console.log('\n📊 Test Results Summary')
  console.log('='.repeat(30))

  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length

  Object.entries(results).forEach(([test, passed]) => {
    console.log(
      `${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}: ${passed ? 'PASSED' : 'FAILED'}`,
    )
  })

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`)

  if (results.connectivity) {
    console.log('\n✅ Service is accessible and ready for integration')
  } else {
    console.log('\n❌ Service connectivity issues detected')
    console.log('💡 Consider using git submodule approach for better control')
  }

  return results
}

// Run tests if called directly
const isMainModule =
  import.meta.url.endsWith(process.argv[1]) ||
  import.meta.url.includes('test-character-library-service.js')

if (isMainModule) {
  runTests().catch(console.error)
}

export { runTests, testBasicConnectivity, testCharacterQuery }
