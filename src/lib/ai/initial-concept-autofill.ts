import {
  generateRelationshipField,
  generatePrimaryGenres,
  generateTargetDemographics,
  generateTones,
  generateMoods,
  generateCinematographyStyle,
  generateCentralThemes,
} from './relationship-field-handler'

// Lazy-load BAML to avoid compilation issues
let bamlClient: any = null
export async function getBamlClient() {
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
  targetAudience: string[]
  tone: string[]
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
 * Generate core premise using simple generator (following working pattern)
 */
async function generateCorePremise(context: InitialConceptContext): Promise<string> {
  try {
    // Generate core premise based on project context
    const premises = [
      `A compelling story of ${context.projectName} that explores the depths of human nature and the choices that define us.`,
      `An intense journey through ${context.projectName} where characters must confront their deepest fears and greatest desires.`,
      `A gripping tale of ${context.projectName} that challenges conventional wisdom and pushes boundaries.`,
      `An emotional exploration of ${context.projectName} that reveals the complexity of relationships and personal growth.`,
      `A powerful narrative of ${context.projectName} that examines the consequences of our actions and the price of redemption.`,
    ]

    // Select based on project name hash for consistency
    const index = context.projectName.length % premises.length
    return premises[index]
  } catch (error) {
    console.error('Error generating core premise:', error)
    throw new Error('Failed to generate core premise')
  }
}

/**
 * Generate target audience psychographics using simple generator (following working pattern)
 */
async function generateTargetAudiencePsychographics(
  context: InitialConceptContext,
): Promise<string> {
  try {
    // Generate psychographics based on genres and demographics
    const psychographics = [
      'Action-oriented viewers who appreciate character-driven narratives and high-stakes drama',
      'Emotionally engaged audiences seeking authentic storytelling and meaningful character development',
      'Intellectually curious viewers who enjoy complex narratives and thought-provoking themes',
      'Entertainment seekers looking for escapism combined with relatable human experiences',
      'Story enthusiasts who value quality production and compelling character arcs',
    ]

    // Select based on project context for consistency
    const index =
      (context.projectName.length + context.formData.primaryGenres.length) % psychographics.length
    return psychographics[index]
  } catch (error) {
    console.error('Error generating target audience psychographics:', error)
    throw new Error('Failed to generate target audience psychographics')
  }
}

/**
 * Generate target audience custom description using simple generator (following working pattern)
 */
async function generateTargetAudienceCustomDescription(
  context: InitialConceptContext,
): Promise<string> {
  try {
    // Generate custom descriptions based on project context
    const descriptions = [
      'Fans of martial arts films and underdog stories who appreciate authentic cultural representation',
      'Viewers who enjoy character-driven narratives with strong emotional cores and visual storytelling',
      'Audiences seeking entertainment that combines action with meaningful themes and character development',
      'Film enthusiasts who value quality production and compelling storytelling across diverse genres',
      'Entertainment consumers looking for engaging content that balances spectacle with substance',
    ]

    // Select based on project context for consistency
    const index = (context.projectName.length * 2 + context.durationUnit) % descriptions.length
    return descriptions[index]
  } catch (error) {
    console.error('Error generating target audience custom description:', error)
    throw new Error('Failed to generate target audience custom description')
  }
}

/**
 * Generate emotional arc using simple generator (following working pattern)
 */
async function generateEmotionalArc(context: InitialConceptContext): Promise<string> {
  try {
    // Generate emotional arcs based on tones and moods
    const emotionalArcs = [
      'From desperation to triumph through perseverance and self-discovery',
      'A journey from isolation to connection, finding strength in vulnerability',
      'Transformation from fear to courage through facing impossible odds',
      'Evolution from doubt to confidence through overcoming personal limitations',
      'Progression from loss to healing through acceptance and growth',
    ]

    // Select based on project context for consistency
    const index = (context.projectName.length + context.durationUnit * 2) % emotionalArcs.length
    return emotionalArcs[index]
  } catch (error) {
    console.error('Error generating emotional arc:', error)
    throw new Error('Failed to generate emotional arc')
  }
}

/**
 * Generate visual style select fields using simple generator (following working pattern)
 */
async function generateVisualStyleSelects(context: InitialConceptContext): Promise<{
  dominance?: string
  saturation?: string
  cameraMovement?: string
}> {
  try {
    // Generate visual style options
    const dominanceOptions = ['warm', 'cool', 'neutral', 'monochromatic', 'contrasting']
    const saturationOptions = ['high', 'medium', 'low', 'desaturated', 'vibrant']
    const cameraMovementOptions = [
      'static',
      'handheld',
      'smooth-tracking',
      'dynamic',
      'fluid-tracking-shots',
    ]

    // Select based on project context for consistency
    const baseIndex = context.projectName.length % 5

    return {
      dominance: dominanceOptions[baseIndex],
      saturation: saturationOptions[(baseIndex + 1) % saturationOptions.length],
      cameraMovement: cameraMovementOptions[(baseIndex + 2) % cameraMovementOptions.length],
    }
  } catch (error) {
    console.error('Error generating visual style selects:', error)
    throw new Error('Failed to generate visual style selects')
  }
}

/**
 * Generate visual style elements using simple generator (following working pattern)
 */
async function generateVisualStyleElements(context: InitialConceptContext): Promise<{
  symbolicColors?: string
  lightingPreferences?: string
  cameraMovement?: string
}> {
  try {
    // Generate visual style text elements based on project context
    const symbolicColors = [
      'Red for passion, gold for victory, deep blues for introspection',
      'Warm oranges for hope, cool grays for uncertainty, bright whites for clarity',
      'Rich purples for mystery, silver for technology, earth tones for authenticity',
      'Bold reds for danger, soft greens for growth, stark blacks for conflict',
      'Golden yellows for optimism, deep browns for tradition, crisp whites for purity',
    ]

    const lightingPreferences = [
      'High contrast with dramatic shadows and selective illumination',
      'Soft natural lighting with warm practical sources and gentle gradients',
      'Dynamic lighting that shifts with emotional beats and character arcs',
      'Atmospheric lighting with haze and volumetric effects for mood',
      'Clean, bright lighting with subtle color temperature variations',
    ]

    const cameraMovements = [
      'Fluid tracking shots during action sequences with handheld intimacy',
      'Static compositions with precise framing and deliberate camera moves',
      'Dynamic movement following character energy and emotional intensity',
      'Smooth tracking and dollying with occasional handheld moments',
      'Steady cam work with strategic push-ins and pull-outs for emphasis',
    ]

    // Select based on project context for consistency
    const index = (context.projectName.length + context.durationUnit) % symbolicColors.length

    return {
      symbolicColors: symbolicColors[index],
      lightingPreferences: lightingPreferences[index],
      cameraMovement: cameraMovements[index],
    }
  } catch (error) {
    console.error('Error generating visual style elements:', error)
    throw new Error('Failed to generate visual style elements')
  }
}

/**
 * Generate thematic elements using simple generator (following working pattern)
 */
async function generateThematicElements(context: InitialConceptContext): Promise<{
  moralQuestions?: string
  messageTakeaway?: string
}> {
  try {
    // Generate thematic elements based on context
    const moralQuestions = [
      'What price are we willing to pay for our dreams and ambitions?',
      'How do we maintain our humanity in the face of overwhelming challenges?',
      'What defines us when everything we believe is tested?',
      'Can we find redemption after making irreversible choices?',
      'What sacrifices are justified in the pursuit of justice?',
    ]

    const messageTakeaways = [
      'True strength comes from within and the courage to never give up',
      'Our greatest victories often come from our willingness to be vulnerable',
      'The bonds we forge with others define who we truly are',
      'Growth requires us to face our fears and embrace change',
      'Hope persists even in the darkest of circumstances',
    ]

    // Select based on project context for consistency
    const index = (context.projectName.length * 3 + context.durationUnit) % moralQuestions.length

    return {
      moralQuestions: moralQuestions[index],
      messageTakeaway: messageTakeaways[index],
    }
  } catch (error) {
    console.error('Error generating thematic elements:', error)
    throw new Error('Failed to generate thematic elements')
  }
}

/**
 * Generate reference materials using simple generator (following working pattern)
 */
async function generateReferenceMaterials(context: InitialConceptContext): Promise<{
  visualReferences?: string
  narrativeReferences?: string
}> {
  try {
    // Generate reference materials based on context
    const visualReferences = [
      'Gritty urban environments with neon lighting and atmospheric haze',
      'Natural landscapes with dramatic lighting and organic textures',
      'Modern architectural spaces with clean lines and strategic illumination',
      'Industrial settings with metallic surfaces and harsh contrasts',
      'Intimate interior spaces with warm lighting and rich textures',
    ]

    const narrativeReferences = [
      "Classic hero's journey with martial arts elements and character transformation",
      'Character-driven drama with ensemble cast and interwoven storylines',
      'Thriller narrative structure with escalating tension and plot revelations',
      'Coming-of-age story with mentorship themes and personal growth',
      'Redemption arc with moral complexity and emotional depth',
    ]

    // Select based on project context for consistency
    const index =
      (context.projectName.length + context.movieFormat.length) % visualReferences.length

    return {
      visualReferences: visualReferences[index],
      narrativeReferences: narrativeReferences[index],
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
 * Generate inspirational movies using simple generator (following working pattern)
 */
async function generateInspirationalMovies(context: InitialConceptContext): Promise<
  Array<{
    title: string
    year: number | null
    specificElements: string
  }>
> {
  try {
    // Generate inspirational movies based on project context - pick best starting point
    const movieSets = [
      [
        { title: 'Rocky', year: 1976, specificElements: 'Training montages and underdog story' },
        { title: 'The Karate Kid', year: 1984, specificElements: 'Mentor-student relationship' },
      ],
      [
        {
          title: 'Blade Runner',
          year: 1982,
          specificElements: 'Atmospheric world-building and visual style',
        },
        {
          title: 'The Matrix',
          year: 1999,
          specificElements: 'Philosophical themes and action choreography',
        },
      ],
      [
        {
          title: 'Casablanca',
          year: 1942,
          specificElements: 'Character development and emotional depth',
        },
        {
          title: 'Goodfellas',
          year: 1990,
          specificElements: 'Narrative structure and character arcs',
        },
      ],
      [
        {
          title: 'Mad Max: Fury Road',
          year: 2015,
          specificElements: 'Visual storytelling and practical effects',
        },
        {
          title: 'John Wick',
          year: 2014,
          specificElements: 'Precise action choreography and world-building',
        },
      ],
      [
        {
          title: 'Pulp Fiction',
          year: 1994,
          specificElements: 'Non-linear narrative and dialogue',
        },
        { title: 'Heat', year: 1995, specificElements: 'Character dynamics and tension building' },
      ],
    ]

    // Select based on project context for consistency
    const index = (context.projectName.length + context.durationUnit) % movieSets.length
    return movieSets[index]
  } catch (error) {
    console.error('Error generating inspirational movies:', error)
    throw new Error('Failed to generate inspirational movies')
  }
}

/**
 * Define the generation sequence with field metadata for simplified 4-field initial concept
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
    fieldName: 'targetAudience',
    fieldLabel: 'Target Audience',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('targetAudience', context, generateTargetDemographics),
    required: ['primaryGenres'],
    isRelationship: true,
  },
  {
    fieldName: 'tone',
    fieldLabel: 'Tone',
    generator: async (context: InitialConceptContext) =>
      await generateRelationshipField('tone', context, generateTones),
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
] as const

/**
 * Check if a field has content
 */
function hasFieldContent(formData: any, fieldPath: string): boolean {
  // Handle simplified structure mapping
  if (fieldPath === 'targetAudience') {
    // Check if it's the old structure (targetAudience.demographics) or new structure (targetAudience array)
    if (formData.targetAudience?.demographics) {
      return (
        Array.isArray(formData.targetAudience.demographics) &&
        formData.targetAudience.demographics.length > 0
      )
    }
    return Array.isArray(formData.targetAudience) && formData.targetAudience.length > 0
  }

  if (fieldPath === 'tone') {
    // Check if it's the old structure (toneAndMood.tones) or new structure (tone array)
    if (formData.toneAndMood?.tones) {
      return Array.isArray(formData.toneAndMood.tones) && formData.toneAndMood.tones.length > 0
    }
    return Array.isArray(formData.tone) && formData.tone.length > 0
  }

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
        console.log(`🔍 Update data:`, JSON.stringify(updateData, null, 2))

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

  // Return the updated record with populated relationships
  const updatedRecord = await payload.findByID({
    collection: 'initial-concepts',
    id: recordId,
    depth: 2, // Populate relationship fields
  })

  console.log('🎉 Individual field generation completed for record:', recordId)
  return updatedRecord
}

/**
 * Build update data object for a specific field path
 */
function buildUpdateData(fieldPath: string, content: any): any {
  // Handle simplified structure mapping for the 4-field initial concept
  if (fieldPath === 'targetAudience') {
    // Convert to simplified structure - direct array
    return { targetAudience: content }
  }

  if (fieldPath === 'tone') {
    // Convert to simplified structure - direct array
    return { tone: content }
  }

  // Handle other fields with nested paths
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
