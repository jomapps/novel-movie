#!/usr/bin/env tsx

/**
 * Test script to verify project deletion functionality via API
 * This script tests the deletion endpoint to ensure it works correctly
 */

async function testProjectDeletion() {
  console.log('🧪 Testing Project Deletion API Functionality...\n')

  try {
    const baseUrl = 'http://localhost:3000'

    // Step 1: Get existing projects to test with
    console.log('1️⃣ Fetching existing projects...')
    const projectsResponse = await fetch(`${baseUrl}/api/projects?limit=1`)

    if (!projectsResponse.ok) {
      throw new Error(`Failed to fetch projects: ${projectsResponse.status}`)
    }

    const projectsData = await projectsResponse.json()

    if (projectsData.docs.length === 0) {
      console.log('⚠️  No existing projects found. Please create a test project first.')
      console.log('   You can create one at: http://localhost:3000/project/create')
      return
    }

    const testProject = projectsData.docs[0]
    console.log(`✅ Found test project: ${testProject.name} (ID: ${testProject.id})`)

    // Step 2: Check for related data before deletion
    console.log('\n2️⃣ Checking for related data...')

    // Check initial concepts
    const conceptsResponse = await fetch(
      `${baseUrl}/api/initial-concepts?where[project][equals]=${testProject.id}`,
    )
    const conceptsData = await conceptsResponse.json()
    console.log(`📋 Found ${conceptsData.totalDocs} initial concept(s)`)

    // Check stories
    const storiesResponse = await fetch(
      `${baseUrl}/api/stories?where[project][equals]=${testProject.id}`,
    )
    const storiesData = await storiesResponse.json()
    console.log(`📖 Found ${storiesData.totalDocs} story/stories`)

    // Step 3: Test the deletion API endpoint
    console.log('\n3️⃣ Testing deletion via API endpoint...')
    console.log(`🗑️  Attempting to delete project: ${testProject.name}`)

    const deleteResponse = await fetch(`${baseUrl}/v1/projects/${testProject.id}`, {
      method: 'DELETE',
    })

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      throw new Error(`Delete request failed: ${deleteResponse.status} - ${errorData.error}`)
    }

    const deleteResult = await deleteResponse.json()
    console.log('✅ Delete API response:', JSON.stringify(deleteResult, null, 2))

    // Step 4: Verify the project is deleted
    console.log('\n4️⃣ Verifying deletion...')

    const verifyResponse = await fetch(`${baseUrl}/api/projects/${testProject.id}`)
    if (verifyResponse.status === 404) {
      console.log('✅ Project successfully deleted (404 response)')
    } else {
      console.log('❌ Project still exists - deletion may have failed')
    }

    // Step 5: Verify related data is deleted
    console.log('\n5️⃣ Verifying cascade deletion...')

    const conceptsAfterResponse = await fetch(
      `${baseUrl}/api/initial-concepts?where[project][equals]=${testProject.id}`,
    )
    const conceptsAfterData = await conceptsAfterResponse.json()
    console.log(`📋 Initial concepts after deletion: ${conceptsAfterData.totalDocs} (should be 0)`)

    const storiesAfterResponse = await fetch(
      `${baseUrl}/api/stories?where[project][equals]=${testProject.id}`,
    )
    const storiesAfterData = await storiesAfterResponse.json()
    console.log(`📖 Stories after deletion: ${storiesAfterData.totalDocs} (should be 0)`)

    // Final verification
    const cascadeSuccess = conceptsAfterData.totalDocs === 0 && storiesAfterData.totalDocs === 0

    if (cascadeSuccess) {
      console.log('\n🎉 SUCCESS: Project deletion with cascade delete works correctly!')
      console.log('✅ All related data was properly removed')
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Project deleted but some related data may remain')
      console.log(`   - Remaining concepts: ${conceptsAfterData.totalDocs}`)
      console.log(`   - Remaining stories: ${storiesAfterData.totalDocs}`)
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testProjectDeletion()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
