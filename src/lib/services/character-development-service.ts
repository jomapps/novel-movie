import { characterLibraryClient } from './character-library-client'
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

export class CharacterDevelopmentService {
  async generateSceneSpecificImage(
    character: Character,
    request: CharacterVisualsRequest
  ): Promise<CharacterVisualsResponse> {
    if (!character.characterLibraryId) {
      return {
        success: false,
        error: 'Character not linked to Character Library'
      }
    }

    try {
      const response = await characterLibraryClient.generateSmartImage(
        character.characterLibraryId,
        {
          prompt: request.prompt,
          maxRetries: 5,
          qualityThreshold: request.qualityThreshold || 70,
          consistencyThreshold: request.consistencyThreshold || 85,
          style: request.style || 'character_production',
          tags: request.sceneContext || 'scene generation'
        }
      )

      if (response.success && response.data) {
        return {
          success: true,
          imageUrl: response.data.publicUrl,
          qualityScore: response.data.qualityScore,
          consistencyScore: response.data.consistencyScore
        }
      } else {
        return {
          success: false,
          error: response.error || 'Image generation failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async queryCharacterKnowledge(query: string): Promise<string | null> {
    try {
      const response = await characterLibraryClient.queryCharacters(query)
      return response.data?.result || null
    } catch (error) {
      console.error('Character knowledge query failed:', error)
      return null
    }
  }
}

export const characterDevelopmentService = new CharacterDevelopmentService()
