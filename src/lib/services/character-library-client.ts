import { CHARACTER_LIBRARY_CONFIG } from '@/lib/config/character-library'

export interface CharacterLibraryCharacter {
  name: string
  characterId: string
  status: 'draft' | 'in_development' | 'ready' | 'in_production' | 'archived'
  biography: string
  personality: string
  physicalDescription: string
  age?: number
  height?: string
  eyeColor?: string
  hairColor?: string
}

export interface SmartImageGenerationRequest {
  prompt: string
  maxRetries?: number
  qualityThreshold?: number
  consistencyThreshold?: number
  style?: string
  tags?: string
}

export interface SmartImageGenerationResponse {
  success: boolean
  message: string
  data?: {
    characterId: string
    characterName: string
    imageId: string
    dinoAssetId: string
    publicUrl: string
    selectedReferenceId: string
    selectedReferenceType: 'master' | 'core_reference' | 'generated'
    qualityScore: number
    consistencyScore: number
    attempts: number
    generationTime: number
    filename: string
  }
  error?: string
}

export class CharacterLibraryClient {
  private baseUrl: string
  private timeout: number
  private retryAttempts: number

  constructor() {
    this.baseUrl = CHARACTER_LIBRARY_CONFIG.baseUrl
    this.timeout = CHARACTER_LIBRARY_CONFIG.timeout
    this.retryAttempts = CHARACTER_LIBRARY_CONFIG.retryAttempts
  }

  async createCharacter(character: CharacterLibraryCharacter): Promise<any> {
    return this.makeRequest('POST', '/api/characters', character)
  }

  async createNovelMovieCharacter(character: any, project: any): Promise<any> {
    const endpoint = '/api/v1/characters/novel-movie'
    const payload = {
      novelMovieProjectId: project.id,
      projectName: project.name,
      characterData: this.mapToCharacterLibraryFormat(character),
      syncSettings: {
        autoSync: true,
        conflictResolution: 'novel-movie-wins',
      },
    }
    return this.makeRequest('POST', endpoint, payload)
  }

  async generateSmartImage(
    characterId: string,
    request: SmartImageGenerationRequest,
  ): Promise<SmartImageGenerationResponse> {
    const endpoint = `/api/characters/${characterId}/generate-smart-image`
    return this.makeRequest('POST', endpoint, request)
  }

  async generateSceneSpecificImage(characterId: string, sceneContext: any): Promise<any> {
    const endpoint = `/api/v1/characters/${characterId}/generate-scene-image`
    const payload = {
      sceneContext: sceneContext.description,
      sceneType: sceneContext.type || 'dialogue',
      mood: sceneContext.mood,
      lightingStyle: sceneContext.lighting,
    }
    return this.makeRequest('POST', endpoint, payload)
  }

  async generateInitialImage(characterId: string, prompt: string): Promise<any> {
    const endpoint = `/api/characters/${characterId}/generate-initial-image`
    return this.makeRequest('POST', endpoint, { prompt })
  }

  async generateCoreSet(characterId: string): Promise<any> {
    const endpoint = `/api/characters/${characterId}/generate-core-set`
    return this.makeRequest('POST', endpoint, {})
  }

  async queryCharacters(query: string): Promise<any> {
    return this.makeRequest('POST', '/api/characters/query', { query })
  }

  async validateProjectConsistency(projectId: string): Promise<any> {
    const endpoint = '/api/v1/characters/validate-project-consistency'
    const payload = {
      projectId,
      includeVisualValidation: true,
      includeNarrativeValidation: true,
      includeRelationshipValidation: true,
      qualityThreshold: 70,
      consistencyThreshold: 85,
    }
    return this.makeRequest('POST', endpoint, payload)
  }

  async bulkCreateCharacters(projectId: string, characters: any[]): Promise<any> {
    const endpoint = '/api/v1/characters/bulk/novel-movie'
    const payload = {
      projectId,
      characters: characters.map((character) => ({
        characterData: this.mapToCharacterLibraryFormat(character),
      })),
      operation: 'create',
      syncSettings: {
        autoSync: true,
        conflictResolution: 'novel-movie-wins',
      },
    }
    return this.makeRequest('POST', endpoint, payload)
  }

  // Get existing character data
  async getCharacter(characterId: string): Promise<any> {
    const endpoint = `/api/v1/characters/${characterId}`
    return this.makeRequest('GET', endpoint)
  }

  // Update existing Novel Movie character with incremental enhancement
  async updateNovelMovieCharacter(characterId: string, updateData: any): Promise<any> {
    const endpoint = `/api/v1/characters/${characterId}/novel-movie-sync`
    return this.makeRequest('PUT', endpoint, updateData)
  }

  private mapToCharacterLibraryFormat(character: any): CharacterLibraryCharacter {
    return {
      name: character.name,
      characterId:
        character.characterId ||
        `${character.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'in_development' as const,
      biography: character.characterDevelopment?.biography || '',
      personality: character.characterDevelopment?.personality || '',
      physicalDescription: character.physicalDescription?.description || '',
      age: character.physicalDescription?.age,
      height: character.physicalDescription?.height,
      eyeColor: character.physicalDescription?.eyeColor,
      hairColor: character.physicalDescription?.hairColor,
    }
  }

  private getDefaultValidationRules(): any[] {
    return [
      { type: 'visual_consistency', threshold: 85 },
      { type: 'narrative_consistency', threshold: 80 },
      { type: 'character_depth', threshold: 75 },
    ]
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(this.timeout),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.error(`Character Library API attempt ${attempt} failed:`, error)

        if (attempt === this.retryAttempts) {
          throw new Error(
            `Character Library API failed after ${this.retryAttempts} attempts: ${error}`,
          )
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
}

export const characterLibraryClient = new CharacterLibraryClient()
