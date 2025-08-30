// Story Generation using BAML
import { getBamlClient } from './baml-client'

export interface ProjectStoryData {
  projectName: string
  projectTitle?: string
  shortDescription?: string
  longDescription?: string
  movieFormat: string
  movieStyle: string
  durationUnit: number
  primaryGenres: string[]
  corePremise: string
  targetAudience: string[]
  tone: string[]
}

export interface StoryGenerationResult {
  storyContent: string
  qualityMetrics: {
    overallQuality: number
    structureScore: number
    characterDepth: number
    coherenceScore: number
    conflictTension: number
    dialogueQuality: number
    genreAlignment: number
    audienceEngagement: number
    visualStorytelling: number
    productionReadiness: number
  }
  generationNotes: string
}

/**
 * Generate initial story using BAML with comprehensive project data
 */
export async function generateInitialStoryWithBAML(
  projectData: ProjectStoryData,
): Promise<StoryGenerationResult> {
  try {
    const baml = await getBamlClient()

    const result = await baml.GenerateInitialStory(
      projectData.projectName,
      projectData.projectTitle || null,
      projectData.shortDescription || null,
      projectData.longDescription || null,
      projectData.movieFormat,
      projectData.movieStyle,
      projectData.durationUnit,
      projectData.primaryGenres,
      projectData.corePremise,
      projectData.targetAudience,
      projectData.tone,
    )

    return {
      storyContent: result.storyContent,
      qualityMetrics: {
        overallQuality: result.qualityMetrics.overallQuality,
        structureScore: result.qualityMetrics.structureScore,
        characterDepth: result.qualityMetrics.characterDepth,
        coherenceScore: result.qualityMetrics.coherenceScore,
        conflictTension: result.qualityMetrics.conflictTension,
        dialogueQuality: result.qualityMetrics.dialogueQuality,
        genreAlignment: result.qualityMetrics.genreAlignment,
        audienceEngagement: result.qualityMetrics.audienceEngagement,
        visualStorytelling: result.qualityMetrics.visualStorytelling,
        productionReadiness: result.qualityMetrics.productionReadiness,
      },
      generationNotes: result.generationNotes,
    }
  } catch (error) {
    console.error('BAML story generation failed:', error)
    throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract story data from project object for BAML generation
 */
export function extractProjectStoryData(project: any): ProjectStoryData {
  return {
    projectName: project.name || 'Untitled Project',
    projectTitle: project.projectTitle || undefined,
    shortDescription: project.shortDescription || undefined,
    longDescription: project.longDescription || undefined,
    movieFormat: project.movieFormat?.name || project.movieFormat || 'Unknown Format',
    movieStyle: project.movieStyle?.name || project.movieStyle || 'Unknown Style',
    durationUnit: project.durationUnit || 90,
    primaryGenres: project.primaryGenres?.map((g: any) => g.name || g) || [],
    corePremise: project.corePremise || 'A story waiting to be told',
    targetAudience: project.targetAudience?.map((a: any) => a.name || a) || [],
    tone: project.tone?.map((t: any) => t.name || t) || [],
  }
}

/**
 * Validate that project has minimum required data for story generation
 */
export function validateProjectForStoryGeneration(project: any): {
  isValid: boolean
  missingFields: string[]
  warnings: string[]
} {
  const missingFields: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!project.name) missingFields.push('Project Name')
  if (!project.movieFormat) missingFields.push('Movie Format')
  if (!project.movieStyle) missingFields.push('Movie Style')

  // Important fields (warnings if missing)
  if (!project.primaryGenres || project.primaryGenres.length === 0) {
    warnings.push('Primary Genres not specified - will use generic approach')
  }
  if (!project.corePremise) {
    warnings.push('Core Premise not specified - will generate generic premise')
  }
  if (!project.targetAudience || project.targetAudience.length === 0) {
    warnings.push('Target Audience not specified - will target general audience')
  }
  if (!project.tone || project.tone.length === 0) {
    warnings.push('Tone not specified - will use balanced tone')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  }
}

/**
 * Generate fallback story content when BAML is unavailable
 */
export function generateFallbackStory(projectData: ProjectStoryData): StoryGenerationResult {
  const storyContent = `
**PROJECT:** ${projectData.projectTitle || projectData.projectName}
**FORMAT:** ${projectData.movieFormat} (${projectData.durationUnit} minutes)
**STYLE:** ${projectData.movieStyle}
**GENRE:** ${projectData.primaryGenres.join(', ') || 'Unknown'}
**TONE:** ${projectData.tone.join(', ') || 'Balanced'}
**TARGET AUDIENCE:** ${projectData.targetAudience.join(', ') || 'General audience'}

${projectData.shortDescription ? `**BRIEF:** ${projectData.shortDescription}\n` : ''}
${projectData.longDescription ? `**SYNOPSIS:** ${projectData.longDescription}\n` : ''}

**STORY OUTLINE:**

**Act I - Setup**
${projectData.corePremise}

Our protagonist finds themselves in a world where the ordinary rules no longer apply. The initial conflict emerges from their desire to maintain normalcy while being thrust into extraordinary circumstances. The ${projectData.movieStyle} visual approach enhances the ${projectData.tone.join(', ') || 'balanced'} atmosphere.

**Act II - Confrontation**
As the stakes rise, our protagonist must confront not only external challenges but also internal doubts and fears. The central conflict intensifies, forcing difficult choices that will define their character. The ${projectData.primaryGenres.join(', ') || 'genre'} elements drive the narrative tension forward.

**Act III - Resolution**
Through courage, growth, and perhaps unexpected allies, our protagonist faces the final challenge. The resolution brings not just victory, but transformation - both for the character and their world.

**CHARACTER ARCS:**
- Protagonist: Begins reluctant, grows into a confident leader
- Supporting characters: Each represents different aspects of the central theme
- Antagonist: Embodies the opposite of what the protagonist must become

**VISUAL ELEMENTS:**
The story unfolds through carefully crafted scenes that balance dialogue with action, ensuring each moment serves both character development and plot advancement. The ${projectData.movieStyle} style creates a distinctive visual identity.

**THEMATIC RESONANCE:**
This narrative explores themes of growth, courage, and the power of choice, delivering a message that resonates with the ${projectData.targetAudience.join(', ') || 'target'} audience while maintaining the ${projectData.tone.join(', ') || 'balanced'} tone throughout.

**FORMAT CONSIDERATIONS:**
As a ${projectData.movieFormat} with ${projectData.durationUnit} minutes, the pacing is carefully calibrated to maximize impact within the time constraints while delivering a complete narrative arc.

*This is an initial story draft that will be enhanced through multiple iterations to improve character depth, dialogue quality, visual storytelling, and overall narrative coherence.*
  `.trim()

  return {
    storyContent,
    qualityMetrics: {
      overallQuality: 6,
      structureScore: 6,
      characterDepth: 5,
      coherenceScore: 7,
      conflictTension: 5,
      dialogueQuality: 5,
      genreAlignment: 7,
      audienceEngagement: 5,
      visualStorytelling: 4,
      productionReadiness: 3,
    },
    generationNotes: 'Generated using fallback template due to BAML unavailability. Recommend using BAML for enhanced story quality.',
  }
}
