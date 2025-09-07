import { characterLibraryClient } from './character-library-client'
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
    characterRole: 'protagonist' | 'antagonist' | 'supporting' | 'minor' = 'supporting'
  ): Promise<CharacterGenerationResult> {
    try {
      console.log(`🎭 Starting character generation for: ${characterName}`)

      // 1. Generate rich character data with BAML
      const characterData = await this.generateCharacterWithBAML(projectData, characterName)
      console.log(`✅ Character data generated for: ${characterName}`)

      // 2. Create in Character Library
      const libraryResponse = await characterLibraryClient.createNovelMovieCharacter(
        characterData,
        projectData
      )
      console.log(`✅ Character created in library: ${libraryResponse.id}`)

      // 3. Store reference in Novel Movie
      const payload = await this.getPayloadInstance()
      const characterRef = await payload.create({
        collection: 'character-references',
        data: {
          project: projectId,
          projectCharacterName: characterName,
          libraryCharacterId: libraryResponse.id,
          characterRole,
          generationStatus: 'generated',
          generationMetadata: {
            generatedAt: new Date(),
          }
        }
      })
      console.log(`✅ Character reference stored: ${characterRef.id}`)

      // 4. Generate reference image
      const referenceImagePrompt = this.buildReferenceImagePrompt(characterData)
      await characterLibraryClient.generateInitialImage(
        libraryResponse.id,
        referenceImagePrompt
      )
      console.log(`✅ Reference image generated for: ${characterName}`)

      // 5. Update status to images_created
      await payload.update({
        collection: 'character-references',
        id: characterRef.id,
        data: { 
          generationStatus: 'images_created',
          generationMetadata: {
            generatedAt: characterRef.generationMetadata?.generatedAt,
            lastImageUpdate: new Date(),
          }
        }
      })

      // 6. Generate 360° image set
      await characterLibraryClient.generate360ImageSet(libraryResponse.id, {
        style: 'character_production',
        qualityThreshold: 75
      })
      console.log(`✅ 360° image set generated for: ${characterName}`)

      // 7. Mark as complete
      await payload.update({
        collection: 'character-references',
        id: characterRef.id,
        data: { generationStatus: 'complete' }
      })

      return {
        success: true,
        libraryCharacterId: libraryResponse.id,
        characterReferenceId: characterRef.id,
        status: 'complete'
      }

    } catch (error) {
      console.error(`❌ Character generation failed for ${characterName}:`, error)
      
      // Try to update status to failed if we have a reference
      try {
        const payload = await this.getPayloadInstance()
        const existingRef = await payload.find({
          collection: 'character-references',
          where: {
            and: [
              { project: { equals: projectId } },
              { projectCharacterName: { equals: characterName } }
            ]
          }
        })
        
        if (existingRef.docs.length > 0) {
          await payload.update({
            collection: 'character-references',
            id: existingRef.docs[0].id,
            data: { 
              generationStatus: 'failed',
              generationMetadata: {
                generatedAt: existingRef.docs[0].generationMetadata?.generatedAt,
                errorMessage: error instanceof Error ? error.message : 'Character generation failed'
              }
            }
          })
        }
      } catch (updateError) {
        console.error('Failed to update character status to failed:', updateError)
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character generation failed',
        status: 'failed'
      }
    }
  }

  private async generateCharacterWithBAML(projectData: any, characterName: string): Promise<any> {
    const bamlClient = getBamlClient()
    
    const context = {
      projectName: projectData.name,
      genres: projectData.initialConcept?.genre || [],
      premise: projectData.initialConcept?.premise || '',
      tone: projectData.tone || '',
      mood: projectData.mood || '',
      targetAudience: projectData.initialConcept?.targetAudience || '',
      characterName
    }

    return await bamlClient.GenerateCharacterDevelopment(context)
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
      where: { project: { equals: projectId } }
    })

    // Enrich with library data
    const enrichedCharacters = await Promise.all(
      characterRefs.docs.map(async (ref) => {
        try {
          const libraryData = await characterLibraryClient.getCharacter(ref.libraryCharacterId)
          return {
            referenceId: ref.id,
            projectName: ref.projectCharacterName,
            libraryId: ref.libraryCharacterId,
            role: ref.characterRole,
            status: ref.generationStatus,
            generatedAt: ref.generationMetadata?.generatedAt,
            lastImageUpdate: ref.generationMetadata?.lastImageUpdate,
            libraryData
          }
        } catch (error) {
          console.error(`Failed to fetch library data for character ${ref.libraryCharacterId}:`, error)
          return {
            referenceId: ref.id,
            projectName: ref.projectCharacterName,
            libraryId: ref.libraryCharacterId,
            role: ref.characterRole,
            status: 'failed',
            error: 'Failed to fetch from Character Library'
          }
        }
      })
    )

    return enrichedCharacters
  }

  async regenerateCharacter(
    characterReferenceId: string
  ): Promise<CharacterGenerationResult> {
    try {
      const payload = await this.getPayloadInstance()
      
      // Get the character reference
      const characterRef = await payload.findByID({
        collection: 'character-references',
        id: characterReferenceId,
        depth: 2
      })

      if (!characterRef) {
        return {
          success: false,
          error: 'Character reference not found',
          status: 'failed'
        }
      }

      // Get project data
      const project = await payload.findByID({
        collection: 'projects',
        id: typeof characterRef.project === 'string' ? characterRef.project : characterRef.project.id,
        depth: 2
      })

      // Regenerate the character
      return await this.generateAndStoreCharacter(
        typeof characterRef.project === 'string' ? characterRef.project : characterRef.project.id,
        characterRef.projectCharacterName,
        project,
        characterRef.characterRole
      )

    } catch (error) {
      console.error('Character regeneration failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character regeneration failed',
        status: 'failed'
      }
    }
  }
}
