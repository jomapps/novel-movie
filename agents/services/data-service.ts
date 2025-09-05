/**
 * Data Service for Novel Movie Agent Integration
 * Handles PayloadCMS and PathRAG integration for story processing
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { PathRAGService, CustomKnowledgeGraph } from './pathrag-service'

export interface StoryGraph {
  scenes: SceneNode[]
  relationships: GraphRelationship[]
  characters: CharacterNode[]
  locations: LocationNode[]
  themes: ThemeNode[]
}

export interface SceneNode {
  sceneId: string
  sequenceNumber: number
  setting: string
  charactersPresent: string[]
  keyObjects: string[]
  emotionalArc: string[]
  actionSummary: string
  narrativePurpose: string
  dialogueScript?: string
  duration?: number
  visualStyle?: string
}

export interface CharacterNode {
  name: string
  description: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor'
  traits: string[]
  arc?: string
}

export interface LocationNode {
  name: string
  description: string
  type: 'interior' | 'exterior' | 'mixed'
  atmosphere: string[]
}

export interface ThemeNode {
  name: string
  description: string
  manifestation: string[]
}

export interface GraphRelationship {
  from: string
  to: string
  type: 'FOLLOWS' | 'HAS_CHARACTER' | 'TAKES_PLACE_IN' | 'HAS_EMOTION' | 'FEATURES_OBJECT' | 'EXPLORES_THEME'
}

export class DataService {
  /**
   * Get project data from PayloadCMS
   */
  static async getProjectData(projectId: string) {
    const payload = await getPayload({ config })
    return await payload.findByID({ 
      collection: 'projects', 
      id: projectId,
      depth: 2 // Include relationships
    })
  }

  /**
   * Get story data from PayloadCMS
   */
  static async getStoryData(projectId: string) {
    const payload = await getPayload({ config })
    const stories = await payload.find({
      collection: 'stories',
      where: {
        project: { equals: projectId }
      },
      depth: 2
    })
    
    return stories.docs.length > 0 ? stories.docs[0] : null
  }

  /**
   * Update project status in PayloadCMS
   */
  static async updateProjectStatus(
    projectId: string,
    status: 'project-setup' | 'story-generation' | 'character-development' | 'scene-planning' | 'media-generation' | 'post-production' | 'final-review' | 'completed'
  ) {
    const payload = await getPayload({ config })
    return await payload.update({
      collection: 'projects',
      id: projectId,
      data: { workflowStatus: { currentStep: status } }
    })
  }

  /**
   * Parse story content into structured scenes using AI-like analysis
   */
  static parseStoryIntoScenes(storyContent: string, projectId: string): StoryGraph {
    // This is a simplified parser - in production, this would use AI
    const scenes: SceneNode[] = []
    const characters: CharacterNode[] = []
    const locations: LocationNode[] = []
    const themes: ThemeNode[] = []
    const relationships: GraphRelationship[] = []

    // Extract basic information from the story content
    // This is a simplified implementation - real implementation would use NLP/AI
    
    // Look for character names (capitalized words that appear multiple times)
    const characterMatches = storyContent.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []
    const characterCounts = new Map<string, number>()
    
    characterMatches.forEach(char => {
      if (char.length > 2 && !['The', 'And', 'But', 'For', 'Act', 'Scene'].includes(char)) {
        characterCounts.set(char, (characterCounts.get(char) || 0) + 1)
      }
    })

    // Characters that appear more than once are likely main characters
    Array.from(characterCounts.entries())
      .filter(([_, count]) => count > 1)
      .slice(0, 5) // Top 5 characters
      .forEach(([name, count]) => {
        characters.push({
          name,
          description: `Character appearing ${count} times in the story`,
          role: count > 3 ? 'protagonist' : 'supporting',
          traits: []
        })
      })

    // Extract locations (look for common location indicators)
    const locationKeywords = ['theatre', 'stage', 'coffin', 'water', 'tank', 'audience', 'spotlight']
    locationKeywords.forEach(keyword => {
      if (storyContent.toLowerCase().includes(keyword)) {
        locations.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          description: `Location mentioned in the story: ${keyword}`,
          type: 'interior',
          atmosphere: ['dramatic', 'tense']
        })
      }
    })

    // Extract themes
    const themeKeywords = ['magic', 'illusion', 'reality', 'death', 'performance', 'hubris', 'supernatural']
    themeKeywords.forEach(theme => {
      if (storyContent.toLowerCase().includes(theme)) {
        themes.push({
          name: theme.charAt(0).toUpperCase() + theme.slice(1),
          description: `Theme explored in the story: ${theme}`,
          manifestation: ['narrative', 'character development']
        })
      }
    })

    // Create a single scene for now (simplified)
    scenes.push({
      sceneId: 'scene_001',
      sequenceNumber: 1,
      setting: locations[0]?.name || 'Theatre',
      charactersPresent: characters.slice(0, 3).map(c => c.name),
      keyObjects: ['coffin', 'water', 'lock', 'spotlight'],
      emotionalArc: ['confidence', 'panic', 'terror', 'death'],
      actionSummary: storyContent.substring(0, 200) + '...',
      narrativePurpose: 'Establish the protagonist\'s hubris and ultimate downfall',
      duration: 60
    })

    // Create relationships
    characters.forEach(char => {
      relationships.push({
        from: 'scene_001',
        to: char.name,
        type: 'HAS_CHARACTER'
      })
    })

    locations.forEach(loc => {
      relationships.push({
        from: 'scene_001',
        to: loc.name,
        type: 'TAKES_PLACE_IN'
      })
    })

    return {
      scenes,
      characters,
      locations,
      themes,
      relationships
    }
  }

  /**
   * Convert story graph to PathRAG custom knowledge graph format
   */
  static convertToPathRAGFormat(projectId: string, storyGraph: StoryGraph): CustomKnowledgeGraph {
    const chunks: string[] = []
    const entities: any[] = []
    const relationships: any[] = []

    // Create chunks from scenes
    storyGraph.scenes.forEach(scene => {
      chunks.push(
        `Scene ${scene.sceneId}: ${scene.actionSummary}. ` +
        `Location: ${scene.setting}. ` +
        `Characters: ${scene.charactersPresent.join(', ')}. ` +
        `Purpose: ${scene.narrativePurpose}. ` +
        `Emotional Arc: ${scene.emotionalArc.join(' → ')}.`
      )
    })

    // Create scene entities
    storyGraph.scenes.forEach(scene => {
      entities.push({
        name: `Scene_${projectId}_${scene.sceneId}`,
        type: 'Scene',
        description: scene.actionSummary,
        metadata: {
          projectId,
          sceneId: scene.sceneId,
          sequenceNumber: scene.sequenceNumber,
          setting: scene.setting,
          emotionalArc: scene.emotionalArc,
          duration: scene.duration
        }
      })
    })

    // Create character entities
    storyGraph.characters.forEach(char => {
      entities.push({
        name: `Character_${projectId}_${char.name.replace(/\s+/g, '_')}`,
        type: 'Character',
        description: char.description,
        metadata: { 
          projectId, 
          characterName: char.name,
          role: char.role,
          traits: char.traits
        }
      })
    })

    // Create location entities
    storyGraph.locations.forEach(loc => {
      entities.push({
        name: `Location_${projectId}_${loc.name.replace(/\s+/g, '_')}`,
        type: 'Location',
        description: loc.description,
        metadata: { 
          projectId, 
          locationName: loc.name,
          type: loc.type,
          atmosphere: loc.atmosphere
        }
      })
    })

    // Create theme entities
    storyGraph.themes.forEach(theme => {
      entities.push({
        name: `Theme_${projectId}_${theme.name.replace(/\s+/g, '_')}`,
        type: 'Theme',
        description: theme.description,
        metadata: { 
          projectId, 
          themeName: theme.name,
          manifestation: theme.manifestation
        }
      })
    })

    // Create relationships
    storyGraph.relationships.forEach(rel => {
      let sourceName = rel.from
      let targetName = rel.to

      // Convert relationship names to entity names
      if (rel.from.startsWith('scene_')) {
        sourceName = `Scene_${projectId}_${rel.from}`
      }
      
      if (rel.type === 'HAS_CHARACTER') {
        targetName = `Character_${projectId}_${rel.to.replace(/\s+/g, '_')}`
      } else if (rel.type === 'TAKES_PLACE_IN') {
        targetName = `Location_${projectId}_${rel.to.replace(/\s+/g, '_')}`
      } else if (rel.type === 'EXPLORES_THEME') {
        targetName = `Theme_${projectId}_${rel.to.replace(/\s+/g, '_')}`
      }

      relationships.push({
        source: sourceName,
        target: targetName,
        relation: rel.type
      })
    })

    return { chunks, entities, relationships }
  }

  /**
   * Save story graph to PathRAG
   */
  static async saveStoryGraph(projectId: string, storyGraph: StoryGraph) {
    const customKG = this.convertToPathRAGFormat(projectId, storyGraph)
    return await PathRAGService.insertCustomKG(customKG)
  }

  /**
   * Get scene context using PathRAG intelligent querying
   */
  static async getSceneContext(projectId: string, sceneId: string) {
    const query = `Get all context for scene ${sceneId} in project ${projectId}, including characters present, location details, emotional beats, and relationships to other scenes`
    
    return await PathRAGService.query(query, {
      mode: 'hybrid',
      top_k: 20,
      response_type: 'Structured Data'
    })
  }

  /**
   * Query story elements using natural language
   */
  static async queryStoryElements(projectId: string, query: string) {
    const contextualQuery = `In project ${projectId}: ${query}`
    
    return await PathRAGService.query(contextualQuery, {
      mode: 'hybrid',
      top_k: 15,
      only_need_context: true
    })
  }
}
