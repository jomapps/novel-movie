#!/usr/bin/env node

/**
 * Test script to verify enhanced character data mapping
 * Tests the data structure that would be sent to Character Library
 */

// Sample character data from Novel Movie (similar to what BAML generates)
const sampleCharacter = {
  name: 'Iliana',
  role: 'protagonist',
  archetype: 'The Hero',
  characterDevelopment: {
    biography: 'A determined young woman who discovers her hidden magical abilities.',
    personality: 'Brave, compassionate, sometimes impulsive, deeply loyal to friends.',
    motivations: 'To protect her family and master her newfound powers.',
    backstory:
      'Grew up in a small village, unaware of her magical heritage until a crisis forced her abilities to manifest.',
    psychology: {
      motivation: 'Protecting loved ones',
      fears: 'Losing control of her powers',
      desires: 'To find her place in the world',
      flaws: 'Tendency to act without thinking',
    },
  },
  physicalDescription: {
    description: 'Tall and athletic with striking green eyes and long auburn hair.',
    age: 24,
    height: '5\'8"',
    eyeColor: 'green',
    hairColor: 'auburn',
    clothing: 'Practical leather armor with intricate silver buckles.',
  },
  dialogueVoice: {
    voiceDescription: 'Clear and confident voice with a slight regional accent.',
    style: 'Direct and honest',
    patterns: 'Uses metaphors from nature',
    vocabulary: 'Mix of common speech and archaic terms',
  },
  relationships: [
    {
      characterName: 'Marcus',
      relationshipType: 'mentor',
      relationshipDynamic: 'Respectful student-teacher relationship with growing friendship',
    },
    {
      characterName: 'Elena',
      relationshipType: 'best friend',
      relationshipDynamic: 'Deep friendship tested by secrets and danger',
    },
  ],
}

const sampleProject = {
  id: '68bc17412fc53800a96365d8',
  name: 'The Awakening Chronicles',
}

// Simulate the enhanced mapping logic
function mapToCharacterLibraryFormat(character, project) {
  // Helper function to convert RichText to Character Library format
  const convertRichText = (richTextData) => {
    if (!richTextData)
      return {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      }

    if (richTextData.root) return richTextData

    if (typeof richTextData === 'string') {
      return {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: richTextData,
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      }
    }

    return richTextData
  }

  return {
    name: character.name,
    characterId: `${project.id}-${character.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    status: 'in_development',
    biography: convertRichText(character.characterDevelopment?.biography),
    personality: convertRichText(character.characterDevelopment?.personality),
    motivations: convertRichText(character.characterDevelopment?.motivations),
    backstory: convertRichText(character.characterDevelopment?.backstory),
    physicalDescription: convertRichText(character.physicalDescription?.description),
    voiceDescription: convertRichText(character.dialogueVoice?.voiceDescription),
    clothing: convertRichText(character.physicalDescription?.clothing),
    age: character.physicalDescription?.age || null,
    height: character.physicalDescription?.height || '',
    weight: '',
    eyeColor: character.physicalDescription?.eyeColor || '',
    hairColor: character.physicalDescription?.hairColor || '',
    relationships: convertRichText(
      character.relationships
        ?.map((rel) => `${rel.characterName}: ${rel.relationshipType} - ${rel.relationshipDynamic}`)
        .join('\n\n') || '',
    ),
    skills: character.characterDevelopment?.psychology
      ? [
          {
            skill: 'Core Motivation',
            level: 'advanced',
            description: character.characterDevelopment.psychology.motivation || '',
          },
          {
            skill: 'Character Strengths',
            level: 'intermediate',
            description: character.characterDevelopment.psychology.desires || '',
          },
        ]
      : [],
    novelMovieIntegration: {
      projectId: project?.id || '',
      projectName: project?.name || '',
      lastSyncAt: new Date(),
      syncStatus: 'synced',
      conflictResolution: 'auto',
      changeLog: [
        {
          timestamp: new Date(),
          source: 'novel-movie',
          changes: ['Initial character creation from Novel Movie'],
          resolvedBy: 'system',
        },
      ],
    },
  }
}

async function testDataMapping() {
  console.log('🧪 Testing Enhanced Character Data Mapping')
  console.log('='.repeat(50))

  try {
    console.log('📝 Input Character Data:')
    console.log(JSON.stringify(sampleCharacter, null, 2))
    console.log('\n' + '='.repeat(50))

    const mappedData = mapToCharacterLibraryFormat(sampleCharacter, sampleProject)

    console.log('🔄 Mapped Character Library Data:')
    console.log(JSON.stringify(mappedData, null, 2))
    console.log('\n' + '='.repeat(50))

    // Verify key fields are present and properly formatted
    const checks = [
      { field: 'name', expected: 'string', actual: typeof mappedData.name },
      { field: 'biography', expected: 'object', actual: typeof mappedData.biography },
      { field: 'personality', expected: 'object', actual: typeof mappedData.personality },
      { field: 'motivations', expected: 'object', actual: typeof mappedData.motivations },
      { field: 'backstory', expected: 'object', actual: typeof mappedData.backstory },
      {
        field: 'physicalDescription',
        expected: 'object',
        actual: typeof mappedData.physicalDescription,
      },
      { field: 'voiceDescription', expected: 'object', actual: typeof mappedData.voiceDescription },
      { field: 'clothing', expected: 'object', actual: typeof mappedData.clothing },
      { field: 'relationships', expected: 'object', actual: typeof mappedData.relationships },
      { field: 'skills', expected: 'object', actual: typeof mappedData.skills },
      {
        field: 'novelMovieIntegration',
        expected: 'object',
        actual: typeof mappedData.novelMovieIntegration,
      },
    ]

    console.log('✅ Data Mapping Validation:')
    let allPassed = true

    checks.forEach((check) => {
      const passed = check.actual === check.expected
      const status = passed ? '✅' : '❌'
      console.log(`${status} ${check.field}: ${check.expected} (got ${check.actual})`)
      if (!passed) allPassed = false
    })

    console.log('\n' + '='.repeat(50))

    // Check RichText format
    if (mappedData.biography && mappedData.biography.root) {
      console.log('✅ Biography is properly formatted as RichText')
      console.log('📄 Biography text:', mappedData.biography.root.children[0]?.children[0]?.text)
    } else {
      console.log('❌ Biography is not properly formatted as RichText')
      allPassed = false
    }

    if (mappedData.novelMovieIntegration) {
      console.log('✅ Novel Movie integration metadata included')
      console.log('🔗 Project ID:', mappedData.novelMovieIntegration.projectId)
      console.log('📅 Last sync:', mappedData.novelMovieIntegration.lastSyncAt)
    } else {
      console.log('❌ Novel Movie integration metadata missing')
      allPassed = false
    }

    console.log('\n' + '='.repeat(50))
    console.log(allPassed ? '🎉 All tests PASSED!' : '⚠️  Some tests FAILED!')

    return allPassed
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return false
  }
}

// Run the test
testDataMapping()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
