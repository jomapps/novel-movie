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
  private characterIdCounter: number = 0

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
      characterData: this.mapToCharacterLibraryFormat(character, project),
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

  async bulkCreateCharacters(projectId: string, characters: any[], project?: any): Promise<any> {
    const endpoint = '/api/v1/characters/bulk/novel-movie'
    const payload = {
      projectId,
      characters: characters.map((character) => ({
        characterData: this.mapToCharacterLibraryFormat(character, project),
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

  private mapToCharacterLibraryFormat(character: any, project?: any): CharacterLibraryCharacter {
    return {
      name: character.name,
      characterId: character.characterId || this.generateUniqueCharacterId(character.name, project),
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

  /**
   * Generate a unique character ID using multiple entropy sources
   * Format: {project-prefix}-{name-slug}-{timestamp}-{random}-{counter}
   */
  private generateUniqueCharacterId(characterName: string, project?: any): string {
    // Add project prefix for additional uniqueness across projects
    const projectPrefix = project?.id ? project.id.substring(0, 8) : 'nm'
    // Create a clean slug from character name
    const nameSlug = characterName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 20) // Limit length

    // High-resolution timestamp (microseconds)
    const timestamp = Date.now()
    const microTime = performance.now().toString().replace('.', '')

    // Crypto-strong random component (8 characters)
    const randomBytes = new Uint8Array(4)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes)
    } else {
      // Fallback for environments without crypto
      for (let i = 0; i < 4; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256)
      }
    }
    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Process-level counter for additional uniqueness
    if (!this.characterIdCounter) {
      this.characterIdCounter = Math.floor(Math.random() * 1000)
    }
    this.characterIdCounter++

    // Combine all entropy sources with project prefix
    return `${projectPrefix}-${nameSlug}-${timestamp}-${microTime.substring(0, 6)}-${randomHex}-${this.characterIdCounter.toString().padStart(3, '0')}`
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
          // @ts-ignore - Node.js specific option to ignore SSL certificate errors
          agent:
            process.env.NODE_ENV === 'development'
              ? new (require('https').Agent)({ rejectUnauthorized: false })
              : undefined,
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
