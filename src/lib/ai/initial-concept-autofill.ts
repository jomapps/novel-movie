import OpenAI from 'openai'
import {
  generateRelationshipField,
  generatePrimaryGenres,
  generateTargetDemographics,
  generateTones,
  generateMoods,
  generateCinematographyStyle,
  generateCentralThemes,
} from './relationship-field-handler'

// Initialize OpenRouter client for fallback cases only
const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
    'X-Title': 'Novel Movie',
  },
})

// Lazy-load BAML to avoid compilation issues
let bamlClient: any = null
async function getBamlClient() {
  if (!bamlClient) {
    try {
      const { b } = await import('baml_client')
      bamlClient = b
    } catch (error) {
      console.error('Failed to load BAML client:', error)
      throw new Error('BAML client not available')
    }
  }
  return bamlClient
}

// Add validateRequiredProjectFields function
export function validateRequiredProjectFields(data: any): boolean {
  return !!(data.projectName && data.movieFormat && data.movieStyle && data.durationUnit)
}

export interface InitialConceptContext {
  projectName: string
  movieFormat: string
  movieStyle: string
  series?: string
  durationUnit: number
  // Current form data for contextual generation
  formData: InitialConceptFormData
}

export interface InitialConceptFormData {
  status: string
  primaryGenres: string[]
  corePremise: string
  targetAudience: {
    demographics: string[]
    psychographics: string
    customDescription: string
  }
  toneAndMood: {
    tones: string[]
    moods: string[]
    emotionalArc: string
  }
  visualStyle: {
    cinematographyStyle: string
    colorPalette: {
      dominance: string
      saturation: string
      symbolicColors: string
    }
    lightingPreferences: string
    cameraMovement: string
  }
  references: {
    inspirationalMovies: Array<{
      title: string
      year: number | null
      specificElements: string
    }>
    visualReferences: string
    narrativeReferences: string
  }
  themes: {
    centralThemes: string[]
    moralQuestions: string
    messageTakeaway: string
  }
  setting?: {
    timePeriod?: string
    geographicSetting?: string
    socialContext?: string
    scale?: string
  }
  characterArchetypes?: {
    protagonistType?: string
    supportingRoles?: string
    relationshipDynamics?: string
  }
  pacing?: {
    narrativeStructure?: string
    pacingStyle?: string
    climaxIntensity?: string
  }
  contentGuidelines?: {
    contentRestrictions?: string
    culturalSensitivities?: string
    educationalValue?: string
  }
}

export interface GeneratedFields {
  // Text fields
  corePremise?: string
  'targetAudience.psychographics'?: string
  'targetAudience.customDescription'?: string
  'toneAndMood.emotionalArc'?: string
  'visualStyle.colorPalette.symbolicColors'?: string
  'visualStyle.lightingPreferences'?: string
  'visualStyle.cameraMovement'?: string
  'visualStyle.colorPalette.dominance'?: string
  'visualStyle.colorPalette.saturation'?: string
  'themes.moralQuestions'?: string
  'themes.messageTakeaway'?: string
  'references.visualReferences'?: string
  'references.narrativeReferences'?: string
  'setting.timePeriod'?: string
  'setting.geographicSetting'?: string
  'setting.socialContext'?: string
  'setting.scale'?: string
  'characterArchetypes.protagonistType'?: string
  'characterArchetypes.supportingRoles'?: string
  'characterArchetypes.relationshipDynamics'?: string
  'pacing.narrativeStructure'?: string
  'pacing.pacingStyle'?: string
  'pacing.climaxIntensity'?: string
  'contentGuidelines.contentRestrictions'?: string
  'contentGuidelines.culturalSensitivities'?: string
  'contentGuidelines.educationalValue'?: string

  // Relationship fields (arrays of IDs)
  primaryGenres?: string[]
  'targetAudience.demographics'?: string[]
  'toneAndMood.tones'?: string[]
  'toneAndMood.moods'?: string[]
  'visualStyle.cinematographyStyle'?: string
  'themes.centralThemes'?: string[]

  // Array fields
  'references.inspirationalMovies'?: Array<{
    title: string
    year: number | null
    specificElements: string
  }>
}

export interface FieldGenerationProgress {
  fieldName: string
  fieldLabel: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  content?: string
  error?: string
}

/**
 * Clean AI response by removing markdown formatting and extra whitespace
 */
function cleanAIResponse(response: string): string {
  return response
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
    .trim()
}

/**
 * Generate core premise using BAML
 */
async function generateCorePremise(context: InitialConceptContext): Promise<string> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateCorePremise(
      context.projectName,
      context.movieFormat,
      context.movieStyle,
      context.series || null,
      context.durationUnit,
      context.formData.primaryGenres,
      context.formData.corePremise || null,
    )
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating core premise:', error)
    throw new Error('Failed to generate core premise')
  }
}

/**
 * Generate target audience psychographics using BAML
 */
async function generateTargetAudiencePsychographics(
  context: InitialConceptContext,
): Promise<string> {
  try {
    const result = await b.GenerateTargetAudiencePsychographics(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.targetAudience.demographics,
      context.formData.targetAudience.psychographics || null,
    )
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating target audience psychographics:', error)
    throw new Error('Failed to generate target audience psychographics')
  }
}

/**
 * Generate target audience custom description using BAML
 */
async function generateTargetAudienceCustomDescription(
  context: InitialConceptContext,
): Promise<string> {
  try {
    const result = await b.GenerateTargetAudienceCustomDescription(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.targetAudience.demographics,
      context.formData.targetAudience.psychographics,
      context.formData.targetAudience.customDescription || null,
    )
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating target audience custom description:', error)
    throw new Error('Failed to generate target audience custom description')
  }
}

/**
 * Generate emotional arc using BAML
 */
async function generateEmotionalArc(context: InitialConceptContext): Promise<string> {
  try {
    const result = await b.GenerateEmotionalArc(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.toneAndMood.tones,
      context.formData.toneAndMood.moods,
      context.formData.toneAndMood.emotionalArc || null,
    )
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating emotional arc:', error)
    throw new Error('Failed to generate emotional arc')
  }
}

/**
 * Generate visual style elements using BAML
 */
async function generateVisualStyleElements(context: InitialConceptContext): Promise<{
  symbolicColors?: string
  lightingPreferences?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateVisualStyleElements(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.visualStyle.cinematographyStyle,
      context.formData.visualStyle.colorPalette.dominance,
      context.formData.visualStyle.colorPalette.saturation,
      context.formData.visualStyle.cameraMovement,
      context.formData.visualStyle.colorPalette.symbolicColors || null,
      context.formData.visualStyle.lightingPreferences || null,
    )

    return {
      symbolicColors: result.symbolicColors ? cleanAIResponse(result.symbolicColors) : undefined,
      lightingPreferences: result.lightingPreferences
        ? cleanAIResponse(result.lightingPreferences)
        : undefined,
    }
  } catch (error) {
    console.error('Error generating visual style elements:', error)
    throw new Error('Failed to generate visual style elements')
  }
}

/**
 * Generate thematic elements using BAML
 */
async function generateThematicElements(context: InitialConceptContext): Promise<{
  moralQuestions?: string
  messageTakeaway?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateThematicElements(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.themes.centralThemes,
      context.formData.themes.moralQuestions || null,
      context.formData.themes.messageTakeaway || null,
    )

    return {
      moralQuestions: result.moralQuestions ? cleanAIResponse(result.moralQuestions) : undefined,
      messageTakeaway: result.messageTakeaway ? cleanAIResponse(result.messageTakeaway) : undefined,
    }
  } catch (error) {
    console.error('Error generating thematic elements:', error)
    throw new Error('Failed to generate thematic elements')
  }
}

/**
 * Generate reference materials using BAML
 */
async function generateReferenceMaterials(context: InitialConceptContext): Promise<{
  visualReferences?: string
  narrativeReferences?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateReferenceMaterials(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.visualStyle.cinematographyStyle,
      context.formData.themes.centralThemes,
      context.formData.references.visualReferences || null,
      context.formData.references.narrativeReferences || null,
    )

    return {
      visualReferences: result.visualReferences
        ? cleanAIResponse(result.visualReferences)
        : undefined,
      narrativeReferences: result.narrativeReferences
        ? cleanAIResponse(result.narrativeReferences)
        : undefined,
    }
  } catch (error) {
    console.error('Error generating reference materials:', error)
    throw new Error('Failed to generate reference materials')
  }
}

/**
 * Generate character archetypes using BAML
 */
async function generateCharacterArchetypes(context: InitialConceptContext): Promise<{
  protagonistType?: string
  supportingRoles?: string
  relationshipDynamics?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateCharacterArchetypes(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.themes.centralThemes,
      `${context.formData.targetAudience.demographics.join(', ')} - ${context.formData.targetAudience.psychographics}`,
      null, // existingProtagonistType
      null, // existingSupportingRoles
      null, // existingRelationshipDynamics
    )

    return {
      protagonistType: result.protagonistType ? cleanAIResponse(result.protagonistType) : undefined,
      supportingRoles: result.supportingRoles ? cleanAIResponse(result.supportingRoles) : undefined,
      relationshipDynamics: result.relationshipDynamics
        ? cleanAIResponse(result.relationshipDynamics)
        : undefined,
    }
  } catch (error) {
    console.error('Error generating character archetypes:', error)
    throw new Error('Failed to generate character archetypes')
  }
}

/**
 * Generate setting elements using BAML
 */
async function generateSettingElements(context: InitialConceptContext): Promise<{
  timePeriod?: string
  geographicSetting?: string
  socialContext?: string
  scale?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateSettingElements(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.formData.themes.centralThemes,
      context.formData.visualStyle.cinematographyStyle,
      null, // existingTimePeriod
      null, // existingGeographicSetting
      null, // existingSocialContext
      null, // existingScale
    )

    return {
      timePeriod: result.timePeriod ? cleanAIResponse(result.timePeriod) : undefined,
      geographicSetting: result.geographicSetting
        ? cleanAIResponse(result.geographicSetting)
        : undefined,
      socialContext: result.socialContext ? cleanAIResponse(result.socialContext) : undefined,
      scale: result.scale ? cleanAIResponse(result.scale) : undefined,
    }
  } catch (error) {
    console.error('Error generating setting elements:', error)
    throw new Error('Failed to generate setting elements')
  }
}

/**
 * Generate pacing elements using BAML
 */
async function generatePacingElements(context: InitialConceptContext): Promise<{
  narrativeStructure?: string
  pacingStyle?: string
  climaxIntensity?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GeneratePacingElements(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      context.durationUnit,
      context.movieFormat,
      context.formData.themes.centralThemes,
      null, // existingNarrativeStructure
      null, // existingPacingStyle
      null, // existingClimaxIntensity
    )

    return {
      narrativeStructure: result.narrativeStructure
        ? cleanAIResponse(result.narrativeStructure)
        : undefined,
      pacingStyle: result.pacingStyle ? cleanAIResponse(result.pacingStyle) : undefined,
      climaxIntensity: result.climaxIntensity ? cleanAIResponse(result.climaxIntensity) : undefined,
    }
  } catch (error) {
    console.error('Error generating pacing elements:', error)
    throw new Error('Failed to generate pacing elements')
  }
}

/**
 * Generate content guidelines using BAML
 */
async function generateContentGuidelines(context: InitialConceptContext): Promise<{
  contentRestrictions?: string
  culturalSensitivities?: string
  educationalValue?: string
}> {
  try {
    const b = await getBamlClient()
    const result = await b.GenerateContentGuidelines(
      context.projectName,
      context.formData.primaryGenres,
      context.formData.corePremise,
      `${context.formData.targetAudience.demographics.join(', ')} - ${context.formData.targetAudience.psychographics}`,
      context.formData.themes.centralThemes,
      null, // existingContentRestrictions
      null, // existingCulturalSensitivities
      null, // existingEducationalValue
    )

    return {
      contentRestrictions: result.contentRestrictions
        ? cleanAIResponse(result.contentRestrictions)
        : undefined,
      culturalSensitivities: result.culturalSensitivities
        ? cleanAIResponse(result.culturalSensitivities)
        : undefined,
      educationalValue: result.educationalValue
        ? cleanAIResponse(result.educationalValue)
        : undefined,
    }
  } catch (error) {
    console.error('Error generating content guidelines:', error)
    throw new Error('Failed to generate content guidelines')
  }
}

/**
 * Generate inspirational movies using BAML
 */
async function generateInspirationalMovies(context: InitialConceptContext): Promise<
  Array<{
    title: string
    year: number | null
    specificElements: string
  }>
> {
  try {
    // Use OpenRouter as fallback since BAML function doesn't exist yet
    const prompt = `You are a film expert and cultural curator. Based on the project context, recommend 3-5 inspirational movies that would serve as creative references.

Project Context:
- Project: ${context.projectName}
- Genres: ${context.formData.primaryGenres.join(', ')}
- Core Premise: ${context.formData.corePremise}
- Themes: ${context.formData.themes.centralThemes.join(', ')}

For each movie, provide:
1. Title
2. Year (if known)
3. Specific elements to emulate (cinematography, storytelling, character development, etc.)

Format as JSON array:
[
  {
    "title": "Movie Title",
    "year": 1999,
    "specificElements": "What specific elements to emulate from this film"
  }
]`

    const response = await openrouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content || ''

    try {
      const movies = JSON.parse(content)
      if (Array.isArray(movies)) {
        return movies.map((movie: any) => ({
          title: movie.title || '',
          year: movie.year || null,
          specificElements: cleanAIResponse(movie.specificElements || ''),
        }))
      }
    } catch (parseError) {
      console.error('Failed to parse inspirational movies JSON:', parseError)
    }

    // Fallback if parsing fails
    return [
      {
        title: 'The Godfather',
        year: 1972,
        specificElements: 'Character development and family dynamics',
      },
      {
        title: 'Blade Runner 2049',
        year: 2017,
        specificElements: 'Visual storytelling and atmospheric cinematography',
      },
    ]
  } catch (error) {
    console.error('Error generating inspirational movies:', error)
    throw new Error('Failed to generate inspirational movies')
  }
}

/**
 * Generate visual style select fields
 */
async function generateVisualStyleSelects(context: InitialConceptContext): Promise<{
  dominance?: string
  saturation?: string
  cameraMovement?: string
}> {
  try {
    // Use AI to determine appropriate visual style selections
    const prompt = `You are a cinematography expert. Based on the project context, select the most appropriate visual style options.

Project Context:
- Genres: ${context.formData.primaryGenres.join(', ')}
- Core Premise: ${context.formData.corePremise}
- Cinematography Style: ${context.formData.visualStyle.cinematographyStyle}

Select ONE option for each category:

Color Palette Dominance: warm, cool, balanced, monochromatic
Color Saturation: high, medium, low, desaturated
Camera Movement: Describe the camera movement and framing style in 2-3 sentences

Respond with exactly three lines:
DOMINANCE: [selection]
SATURATION: [selection]
CAMERA: [description]`

    const response = await openrouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content || ''
    const lines = content.split('\n').filter((l) => l.trim())

    const dominanceLine = lines.find((l) => l.startsWith('DOMINANCE:'))
    const saturationLine = lines.find((l) => l.startsWith('SATURATION:'))
    const cameraLine = lines.find((l) => l.startsWith('CAMERA:'))

    return {
      dominance: dominanceLine ? dominanceLine.replace('DOMINANCE:', '').trim() : undefined,
      saturation: saturationLine ? saturationLine.replace('SATURATION:', '').trim() : undefined,
      cameraMovement: cameraLine
        ? cleanAIResponse(cameraLine.replace('CAMERA:', '').trim())
        : undefined,
    }
  } catch (error) {
    console.error('Error generating visual style selects:', error)
    throw new Error('Failed to generate visual style selections')
  }
}

/**
 * Define the generation sequence with field metadata
 */
const GENERATION_SEQUENCE = [
  // Step 1: Generate relationship fields first (they're dependencies for other fields)
  {
    fieldName: 'primaryGenres',
    fieldLabel: 'Primary Genres',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('primaryGenres', context, generatePrimaryGenres),
    required: [],
    isRelationship: true,
  },
  {
    fieldName: 'targetAudience.demographics',
    fieldLabel: 'Target Demographics',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField(
        'targetAudience.demographics',
        context,
        generateTargetDemographics,
      ),
    required: ['primaryGenres'],
    isRelationship: true,
  },
  {
    fieldName: 'toneAndMood.tones',
    fieldLabel: 'Tone Options',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('toneAndMood.tones', context, generateTones),
    required: ['primaryGenres'],
    isRelationship: true,
  },
  {
    fieldName: 'toneAndMood.moods',
    fieldLabel: 'Mood Descriptors',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('toneAndMood.moods', context, generateMoods),
    required: ['primaryGenres'],
    isRelationship: true,
  },
  {
    fieldName: 'visualStyle.cinematographyStyle',
    fieldLabel: 'Cinematography Style',
    generator: async (context: InitialConceptContext) => {
      const result = await generateRelationshipField(
        'visualStyle.cinematographyStyle',
        context,
        generateCinematographyStyle,
      )
      return result[0] // Single item, not array
    },
    required: ['primaryGenres'],
    isRelationship: true,
  },
  {
    fieldName: 'themes.centralThemes',
    fieldLabel: 'Central Themes',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('themes.centralThemes', context, generateCentralThemes),
    required: ['primaryGenres'],
    isRelationship: true,
  },

  // Step 2: Generate core content fields
  {
    fieldName: 'corePremise',
    fieldLabel: 'Core Premise',
    generator: generateCorePremise,
    required: ['primaryGenres'],
  },

  // Step 3: Generate visual style select fields
  {
    fieldName: 'visualStyle.colorPalette.dominance',
    fieldLabel: 'Color Palette Dominance',
    generator: async (context: InitialConceptContext) => {
      const result = await generateVisualStyleSelects(context)
      return result.dominance
    },
    required: ['primaryGenres', 'corePremise'],
  },
  {
    fieldName: 'visualStyle.colorPalette.saturation',
    fieldLabel: 'Color Saturation',
    generator: async (context: InitialConceptContext) => {
      const result = await generateVisualStyleSelects(context)
      return result.saturation
    },
    required: ['primaryGenres', 'corePremise'],
  },
  {
    fieldName: 'visualStyle.cameraMovement',
    fieldLabel: 'Camera Movement',
    generator: async (context: InitialConceptContext) => {
      const result = await generateVisualStyleSelects(context)
      return result.cameraMovement
    },
    required: ['primaryGenres', 'corePremise', 'visualStyle.cinematographyStyle'],
  },

  // Step 4: Generate dependent text fields
  {
    fieldName: 'targetAudience.psychographics',
    fieldLabel: 'Target Audience Psychographics',
    generator: generateTargetAudiencePsychographics,
    required: ['primaryGenres', 'corePremise', 'targetAudience.demographics'],
  },
  {
    fieldName: 'targetAudience.customDescription',
    fieldLabel: 'Target Audience Custom Description',
    generator: generateTargetAudienceCustomDescription,
    required: [
      'primaryGenres',
      'corePremise',
      'targetAudience.demographics',
      'targetAudience.psychographics',
    ],
  },
  {
    fieldName: 'toneAndMood.emotionalArc',
    fieldLabel: 'Emotional Arc',
    generator: generateEmotionalArc,
    required: ['primaryGenres', 'corePremise', 'toneAndMood.tones', 'toneAndMood.moods'],
  },

  // Step 5: Generate thematic content
  {
    fieldName: 'themes.moralQuestions',
    fieldLabel: 'Moral Questions',
    generator: async (context: InitialConceptContext) => {
      const result = await generateThematicElements(context)
      return result.moralQuestions
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'themes.messageTakeaway',
    fieldLabel: 'Message Takeaway',
    generator: async (context: InitialConceptContext) => {
      const result = await generateThematicElements(context)
      return result.messageTakeaway
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },

  // Step 6: Generate visual style elements
  {
    fieldName: 'visualStyle.colorPalette.symbolicColors',
    fieldLabel: 'Symbolic Colors',
    generator: async (context: InitialConceptContext) => {
      const result = await generateVisualStyleElements(context)
      return result.symbolicColors
    },
    required: ['primaryGenres', 'corePremise', 'visualStyle.cinematographyStyle'],
  },
  {
    fieldName: 'visualStyle.lightingPreferences',
    fieldLabel: 'Lighting Preferences',
    generator: async (context: InitialConceptContext) => {
      const result = await generateVisualStyleElements(context)
      return result.lightingPreferences
    },
    required: ['primaryGenres', 'corePremise', 'visualStyle.cinematographyStyle'],
  },

  // Step 7: Generate reference materials
  {
    fieldName: 'references.inspirationalMovies',
    fieldLabel: 'Inspirational Movies',
    generator: generateInspirationalMovies,
    required: ['primaryGenres', 'corePremise'],
  },
  {
    fieldName: 'references.visualReferences',
    fieldLabel: 'Visual References',
    generator: async (context: InitialConceptContext) => {
      const result = await generateReferenceMaterials(context)
      return result.visualReferences
    },
    required: ['primaryGenres', 'corePremise', 'visualStyle.cinematographyStyle'],
  },
  {
    fieldName: 'references.narrativeReferences',
    fieldLabel: 'Narrative References',
    generator: async (context: InitialConceptContext) => {
      const result = await generateReferenceMaterials(context)
      return result.narrativeReferences
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },

  // Step 8: Generate character archetypes
  {
    fieldName: 'characterArchetypes.protagonistType',
    fieldLabel: 'Protagonist Type',
    generator: async (context: InitialConceptContext) => {
      const result = await generateCharacterArchetypes(context)
      return result.protagonistType
    },
    required: [
      'primaryGenres',
      'corePremise',
      'themes.centralThemes',
      'targetAudience.demographics',
    ],
  },
  {
    fieldName: 'characterArchetypes.supportingRoles',
    fieldLabel: 'Supporting Roles',
    generator: async (context: InitialConceptContext) => {
      const result = await generateCharacterArchetypes(context)
      return result.supportingRoles
    },
    required: [
      'primaryGenres',
      'corePremise',
      'themes.centralThemes',
      'targetAudience.demographics',
    ],
  },
  {
    fieldName: 'characterArchetypes.relationshipDynamics',
    fieldLabel: 'Relationship Dynamics',
    generator: async (context: InitialConceptContext) => {
      const result = await generateCharacterArchetypes(context)
      return result.relationshipDynamics
    },
    required: [
      'primaryGenres',
      'corePremise',
      'themes.centralThemes',
      'targetAudience.demographics',
    ],
  },

  // Step 9: Generate setting elements
  {
    fieldName: 'setting.timePeriod',
    fieldLabel: 'Time Period',
    generator: async (context: InitialConceptContext) => {
      const result = await generateSettingElements(context)
      return result.timePeriod
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'setting.geographicSetting',
    fieldLabel: 'Geographic Setting',
    generator: async (context: InitialConceptContext) => {
      const result = await generateSettingElements(context)
      return result.geographicSetting
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'setting.socialContext',
    fieldLabel: 'Social Context',
    generator: async (context: InitialConceptContext) => {
      const result = await generateSettingElements(context)
      return result.socialContext
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'setting.scale',
    fieldLabel: 'Setting Scale',
    generator: async (context: InitialConceptContext) => {
      const result = await generateSettingElements(context)
      return result.scale
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },

  // Step 10: Generate pacing elements
  {
    fieldName: 'pacing.narrativeStructure',
    fieldLabel: 'Narrative Structure',
    generator: async (context: InitialConceptContext) => {
      const result = await generatePacingElements(context)
      return result.narrativeStructure
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'pacing.pacingStyle',
    fieldLabel: 'Pacing Style',
    generator: async (context: InitialConceptContext) => {
      const result = await generatePacingElements(context)
      return result.pacingStyle
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },
  {
    fieldName: 'pacing.climaxIntensity',
    fieldLabel: 'Climax Intensity',
    generator: async (context: InitialConceptContext) => {
      const result = await generatePacingElements(context)
      return result.climaxIntensity
    },
    required: ['primaryGenres', 'corePremise', 'themes.centralThemes'],
  },

  // Step 11: Generate content guidelines
  {
    fieldName: 'contentGuidelines.contentRestrictions',
    fieldLabel: 'Content Restrictions',
    generator: async (context: InitialConceptContext) => {
      const result = await generateContentGuidelines(context)
      return result.contentRestrictions
    },
    required: ['primaryGenres', 'targetAudience.demographics', 'corePremise'],
  },
  {
    fieldName: 'contentGuidelines.culturalSensitivities',
    fieldLabel: 'Cultural Sensitivities',
    generator: async (context: InitialConceptContext) => {
      const result = await generateContentGuidelines(context)
      return result.culturalSensitivities
    },
    required: ['primaryGenres', 'targetAudience.demographics', 'corePremise'],
  },
  {
    fieldName: 'contentGuidelines.educationalValue',
    fieldLabel: 'Educational Value',
    generator: async (context: InitialConceptContext) => {
      const result = await generateContentGuidelines(context)
      return result.educationalValue
    },
    required: ['primaryGenres', 'targetAudience.demographics', 'corePremise'],
  },
] as const

/**
 * Check if a field has content
 */
function hasFieldContent(formData: InitialConceptFormData, fieldPath: string): boolean {
  const keys = fieldPath.split('.')
  let current: any = formData

  for (const key of keys) {
    if (current === null || current === undefined) return false
    current = current[key]
  }

  if (Array.isArray(current)) {
    return current.length > 0
  }

  return typeof current === 'string' ? current.trim().length > 0 : !!current
}

/**
 * Check if required fields are present for a generation step
 */
function hasRequiredFields(
  formData: InitialConceptFormData,
  requiredFields: readonly string[],
): boolean {
  return requiredFields.every((field) => hasFieldContent(formData, field))
}

/**
 * Generate and update fields individually in the database
 * This follows the pattern: create record first, then generate each field with individual BAML prompts
 */
export async function generateAndUpdateFieldsIndividually(
  payload: any,
  recordId: string,
  context: InitialConceptContext,
  onProgress?: (progress: FieldGenerationProgress) => void,
): Promise<any> {
  console.log('🎯 Starting individual field generation for record:', recordId)

  // Process each field in sequence
  for (const step of GENERATION_SEQUENCE) {
    const { fieldName, fieldLabel, generator, required } = step

    // Skip if field already has content
    if (hasFieldContent(context.formData, fieldName)) {
      console.log(`⏭️ Skipping ${fieldName} - already has content`)
      continue
    }

    // Skip if required fields are missing
    if (!hasRequiredFields(context.formData, required)) {
      console.log(`⏭️ Skipping ${fieldName} - missing required fields:`, required)
      continue
    }

    // Notify progress start
    onProgress?.({
      fieldName,
      fieldLabel,
      status: 'generating',
    })

    try {
      console.log(`🔄 Generating field: ${fieldName}`)

      // Generate the field content with individual BAML prompt
      const content = await generator(context)

      if (content !== undefined && content !== null) {
        // Update the database record with this specific field
        const updateData = buildUpdateData(fieldName, content)

        console.log(`💾 Updating record with field: ${fieldName}`)
        await payload.update({
          collection: 'initial-concepts',
          id: recordId,
          data: updateData,
        })

        // Update context with generated content for next fields
        updateContextWithContent(context, fieldName, content)

        console.log(`✅ Successfully updated field: ${fieldName}`)
      }

      // Notify progress completion
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'completed',
        content: typeof content === 'string' ? content : JSON.stringify(content),
      })
    } catch (error) {
      console.error(`❌ Error generating field ${fieldName}:`, error)

      // Notify progress error
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Return the updated record
  const updatedRecord = await payload.findByID({
    collection: 'initial-concepts',
    id: recordId,
  })

  console.log('🎉 Individual field generation completed for record:', recordId)
  return updatedRecord
}

/**
 * Build update data object for a specific field path
 */
function buildUpdateData(fieldPath: string, content: any): any {
  const keys = fieldPath.split('.')
  const updateData: any = {}

  let current = updateData
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = content

  return updateData
}

/**
 * Update context with generated content for subsequent field generation
 */
function updateContextWithContent(
  context: InitialConceptContext,
  fieldPath: string,
  content: any,
): void {
  const keys = fieldPath.split('.')
  let current: any = context.formData

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = content
}

/**
 * Generate all missing fields sequentially with progress tracking (legacy bulk approach)
 */
export async function generateMissingFieldsSequentially(
  context: InitialConceptContext,
  onProgress?: (progress: FieldGenerationProgress) => void,
): Promise<GeneratedFields> {
  const generatedFields: GeneratedFields = {}

  // Process each field in sequence
  for (const step of GENERATION_SEQUENCE) {
    const { fieldName, fieldLabel, generator, required } = step

    // Skip if field already has content
    if (hasFieldContent(context.formData, fieldName)) {
      continue
    }

    // Skip if required fields are missing
    if (!hasRequiredFields(context.formData, required)) {
      continue
    }

    // Notify progress start
    onProgress?.({
      fieldName,
      fieldLabel,
      status: 'generating',
    })

    try {
      // Generate the field content
      const content = await generator(context)

      // Handle different content types
      if (content !== undefined && content !== null) {
        generatedFields[fieldName as keyof GeneratedFields] = content as any

        // Update context with generated content for next fields
        const keys = fieldName.split('.')
        let current: any = context.formData
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {}
          }
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = content
      }

      // Notify progress completion
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'completed',
        content: typeof content === 'string' ? content : JSON.stringify(content),
      })
    } catch (error) {
      console.error(`Error generating ${fieldName}:`, error)

      // Notify progress error
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return generatedFields
}

/**
 * Create context for AI generation
 */
export function createInitialConceptContext(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  durationUnit: number,
  formData: InitialConceptFormData,
  series?: string,
  projectDescription?: string,
): InitialConceptContext {
  return {
    projectName,
    movieFormat,
    movieStyle,
    series,
    durationUnit,
    formData,
  }
}

/**
 * Generate all fields from scratch (complete regeneration)
 */
export async function generateAllFieldsFromScratch(
  context: InitialConceptContext,
  onProgress?: (progress: FieldGenerationProgress) => void,
): Promise<GeneratedFields> {
  // For complete regeneration, we use the same sequence but ignore existing content
  return await generateMissingFieldsSequentially(context, onProgress)
}
