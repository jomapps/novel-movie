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

  async generateSmartImage(
    characterId: string, 
    request: SmartImageGenerationRequest
  ): Promise<SmartImageGenerationResponse> {
    const endpoint = `/api/characters/${characterId}/generate-smart-image`
    return this.makeRequest('POST', endpoint, request)
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
          signal: AbortSignal.timeout(this.timeout)
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        console.error(`Character Library API attempt ${attempt} failed:`, error)
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Character Library API failed after ${this.retryAttempts} attempts: ${error}`)
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
}

export const characterLibraryClient = new CharacterLibraryClient()
