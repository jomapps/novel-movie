import { characterLibraryClient } from './character-library-client'
import { characterSyncService } from './character-sync-service'
import { checkCharacterLibraryHealth } from './character-library-health'
import { getBamlClient } from '@/lib/ai/baml-client'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Character } from '@/payload-types'

export interface CharacterVisualsRequest {
  characterId: string
  sceneContext?: string
  prompt: string
  style?: string
  qualityThreshold?: number
  consistencyThreshold?: number
}

export interface CharacterVisualsResponse {
  success: boolean
  imageUrl?: string
  qualityScore?: number
  consistencyScore?: number
  error?: string
}

export interface SceneContext {
  description: string
  type: 'dialogue' | 'action' | 'emotional' | 'establishing'
  mood?: string
  lighting?: string
  characters?: string[]
}

export interface VisualAssetCollection {
  masterReferenceImage: {
    url: string
    dinoAssetId: string
    qualityScore: number
  }
  coreReferenceSet: Array<{
    url: string
    shotType: string
    consistencyScore: number
  }>
  generatedImages: Array<{
    url: string
    sceneId?: string
    prompt: string
    qualityScore: number
  }>
}

export class CharacterDevelopmentService {
  private payload: any

  constructor() {
    this.initializePayload()
  }

  private async initializePayload() {
    if (!this.payload) {
      this.payload = await getPayload({ config })
    }
  }

  async generateSceneSpecificImage(
    character: Character,
    request: CharacterVisualsRequest,
  ): Promise<CharacterVisualsResponse> {
    const libId =
      (character as any)?.characterLibraryId ||
      (character as any)?.libraryIntegration?.characterLibraryId ||
      (character as any)?.libraryCharacterId
    if (!libId) {
      return {
        success: false,
        error: 'Character not linked to Character Library',
      }
    }

    try {
      const sceneContext: SceneContext = {
        description: request.sceneContext || request.prompt,
        type: 'dialogue',
        mood: 'neutral',
      }

      const response = await characterLibraryClient.generateSceneSpecificImage(libId, sceneContext)

      return {
        success: response.success !== false,
        imageUrl: response.publicUrl || response.imageUrl,
        qualityScore: response.qualityScore || 0,
        consistencyScore: response.consistencyScore || 0,
        error: response.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      }
    }
  }

  async generateMasterReference(character: Character): Promise<CharacterVisualsResponse> {
    const libId =
      (character as any)?.characterLibraryId ||
      (character as any)?.libraryIntegration?.characterLibraryId ||
      (character as any)?.libraryCharacterId
    if (!libId) {
      return {
        success: false,
        error: 'Character not linked to Character Library',
      }
    }

    try {
      const physicalDesc = character.physicalDescription?.description || ''
      const personality = character.characterDevelopment?.personality || ''

      const masterPrompt = `Professional character reference image: ${physicalDesc}. ${personality}. High quality, clear lighting, neutral background, full body view.`

      const response = await characterLibraryClient.generateInitialImage(libId, masterPrompt)

      return {
        success: response.success !== false,
        imageUrl: response.publicUrl || response.imageUrl,
        qualityScore: response.qualityScore || 0,
        consistencyScore: response.consistencyScore || 0,
        error: response.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Master reference generation failed',
      }
    }
  }

  async generateCoreReferenceSet(character: Character): Promise<CharacterVisualsResponse> {
    const libId =
      (character as any)?.characterLibraryId ||
      (character as any)?.libraryIntegration?.characterLibraryId ||
      (character as any)?.libraryCharacterId
    if (!libId) {
      return {
        success: false,
        error: 'Character not linked to Character Library',
      }
    }

    try {
      const response = await characterLibraryClient.generateCoreSet(libId)

      return {
        success: response.success !== false,
        imageUrl: response.images?.[0]?.publicUrl || '',
        qualityScore: response.averageQuality || 0,
        consistencyScore: response.averageConsistency || 0,
        error: response.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Core reference set generation failed',
      }
    }
  }

  async enhanceCharacterProfile(characterId: string, focusAreas: string[]): Promise<any> {
    await this.initializePayload()

    try {
      // Get character and related data
      const character = await this.payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 2,
      })

      if (!character) {
        return {
          success: false,
          error: 'Character not found',
        }
      }

      // Get story content for context
      const story = await this.payload.find({
        collection: 'stories',
        where: {
          project: {
            equals: character.project,
          },
        },
        depth: 1,
      })

      if (story.docs.length === 0) {
        return {
          success: false,
          error: 'Story not found for character enhancement',
        }
      }

      // Use BAML to enhance character
      const bamlClient = await getBamlClient()

      // Prepare character data as array of strings (as expected by BAML)
      const existingCharacterData = [JSON.stringify(character)]

      const enhancementResult = await bamlClient.EnhanceCharacterProfiles(
        existingCharacterData,
        story.docs[0].currentContent || '',
        focusAreas || ['dialogue', 'psychology', 'relationships'],
      )

      // Update character with enhanced data
      const enhancedCharacter = enhancementResult.characters[0]
      if (enhancedCharacter) {
        await this.payload.update({
          collection: 'characters',
          id: characterId,
          data: {
            characterDevelopment: {
              biography: enhancedCharacter.characterDevelopment.biography,
              personality: enhancedCharacter.characterDevelopment.personality,
              motivations: enhancedCharacter.characterDevelopment.motivations,
              backstory: enhancedCharacter.characterDevelopment.backstory,
              psychology: enhancedCharacter.characterDevelopment.psychology,
            },
            dialogueVoice: enhancedCharacter.dialogueVoice,
            relationships: enhancedCharacter.relationships.map((rel: any) => ({
              character: rel.character,
              relationship: rel.relationship,
              dynamic: rel.dynamic,
            })),
            generationMetadata: {
              ...character.generationMetadata,
              qualityScore: enhancedCharacter.generationMetadata.qualityScore,
              completeness: enhancedCharacter.generationMetadata.completeness,
              generationMethod: 'ai_enhanced',
            },
          },
        })
      }

      return {
        success: true,
        enhancedCharacter: enhancedCharacter,
        qualityMetrics: enhancementResult.qualityMetrics,
        generationNotes: enhancementResult.generationNotes,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character enhancement failed',
      }
    }
  }

  async validateCharacterConsistency(characterId: string): Promise<any> {
    await this.initializePayload()

    try {
      const character = await this.payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 2,
      })

      if (!character) {
        return {
          success: false,
          error: 'Character not found',
        }
      }

      // Get story structure for validation
      const storyStructure = await this.payload.find({
        collection: 'story-structures',
        where: {
          project: {
            equals: character.project,
          },
        },
        depth: 1,
      })

      if (storyStructure.docs.length === 0) {
        return {
          success: false,
          error: 'Story structure not found for validation',
        }
      }

      // Get story content
      const story = await this.payload.find({
        collection: 'stories',
        where: {
          project: {
            equals: character.project,
          },
        },
        depth: 1,
      })

      if (story.docs.length === 0) {
        return {
          success: false,
          error: 'Story not found for validation',
        }
      }

      // Use BAML to validate character consistency
      const bamlClient = await getBamlClient()
      const characterData = [JSON.stringify(character)]
      const storyBeats =
        storyStructure.docs[0].storyBeats?.map(
          (beat: any) => `Beat ${beat.beat}: ${beat.description}`,
        ) || []

      const validationResult = await bamlClient.ValidateCharacterConsistency(
        characterData,
        storyBeats,
        story.docs[0].currentContent || '',
      )

      return {
        success: true,
        qualityMetrics: validationResult,
        recommendations: this.generateValidationRecommendations(validationResult),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Character validation failed',
      }
    }
  }

  private generateValidationRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    if (metrics.characterDepth < 75) {
      recommendations.push('Consider adding more depth to character psychology and motivations')
    }
    if (metrics.arcConsistency < 80) {
      recommendations.push('Review character arc for consistency with story progression')
    }
    if (metrics.relationshipClarity < 70) {
      recommendations.push('Clarify character relationships and dynamics')
    }
    if (metrics.dialogueDistinction < 75) {
      recommendations.push('Enhance dialogue voice to make character speech more distinctive')
    }

    return recommendations
  }

  async syncCharacterToLibrary(characterId: string): Promise<any> {
    return await characterSyncService.syncCharacterToLibrary(characterId)
  }

  async syncProjectCharacters(projectId: string): Promise<any> {
    return await characterSyncService.syncProjectCharacters(projectId)
  }
}

export const characterDevelopmentService = new CharacterDevelopmentService()
