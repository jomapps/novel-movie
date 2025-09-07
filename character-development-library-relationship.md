# Character Development & Character Library Service Integration

## Overview

This document provides comprehensive documentation for the Character Development step in the Novel Movie screenplay workflow and its integration with the external Character Library Service. The Character Development step creates detailed character profiles, relationships, and dialogue voices based on story structure data and integrates with the Character Library Service for visual asset generation and character consistency management.

## 1. Character Fields Analysis

### Novel Movie Character Schema

The Novel Movie system uses a comprehensive character data model defined in `src/collections/Characters.ts`:

#### Core Identity Fields
- **name**: Character name (required)
- **status**: Development status (`draft`, `in_development`, `ready`, `in_production`, `archived`)
- **role**: Character role (`protagonist`, `antagonist`, `supporting`, `minor`)
- **archetype**: Character archetype (e.g., "Hero", "Villain", "Ally")

#### Character Development Fields
- **biography**: Rich text character biography
- **personality**: Rich text personality description
- **motivations**: Rich text character motivations
- **backstory**: Rich text character backstory
- **psychology**: Nested object with:
  - `motivation`: Core psychological motivation
  - `fears`: Character fears
  - `desires`: Character desires
  - `flaws`: Character flaws

#### Character Arc Fields
- **startState**: Character's initial state
- **transformation**: Character transformation journey
- **endState**: Character's final state

#### Physical Description Fields
- **description**: Rich text physical description
- **age**: Character age (number)
- **height**: Character height (string)
- **eyeColor**: Eye color (string)
- **hairColor**: Hair color (string)
- **clothing**: Rich text clothing description

#### Dialogue Voice Fields
- **voiceDescription**: Rich text voice description
- **style**: Speaking style
- **patterns**: Speech patterns
- **vocabulary**: Vocabulary characteristics

#### Relationship Fields
- **relationships**: Array of character relationships:
  - `character`: Reference to related character
  - `relationship`: Relationship type
  - `dynamic`: Relationship dynamic description

#### Character Library Integration Fields
- **characterLibraryId**: External Character Library ID
- **characterLibraryStatus**: Integration status (`created`, `error`)

#### Visual Assets Fields
- **visualAssets**: Nested object with:
  - `masterReferenceImage`: Master reference image data
  - `coreReferenceSet`: Array of core reference images
  - `generatedImages`: Array of generated images

#### Generation Metadata Fields
- **generationMetadata**: AI generation tracking:
  - `generatedAt`: Generation timestamp
  - `generationMethod`: Method used (`ai_generated`, `story_structure_extraction`)
  - `qualityScore`: Quality score (0-100)
  - `completeness`: Completeness percentage

### Field Development Workflow

Characters are developed through the following stages:

1. **Story Structure Extraction**: Basic character information extracted from story structure
2. **Character Development Step**: Detailed profiles created with all character fields
3. **Character Library Integration**: Characters synchronized with external service
4. **Visual Asset Generation**: Character images and reference sets created
5. **Enhancement Phase**: Characters refined with additional AI-generated content

## 2. Character Library Integration

### Service Configuration

The Character Library Service is configured in `src/lib/config/character-library.ts`:

```typescript
export const CHARACTER_LIBRARY_CONFIG = {
  baseUrl: process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc',
  timeout: 60000,
  retryAttempts: 3,
  qualityThreshold: 70,
  consistencyThreshold: 85,
  defaultStyle: 'character_production',
  maxRetries: 5
}
```

### Environment Variables

Required environment variables in `.env.local`:

```env
CHARACTER_LIBRARY_API_URL=https://character.ft.tc
CHARACTER_LIBRARY_TIMEOUT=60000
CHARACTER_LIBRARY_RETRY_ATTEMPTS=3
```

### Character Library Client

The integration is handled by `CharacterLibraryClient` in `src/lib/services/character-library-client.ts`:

#### Available Methods
- **createCharacter(character)**: Create character in external library
- **generateSmartImage(characterId, request)**: Generate intelligent character images
- **generateInitialImage(characterId, prompt)**: Generate master reference image
- **generateCoreSet(characterId)**: Generate 360° reference set
- **queryCharacters(query)**: Natural language character queries

#### Data Format Mapping

Novel Movie character data is mapped to Character Library format:

```typescript
const characterLibraryData = {
  name: character.name,
  characterId: `${project.id}-${character.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
  status: 'in_development',
  biography: character.characterDevelopment?.biography || '',
  personality: character.characterDevelopment?.personality || '',
  physicalDescription: character.physicalDescription?.description || '',
  age: character.physicalDescription?.age,
  height: character.physicalDescription?.height,
  eyeColor: character.physicalDescription?.eyeColor,
  hairColor: character.physicalDescription?.hairColor
}
```

### Integration Workflow

The character development API (`src/app/v1/projects/[id]/character-development/route.ts`) implements the following integration workflow:

1. **Character Creation**: Create character record in Novel Movie database
2. **Library Synchronization**: Create corresponding character in Character Library
3. **Visual Asset Generation**: Generate master reference and core set images
4. **Quality Validation**: Validate image consistency and quality
5. **Asset Storage**: Store visual assets with metadata

### API Integration Patterns

#### Health Check Pattern
```typescript
const healthCheck = await checkCharacterLibraryHealth()
if (!healthCheck.isHealthy) {
  // Handle service unavailability
  return { characterLibraryId: null, status: 'error', error: healthCheck.error }
}
```

#### Retry Pattern with Exponential Backoff
```typescript
for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
  try {
    const response = await fetch(url, options)
    return await response.json()
  } catch (error) {
    if (attempt === this.retryAttempts) throw error
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
  }
}
```

#### Error Handling Pattern
```typescript
try {
  const response = await characterLibraryClient.createCharacter(characterData)
  return { characterLibraryId: response.id, status: 'created' }
} catch (error) {
  console.error('Character Library integration failed:', error)
  return { characterLibraryId: null, status: 'error', error: error.message }
}
```

### Data Flow

```
Novel Movie Character Creation
           ↓
Character Library Service
           ↓
Visual Asset Generation
           ↓
Quality Validation (DINOv3)
           ↓
Asset Storage (Cloudflare R2)
           ↓
Novel Movie Database Update
```

## 3. Development Requirements Section

### Current Character Data at Development Stage

At the Character Development step, the following data should be present:

#### Prerequisites
- ✅ **Project Data**: Complete project information
- ✅ **Story Content**: Minimum 500 characters of story content
- ✅ **Story Structure**: Completed story structure with character arcs

#### Generated Character Data
- ✅ **Basic Information**: Name, role, archetype
- ✅ **Character Development**: Biography, personality, motivations, backstory
- ✅ **Character Arc**: Start state, transformation, end state
- ✅ **Physical Description**: Basic physical characteristics
- ✅ **Dialogue Voice**: Speaking style and patterns
- ⚠️ **Relationships**: Currently empty, needs enhancement
- ⚠️ **Visual Assets**: Basic structure, needs Character Library integration

### Required Improvements for Character Development Workflow

#### 1. Enhanced Character Generation
**Current**: Story structure extraction with basic character information
**Needed**: AI-powered character generation using BAML functions

**Implementation Requirements**:
- Regenerate BAML client with character development functions
- Update API to use `DevelopCharacters` BAML function
- Implement character enhancement with `EnhanceCharacterProfiles`
- Add character consistency validation with `ValidateCharacterConsistency`

#### 2. Character Relationship Mapping
**Current**: Empty relationships array
**Needed**: Intelligent relationship detection and mapping

**Implementation Requirements**:
- Analyze story structure for character interactions
- Generate relationship types and dynamics
- Create bidirectional relationship mapping
- Implement relationship validation and consistency checks

#### 3. Enhanced Physical Descriptions
**Current**: Generic physical descriptions
**Needed**: Detailed, story-appropriate physical characteristics

**Implementation Requirements**:
- Generate age-appropriate physical descriptions
- Consider story genre and setting for appearance details
- Create distinctive physical traits for each character
- Ensure physical consistency across character development

#### 4. Dialogue Voice Development
**Current**: Basic dialogue voice structure
**Needed**: Distinctive dialogue patterns and samples

**Implementation Requirements**:
- Generate character-specific speech patterns
- Create vocabulary profiles based on character background
- Generate sample dialogue for each character
- Implement dialogue consistency validation

### Required Enhancements for Character Library Integration

#### 1. Complete API Integration
**Current**: Basic integration with error handling
**Needed**: Full feature integration with all Character Library capabilities

**Implementation Requirements**:
- Implement smart image generation with scene context
- Add batch character processing capabilities
- Integrate natural language character queries
- Implement character consistency validation pipeline

#### 2. Visual Asset Management
**Current**: Basic visual asset structure
**Needed**: Complete visual asset lifecycle management

**Implementation Requirements**:
- Implement master reference image generation
- Add 360° core reference set creation
- Integrate on-demand image generation for scenes
- Implement quality assurance and validation pipeline

#### 3. Character Library Synchronization
**Current**: One-way character creation
**Needed**: Bidirectional synchronization with conflict resolution

**Implementation Requirements**:
- Implement character update synchronization
- Add conflict resolution for concurrent edits
- Create character version management
- Implement bulk synchronization capabilities

#### 4. Advanced Character Queries
**Current**: No query integration
**Needed**: Natural language character information retrieval

**Implementation Requirements**:
- Integrate PathRAG service for character queries
- Implement character knowledge base synchronization
- Add contextual character information retrieval
- Create character relationship query capabilities

### Correct Data Structures and Workflows

#### Character Development Data Structure
```typescript
interface EnhancedCharacterData {
  // Core identity (existing)
  name: string
  role: CharacterRole
  archetype: string
  
  // Enhanced development (needs improvement)
  characterDevelopment: {
    biography: RichText
    personality: RichText
    motivations: RichText
    backstory: RichText
    psychology: DetailedPsychology
    skills: CharacterSkill[]
    goals: CharacterGoal[]
    conflicts: CharacterConflict[]
  }
  
  // Enhanced physical description (needs improvement)
  physicalDescription: {
    description: RichText
    age: number
    height: string
    build: string
    eyeColor: string
    hairColor: string
    distinctiveFeatures: string[]
    clothing: RichText
    accessories: string[]
  }
  
  // Enhanced dialogue voice (needs improvement)
  dialogueVoice: {
    voiceDescription: RichText
    style: string
    patterns: string[]
    vocabulary: VocabularyProfile
    speechQuirks: string[]
    sampleDialogue: DialogueSample[]
  }
  
  // Enhanced relationships (needs implementation)
  relationships: CharacterRelationship[]
  
  // Character Library integration (needs enhancement)
  characterLibraryId: string
  visualAssets: VisualAssetCollection
  
  // Generation metadata (existing)
  generationMetadata: GenerationMetadata
}
```

#### Recommended Development Workflow
1. **Story Structure Analysis**: Extract character information from story beats
2. **AI Character Generation**: Use BAML functions for detailed character development
3. **Character Library Creation**: Synchronize characters with external service
4. **Visual Asset Generation**: Create master reference and core image sets
5. **Relationship Mapping**: Analyze and create character relationships
6. **Quality Validation**: Validate character consistency and completeness
7. **Enhancement Phase**: Refine characters based on story requirements

## 4. Implementation Plan

### Phase 1: Character Library Service Enhancements (External App)

The Character Library Service at `https://character.ft.tc` requires several enhancements to support seamless integration with Novel Movie's character development workflow.

#### Required API Endpoints

**Missing Endpoints to Implement:**

1. **Character Management Endpoints**
```typescript
// Create character with Novel Movie specific fields
POST /api/characters/novel-movie
{
  novelMovieProjectId: string
  characterData: NovelMovieCharacterData
  syncSettings: {
    autoSync: boolean
    conflictResolution: 'novel-movie-wins' | 'character-library-wins' | 'manual'
  }
}

// Update character from Novel Movie
PUT /api/characters/{characterId}/novel-movie-sync
{
  characterData: NovelMovieCharacterData
  lastModified: string
  changeSet: string[]
}

// Bulk character operations for projects
POST /api/characters/bulk/novel-movie
{
  projectId: string
  characters: NovelMovieCharacterData[]
  operation: 'create' | 'update' | 'sync'
}
```

2. **Enhanced Image Generation Endpoints**
```typescript
// Generate scene-specific character images
POST /api/characters/{characterId}/generate-scene-image
{
  sceneContext: string
  sceneType: 'dialogue' | 'action' | 'emotional' | 'establishing'
  additionalCharacters?: string[]
  environmentContext?: string
  mood?: string
  lightingStyle?: string
}

// Generate character interaction images
POST /api/characters/generate-interaction
{
  primaryCharacterId: string
  secondaryCharacterIds: string[]
  interactionType: string
  sceneDescription: string
}

// Batch image generation for screenplay scenes
POST /api/characters/batch-generate-scenes
{
  projectId: string
  scenes: Array<{
    sceneId: string
    characters: string[]
    sceneDescription: string
    requiredShots: string[]
  }>
}
```

3. **Character Relationship Endpoints**
```typescript
// Create/update character relationships
POST /api/characters/{characterId}/relationships
{
  relatedCharacterId: string
  relationshipType: string
  relationshipDynamic: string
  storyContext: string
  visualCues?: string[]
}

// Get character relationship graph
GET /api/characters/relationships/graph?projectId={projectId}

// Generate relationship-aware images
POST /api/characters/generate-relationship-image
{
  characterIds: string[]
  relationshipContext: string
  visualStyle: string
}
```

4. **Quality Assurance & Validation Endpoints**
```typescript
// Validate character consistency across project
POST /api/characters/validate-project-consistency
{
  projectId: string
  validationRules: ConsistencyRule[]
}

// Get character quality metrics
GET /api/characters/{characterId}/quality-metrics

// Batch quality validation
POST /api/characters/batch-validate
{
  characterIds: string[]
  validationType: 'visual' | 'narrative' | 'complete'
}
```

#### Character Library Database Schema Enhancements

**Required Schema Additions:**

```typescript
// Add Novel Movie integration fields to Character schema
interface EnhancedCharacterLibrarySchema {
  // Existing fields...

  // Novel Movie Integration
  novelMovieIntegration: {
    projectId: string
    projectName: string
    lastSyncAt: Date
    syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
    conflictResolution: 'manual' | 'auto'
    changeLog: Array<{
      timestamp: Date
      source: 'novel-movie' | 'character-library'
      changes: string[]
      resolvedBy?: string
    }>
  }

  // Enhanced Relationships
  relationships: Array<{
    characterId: string
    relationshipType: string
    relationshipDynamic: string
    storyContext: string
    visualCues: string[]
    strength: number // 1-10 relationship strength
    conflictLevel: number // 1-10 conflict level
  }>

  // Scene Context Tracking
  sceneContexts: Array<{
    sceneId: string
    sceneType: string
    generatedImages: string[]
    qualityScores: number[]
    lastGenerated: Date
  }>

  // Quality Metrics Enhancement
  qualityMetrics: {
    // Existing metrics...
    narrativeConsistency: number
    crossSceneConsistency: number
    relationshipVisualConsistency: number
    lastValidated: Date
    validationHistory: ValidationRecord[]
  }
}
```

#### Character Library Service Improvements

**1. Enhanced Image Generation Pipeline**
- Implement scene-aware image generation
- Add character interaction image generation
- Create batch processing for multiple scenes
- Implement mood and lighting style controls

**2. Advanced Consistency Validation**
- Cross-scene character consistency validation
- Relationship-aware visual consistency
- Narrative consistency checking
- Automated quality scoring improvements

**3. Novel Movie Integration Layer**
- Dedicated Novel Movie API endpoints
- Conflict resolution mechanisms
- Bidirectional synchronization
- Change tracking and audit logs

**4. Performance Optimizations**
- Batch processing capabilities
- Caching for frequently accessed characters
- Optimized image generation queues
- Background processing for large projects

### Phase 2: Novel Movie Character Development Enhancements

#### 2.1 Enhanced Character Generation (Week 1-2)

**Implementation Tasks:**

1. **BAML Integration Enhancement**
```typescript
// Update character development API to use BAML
const characterResult = await getBamlClient().DevelopCharacters({
  storyContent: story.currentContent,
  projectName: project.name,
  movieFormat: project.movieFormat,
  movieStyle: project.movieStyle,
  durationUnit: project.durationUnit,
  primaryGenres: project.primaryGenres,
  targetAudience: project.targetAudience,
  characterArcs: characterArcs,
  storyBeats: storyBeats
})
```

2. **Character Relationship Generation**
```typescript
// Add relationship generation function
async function generateCharacterRelationships(
  characters: Character[],
  storyStructure: StoryStructure
): Promise<CharacterRelationship[]> {
  // Analyze story beats for character interactions
  // Generate relationship types and dynamics
  // Create bidirectional relationship mapping
  // Validate relationship consistency
}
```

3. **Enhanced Physical Description Generation**
```typescript
// Implement detailed physical description generation
async function enhancePhysicalDescriptions(
  characters: Character[],
  storyContext: StoryContext
): Promise<EnhancedPhysicalDescription[]> {
  // Generate age-appropriate descriptions
  // Consider genre and setting
  // Create distinctive traits
  // Ensure visual consistency
}
```

#### 2.2 Character Library Integration Enhancement (Week 2-3)

**Implementation Tasks:**

1. **Enhanced Character Library Client**
```typescript
// Add new methods to CharacterLibraryClient
class EnhancedCharacterLibraryClient extends CharacterLibraryClient {
  async createNovelMovieCharacter(character: NovelMovieCharacter, project: Project) {
    return this.makeRequest('POST', '/api/characters/novel-movie', {
      novelMovieProjectId: project.id,
      characterData: this.mapToCharacterLibraryFormat(character),
      syncSettings: {
        autoSync: true,
        conflictResolution: 'novel-movie-wins'
      }
    })
  }

  async generateSceneSpecificImage(characterId: string, sceneContext: SceneContext) {
    return this.makeRequest('POST', `/api/characters/${characterId}/generate-scene-image`, {
      sceneContext: sceneContext.description,
      sceneType: sceneContext.type,
      mood: sceneContext.mood,
      lightingStyle: sceneContext.lighting
    })
  }

  async validateProjectConsistency(projectId: string) {
    return this.makeRequest('POST', '/api/characters/validate-project-consistency', {
      projectId,
      validationRules: this.getDefaultValidationRules()
    })
  }
}
```

2. **Bidirectional Synchronization**
```typescript
// Implement sync service
class CharacterSyncService {
  async syncCharacterToLibrary(characterId: string) {
    // Get latest character data from Novel Movie
    // Check for conflicts with Character Library
    // Resolve conflicts based on sync settings
    // Update both systems
  }

  async syncProjectCharacters(projectId: string) {
    // Batch sync all project characters
    // Handle bulk operations efficiently
    // Provide progress feedback
  }

  async handleSyncConflict(characterId: string, conflict: SyncConflict) {
    // Present conflict resolution options
    // Apply resolution strategy
    // Update change logs
  }
}
```

#### 2.3 Visual Asset Management Enhancement (Week 3-4)

**Implementation Tasks:**

1. **Complete Visual Asset Lifecycle**
```typescript
// Enhanced visual asset management
class VisualAssetManager {
  async generateMasterReference(character: Character) {
    // Generate high-quality master reference
    // Validate quality and consistency
    // Store with metadata
  }

  async generateCoreReferenceSet(character: Character) {
    // Generate 360° reference set
    // Validate cross-angle consistency
    // Store as core reference collection
  }

  async generateSceneImages(character: Character, scenes: Scene[]) {
    // Generate scene-specific images
    // Maintain character consistency
    // Optimize for batch processing
  }
}
```

2. **Quality Assurance Pipeline**
```typescript
// Implement comprehensive QA pipeline
class CharacterQualityAssurance {
  async validateCharacterConsistency(characterId: string) {
    // Visual consistency validation
    // Narrative consistency checking
    // Cross-scene consistency verification
  }

  async generateQualityReport(projectId: string) {
    // Comprehensive quality metrics
    // Consistency scores
    // Improvement recommendations
  }
}
```

### Phase 3: Advanced Features Implementation (Week 4-6)

#### 3.1 Character Relationship System

**Implementation Tasks:**

1. **Relationship Detection and Mapping**
2. **Visual Relationship Representation**
3. **Relationship-Aware Image Generation**
4. **Dynamic Relationship Evolution**

#### 3.2 Advanced Character Queries

**Implementation Tasks:**

1. **Natural Language Character Queries**
2. **Character Knowledge Base Integration**
3. **Contextual Information Retrieval**
4. **Character Relationship Queries**

#### 3.3 Character Enhancement Pipeline

**Implementation Tasks:**

1. **Iterative Character Refinement**
2. **Story-Driven Character Evolution**
3. **Character Consistency Validation**
4. **Quality Improvement Automation**

### Phase 4: Testing and Optimization (Week 6-8)

#### 4.1 Comprehensive Testing Strategy

**Testing Requirements:**

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Character Library service integration
3. **End-to-End Tests**: Complete workflow testing
4. **Performance Tests**: Load and stress testing
5. **Quality Assurance Tests**: Character consistency validation

#### 4.2 Performance Optimization

**Optimization Areas:**

1. **Batch Processing**: Efficient bulk operations
2. **Caching Strategy**: Reduce API calls and processing time
3. **Background Processing**: Non-blocking operations
4. **Resource Management**: Memory and CPU optimization

### Implementation Timeline

**Week 1-2: Character Library Service Enhancements**
- Implement missing API endpoints
- Enhance database schema
- Add Novel Movie integration layer

**Week 2-3: Novel Movie Integration Enhancement**
- Enhance character generation with BAML
- Implement bidirectional synchronization
- Add relationship generation

**Week 3-4: Visual Asset Management**
- Complete visual asset lifecycle
- Implement quality assurance pipeline
- Add scene-specific image generation

**Week 4-6: Advanced Features**
- Character relationship system
- Advanced character queries
- Character enhancement pipeline

**Week 6-8: Testing and Optimization**
- Comprehensive testing suite
- Performance optimization
- Quality assurance validation

### Success Metrics

**Technical Metrics:**
- Character generation time < 30 seconds
- Image generation success rate > 95%
- Character consistency score > 85%
- API response time < 2 seconds

**Quality Metrics:**
- Character depth score > 80%
- Relationship clarity score > 75%
- Visual consistency score > 90%
- User satisfaction score > 85%

This implementation plan provides a structured approach to achieving comprehensive character development with full Character Library Service integration, ensuring consistent, high-quality character assets for AI movie generation.
