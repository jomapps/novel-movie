import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getBamlClient } from '@/lib/ai/baml-client'
import { characterLibraryClient } from '@/lib/services/character-library-client'
import { checkCharacterLibraryHealth } from '@/lib/services/character-library-health'
import { CharacterDevelopmentService } from '@/lib/services/character-development-service'

const characterDevelopmentService = new CharacterDevelopmentService()

// Helper function to generate character relationships
async function generateCharacterRelationships(
  characters: any[],
  storyStructure: any,
  storyContent: string,
): Promise<any[]> {
  if (characters.length < 2) {
    return characters // No relationships to generate for single character
  }

  console.log('🔗 Generating character relationships...')

  // Analyze story beats for character interactions
  const characterInteractions: { [key: string]: string[] } = {}

  // Extract character interactions from story beats
  storyStructure.storyBeats?.forEach((beat: any) => {
    const beatCharacters = beat.characters?.map((c: any) => c.character || c.characterName) || []

    beatCharacters.forEach((char1: string) => {
      beatCharacters.forEach((char2: string) => {
        if (char1 !== char2) {
          if (!characterInteractions[char1]) {
            characterInteractions[char1] = []
          }
          if (!characterInteractions[char1].includes(char2)) {
            characterInteractions[char1].push(char2)
          }
        }
      })
    })
  })

  // Generate relationships for each character
  const enhancedCharacters = characters.map((character) => {
    const relationships: any[] = []
    const interactsWith = characterInteractions[character.name] || []

    interactsWith.forEach((otherCharName) => {
      const otherChar = characters.find((c) => c.name === otherCharName)
      if (otherChar) {
        // Determine relationship type based on character roles
        let relationshipType = 'ally'
        let dynamic = 'supportive'

        if (character.role === 'protagonist' && otherChar.role === 'antagonist') {
          relationshipType = 'enemy'
          dynamic = 'conflicted and opposing'
        } else if (character.role === 'antagonist' && otherChar.role === 'protagonist') {
          relationshipType = 'enemy'
          dynamic = 'antagonistic and challenging'
        } else if (character.role === 'protagonist' && otherChar.role === 'supporting') {
          relationshipType = 'ally'
          dynamic = 'supportive and collaborative'
        } else if (character.role === 'supporting' && otherChar.role === 'protagonist') {
          relationshipType = 'mentor'
          dynamic = 'guiding and supportive'
        }

        relationships.push({
          character: otherChar.name,
          relationship: relationshipType,
          dynamic: dynamic,
        })
      }
    })

    return {
      ...character,
      relationships: relationships,
    }
  })

  console.log(`✅ Generated relationships for ${enhancedCharacters.length} characters`)
  return enhancedCharacters
}

// Helper function to sync character with Character Library (create or update)
async function syncCharacterWithLibrary(
  character: any,
  project: any,
  existingCharacterLibraryId?: string | null,
): Promise<{
  characterLibraryId: string | null
  status: 'created' | 'updated' | 'error'
  error?: string
}> {
  try {
    // Check if Character Library is available
    const healthCheck = await checkCharacterLibraryHealth()
    if (!healthCheck.isHealthy) {
      console.warn('Character Library is not available:', healthCheck.error)
      return { characterLibraryId: null, status: 'error', error: healthCheck.error }
    }

    // If character already exists in Character Library, update it
    if (existingCharacterLibraryId) {
      console.log(`🔄 Updating existing character ${character.name} in Character Library`)

      try {
        // Get existing character data to preserve immutable fields
        const existingCharacter = await characterLibraryClient.getCharacter(
          existingCharacterLibraryId,
        )

        // Prepare update data - preserve existing physical characteristics if they exist
        const updateData = {
          // Always update these fields (they can evolve)
          biography:
            character.characterDevelopment?.biography || existingCharacter?.biography || '',
          personality:
            character.characterDevelopment?.personality || existingCharacter?.personality || '',

          // Preserve existing physical characteristics, only add if missing
          physicalDescription:
            existingCharacter?.physicalDescription ||
            character.physicalDescription?.description ||
            '',
          age: existingCharacter?.age || character.physicalDescription?.age,
          height: existingCharacter?.height || character.physicalDescription?.height,
          eyeColor: existingCharacter?.eyeColor || character.physicalDescription?.eyeColor,
          hairColor: existingCharacter?.hairColor || character.physicalDescription?.hairColor,

          // Update status and metadata
          status: 'in_development' as const,
          lastModified: new Date().toISOString(),
          changeSet: ['biography', 'personality'], // Track what was updated
        }

        const response = await characterLibraryClient.updateNovelMovieCharacter(
          existingCharacterLibraryId,
          updateData,
        )

        if (response.success !== false) {
          return {
            characterLibraryId: existingCharacterLibraryId,
            status: 'updated',
          }
        } else {
          throw new Error(response.error || 'Update failed')
        }
      } catch (updateError) {
        console.warn('Failed to update existing character, will create new:', updateError)
        // Fall through to create new character
      }
    }

    // Create new character in Character Library
    console.log(`✨ Creating new character ${character.name} in Character Library`)

    const characterLibraryData = {
      name: character.name,
      characterId: `${project.id}-${character.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'in_development' as const,
      biography: character.characterDevelopment?.biography || '',
      personality: character.characterDevelopment?.personality || '',
      physicalDescription: character.physicalDescription?.description || '',
      age: character.physicalDescription?.age,
      height: character.physicalDescription?.height,
      eyeColor: character.physicalDescription?.eyeColor,
      hairColor: character.physicalDescription?.hairColor,
    }

    const response = await characterLibraryClient.createNovelMovieCharacter(
      characterLibraryData,
      project,
    )

    if (response.success !== false) {
      return {
        characterLibraryId: response.id || response.characterId,
        status: 'created',
      }
    } else {
      return {
        characterLibraryId: null,
        status: 'error',
        error: response.error || 'Unknown error creating character',
      }
    }
  } catch (error) {
    console.error('Error syncing character with Character Library:', error)
    return {
      characterLibraryId: null,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper function to generate character visuals
async function generateCharacterVisuals(
  characterLibraryId: string,
  character: any,
): Promise<{
  masterReference?: any
  coreSet?: any[]
  error?: string
}> {
  try {
    // Generate master reference image
    const physicalDesc = character.physicalDescription?.description || ''
    const personality = character.characterDevelopment?.personality || ''

    const masterPrompt = `Professional character reference image: ${physicalDesc}. ${personality}. High quality, clear lighting, neutral background, full body view.`

    const masterResponse = await characterLibraryClient.generateInitialImage(
      characterLibraryId,
      masterPrompt,
    )

    if (!masterResponse.success) {
      throw new Error(`Master reference generation failed: ${masterResponse.error}`)
    }

    // Generate 360° core reference set
    const coreSetResponse = await characterLibraryClient.generateCoreSet(characterLibraryId)

    if (!coreSetResponse.success) {
      console.warn('Core set generation failed:', coreSetResponse.error)
      // Continue without core set - master reference is sufficient
    }

    return {
      masterReference: masterResponse.data,
      coreSet: coreSetResponse.success ? coreSetResponse.data : [],
    }
  } catch (error) {
    console.error('Error generating character visuals:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Fetch the project with related data
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2,
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch the associated story
    const storyQuery = await payload.find({
      collection: 'stories',
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 1,
    })

    if (storyQuery.docs.length === 0) {
      return NextResponse.json(
        { error: 'No story found for this project. Please complete story development first.' },
        { status: 400 },
      )
    }

    const story = storyQuery.docs[0]

    // Check if story is ready for character development
    if (!story.currentContent || story.currentContent.trim().length < 500) {
      return NextResponse.json(
        {
          error:
            'Story content is too short for character development. Please enhance the story first.',
        },
        { status: 400 },
      )
    }

    // Fetch story structure (required for character development)
    const storyStructureQuery = await payload.find({
      collection: 'story-structures',
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 1,
    })

    if (storyStructureQuery.docs.length === 0) {
      return NextResponse.json(
        {
          error:
            'Story structure is required for character development. Please complete story structure planning first.',
        },
        { status: 400 },
      )
    }

    const storyStructure = storyStructureQuery.docs[0]

    // Check if characters already exist for this project
    const existingCharacters = await payload.find({
      collection: 'characters',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    // If characters exist, regenerate them instead of just returning them
    if (existingCharacters.docs.length > 0) {
      console.log(`🔄 Regenerating ${existingCharacters.docs.length} existing characters...`)

      // We'll continue with the character generation process below
      // but will update existing characters instead of creating new ones
    }

    // Prepare data for character development
    const characterArcs =
      storyStructure.characterArcs?.map(
        (arc: any) =>
          `${arc.character}: ${arc.startState} → ${arc.transformation} → ${arc.endState}`,
      ) || []

    const storyBeats =
      storyStructure.storyBeats?.map(
        (beat: any) =>
          `Beat ${beat.beat}: ${beat.description} (Characters: ${beat.characters?.map((c: any) => c.character).join(', ') || 'None'})`,
      ) || []

    // Generate characters using BAML AI functions
    const startTime = Date.now()

    console.log('🤖 Generating characters using BAML AI functions...')

    // Get BAML client
    const bamlClient = await getBamlClient()

    // Prepare data for BAML character generation
    const movieFormatName =
      typeof project.movieFormat === 'string'
        ? project.movieFormat
        : project.movieFormat?.name || 'feature-film'

    const movieStyleName =
      typeof project.movieStyle === 'string'
        ? project.movieStyle
        : project.movieStyle?.name || 'dramatic'

    const primaryGenreNames = Array.isArray(project.primaryGenres)
      ? project.primaryGenres.map((genre: any) =>
          typeof genre === 'string' ? genre : genre?.name || 'drama',
        )
      : ['drama']

    const targetAudienceNames = Array.isArray(project.targetAudience)
      ? project.targetAudience.map((audience: any) =>
          typeof audience === 'string' ? audience : audience?.name || 'general',
        )
      : ['general']

    // Generate characters using BAML - NO FALLBACK MECHANISM
    const characterResult = await bamlClient.DevelopCharacters(
      story.currentContent,
      project.name || 'Untitled Project',
      movieFormatName,
      movieStyleName,
      project.durationUnit || 90,
      primaryGenreNames,
      targetAudienceNames,
      characterArcs,
      storyBeats,
    )

    console.log(
      `✅ BAML character generation completed. Generated ${characterResult.characters?.length || 0} characters`,
    )

    // Generate character relationships
    const charactersWithRelationships = await generateCharacterRelationships(
      characterResult.characters,
      storyStructure,
      story.currentContent,
    )

    const processingTime = Math.round((Date.now() - startTime) / 1000)

    // Create character records in the database with Character Library integration
    const createdCharacters = []

    for (const character of charactersWithRelationships) {
      // Get existing character library ID if character already exists
      const existingCharacters = await payload.find({
        collection: 'characters',
        where: {
          and: [{ project: { equals: projectId } }, { name: { equals: character.name } }],
        },
        limit: 1,
      })

      const existingCharacterLibraryId = existingCharacters.docs[0]?.characterLibraryId || null

      // Sync character with Character Library (create or update)
      console.log(`🔗 Syncing character ${character.name} with Character Library...`)
      const libraryResult = await syncCharacterWithLibrary(
        character,
        project,
        existingCharacterLibraryId,
      )

      // Prepare character data for local database
      const characterData = {
        project: projectId,
        projectName: project.name || 'Untitled Project',
        storyStructure: storyStructure.id,
        name: character.name,
        status: 'ready' as const,
        role: character.role as 'protagonist' | 'antagonist' | 'supporting' | 'minor',
        archetype: character.archetype || '',

        // Character Library integration fields
        characterLibraryId: libraryResult.characterLibraryId,
        characterLibraryStatus: libraryResult.status as 'created' | 'updated' | 'error',

        characterDevelopment: {
          biography: character.characterDevelopment.biography,
          personality: character.characterDevelopment.personality,
          motivations: character.characterDevelopment.motivations,
          backstory: character.characterDevelopment.backstory,
          psychology: {
            motivation: character.characterDevelopment.psychology.motivation,
            fears: character.characterDevelopment.psychology.fears,
            desires: character.characterDevelopment.psychology.desires,
            flaws: character.characterDevelopment.psychology.flaws,
          },
        },
        characterArc: {
          startState: character.characterArc.startState,
          transformation: character.characterArc.transformation,
          endState: character.characterArc.endState,
        },
        physicalDescription: {
          description: character.physicalDescription.description,
          age: character.physicalDescription.age || null,
          height: character.physicalDescription.height || '',
          eyeColor: character.physicalDescription.eyeColor || '',
          hairColor: character.physicalDescription.hairColor || '',
          clothing: character.physicalDescription.clothing || '',
        },
        dialogueVoice: {
          voiceDescription: character.dialogueVoice.voiceDescription,
          style: character.dialogueVoice.style,
          patterns: character.dialogueVoice.patterns,
          vocabulary: character.dialogueVoice.vocabulary,
        },
        relationships: character.relationships.map((rel: any) => ({
          character: rel.character,
          relationship: rel.relationship,
          dynamic: rel.dynamic,
        })),
        generationMetadata: {
          generatedAt: new Date().toISOString(),
          generationMethod: 'ai_generated' as const,
          qualityScore:
            character.generationMetadata.qualityScore ||
            characterResult.qualityMetrics.overallQuality,
          completeness: character.generationMetadata.completeness || 100,
        },

        // Initialize visual assets structure
        visualAssets: {
          masterReferenceImage: {
            url: '',
            dinoAssetId: '',
            qualityScore: 0,
          },
          coreReferenceSet: [],
          generatedImages: [],
        },
      }

      // Create or update character in local database
      let createdCharacter
      if (existingCharacters.docs.length > 0) {
        // Update existing character with enhanced data
        const existingCharacter = existingCharacters.docs[0]

        // Merge data preserving immutable fields
        const mergedData = {
          ...characterData,
          // Preserve existing physical characteristics if they exist
          physicalDescription: {
            ...characterData.physicalDescription,
            age:
              existingCharacter.physicalDescription?.age || characterData.physicalDescription.age,
            height:
              existingCharacter.physicalDescription?.height ||
              characterData.physicalDescription.height,
            eyeColor:
              existingCharacter.physicalDescription?.eyeColor ||
              characterData.physicalDescription.eyeColor,
            hairColor:
              existingCharacter.physicalDescription?.hairColor ||
              characterData.physicalDescription.hairColor,
          },
          // Preserve existing visual assets
          visualAssets: existingCharacter.visualAssets || characterData.visualAssets,
          // Cast the status to avoid TypeScript issues
          characterLibraryStatus: characterData.characterLibraryStatus as
            | 'created'
            | 'updated'
            | 'error',
        }

        createdCharacter = await payload.update({
          collection: 'characters',
          id: existingCharacter.id,
          data: mergedData as any, // Type assertion to handle 'updated' status
        })

        console.log(`✅ Updated existing character: ${character.name}`)
      } else {
        // Create new character
        createdCharacter = await payload.create({
          collection: 'characters',
          data: characterData as any, // Type assertion to handle 'updated' status
        })

        console.log(`✅ Created new character: ${character.name}`)
      }

      // Generate visual assets if Character Library sync was successful
      if (
        (libraryResult.status === 'created' || libraryResult.status === 'updated') &&
        libraryResult.characterLibraryId
      ) {
        console.log(`🎨 Generating visual assets for ${character.name}...`)

        const visualsResult = await generateCharacterVisuals(
          libraryResult.characterLibraryId,
          character,
        )

        if (visualsResult.masterReference && !visualsResult.error) {
          // Update character with visual assets
          await payload.update({
            collection: 'characters',
            id: createdCharacter.id,
            data: {
              visualAssets: {
                masterReferenceImage: {
                  url: visualsResult.masterReference.publicUrl || '',
                  dinoAssetId: visualsResult.masterReference.dinoAssetId || '',
                  qualityScore: visualsResult.masterReference.qualityScore || 0,
                },
                coreReferenceSet: (visualsResult.coreSet || []).map((img: any) => ({
                  url: img.publicUrl || '',
                  shotType: img.shotType || 'front',
                  consistencyScore: img.consistencyScore || 0,
                })),
                generatedImages: [],
              },
            },
          })

          console.log(`✅ Visual assets generated for ${character.name}`)
        } else {
          console.warn(
            `⚠️ Visual asset generation failed for ${character.name}:`,
            visualsResult.error,
          )
        }
      }

      createdCharacters.push(createdCharacter)
    }

    // Return the created characters with metadata
    return NextResponse.json(
      {
        characters: createdCharacters,
        qualityMetrics: characterResult.qualityMetrics,
        generationNotes: characterResult.generationNotes,
        processingTime,
        totalCharacters: createdCharacters.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error developing characters:', error)
    return NextResponse.json({ error: 'Failed to develop characters' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Find existing characters for this project
    const characters = await payload.find({
      collection: 'characters',
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 2,
      sort: 'role', // Sort by role to show protagonist first
    })

    if (characters.docs.length === 0) {
      return NextResponse.json({ error: 'No characters found for this project' }, { status: 404 })
    }

    // Calculate summary metrics
    const totalCharacters = characters.docs.length
    const charactersByRole = characters.docs.reduce((acc: any, char: any) => {
      acc[char.role] = (acc[char.role] || 0) + 1
      return acc
    }, {})

    const averageQuality =
      characters.docs.reduce(
        (sum: number, char: any) => sum + (char.generationMetadata?.qualityScore || 0),
        0,
      ) / totalCharacters

    return NextResponse.json(
      {
        characters: characters.docs,
        summary: {
          totalCharacters,
          charactersByRole,
          averageQuality: Math.round(averageQuality),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id
    const { action, characterId, focusAreas } = await request.json()

    if (action === 'enhance') {
      // Enhance specific character or all characters
      const characters = await payload.find({
        collection: 'characters',
        where: characterId ? { id: { equals: characterId } } : { project: { equals: projectId } },
      })

      if (characters.docs.length === 0) {
        return NextResponse.json({ error: 'No characters found to enhance' }, { status: 404 })
      }

      console.log(
        `🚀 Enhancing ${characters.docs.length} character(s) with focus areas: ${focusAreas?.join(', ') || 'all areas'}`,
      )

      const enhancementResults = []
      const errors = []

      // Enhance each character
      for (const character of characters.docs) {
        try {
          const result = await characterDevelopmentService.enhanceCharacterProfile(
            character.id,
            focusAreas || ['dialogue', 'psychology', 'relationships', 'backstory'],
          )

          if (result.success) {
            enhancementResults.push({
              characterId: character.id,
              characterName: character.name,
              qualityImprovement: result.qualityMetrics?.overallQuality || 0,
              enhancedAreas: focusAreas || ['dialogue', 'psychology', 'relationships', 'backstory'],
            })
          } else {
            errors.push(`${character.name}: ${result.error}`)
          }
        } catch (error) {
          errors.push(
            `${character.name}: ${error instanceof Error ? error.message : 'Enhancement failed'}`,
          )
        }
      }

      return NextResponse.json(
        {
          message: 'Character enhancement completed',
          enhancedCharacters: enhancementResults.length,
          results: enhancementResults,
          errors: errors,
          totalProcessed: characters.docs.length,
        },
        { status: 200 },
      )
    }

    if (action === 'validate') {
      // Validate character consistency
      const characters = await payload.find({
        collection: 'characters',
        where: characterId ? { id: { equals: characterId } } : { project: { equals: projectId } },
      })

      if (characters.docs.length === 0) {
        return NextResponse.json({ error: 'No characters found to validate' }, { status: 404 })
      }

      console.log(`🔍 Validating ${characters.docs.length} character(s) for consistency`)

      const validationResults = []
      const errors = []

      // Validate each character
      for (const character of characters.docs) {
        try {
          const result = await characterDevelopmentService.validateCharacterConsistency(
            character.id,
          )

          if (result.success) {
            validationResults.push({
              characterId: character.id,
              characterName: character.name,
              qualityMetrics: result.qualityMetrics,
              recommendations: result.recommendations,
            })
          } else {
            errors.push(`${character.name}: ${result.error}`)
          }
        } catch (error) {
          errors.push(
            `${character.name}: ${error instanceof Error ? error.message : 'Validation failed'}`,
          )
        }
      }

      return NextResponse.json(
        {
          message: 'Character validation completed',
          validatedCharacters: validationResults.length,
          results: validationResults,
          errors: errors,
          totalProcessed: characters.docs.length,
        },
        { status: 200 },
      )
    }

    if (action === 'sync') {
      // Sync characters with Character Library
      console.log(`🔄 Syncing characters for project ${projectId}`)

      const syncResult = await characterDevelopmentService.syncProjectCharacters(projectId)

      return NextResponse.json(
        {
          message: 'Character synchronization completed',
          syncResult,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: enhance, validate, sync' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error updating characters:', error)
    return NextResponse.json({ error: 'Failed to update characters' }, { status: 500 })
  }
}
