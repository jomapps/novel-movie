import { getBamlClient } from '@/lib/ai/baml-client'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface CharacterGenerationResult {
  success: boolean
  libraryCharacterId?: string
  characterReferenceId?: string
  error?: string
  status?: 'generated' | 'images_created' | 'complete' | 'failed'
}

export class CharacterGenerationService {
  private async getPayloadInstance() {
    return await getPayload({ config })
  }

  async generateAndStoreCharacter(
    projectId: string,
    characterName: string,
    projectData: any,
    characterRole: 'protagonist' | 'antagonist' | 'supporting' | 'minor' = 'supporting',
  ): Promise<CharacterGenerationResult> {
    try {
      console.log(`🎭 Starting character generation for: ${characterName}`)

      // 1. Generate rich character data with BAML
      const characterData = await this.generateCharacterWithBAML(projectData, characterName)
      console.log(`✅ Character data generated for: ${characterName}`)

      // 2. Create character LOCALLY (authoring-first). Do NOT touch voice yet.
      const payload = await this.getPayloadInstance()
      const createdLocal = await payload.create({
        collection: 'characters',
        data: {
          project: projectId,
          name: characterName,
          role: characterRole,
          archetype: characterData.archetype,
          characterDevelopment: {
            biography: characterData.characterDevelopment?.biography,
            personality: characterData.characterDevelopment?.personality,
            motivations: characterData.characterDevelopment?.motivations,
            backstory: characterData.characterDevelopment?.backstory,
            psychology: characterData.characterDevelopment?.psychology,
          },
          characterArc: characterData.characterArc,
          physicalDescription: characterData.physicalDescription,
          relationships: characterData.relationships || [],
          generationMetadata: {
            generatedAt: new Date(),
            generationMethod: 'BAML DevelopCharacters',
            qualityScore: characterData.generationMetadata?.qualityScore || 85,
            completeness: characterData.generationMetadata?.completeness || 90,
            bamlData: characterData,
          },
        },
      })
      console.log(`✅ Local character stored: ${createdLocal.id}`)

      // 3. Sync to Character Library using delete-and-recreate semantics (service handles it)
      const syncResult = await (
        await import('./character-sync-service')
      ).characterSyncService.syncCharacterToLibrary(createdLocal.id)
      if (syncResult.success === false) {
        console.warn('Character Library sync failed:', syncResult.errors?.join('; '))
      } else {
        console.log('✅ Character synced to Character Library')
      }

      // 4. Upsert Character Reference with BAML data so the UI can display full details
      try {
        const updatedLocal = await payload.findByID({
          collection: 'characters',
          id: createdLocal.id,
          depth: 0,
        })
        const libraryCharacterId =
          updatedLocal.characterLibraryId || updatedLocal.libraryIntegration?.libraryCharacterId
        const libraryDbId = updatedLocal.libraryIntegration?.libraryDbId

        if (libraryCharacterId) {
          // Check if a reference exists for this library character id
          const existing = await payload.find({
            collection: 'character-references',
            where: { libraryCharacterId: { equals: libraryCharacterId } },
            limit: 1,
          })

          const refData: any = {
            project: projectId,
            projectCharacterName: characterName,
            libraryCharacterId,
            libraryDbId,
            characterRole: characterRole,
            generationStatus: 'generated',
            generationMetadata: {
              generatedAt: new Date(),
              generationMethod: 'BAML DevelopCharacters',
              qualityScore: characterData.generationMetadata?.qualityScore || 85,
              completeness: characterData.generationMetadata?.completeness || 90,
              characterLibraryStatus: updatedLocal.characterLibraryStatus || 'created',
              bamlData: characterData,
            },
          }

          if (existing.docs.length > 0) {
            await payload.update({
              collection: 'character-references',
              id: existing.docs[0].id,
              data: refData,
            })
          } else {
            await payload.create({
              collection: 'character-references',
              data: refData,
            })
          }
        } else {
          console.warn('No libraryCharacterId found; skipping character-reference upsert')
        }
      } catch (e) {
        console.warn('Failed to upsert character-reference record:', e)
      }

      return {
        success: true,
        libraryCharacterId: undefined,
        characterReferenceId: createdLocal.id, // returns local character id for now
        status: 'complete',
      }
    } catch (error) {
      console.error(`❌ Character generation failed for ${characterName}:`, error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character generation failed',
        status: 'failed',
      }
    }
  }

  private async generateCharacterWithBAML(projectData: any, characterName: string): Promise<any> {
    const bamlClient = await getBamlClient()

    // Get story structure for character development context
    const storyContent =
      projectData.storyStructure?.content || projectData.initialConcept?.premise || ''
    const characterArcs = projectData.storyStructure?.characterArcs || []
    const storyBeats = projectData.storyStructure?.storyBeats || []

    // Extract string values from relationship objects
    const movieFormat =
      typeof projectData.movieFormat === 'object'
        ? projectData.movieFormat?.name || 'Short Film'
        : projectData.movieFormat || 'Short Film'

    const movieStyle =
      typeof projectData.movieStyle === 'object'
        ? projectData.movieStyle?.name || 'Cinematic'
        : projectData.movieStyle || 'Cinematic'

    const genres = Array.isArray(projectData.initialConcept?.genre)
      ? projectData.initialConcept.genre.map((g) => (typeof g === 'object' ? g.name : g))
      : []

    const targetAudience = Array.isArray(projectData.initialConcept?.targetAudience)
      ? projectData.initialConcept.targetAudience.map((ta) =>
          typeof ta === 'object' ? ta.name : ta,
        )
      : []

    // Use the correct BAML function with proper parameters
    const result = await bamlClient.DevelopCharacters(
      storyContent,
      projectData.name,
      movieFormat,
      movieStyle,
      projectData.durationUnit || 15,
      genres,
      targetAudience,
      characterArcs,
      storyBeats,
    )

    // Extract the specific character from the result
    const targetCharacter = result.characters?.find(
      (char) => char.name.toLowerCase() === characterName.toLowerCase(),
    )

    if (targetCharacter) {
      return targetCharacter
    }

    // If character not found in result, return the first character or create a basic one
    if (result.characters && result.characters.length > 0) {
      const firstChar = result.characters[0]
      // Modify the name to match the requested character
      return {
        ...firstChar,
        name: characterName,
      }
    }

    // Fallback: create a basic character structure
    return {
      name: characterName,
      role: 'supporting',
      archetype: 'Supporting Character',
      characterDevelopment: {
        biography: `${characterName} is a character in ${projectData.name}`,
        personality: 'To be developed',
        motivations: 'To be determined',
        backstory: 'Background to be established',
        psychology: {
          motivation: 'Character motivation',
          fears: 'Character fears',
          desires: 'Character desires',
          flaws: 'Character flaws',
        },
      },
      characterArc: {
        startState: 'Initial state',
        transformation: 'Character growth',
        endState: 'Final state',
      },
      physicalDescription: {
        description: 'Physical appearance to be defined',
        age: 30,
        height: 'Average height',
        eyeColor: 'Brown',
        hairColor: 'Brown',
        clothing: 'Casual attire',
      },
      dialogueVoice: {
        voiceDescription: 'Distinctive voice',
        style: 'Natural speaking style',
        patterns: 'Speech patterns',
        vocabulary: 'Appropriate vocabulary',
      },
      relationships: [],
      generationMetadata: {
        generatedAt: new Date().toISOString(),
        generationMethod: 'BAML DevelopCharacters',
        qualityScore: 75,
        completeness: 80,
      },
    }
  }

  private buildReferenceImagePrompt(characterData: any): string {
    const physical = characterData.physicalDescription?.description || ''
    const personality = characterData.characterDevelopment?.personality || ''
    const age = characterData.physicalDescription?.age || ''
    const clothing = characterData.physicalDescription?.clothing || ''

    return `Professional character reference image: ${physical}. Age: ${age}. Personality: ${personality}. Clothing: ${clothing}. High quality, neutral background, full body view, clear lighting.`
  }

  async getProjectCharacters(projectId: string): Promise<any[]> {
    const payload = await this.getPayloadInstance()

    // Get character references for project
    const characterRefs = await payload.find({
      collection: 'character-references',
      where: { project: { equals: projectId } },
    })

    // Return character data in format expected by the screenplay component
    // Filter out incomplete characters and prioritize those with BAML data
    const validCharacters = characterRefs.docs.filter((ref) => {
      const bamlData = ref.generationMetadata?.bamlData
      // Only include characters that have BAML data OR are the only character with that name
      return bamlData && bamlData.name
    })

    return validCharacters.map((ref) => {
      const bamlData = ref.generationMetadata?.bamlData

      // If we have BAML data, use it directly (it's already in the right format)
      if (bamlData && bamlData.name) {
        return {
          ...bamlData,
          // Add reference metadata
          referenceId: ref.id,
          projectName: ref.projectCharacterName,
          libraryId: ref.libraryCharacterId,
          characterLibraryId: ref.libraryCharacterId, // For component compatibility
          status: ref.generationStatus || 'offline',
          characterLibraryStatus: ref.generationMetadata?.characterLibraryStatus || 'offline',
          generatedAt: ref.generationMetadata?.generatedAt,
          lastImageUpdate: ref.generationMetadata?.lastImageUpdate,
        }
      }

      // Fallback for characters without BAML data
      return {
        name: ref.projectCharacterName,
        role: ref.characterRole,
        archetype: 'Unknown',
        referenceId: ref.id,
        projectName: ref.projectCharacterName,
        libraryId: ref.libraryCharacterId,
        characterLibraryId: ref.libraryCharacterId, // For component compatibility
        status: ref.generationStatus || 'offline',
        characterLibraryStatus: ref.generationMetadata?.characterLibraryStatus || 'offline',
        generatedAt: ref.generationMetadata?.generatedAt,
        lastImageUpdate: ref.generationMetadata?.lastImageUpdate,
      }
    })
  }

  async regenerateCharacter(characterReferenceId: string): Promise<CharacterGenerationResult> {
    try {
      const payload = await this.getPayloadInstance()

      // Get the character reference
      const characterRef = await payload.findByID({
        collection: 'character-references',
        id: characterReferenceId,
        depth: 2,
      })

      if (!characterRef) {
        return {
          success: false,
          error: 'Character reference not found',
          status: 'failed',
        }
      }

      // Get project data
      const project = await payload.findByID({
        collection: 'projects',
        id:
          typeof characterRef.project === 'string' ? characterRef.project : characterRef.project.id,
        depth: 2,
      })

      // Regenerate the character
      return await this.generateAndStoreCharacter(
        typeof characterRef.project === 'string' ? characterRef.project : characterRef.project.id,
        characterRef.projectCharacterName,
        project,
        characterRef.characterRole,
      )
    } catch (error) {
      console.error('Character regeneration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character regeneration failed',
        status: 'failed',
      }
    }
  }
}
