#!/usr/bin/env node

/**
 * Simple test for Character References Collection
 * Tests only the Novel Movie side without Character Library dependency
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testCharacterReferencesAPI() {
  console.log('🧪 Testing Character References API...')
  
  try {
    // Test GET endpoint
    const getResponse = await fetch('http://localhost:3001/api/character-references', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (getResponse.ok) {
      const result = await getResponse.json()
      console.log(`✅ GET /api/character-references: ${result.docs?.length || 0} references found`)
      console.log('📋 Collection structure:', Object.keys(result))
      return true
    } else {
      console.log('❌ GET /api/character-references failed:', getResponse.status)
      return false
    }
    
  } catch (error) {
    console.log('❌ Character references API test failed:', error.message)
    return false
  }
}

async function testProjectsAPI() {
  console.log('🧪 Testing Projects API...')
  
  try {
    // Test GET projects endpoint
    const getResponse = await fetch('http://localhost:3001/api/projects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (getResponse.ok) {
      const result = await getResponse.json()
      console.log(`✅ GET /api/projects: ${result.docs?.length || 0} projects found`)
      
      if (result.docs && result.docs.length > 0) {
        const firstProject = result.docs[0]
        console.log(`📋 First project: ${firstProject.name} (ID: ${firstProject.id})`)
        return firstProject.id
      }
      return null
    } else {
      console.log('❌ GET /api/projects failed:', getResponse.status)
      return null
    }
    
  } catch (error) {
    console.log('❌ Projects API test failed:', error.message)
    return null
  }
}

async function testCharacterDevelopmentEndpoint(projectId) {
  console.log('🧪 Testing Character Development Endpoint (without Character Library)...')
  
  if (!projectId) {
    console.log('⚠️ No project ID available, skipping character development test')
    return false
  }
  
  try {
    // Test GET endpoint first
    const getResponse = await fetch(`http://localhost:3001/v1/projects/${projectId}/character-development`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (getResponse.ok) {
      const result = await getResponse.json()
      console.log(`✅ GET character-development: ${result.characters?.length || 0} characters found`)
      return true
    } else {
      const error = await getResponse.text()
      console.log('❌ GET character-development failed:', getResponse.status, error)
      return false
    }
    
  } catch (error) {
    console.log('❌ Character development endpoint test failed:', error.message)
    return false
  }
}

async function runBasicTests() {
  console.log('🚀 Starting Basic Character Architecture Tests (No External Dependencies)\n')
  
  const results = {
    characterReferencesAPI: false,
    projectsAPI: false,
    characterDevelopmentEndpoint: false
  }
  
  // Test 1: Character References API
  console.log('='.repeat(60))
  results.characterReferencesAPI = await testCharacterReferencesAPI()
  
  // Test 2: Projects API (to get a real project ID)
  console.log('\n' + '='.repeat(60))
  const projectId = await testProjectsAPI()
  results.projectsAPI = !!projectId
  
  // Test 3: Character Development Endpoint
  console.log('\n' + '='.repeat(60))
  results.characterDevelopmentEndpoint = await testCharacterDevelopmentEndpoint(projectId)
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 BASIC TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  
  console.log(`Character References API: ${results.characterReferencesAPI ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Projects API: ${results.projectsAPI ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Character Development Endpoint: ${results.characterDevelopmentEndpoint ? '✅ PASS' : '❌ FAIL'}`)
  
  const passCount = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`)
  
  if (passCount === totalTests) {
    console.log('🎉 All basic tests passed! Character architecture is working.')
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.')
  }
  
  return results
}

// Run tests directly
runBasicTests().catch(console.error)
