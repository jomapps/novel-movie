# Character Library Integration Plan

## 🎯 **Overview**

This document outlines the comprehensive integration of the Character Library service into the Novel Movie system. The Character Library provides AI-powered character image generation, visual consistency validation, and knowledge management capabilities that will enhance our screenplay development workflow.

## 🏗️ **Integration Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOVEL MOVIE SYSTEM                           │
│                   (Next.js + PayloadCMS)                       │
├─────────────────────────────────────────────────────────────────┤
│  Story Gen  │  Character Dev  │  Screenplay  │  Scene Planning  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼─────┐
        │ CHARACTER    │ │   BAML      │ │  SCENE    │
        │ LIBRARY      │ │ FUNCTIONS   │ │ GENERATION│
        │              │ │             │ │           │
        │ • Smart Gen  │ │ • Enhanced  │ │ • Visual  │
        │ • DINOv3     │ │   Prompts   │ │   Prompts │
        │ • PathRAG    │ │ • Character │ │ • Ref     │
        │ • 360° Refs  │ │   Context   │ │   Images  │
        └──────────────┘ └─────────────┘ └───────────┘
```

## 📋 **Implementation Phases**

### **Phase 1: Foundation Setup** ⏱️ 2-3 hours
- Environment configuration
- Service connectivity testing
- Basic API integration
- Error handling framework

### **Phase 2: Character Development Integration** ⏱️ 4-6 hours
- Enhance character creation workflow
- Implement Character Library character creation
- Add smart image generation
- Update local character records

### **Phase 3: Visual Consistency System** ⏱️ 3-4 hours
- Integrate DINOv3 validation
- Implement consistency scoring
- Add visual guidelines to story structure
- Create validation workflows

### **Phase 4: Scene Generation Enhancement** ⏱️ 5-7 hours
- Scene-specific character image generation
- BAML prompt enhancement with character context
- Reference image selection for scenes
- Automated consistency validation

### **Phase 5: UI/UX Integration** ⏱️ 3-4 hours
- Character gallery display
- Consistency score indicators
- Image generation controls
- Progress tracking

### **Phase 6: Testing & Optimization** ⏱️ 2-3 hours
- End-to-end testing
- Performance optimization
- Error handling validation
- Documentation updates

---

## 🔧 **Phase 1: Foundation Setup**

### **1.1 Environment Configuration**

**File**: `.env.local`
```env
# Character Library Service
CHARACTER_LIBRARY_API_URL=https://character.ft.tc
CHARACTER_LIBRARY_TIMEOUT=60000
CHARACTER_LIBRARY_RETRY_ATTEMPTS=3
```

**File**: `src/lib/config/character-library.ts`
```typescript
export const CHARACTER_LIBRARY_CONFIG = {
  baseUrl: process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc',
  timeout: parseInt(process.env.CHARACTER_LIBRARY_TIMEOUT || '60000'),
  retryAttempts: parseInt(process.env.CHARACTER_LIBRARY_RETRY_ATTEMPTS || '3'),
  
  // Quality thresholds
  qualityThreshold: 70,
  consistencyThreshold: 85,
  
  // Generation settings
  defaultStyle: 'character_production',
  maxRetries: 5,
  
  // Endpoints
  endpoints: {
    characters: '/api/characters',
    generateSmart: '/api/characters/{id}/generate-smart-image',
    generateInitial: '/api/characters/{id}/generate-initial-image',
    generateCoreSet: '/api/characters/{id}/generate-core-set',
    query: '/api/characters/query',
    validate: '/api/characters/{id}/validate-consistency'
  }
}
```

### **1.2 Service Client Implementation**

**File**: `src/lib/services/character-library-client.ts`
```typescript
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
```

### **1.3 Service Health Check**

**File**: `src/lib/services/character-library-health.ts`
```typescript
import { characterLibraryClient } from './character-library-client'

export interface HealthCheckResult {
  isHealthy: boolean
  responseTime: number
  error?: string
  timestamp: Date
}

export async function checkCharacterLibraryHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Simple health check - query for any characters
    await characterLibraryClient.queryCharacters('test health check')
    
    return {
      isHealthy: true,
      responseTime: Date.now() - startTime,
      timestamp: new Date()
    }
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }
  }
}
```

---

## 🎭 **Phase 2: Character Development Integration**

### **2.1 Enhanced Character Collection Schema**

**File**: `src/collections/Characters.ts` (additions)
```typescript
// Add these fields to the existing Characters collection

{
  // ... existing fields

  // Character Library Integration
  name: 'characterLibraryId',
  type: 'text',
  admin: {
    description: 'Character Library service ID for this character',
    readOnly: true,
  },
},
{
  name: 'characterLibraryStatus',
  type: 'select',
  options: [
    { label: 'Not Created', value: 'not_created' },
    { label: 'Creating', value: 'creating' },
    { label: 'Created', value: 'created' },
    { label: 'Error', value: 'error' },
  ],
  defaultValue: 'not_created',
  admin: {
    description: 'Status of character in Character Library service',
  },
},
{
  name: 'visualAssets',
  type: 'group',
  admin: {
    description: 'Visual assets and consistency data from Character Library',
  },
  fields: [
    {
      name: 'masterReferenceImage',
      type: 'group',
      fields: [
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Public URL of master reference image' },
        },
        {
          name: 'dinoAssetId',
          type: 'text',
          admin: { description: 'DINOv3 asset ID for consistency validation' },
        },
        {
          name: 'qualityScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: { description: 'DINOv3 quality score (0-100)' },
        },
      ],
    },
    {
      name: 'coreReferenceSet',
      type: 'array',
      admin: {
        description: '360° core reference images',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'shotType',
          type: 'select',
          options: [
            { label: 'Front View', value: 'front' },
            { label: 'Back View', value: 'back' },
            { label: 'Left Side', value: 'left_side' },
            { label: 'Right Side', value: 'right_side' },
            { label: '45° Angle', value: 'angle_45' },
            { label: '135° Angle', value: 'angle_135' },
            { label: '225° Angle', value: 'angle_225' },
            { label: '315° Angle', value: 'angle_315' },
          ],
        },
        {
          name: 'consistencyScore',
          type: 'number',
          min: 0,
          max: 100,
        },
      ],
    },
    {
      name: 'generatedImages',
      type: 'array',
      admin: {
        description: 'Scene-specific generated images',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'prompt',
          type: 'textarea',
          admin: { description: 'Generation prompt used' },
        },
        {
          name: 'sceneContext',
          type: 'text',
          admin: { description: 'Scene or context this image was generated for' },
        },
        {
          name: 'qualityScore',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'consistencyScore',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'generatedAt',
          type: 'date',
        },
      ],
    },
  ],
},
```

### **2.2 Enhanced Character Development API Route**

**File**: `src/app/v1/projects/[id]/character-development/route.ts` (modifications)

Add these imports and functions:

```typescript
import { characterLibraryClient } from '@/lib/services/character-library-client'
import { checkCharacterLibraryHealth } from '@/lib/services/character-library-health'

// Add this function after the existing imports
async function createCharacterInLibrary(character: any, project: any): Promise<{
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
        status: 'created'
      }
    } else {
      return {
        characterLibraryId: null,
        status: 'error',
        error: response.error || 'Unknown error creating character'
      }
    }
  } catch (error) {
    console.error('Error creating character in Character Library:', error)
    return {
      characterLibraryId: null,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function generateCharacterVisuals(
  characterLibraryId: string,
  character: any
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
      masterPrompt
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
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### **2.3 Modified Character Creation Logic**

Replace the character creation loop in the POST handler:

```typescript
// Replace the existing character creation loop with this enhanced version
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

    // ... existing character development fields
    characterDevelopment: {
      biography: character.characterDevelopment.biography,
      personality: character.characterDevelopment.personality,
      motivations: character.characterDevelopment.motivations,
      backstory: character.characterDevelopment.backstory,
      psychology: {
        motivation: character.characterDevelopment.psychology.motivation,
        fears: character.characterDevelopment.psychology.fears,
        strengths: character.characterDevelopment.psychology.strengths,
        weaknesses: character.characterDevelopment.psychology.weaknesses,
        internalConflict: character.characterDevelopment.psychology.internalConflict,
      },
    },

    // ... existing fields (physicalDescription, dialogueVoice, relationships, etc.)
    physicalDescription: {
      description: character.physicalDescription.description,
      age: character.physicalDescription.age,
      height: character.physicalDescription.height,
      build: character.physicalDescription.build,
      eyeColor: character.physicalDescription.eyeColor,
      hairColor: character.physicalDescription.hairColor,
      distinctiveFeatures: character.physicalDescription.distinctiveFeatures,
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
      character
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
      console.warn(`⚠️ Visual asset generation failed for ${character.name}:`, visualsResult.error)
    }
  }

  createdCharacters.push(createdCharacter)
}
```

### **2.4 Character Development Service**

**File**: `src/lib/services/character-development-service.ts`
```typescript
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
```

---

## 🎨 **Phase 3: Visual Consistency System**

### **3.1 Story Structure Visual Guidelines**

**File**: `src/collections/StoryStructures.ts` (additions)

Add these fields to the existing StoryStructures collection:

```typescript
// Add after existing fields
{
  name: 'visualGuidelines',
  type: 'group',
  admin: {
    description: 'Visual consistency guidelines for AI generation',
  },
  fields: [
    {
      name: 'overallTone',
      type: 'select',
      options: [
        { label: 'Dark & Moody', value: 'dark_moody' },
        { label: 'Bright & Optimistic', value: 'bright_optimistic' },
        { label: 'Neutral & Balanced', value: 'neutral_balanced' },
        { label: 'Dramatic & Intense', value: 'dramatic_intense' },
        { label: 'Soft & Romantic', value: 'soft_romantic' },
        { label: 'Gritty & Realistic', value: 'gritty_realistic' },
      ],
      admin: {
        description: 'Overall visual tone for the story',
      },
    },
    {
      name: 'colorPalette',
      type: 'array',
      admin: {
        description: 'Primary colors for visual consistency',
      },
      fields: [
        {
          name: 'color',
          type: 'text',
          required: true,
          admin: {
            description: 'Color name or hex code (e.g., "deep blue" or "#1a365d")',
          },
        },
        {
          name: 'usage',
          type: 'text',
          admin: {
            description: 'When/how this color should be used',
          },
        },
      ],
    },
    {
      name: 'lightingStyle',
      type: 'select',
      options: [
        { label: 'Natural Lighting', value: 'natural' },
        { label: 'Dramatic Lighting', value: 'dramatic' },
        { label: 'Soft Lighting', value: 'soft' },
        { label: 'High Contrast', value: 'high_contrast' },
        { label: 'Low Key', value: 'low_key' },
        { label: 'High Key', value: 'high_key' },
      ],
      admin: {
        description: 'Preferred lighting style for scenes',
      },
    },
    {
      name: 'cinematographyNotes',
      type: 'textarea',
      admin: {
        description: 'Additional visual style notes for AI generation',
      },
    },
  ],
},
{
  name: 'worldConsistencyRules',
  type: 'group',
  admin: {
    description: 'World-building consistency rules',
  },
  fields: [
    {
      name: 'locationGuidelines',
      type: 'textarea',
      admin: {
        description: 'Guidelines for location appearance and atmosphere',
      },
    },
    {
      name: 'propConsistency',
      type: 'textarea',
      admin: {
        description: 'Important props and their consistent appearance',
      },
    },
    {
      name: 'atmosphereNotes',
      type: 'textarea',
      admin: {
        description: 'Overall atmosphere and mood guidelines',
      },
    },
  ],
},
```

### **3.2 Visual Consistency Validation Service**

**File**: `src/lib/services/visual-consistency-service.ts`
```typescript
import { characterLibraryClient } from './character-library-client'
import type { Character, StoryStructure } from '@/payload-types'

export interface ConsistencyValidationResult {
  isConsistent: boolean
  qualityScore: number
  consistencyScore: number
  warnings: string[]
  recommendations: string[]
}

export interface VisualPromptContext {
  storyGuidelines?: StoryStructure['visualGuidelines']
  worldRules?: StoryStructure['worldConsistencyRules']
  characterContext?: Character[]
  sceneDescription?: string
}

export class VisualConsistencyService {
  /**
   * Generate enhanced prompt with visual consistency context
   */
  generateEnhancedPrompt(
    basePrompt: string,
    context: VisualPromptContext
  ): string {
    let enhancedPrompt = basePrompt

    // Add visual guidelines
    if (context.storyGuidelines) {
      const guidelines = context.storyGuidelines

      if (guidelines.overallTone) {
        enhancedPrompt += `, ${guidelines.overallTone.replace('_', ' ')} visual tone`
      }

      if (guidelines.lightingStyle) {
        enhancedPrompt += `, ${guidelines.lightingStyle.replace('_', ' ')} lighting`
      }

      if (guidelines.colorPalette && guidelines.colorPalette.length > 0) {
        const colors = guidelines.colorPalette.map(c => c.color).join(', ')
        enhancedPrompt += `, color palette: ${colors}`
      }

      if (guidelines.cinematographyNotes) {
        enhancedPrompt += `, ${guidelines.cinematographyNotes}`
      }
    }

    // Add world consistency rules
    if (context.worldRules) {
      if (context.worldRules.atmosphereNotes) {
        enhancedPrompt += `, atmosphere: ${context.worldRules.atmosphereNotes}`
      }
    }

    // Add scene context
    if (context.sceneDescription) {
      enhancedPrompt += `, scene context: ${context.sceneDescription}`
    }

    return enhancedPrompt
  }

  /**
   * Validate character image consistency
   */
  async validateCharacterConsistency(
    characterId: string,
    imageUrl: string
  ): Promise<ConsistencyValidationResult> {
    try {
      // This would call the Character Library's validation endpoint
      // For now, we'll simulate the validation
      const response = await characterLibraryClient.queryCharacters(
        `validate consistency for character ${characterId}`
      )

      // Simulate validation results
      const qualityScore = Math.floor(Math.random() * 30) + 70 // 70-100
      const consistencyScore = Math.floor(Math.random() * 20) + 80 // 80-100

      const warnings: string[] = []
      const recommendations: string[] = []

      if (qualityScore < 75) {
        warnings.push('Image quality below recommended threshold')
        recommendations.push('Consider regenerating with higher quality settings')
      }

      if (consistencyScore < 85) {
        warnings.push('Character consistency below threshold')
        recommendations.push('Use master reference image for better consistency')
      }

      return {
        isConsistent: consistencyScore >= 85 && qualityScore >= 70,
        qualityScore,
        consistencyScore,
        warnings,
        recommendations
      }
    } catch (error) {
      console.error('Consistency validation failed:', error)
      return {
        isConsistent: false,
        qualityScore: 0,
        consistencyScore: 0,
        warnings: ['Validation service unavailable'],
        recommendations: ['Retry validation when service is available']
      }
    }
  }

  /**
   * Get character reference images for scene generation
   */
  async getOptimalCharacterReference(
    character: Character,
    sceneContext: string
  ): Promise<{
    referenceUrl?: string
    referenceType: 'master' | 'core_reference' | 'generated'
    confidence: number
  }> {
    if (!character.visualAssets) {
      return { referenceType: 'master', confidence: 0 }
    }

    // Analyze scene context to determine best reference
    const sceneKeywords = sceneContext.toLowerCase()

    // Check for specific angle requirements
    if (sceneKeywords.includes('profile') || sceneKeywords.includes('side')) {
      const sideRef = character.visualAssets.coreReferenceSet?.find(
        ref => ref.shotType === 'left_side' || ref.shotType === 'right_side'
      )
      if (sideRef) {
        return {
          referenceUrl: sideRef.url,
          referenceType: 'core_reference',
          confidence: 0.9
        }
      }
    }

    if (sceneKeywords.includes('back') || sceneKeywords.includes('behind')) {
      const backRef = character.visualAssets.coreReferenceSet?.find(
        ref => ref.shotType === 'back'
      )
      if (backRef) {
        return {
          referenceUrl: backRef.url,
          referenceType: 'core_reference',
          confidence: 0.9
        }
      }
    }

    // Default to master reference
    if (character.visualAssets.masterReferenceImage?.url) {
      return {
        referenceUrl: character.visualAssets.masterReferenceImage.url,
        referenceType: 'master',
        confidence: 0.8
      }
    }

    return { referenceType: 'master', confidence: 0 }
  }
}

export const visualConsistencyService = new VisualConsistencyService()
```

---

## 🎬 **Phase 4: Scene Generation Enhancement**

### **4.1 Enhanced BAML Functions**

**File**: `baml_src/character_development.baml` (modifications)

Add character library context to existing functions:

```baml
// Enhanced character development with Character Library integration
function DevelopCharactersWithVisuals(
  storyContent: string,
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  durationUnit: int,
  primaryGenres: string[],
  targetAudience: string[],
  characterArcs: string[],
  storyBeats: string[],
  visualGuidelines: string? // New parameter for visual consistency
) -> CharacterDevelopmentResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a master character development specialist with expertise in creating characters optimized for AI visual generation. Your task is to create comprehensive character profiles that will be used to generate consistent visual assets.

    STORY CONTENT:
    {{ storyContent }}

    PROJECT CONTEXT:
    - Project: {{ projectName }}
    - Format: {{ movieFormat }}
    - Style: {{ movieStyle }}
    - Duration: {{ durationUnit }} minutes
    - Genres: {{ primaryGenres|join(", ") }}
    - Target Audience: {{ targetAudience|join(", ") }}

    {% if visualGuidelines %}
    VISUAL CONSISTENCY GUIDELINES:
    {{ visualGuidelines }}

    CRITICAL: Ensure all character descriptions align with these visual guidelines for consistent AI generation.
    {% endif %}

    CHARACTER ARCS TO DEVELOP:
    {% for arc in characterArcs %}
    - {{ arc }}
    {% endfor %}

    KEY STORY BEATS FOR CHARACTER PRESENCE:
    {% for beat in storyBeats %}
    - {{ beat }}
    {% endfor %}

    ENHANCED REQUIREMENTS FOR AI VISUAL GENERATION:

    1. **PHYSICAL DESCRIPTIONS**: Provide extremely detailed, specific physical descriptions that AI can consistently reproduce:
       - Exact facial features, bone structure, distinctive marks
       - Specific clothing style, colors, and accessories
       - Unique physical mannerisms and posture
       - Hair texture, style, and exact color
       - Eye shape, color, and expression characteristics

    2. **VISUAL CONSISTENCY MARKERS**: Include specific visual elements that help maintain character consistency:
       - Signature clothing items or accessories
       - Distinctive physical features (scars, tattoos, jewelry)
       - Characteristic poses or expressions
       - Color associations (clothing, accessories)

    3. **AI GENERATION OPTIMIZATION**: Structure descriptions for optimal AI image generation:
       - Use clear, unambiguous descriptive language
       - Avoid contradictory or vague descriptions
       - Include lighting and mood preferences for the character
       - Specify camera angles that work best for the character

    4. **SCENE ADAPTABILITY**: Ensure character descriptions work across different scenes:
       - Provide both formal and casual appearance options
       - Include emotional range and how it affects appearance
       - Specify how character looks in different lighting conditions
       - Consider character's appearance in various settings

    Generate comprehensive character profiles that will enable consistent, high-quality AI visual generation across all scenes and contexts.
  "#
}
```

### **4.2 Scene Generation Service**

**File**: `src/lib/services/scene-generation-service.ts`
```typescript
import { characterDevelopmentService } from './character-development-service'
import { visualConsistencyService } from './visual-consistency-service'
import type { Character, StoryStructure } from '@/payload-types'

export interface SceneCharacterRequirement {
  character: Character
  role: 'primary' | 'secondary' | 'background'
  action: string
  emotion: string
  position: string
}

export interface SceneGenerationRequest {
  sceneDescription: string
  characters: SceneCharacterRequirement[]
  storyStructure: StoryStructure
  visualStyle?: string
  cameraAngle?: string
  lighting?: string
}

export interface SceneGenerationResult {
  success: boolean
  scenePrompt: string
  characterImages: {
    characterId: string
    imageUrl: string
    qualityScore: number
    consistencyScore: number
  }[]
  visualGuidelines: string
  error?: string
}

export class SceneGenerationService {
  async generateSceneAssets(
    request: SceneGenerationRequest
  ): Promise<SceneGenerationResult> {
    try {
      // Generate enhanced scene prompt with visual consistency
      const visualContext = {
        storyGuidelines: request.storyStructure.visualGuidelines,
        worldRules: request.storyStructure.worldConsistencyRules,
        characterContext: request.characters.map(c => c.character),
        sceneDescription: request.sceneDescription
      }

      const basePrompt = this.buildScenePrompt(request)
      const enhancedPrompt = visualConsistencyService.generateEnhancedPrompt(
        basePrompt,
        visualContext
      )

      // Generate character-specific images for the scene
      const characterImages = []

      for (const charReq of request.characters) {
        if (charReq.role === 'background') continue // Skip background characters

        const characterPrompt = this.buildCharacterScenePrompt(charReq, request)

        const imageResult = await characterDevelopmentService.generateSceneSpecificImage(
          charReq.character,
          {
            characterId: charReq.character.id,
            sceneContext: request.sceneDescription,
            prompt: characterPrompt,
            style: 'character_production',
            qualityThreshold: 75,
            consistencyThreshold: 85
          }
        )

        if (imageResult.success && imageResult.imageUrl) {
          characterImages.push({
            characterId: charReq.character.id,
            imageUrl: imageResult.imageUrl,
            qualityScore: imageResult.qualityScore || 0,
            consistencyScore: imageResult.consistencyScore || 0
          })
        }
      }

      return {
        success: true,
        scenePrompt: enhancedPrompt,
        characterImages,
        visualGuidelines: this.extractVisualGuidelines(request.storyStructure)
      }
    } catch (error) {
      return {
        success: false,
        scenePrompt: '',
        characterImages: [],
        visualGuidelines: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private buildScenePrompt(request: SceneGenerationRequest): string {
    let prompt = request.sceneDescription

    // Add camera and lighting preferences
    if (request.cameraAngle) {
      prompt += `, ${request.cameraAngle} camera angle`
    }

    if (request.lighting) {
      prompt += `, ${request.lighting} lighting`
    }

    if (request.visualStyle) {
      prompt += `, ${request.visualStyle} visual style`
    }

    // Add character context
    const primaryCharacters = request.characters
      .filter(c => c.role === 'primary')
      .map(c => c.character.name)

    if (primaryCharacters.length > 0) {
      prompt += `, featuring ${primaryCharacters.join(' and ')}`
    }

    return prompt
  }

  private buildCharacterScenePrompt(
    charReq: SceneCharacterRequirement,
    sceneReq: SceneGenerationRequest
  ): string {
    const character = charReq.character
    const physicalDesc = character.physicalDescription?.description || ''

    let prompt = `${character.name}: ${physicalDesc}`

    // Add scene-specific context
    prompt += `, ${charReq.action}`

    if (charReq.emotion !== 'neutral') {
      prompt += `, showing ${charReq.emotion} emotion`
    }

    if (charReq.position) {
      prompt += `, positioned ${charReq.position}`
    }

    // Add scene context
    prompt += `, in scene: ${sceneReq.sceneDescription}`

    return prompt
  }

  private extractVisualGuidelines(storyStructure: StoryStructure): string {
    const guidelines = []

    if (storyStructure.visualGuidelines?.overallTone) {
      guidelines.push(`Tone: ${storyStructure.visualGuidelines.overallTone.replace('_', ' ')}`)
    }

    if (storyStructure.visualGuidelines?.lightingStyle) {
      guidelines.push(`Lighting: ${storyStructure.visualGuidelines.lightingStyle.replace('_', ' ')}`)
    }

    if (storyStructure.visualGuidelines?.colorPalette?.length) {
      const colors = storyStructure.visualGuidelines.colorPalette.map(c => c.color).join(', ')
      guidelines.push(`Colors: ${colors}`)
    }

    return guidelines.join(' | ')
  }
}

export const sceneGenerationService = new SceneGenerationService()
```

---

## 🖥️ **Phase 5: UI/UX Integration**

### **5.1 Character Gallery Component**

**File**: `src/components/character/CharacterGallery.tsx`
```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Eye, Download, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Character } from '@/payload-types'

interface CharacterGalleryProps {
  character: Character
  onRegenerateImage?: (imageId: string) => void
  onGenerateNewImage?: () => void
}

export function CharacterGallery({
  character,
  onRegenerateImage,
  onGenerateNewImage
}: CharacterGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const visualAssets = character.visualAssets

  if (!visualAssets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Character Visuals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No visual assets available</p>
          {onGenerateNewImage && (
            <Button onClick={onGenerateNewImage} className="mt-4">
              Generate Initial Images
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const getConsistencyBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-500">Excellent</Badge>
    if (score >= 80) return <Badge variant="default" className="bg-blue-500">Good</Badge>
    if (score >= 70) return <Badge variant="default" className="bg-yellow-500">Fair</Badge>
    return <Badge variant="destructive">Poor</Badge>
  }

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (score >= 70) return <Eye className="w-4 h-4 text-blue-500" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      {/* Master Reference */}
      {visualAssets.masterReferenceImage?.url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Master Reference
              {getQualityIcon(visualAssets.masterReferenceImage.qualityScore || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={visualAssets.masterReferenceImage.url}
                  alt={`${character.name} master reference`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-sm font-medium">Quality Score</label>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={visualAssets.masterReferenceImage.qualityScore || 0}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono">
                      {visualAssets.masterReferenceImage.qualityScore || 0}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Full
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Reference Set */}
      {visualAssets.coreReferenceSet && visualAssets.coreReferenceSet.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>360° Reference Set</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {visualAssets.coreReferenceSet.map((ref, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={ref.url}
                      alt={`${character.name} ${ref.shotType}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium capitalize">
                      {ref.shotType?.replace('_', ' ')}
                    </p>
                    {ref.consistencyScore && (
                      <div className="flex items-center justify-center gap-1">
                        {getConsistencyBadge(ref.consistencyScore)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Images */}
      {visualAssets.generatedImages && visualAssets.generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scene-Specific Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visualAssets.generatedImages.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={img.url}
                      alt={`${character.name} generated image`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    {img.sceneContext && (
                      <p className="text-xs text-muted-foreground">
                        {img.sceneContext}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {img.qualityScore && getQualityIcon(img.qualityScore)}
                        {img.consistencyScore && getConsistencyBadge(img.consistencyScore)}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        {onRegenerateImage && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => onRegenerateImage(img.url)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate New Image */}
      {onGenerateNewImage && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={onGenerateNewImage} className="w-full">
              Generate New Scene Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### **5.2 Character Library Status Component**

**File**: `src/components/character/CharacterLibraryStatus.tsx`
```typescript
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react'
import type { Character } from '@/payload-types'

interface CharacterLibraryStatusProps {
  character: Character
  onSync?: () => void
  onGenerateVisuals?: () => void
}

export function CharacterLibraryStatus({
  character,
  onSync,
  onGenerateVisuals
}: CharacterLibraryStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'creating':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <Badge variant="default" className="bg-green-500">Synced</Badge>
      case 'creating':
        return <Badge variant="default" className="bg-blue-500">Creating</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Not Synced</Badge>
    }
  }

  const hasVisualAssets = character.visualAssets?.masterReferenceImage?.url
  const visualAssetsCount = [
    character.visualAssets?.masterReferenceImage?.url ? 1 : 0,
    character.visualAssets?.coreReferenceSet?.length || 0,
    character.visualAssets?.generatedImages?.length || 0
  ].reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Character Library Integration
          {getStatusIcon(character.characterLibraryStatus || 'not_created')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Sync Status</p>
            <p className="text-sm text-muted-foreground">
              {character.characterLibraryId ?
                `ID: ${character.characterLibraryId}` :
                'Not linked to Character Library'
              }
            </p>
          </div>
          {getStatusBadge(character.characterLibraryStatus || 'not_created')}
        </div>

        {/* Visual Assets Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-medium">Visual Assets</p>
            <Badge variant="outline">
              <ImageIcon className="w-3 h-3 mr-1" />
              {visualAssetsCount} images
            </Badge>
          </div>

          {hasVisualAssets && character.visualAssets?.masterReferenceImage && (
            <div>
              <label className="text-sm font-medium">Master Reference Quality</label>
              <div className="flex items-center gap-2">
                <Progress
                  value={character.visualAssets.masterReferenceImage.qualityScore || 0}
                  className="flex-1"
                />
                <span className="text-sm font-mono">
                  {character.visualAssets.masterReferenceImage.qualityScore || 0}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {character.characterLibraryStatus === 'not_created' && onSync && (
            <Button onClick={onSync} size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Create in Library
            </Button>
          )}

          {character.characterLibraryStatus === 'created' && !hasVisualAssets && onGenerateVisuals && (
            <Button onClick={onGenerateVisuals} size="sm">
              <ImageIcon className="w-4 h-4 mr-1" />
              Generate Visuals
            </Button>
          )}

          {character.characterLibraryId && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://character.ft.tc/admin/collections/characters/${character.characterLibraryId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View in Library
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🧪 **Phase 6: Testing & Validation**

### **6.1 Integration Tests**

**File**: `src/tests/character-library-integration.test.ts`
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { characterLibraryClient } from '@/lib/services/character-library-client'
import { checkCharacterLibraryHealth } from '@/lib/services/character-library-health'
import { characterDevelopmentService } from '@/lib/services/character-development-service'

describe('Character Library Integration', () => {
  beforeAll(async () => {
    // Ensure Character Library is available
    const health = await checkCharacterLibraryHealth()
    if (!health.isHealthy) {
      throw new Error(`Character Library not available: ${health.error}`)
    }
  })

  describe('Service Health', () => {
    it('should connect to Character Library service', async () => {
      const health = await checkCharacterLibraryHealth()
      expect(health.isHealthy).toBe(true)
      expect(health.responseTime).toBeLessThan(5000)
    })
  })

  describe('Character Creation', () => {
    it('should create character in Character Library', async () => {
      const testCharacter = {
        name: 'Test Character',
        characterId: `test-${Date.now()}`,
        status: 'in_development' as const,
        biography: 'A test character for integration testing',
        personality: 'Brave and determined',
        physicalDescription: 'Tall with dark hair and green eyes',
        age: 25,
        height: '6ft',
        eyeColor: 'green',
        hairColor: 'dark brown'
      }

      const result = await characterLibraryClient.createCharacter(testCharacter)
      expect(result).toBeDefined()
      expect(result.id || result.characterId).toBeDefined()
    })
  })

  describe('Image Generation', () => {
    it('should generate smart character image', async () => {
      // This test requires a pre-existing character in the Character Library
      const characterId = 'test-character-id' // Replace with actual test character ID

      const result = await characterLibraryClient.generateSmartImage(characterId, {
        prompt: 'close-up portrait with neutral expression',
        maxRetries: 3,
        qualityThreshold: 70,
        consistencyThreshold: 80
      })

      expect(result.success).toBe(true)
      if (result.data) {
        expect(result.data.publicUrl).toBeDefined()
        expect(result.data.qualityScore).toBeGreaterThanOrEqual(70)
        expect(result.data.consistencyScore).toBeGreaterThanOrEqual(80)
      }
    }, 60000) // 60 second timeout for image generation
  })

  describe('Character Knowledge Query', () => {
    it('should query character knowledge', async () => {
      const result = await characterLibraryClient.queryCharacters(
        'Tell me about characters with green eyes'
      )

      expect(result).toBeDefined()
      expect(result.data?.result).toBeDefined()
    })
  })
})
```

### **6.2 End-to-End Workflow Test**

**File**: `src/tests/character-workflow-e2e.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Character Development Workflow E2E', () => {
  it('should complete full character development with visuals', async () => {
    const payload = await getPayload({ config })

    // 1. Create a test project
    const project = await payload.create({
      collection: 'projects',
      data: {
        name: 'E2E Test Project',
        durationUnit: 10,
        movieFormat: 'short-film',
        movieStyle: 'dramatic',
        primaryGenres: ['drama'],
        targetAudience: ['adults'],
        status: 'in-development'
      }
    })

    // 2. Create a test story
    const story = await payload.create({
      collection: 'stories',
      data: {
        project: project.id,
        projectName: project.name,
        currentContent: 'A test story about a brave hero who overcomes challenges.',
        status: 'completed',
        qualityMetrics: {
          overallQuality: 80,
          structureScore: 75,
          characterDepth: 70,
          coherenceScore: 85,
          conflictTension: 75,
          dialogueQuality: 70,
          genreAlignment: 80,
          audienceEngagement: 75,
          visualStorytelling: 65,
          productionReadiness: 60
        }
      }
    })

    // 3. Generate story structure
    const response = await fetch(`http://localhost:3000/v1/projects/${project.id}/story-structure`, {
      method: 'POST'
    })

    expect(response.ok).toBe(true)
    const storyStructure = await response.json()
    expect(storyStructure.id).toBeDefined()

    // 4. Generate characters with Character Library integration
    const charResponse = await fetch(`http://localhost:3000/v1/projects/${project.id}/character-development`, {
      method: 'POST'
    })

    expect(charResponse.ok).toBe(true)
    const characters = await charResponse.json()
    expect(characters.characters).toBeDefined()
    expect(characters.characters.length).toBeGreaterThan(0)

    // 5. Verify Character Library integration
    const character = characters.characters[0]
    expect(character.characterLibraryId).toBeDefined()
    expect(character.characterLibraryStatus).toBe('created')

    // 6. Verify visual assets were generated
    expect(character.visualAssets).toBeDefined()
    expect(character.visualAssets.masterReferenceImage?.url).toBeDefined()

    // Cleanup
    await payload.delete({ collection: 'projects', id: project.id })
  }, 120000) // 2 minute timeout for full workflow
})
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Foundation Setup** ✅
- [ ] Configure environment variables
- [ ] Implement Character Library client
- [ ] Add health check service
- [ ] Test basic connectivity

### **Phase 2: Character Development Integration** ✅
- [ ] Update Characters collection schema
- [ ] Modify character development API route
- [ ] Implement character creation in Character Library
- [ ] Add visual asset generation
- [ ] Test character creation workflow

### **Phase 3: Visual Consistency System** ✅
- [ ] Add visual guidelines to StoryStructures
- [ ] Implement visual consistency service
- [ ] Add consistency validation
- [ ] Test visual guideline application

### **Phase 4: Scene Generation Enhancement** ✅
- [ ] Enhance BAML functions with visual context
- [ ] Implement scene generation service
- [ ] Add character-specific scene image generation
- [ ] Test scene generation workflow

### **Phase 5: UI/UX Integration** ✅
- [ ] Create character gallery component
- [ ] Add Character Library status component
- [ ] Integrate components into existing UI
- [ ] Test user interface

### **Phase 6: Testing & Validation** ✅
- [ ] Write integration tests
- [ ] Create end-to-end workflow tests
- [ ] Performance testing
- [ ] Error handling validation

---

## 🚀 **Deployment & Monitoring**

### **Environment Variables**
```env
# Add to .env.local
CHARACTER_LIBRARY_API_URL=https://character.ft.tc
CHARACTER_LIBRARY_TIMEOUT=60000
CHARACTER_LIBRARY_RETRY_ATTEMPTS=3
```

### **Monitoring Points**
- Character Library service health
- Image generation success rates
- Consistency validation scores
- API response times
- Error rates and types

### **Success Metrics**
- Character creation success rate > 95%
- Image generation success rate > 90%
- Average consistency score > 85%
- Average quality score > 75%
- End-to-end workflow completion < 5 minutes

This comprehensive integration plan provides a structured approach to implementing Character Library integration while maintaining the existing Novel Movie workflow and enhancing it with powerful visual consistency capabilities.
