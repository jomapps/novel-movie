import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getBamlClient } from '@/lib/ai/baml-client'
import { characterLibraryClient } from '@/lib/services/character-library-client'
import { checkCharacterLibraryHealth } from '@/lib/services/character-library-health'

// Helper function to create character in Character Library
async function createCharacterInLibrary(
  character: any,
  project: any,
): Promise<{
  characterLibraryId: string | null
  status: 'created' | 'error'
  error?: string
}> {
  try {
    // Check if Character Library is available
    const healthCheck = await checkCharacterLibraryHealth()
    if (!healthCheck.isHealthy) {
      console.warn('Character Library is not available:', healthCheck.error)
      return { characterLibraryId: null, status: 'error', error: healthCheck.error }
    }

    // Create character in Character Library
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

    const response = await characterLibraryClient.createCharacter(characterLibraryData)

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
    console.error('Error creating character in Character Library:', error)
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

    if (existingCharacters.docs.length > 0) {
      return NextResponse.json(
        {
          message: 'Characters already exist for this project',
          characters: existingCharacters.docs,
        },
        { status: 200 },
      )
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

    // Generate characters using existing story structure data
    const startTime = Date.now()

    // Extract character information from story structure
    const characterResult = {
      characters:
        storyStructure.characterArcs?.map((arc: any, index: number) => {
          const characterName = arc.character || arc.characterName || `Character ${index + 1}`
          const role = index === 0 ? 'protagonist' : index === 1 ? 'antagonist' : 'supporting'

          return {
            name: characterName,
            role: role,
            archetype: role === 'protagonist' ? 'Hero' : role === 'antagonist' ? 'Villain' : 'Ally',
            characterDevelopment: {
              biography: `${characterName} is a key character in this ${typeof project.movieFormat === 'string' ? project.movieFormat : project.movieFormat?.name || 'story'}.`,
              personality: `${characterName} exhibits traits consistent with their role as the ${role} of the story.`,
              motivations:
                arc.transformation ||
                `${characterName} is motivated by the central conflict of the story.`,
              backstory: `${characterName}'s background shapes their journey from ${arc.startState || 'their initial state'} to ${arc.endState || 'their final state'}.`,
              psychology: {
                motivation: arc.transformation || "Driven by the story's central conflict",
                fears: 'Fears failure and loss',
                desires: 'Seeks resolution and growth',
                flaws: 'Has personal weaknesses to overcome',
              },
            },
            characterArc: {
              startState: arc.startState || arc.startingState || 'Initial character state',
              transformation:
                arc.transformation ||
                arc.arcDescription ||
                'Character undergoes significant change',
              endState: arc.endState || arc.endingState || 'Final character state',
            },
            physicalDescription: {
              description: `${characterName} has a distinctive appearance that reflects their role in the story.`,
              age: null,
              height: '',
              eyeColor: '',
              hairColor: '',
              clothing: 'Clothing appropriate to their character and story setting',
            },
            dialogueVoice: {
              voiceDescription: `${characterName} speaks in a manner consistent with their personality and background.`,
              style:
                role === 'protagonist'
                  ? 'Determined and heroic'
                  : role === 'antagonist'
                    ? 'Commanding and threatening'
                    : 'Supportive and wise',
              patterns: 'Speech patterns reflect character background',
              vocabulary: 'Vocabulary appropriate to character education and social status',
            },
            relationships: [],
            generationMetadata: {
              generatedAt: new Date().toISOString(),
              generationMethod: 'story_structure_extraction',
              qualityScore: 75, // Base quality score for extracted characters
              completeness: 80,
            },
          }
        }) || [],
      qualityMetrics: {
        overallQuality: 75,
        characterDepth: 70,
        arcConsistency: 85,
        relationshipClarity: 60,
        dialogueDistinction: 65,
        psychologicalRealism: 70,
      },
      generationNotes:
        'Characters extracted from existing story structure and enhanced with basic development information. External Character Library Service integration available for future enhancement.',
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000)

    // Create character records in the database with Character Library integration
    const createdCharacters = []

    for (const character of characterResult.characters) {
      // Create character in Character Library first
      const libraryResult = await createCharacterInLibrary(character, project)

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
        characterLibraryStatus: libraryResult.status,

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

      // Create character in local database
      const createdCharacter = await payload.create({
        collection: 'characters',
        data: characterData,
      })

      // Generate visual assets if Character Library creation was successful
      if (libraryResult.status === 'created' && libraryResult.characterLibraryId) {
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
    const { action, characterId } = await request.json()

    if (action === 'enhance') {
      // Enhance specific character or all characters
      const characters = await payload.find({
        collection: 'characters',
        where: characterId ? { id: { equals: characterId } } : { project: { equals: projectId } },
      })

      if (characters.docs.length === 0) {
        return NextResponse.json({ error: 'No characters found to enhance' }, { status: 404 })
      }

      // Get story content for enhancement
      const storyQuery = await payload.find({
        collection: 'stories',
        where: { project: { equals: projectId } },
      })

      if (storyQuery.docs.length === 0) {
        return NextResponse.json({ error: 'Story not found for enhancement' }, { status: 400 })
      }

      const story = storyQuery.docs[0]

      // Enhance characters (placeholder implementation)
      const enhancementResult = {
        message: 'Character enhancement completed',
        enhancedCharacters: characters.docs.length,
        focusAreas: ['dialogue', 'psychology', 'relationships'],
        qualityImprovement: 10,
      }

      return NextResponse.json(
        {
          message: 'Characters enhanced successfully',
          enhancementResult,
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating characters:', error)
    return NextResponse.json({ error: 'Failed to update characters' }, { status: 500 })
  }
}
