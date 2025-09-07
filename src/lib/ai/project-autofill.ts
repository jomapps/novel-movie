import OpenAI from 'openai'

// Initialize OpenRouter client
const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3001',
    'X-Title': 'Novel Movie',
  },
})

export interface ProjectContext {
  projectName: string
  movieFormat: string
  movieStyle: string
  series?: string
  durationUnit: number
  existingTitle?: string
  existingShortDescription?: string
  existingLongDescription?: string
  // Section 2 - Core Story Elements
  primaryGenres?: string[]
  corePremise?: string
  targetAudience?: string[]
  tone?: string[]
}

export interface GeneratedFields {
  projectTitle?: string
  shortDescription?: string
  longDescription?: string
}

/**
 * Universal cleanup function for AI-generated content
 * Removes common formatting artifacts that AI models sometimes add
 * Can be reused across all AI generation functions
 */
export function cleanAIResponse(content: string): string {
  return (
    content
      .trim()
      // Remove markdown bold formatting
      .replace(/^\*\*(.*)\*\*$/, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove quotes around entire content
      .replace(/^"(.*)"$/, '$1')
      .replace(/^'(.*)'$/, '$1')
      // Remove backticks
      .replace(/^`(.*)`$/, '$1')
      // Remove any leading/trailing whitespace again
      .trim()
  )
}

/**
 * Generate a project title using AI
 */
export async function generateProjectTitle(context: ProjectContext): Promise<string> {
  try {
    const prompt = `You are a creative writer specializing in compelling movie titles. Your task is to generate an engaging, memorable title for a movie project.

Project Context:
- Project Name: ${context.projectName}
- Movie Format: ${context.movieFormat}
- Movie Style: ${context.movieStyle}
${context.series ? `- Series: ${context.series}` : ''}
- Duration: ${context.durationUnit} minutes

${context.existingTitle ? `- Current Title: ${context.existingTitle}` : ''}
${context.existingShortDescription ? `- Short Description: ${context.existingShortDescription}` : ''}
${context.existingLongDescription ? `- Long Description: ${context.existingLongDescription}` : ''}

Core Story Elements:${
      context.primaryGenres
        ? `
- Genres: ${context.primaryGenres.join(', ')}`
        : ''
    }${
      context.corePremise
        ? `
- Core Premise: ${context.corePremise}`
        : ''
    }${
      context.targetAudience
        ? `
- Target Audience: ${context.targetAudience.join(', ')}`
        : ''
    }${
      context.tone
        ? `
- Tone: ${context.tone.join(', ')}`
        : ''
    }

Guidelines:
- Create a title that captures the essence and tone of the project
- Consider the movie format and style when crafting the title
- Make it memorable and marketable
- Keep it concise but impactful (typically 1-5 words for maximum impact)
- Ensure it fits the genre and style specified
- Avoid overly generic or cliché titles
${context.series ? `- Consider this is part of a series: ${context.series}` : ''}

Generate only the title as plain text, no markdown formatting, asterisks, quotes, or additional text or explanation.`

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ''
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating project title:', error)
    // Preserve the original error message for better error handling
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate project title')
  }
}

/**
 * Generate a short description using AI
 */
export async function generateShortDescription(context: ProjectContext): Promise<string> {
  try {
    const prompt = `You are a marketing content editor specializing in compelling movie descriptions for promotional materials. Your task is to create a concise, engaging short description that would work for movie posters, streaming platforms, and marketing materials.

Project Context:
- Project Name: ${context.projectName}
${context.existingTitle ? `- Title: ${context.existingTitle}` : ''}
- Movie Format: ${context.movieFormat}
- Movie Style: ${context.movieStyle}
${context.series ? `- Series: ${context.series}` : ''}
- Duration: ${context.durationUnit} minutes

${context.existingShortDescription ? `- Current Short Description: ${context.existingShortDescription}` : ''}
${context.existingLongDescription ? `- Long Description: ${context.existingLongDescription}` : ''}

Core Story Elements:${
      context.primaryGenres
        ? `
- Genres: ${context.primaryGenres.join(', ')}`
        : ''
    }${
      context.corePremise
        ? `
- Core Premise: ${context.corePremise}`
        : ''
    }${
      context.targetAudience
        ? `
- Target Audience: ${context.targetAudience.join(', ')}`
        : ''
    }${
      context.tone
        ? `
- Tone: ${context.tone.join(', ')}`
        : ''
    }

Guidelines:
- Write a compelling, concise description that captures the essence in 1-3 sentences
- Aim for the perfect length for movie posters and streaming platforms (roughly 50-120 words)
- Focus on the hook that would make audiences want to watch
- Include the genre/style elements naturally
- Make it suitable for marketing materials
- Create intrigue without spoiling key plot points
- Match the tone of the specified movie style
- End with impact - leave readers wanting more
${context.series ? `- Consider this is part of a series: ${context.series}` : ''}

Generate only the short description, no additional text or explanation.`

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ''
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating short description:', error)
    // Preserve the original error message for better error handling
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate short description')
  }
}

/**
 * Generate a long description using AI
 */
export async function generateLongDescription(context: ProjectContext): Promise<string> {
  try {
    const prompt = `You are an experienced movie screenwriter and story developer. Your task is to create a detailed, rich description that could serve as the foundation for a screenplay or detailed project synopsis.

Project Context:
- Project Name: ${context.projectName}
${context.existingTitle ? `- Title: ${context.existingTitle}` : ''}
- Movie Format: ${context.movieFormat}
- Movie Style: ${context.movieStyle}
${context.series ? `- Series: ${context.series}` : ''}
- Duration: ${context.durationUnit} minutes

${context.existingShortDescription ? `- Short Description: ${context.existingShortDescription}` : ''}
${context.existingLongDescription ? `- Current Long Description: ${context.existingLongDescription}` : ''}

Core Story Elements:${
      context.primaryGenres
        ? `
- Genres: ${context.primaryGenres.join(', ')}`
        : ''
    }${
      context.corePremise
        ? `
- Core Premise: ${context.corePremise}`
        : ''
    }${
      context.targetAudience
        ? `
- Target Audience: ${context.targetAudience.join(', ')}`
        : ''
    }${
      context.tone
        ? `
- Tone: ${context.tone.join(', ')}`
        : ''
    }

Guidelines:
- Create a rich, comprehensive description that serves as a strong foundation for screenplay development
- Aim for the depth of a professional treatment (typically 250-500 words, but let the story dictate length)
- Include character archetypes and motivations that feel authentic
- Outline the main story arc and conflict with emotional resonance
- Describe the setting and atmosphere in vivid, cinematic terms
- Include thematic elements that match the movie style and elevate the narrative
- Consider the runtime when planning story complexity - ${context.durationUnit} minutes allows for specific story depth
- Make it cinematically viable and engaging with strong visual potential
- Include emotional beats and character development arcs
- Create a narrative that feels complete yet leaves room for creative expansion
${context.series ? `- Consider how this fits within the broader series: ${context.series}` : ''}
${context.series ? '- Include elements that could connect to other episodes/installments while standing alone' : ''}

Structure the description thoughtfully with:
1. Setting and premise that draws readers in
2. Main characters with clear goals and compelling flaws
3. Central conflict or challenge that drives the narrative
4. Key story beats that build tension and resolution
5. Thematic elements that give the story deeper meaning
6. A satisfying conclusion that feels earned

Generate only the long description, no additional text or explanation.`

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MILLION_MODEL || 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ''
    return cleanAIResponse(result)
  } catch (error) {
    console.error('Error generating long description:', error)
    // Preserve the original error message for better error handling
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate long description')
  }
}

/**
 * Generate all missing project fields at once
 */
export async function generateAllProjectFields(context: ProjectContext): Promise<GeneratedFields> {
  try {
    const prompt = `You are a comprehensive movie development team including a creative writer, marketing content editor, and screenwriter. Generate all missing project fields for this movie project.

Project Context:
- Project Name: ${context.projectName}
- Movie Format: ${context.movieFormat}
- Movie Style: ${context.movieStyle}
${context.series ? `- Series: ${context.series}` : ''}
- Duration: ${context.durationUnit} minutes

Core Story Elements:${
      context.primaryGenres
        ? `
- Genres: ${context.primaryGenres.join(', ')}`
        : ''
    }${
      context.corePremise
        ? `
- Core Premise: ${context.corePremise}`
        : ''
    }${
      context.targetAudience
        ? `
- Target Audience: ${context.targetAudience.join(', ')}`
        : ''
    }${
      context.tone
        ? `
- Tone: ${context.tone.join(', ')}`
        : ''
    }

Existing Content:
${context.existingTitle ? `- Title: ${context.existingTitle}` : ''}
${context.existingShortDescription ? `- Short Description: ${context.existingShortDescription}` : ''}
${context.existingLongDescription ? `- Long Description: ${context.existingLongDescription}` : ''}

Generate the missing fields with these roles:
- Title: Creative writer creating memorable, marketable titles that reflect the core story elements
- Short Description: Marketing editor creating compelling 50-100 word promotional copy that incorporates the genres, premise, and tone
- Long Description: Screenwriter creating detailed 200-400 word story synopsis that builds upon the core premise and target audience

Ensure all generated content is cohesive and consistent with each other, the project parameters, and the core story elements provided.

Return the response in JSON format with the following structure:
{
  "projectTitle": "Generated title here (only if not provided)",
  "shortDescription": "Generated short description here (only if not provided)",
  "longDescription": "Generated long description here (only if not provided)"
}`

    const completion = await openrouter.chat.completions.create({
      model: process.env.OPENROUTER_MILLION_MODEL || 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const result = completion.choices[0]?.message?.content || ''

    try {
      const cleanedResult = cleanAIResponse(result)
      const parsed = JSON.parse(cleanedResult)
      return {
        projectTitle: parsed.projectTitle ? cleanAIResponse(parsed.projectTitle) : undefined,
        shortDescription: parsed.shortDescription
          ? cleanAIResponse(parsed.shortDescription)
          : undefined,
        longDescription: parsed.longDescription
          ? cleanAIResponse(parsed.longDescription)
          : undefined,
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      throw new Error('Failed to parse AI response')
    }
  } catch (error) {
    console.error('Error generating all project fields:', error)
    throw new Error('Failed to generate project fields')
  }
}

/**
 * Generate only the missing fields based on what's already provided
 */
export async function generateMissingFields(context: ProjectContext): Promise<GeneratedFields> {
  const missingFields: GeneratedFields = {}

  try {
    // Generate fields individually for better control and error handling
    const promises: Promise<void>[] = []

    if (!context.existingTitle) {
      promises.push(
        generateProjectTitle(context)
          .then((title) => {
            missingFields.projectTitle = title
          })
          .catch((error) => {
            // Re-throw credits errors to be handled at the API level
            if (error.message && error.message.includes('402 Insufficient credits')) {
              throw error
            }
            console.warn('Failed to generate title:', error)
          }),
      )
    }

    if (!context.existingShortDescription) {
      promises.push(
        generateShortDescription(context)
          .then((description) => {
            missingFields.shortDescription = description
          })
          .catch((error) => {
            // Re-throw credits errors to be handled at the API level
            if (error.message && error.message.includes('402 Insufficient credits')) {
              throw error
            }
            console.warn('Failed to generate short description:', error)
          }),
      )
    }

    if (!context.existingLongDescription) {
      promises.push(
        generateLongDescription(context)
          .then((description) => {
            missingFields.longDescription = description
          })
          .catch((error) => {
            // Re-throw credits errors to be handled at the API level
            if (error.message && error.message.includes('402 Insufficient credits')) {
              throw error
            }
            console.warn('Failed to generate long description:', error)
          }),
      )
    }

    // Wait for all generations to complete
    await Promise.all(promises)

    return missingFields
  } catch (error) {
    console.error('Error generating missing fields:', error)
    throw new Error('Failed to generate missing project fields')
  }
}

/**
 * Validate that required fields are present for AI generation
 */
export function validateRequiredFields(data: any): boolean {
  return !!(
    data.name &&
    data.movieFormat &&
    data.movieStyle &&
    data.durationUnit &&
    (data.movieFormat !== 'series' || data.series)
  )
}

/**
 * Create project context from form data
 */
export function createProjectContext(formData: any): ProjectContext {
  return {
    projectName: formData.name,
    movieFormat: formData.movieFormat,
    movieStyle: formData.movieStyle,
    series: formData.series || undefined,
    durationUnit: parseInt(formData.durationUnit) || 0,
    existingTitle: formData.projectTitle?.trim() || undefined,
    existingShortDescription: formData.shortDescription?.trim() || undefined,
    existingLongDescription: formData.longDescription?.trim() || undefined,
    // Section 2 - Core Story Elements
    primaryGenres:
      formData.primaryGenres && formData.primaryGenres.length > 0
        ? formData.primaryGenres
        : undefined,
    corePremise: formData.corePremise?.trim() || undefined,
    targetAudience:
      formData.targetAudience && formData.targetAudience.length > 0
        ? formData.targetAudience
        : undefined,
    tone: formData.tone && formData.tone.length > 0 ? formData.tone : undefined,
  }
}
