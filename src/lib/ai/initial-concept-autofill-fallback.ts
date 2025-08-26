import OpenAI from 'openai'

// Initialize OpenRouter client
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
  projectDescription?: string // Optional project description for better context
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
 * Generate content using OpenAI directly
 */
async function generateWithOpenAI(prompt: string): Promise<string> {
  try {
    const response = await openrouter.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return cleanAIResponse(content)
  } catch (error) {
    console.error('OpenAI generation error:', error)
    throw error
  }
}

/**
 * Generate core premise
 */
async function generateCorePremise(context: InitialConceptContext): Promise<string> {
  const prompt = `You are a master story architect with 25+ years of experience crafting compelling narratives for Academy Award-winning films.

Project Context:
- Project Name: ${context.projectName}
- Movie Format: ${context.movieFormat}
- Movie Style: ${context.movieStyle}
${context.series ? `- Series: ${context.series}` : ''}
- Duration: ${context.durationUnit} minutes
- Primary Genres: ${context.formData.primaryGenres.join(', ')}

Create a compelling core premise (200-400 words) that establishes:
1. The central conflict and main character struggle
2. What drives the narrative forward
3. The stakes and why audiences should care
4. The unique hook that differentiates this story
5. The emotional core and universal human truth
6. The thematic question the story explores

Focus on authentic human emotion, universal experiences, and create natural opportunities for character development. Make it production-ready and commercially viable while maintaining creative depth.

Generate only the core premise content, no additional text or explanation.`

  return await generateWithOpenAI(prompt)
}

/**
 * Generate target audience psychographics
 */
async function generateTargetAudiencePsychographics(
  context: InitialConceptContext,
): Promise<string> {
  const prompt = `You are a leading audience psychology expert with deep expertise in film marketing and consumer psychology.

Project Context:
- Project: ${context.projectName}
- Genres: ${context.formData.primaryGenres.join(', ')}
- Demographics: ${context.formData.targetAudience.demographics.join(', ')}
- Core Premise: ${context.formData.corePremise}

Create a comprehensive psychographic profile (150-250 words) that reveals:
1. Core values and beliefs that guide their decisions
2. Lifestyle and identity - how they see themselves
3. Media consumption patterns and preferences
4. Emotional needs that entertainment fulfills
5. Social behaviors and connection patterns
6. Aspirations and fears
7. Cultural touchstones that resonate with them

Focus on authentic human motivations and the deeper psychological reasons they'll connect with this story. Consider contemporary behavioral trends while maintaining cultural specificity.

Generate only the psychographics description, no additional text or explanation.`

  return await generateWithOpenAI(prompt)
}

/**
 * Generate emotional arc
 */
async function generateEmotionalArc(context: InitialConceptContext): Promise<string> {
  const prompt = `You are a master emotional architect with deep knowledge of neuroscience and emotional psychology.

Project Context:
- Project: ${context.projectName}
- Genres: ${context.formData.primaryGenres.join(', ')}
- Core Premise: ${context.formData.corePremise}
- Tones: ${context.formData.toneAndMood.tones.join(', ')}
- Moods: ${context.formData.toneAndMood.moods.join(', ')}

Design a sophisticated emotional journey (200-350 words) that creates profound audience connection:
1. Opening emotional state and audience connection point
2. Emotional escalation pattern through story beats
3. Key emotional turning points and shifts
4. Emotional complexity with conflicting feelings
5. Cathartic moments and transformation
6. Emotional climax that pays off the journey
7. Resolution and lasting emotional impact

Create emotional progression that mirrors psychological transformation, using the specified tones and moods. Design moments of vulnerability that create authentic connection and plan for memorable, shareable emotional experiences.

Generate only the emotional arc description, no additional text or explanation.`

  return await generateWithOpenAI(prompt)
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
 * Generate all fields completely from scratch (complete regeneration)
 */
export async function generateAllFieldsFromScratch(
  context: InitialConceptContext,
  onProgress?: (progress: FieldGenerationProgress) => void,
): Promise<GeneratedFields> {
  const generatedFields: GeneratedFields = {}

  // Process each field in sequence - generate ALL fields regardless of existing content
  for (const step of GENERATION_SEQUENCE) {
    const { fieldName, fieldLabel, generator } = step

    // Always generate - no content checking for complete regeneration
    // Skip only if we can't generate due to missing dependencies
    const canGenerate = step.required ? hasRequiredFields(context.formData, step.required) : true

    if (!canGenerate) {
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

      generatedFields[fieldName as keyof GeneratedFields] = content

      // Update context with generated content for next fields
      const keys = fieldName.split('.')
      let current: any = context.formData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = content

      // Notify progress completion
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'completed',
        content,
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
 * Generate all missing fields sequentially with progress tracking (original function)
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

      generatedFields[fieldName as keyof GeneratedFields] = content

      // Update context with generated content for next fields
      const keys = fieldName.split('.')
      let current: any = context.formData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = content

      // Notify progress completion
      onProgress?.({
        fieldName,
        fieldLabel,
        status: 'completed',
        content,
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
 * Create context from project and form data
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
    projectDescription,
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
