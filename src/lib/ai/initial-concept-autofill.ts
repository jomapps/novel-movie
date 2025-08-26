import { b } from '../../../baml_client'
import OpenAI from 'openai'

// Initialize OpenRouter client as fallback
const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
    'X-Title': 'Novel Movie',
  },
})

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
}

export interface GeneratedFields {
  corePremise?: string
  'targetAudience.psychographics'?: string
  'targetAudience.customDescription'?: string
  'toneAndMood.emotionalArc'?: string
  'visualStyle.colorPalette.symbolicColors'?: string
  'visualStyle.lightingPreferences'?: string
  'themes.moralQuestions'?: string
  'themes.messageTakeaway'?: string
  'references.visualReferences'?: string
  'references.narrativeReferences'?: string
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
 * Define the generation sequence with field metadata
 */
const GENERATION_SEQUENCE = [
  {
    fieldName: 'corePremise',
    fieldLabel: 'Core Premise',
    generator: generateCorePremise,
    required: ['primaryGenres'],
  },
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
 * Generate all missing fields sequentially with progress tracking
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

      if (typeof content === 'string') {
        generatedFields[fieldName as keyof GeneratedFields] = content

        // Update context with generated content for next fields
        const keys = fieldName.split('.')
        let current: any = context.formData
        for (let i = 0; i < keys.length - 1; i++) {
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

  // Handle complex fields that return multiple values
  try {
    // Visual Style Elements
    if (
      !hasFieldContent(context.formData, 'visualStyle.colorPalette.symbolicColors') ||
      !hasFieldContent(context.formData, 'visualStyle.lightingPreferences')
    ) {
      if (
        hasRequiredFields(context.formData, [
          'primaryGenres',
          'corePremise',
          'visualStyle.cinematographyStyle',
        ])
      ) {
        onProgress?.({
          fieldName: 'visualStyle',
          fieldLabel: 'Visual Style Elements',
          status: 'generating',
        })

        const visualElements = await generateVisualStyleElements(context)

        if (
          visualElements.symbolicColors &&
          !hasFieldContent(context.formData, 'visualStyle.colorPalette.symbolicColors')
        ) {
          generatedFields['visualStyle.colorPalette.symbolicColors'] = visualElements.symbolicColors
        }

        if (
          visualElements.lightingPreferences &&
          !hasFieldContent(context.formData, 'visualStyle.lightingPreferences')
        ) {
          generatedFields['visualStyle.lightingPreferences'] = visualElements.lightingPreferences
        }

        onProgress?.({
          fieldName: 'visualStyle',
          fieldLabel: 'Visual Style Elements',
          status: 'completed',
        })
      }
    }

    // Thematic Elements
    if (
      !hasFieldContent(context.formData, 'themes.moralQuestions') ||
      !hasFieldContent(context.formData, 'themes.messageTakeaway')
    ) {
      if (
        hasRequiredFields(context.formData, [
          'primaryGenres',
          'corePremise',
          'themes.centralThemes',
        ])
      ) {
        onProgress?.({
          fieldName: 'themes',
          fieldLabel: 'Thematic Elements',
          status: 'generating',
        })

        const thematicElements = await generateThematicElements(context)

        if (
          thematicElements.moralQuestions &&
          !hasFieldContent(context.formData, 'themes.moralQuestions')
        ) {
          generatedFields['themes.moralQuestions'] = thematicElements.moralQuestions
        }

        if (
          thematicElements.messageTakeaway &&
          !hasFieldContent(context.formData, 'themes.messageTakeaway')
        ) {
          generatedFields['themes.messageTakeaway'] = thematicElements.messageTakeaway
        }

        onProgress?.({
          fieldName: 'themes',
          fieldLabel: 'Thematic Elements',
          status: 'completed',
        })
      }
    }

    // Reference Materials
    if (
      !hasFieldContent(context.formData, 'references.visualReferences') ||
      !hasFieldContent(context.formData, 'references.narrativeReferences')
    ) {
      if (hasRequiredFields(context.formData, ['primaryGenres', 'corePremise'])) {
        onProgress?.({
          fieldName: 'references',
          fieldLabel: 'Reference Materials',
          status: 'generating',
        })

        const referenceMaterials = await generateReferenceMaterials(context)

        if (
          referenceMaterials.visualReferences &&
          !hasFieldContent(context.formData, 'references.visualReferences')
        ) {
          generatedFields['references.visualReferences'] = referenceMaterials.visualReferences
        }

        if (
          referenceMaterials.narrativeReferences &&
          !hasFieldContent(context.formData, 'references.narrativeReferences')
        ) {
          generatedFields['references.narrativeReferences'] = referenceMaterials.narrativeReferences
        }

        onProgress?.({
          fieldName: 'references',
          fieldLabel: 'Reference Materials',
          status: 'completed',
        })
      }
    }
  } catch (error) {
    console.error('Error generating complex fields:', error)
  }

  return generatedFields
}

/**
 * Create context from project and form data
 */
export function createInitialConceptContext(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  durationUnit: number,
  formData: InitialConceptFormData,
  series?: string,
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
 * Validate that required project fields are present
 */
export function validateRequiredProjectFields(data: any): boolean {
  return !!(
    data.projectName &&
    data.movieFormat &&
    data.movieStyle &&
    data.durationUnit &&
    (data.movieFormat !== 'series' || data.series)
  )
}
