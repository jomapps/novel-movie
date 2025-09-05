import { getPayload } from 'payload'
import config from '@payload-config'

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

export interface CoreElementsContext {
  projectName: string
  movieFormat: string
  movieStyle: string
  series?: string
  durationUnit: number
  currentValues: {
    primaryGenres: string[]
    corePremise: string
    targetAudience: string[]
    tone: string[]
    mood: string[]
  }
}

export interface GeneratedCoreElements {
  primaryGenres?: string[]
  corePremise?: string
  targetAudience?: string[]
  tone?: string[]
  mood?: string[]
}

/**
 * Generate core story elements using BAML
 */
export async function generateCoreStoryElements(
  context: CoreElementsContext,
): Promise<GeneratedCoreElements> {
  const generatedFields: GeneratedCoreElements = {}

  try {
    const b = await getBamlClient()

    // Generate Primary Genres if not provided or empty
    if (!context.currentValues.primaryGenres || context.currentValues.primaryGenres.length === 0) {
      try {
        const genresResult = await b.GeneratePrimaryGenres(
          context.projectName,
          context.movieFormat,
          context.movieStyle,
          context.series || null,
          context.durationUnit,
          null, // existingGenres
        )

        if (genresResult && Array.isArray(genresResult) && genresResult.length > 0) {
          // Convert genre names to IDs by finding them in the database
          const genreIds = await convertGenreNamesToIds(genresResult)
          if (genreIds.length > 0) {
            generatedFields.primaryGenres = genreIds
          }
        }
      } catch (error) {
        console.warn('Failed to generate primary genres:', error)
        // Continue with other fields even if this one fails
      }
    }

    // Generate Core Premise if not provided or empty
    if (!context.currentValues.corePremise || context.currentValues.corePremise.trim() === '') {
      try {
        const premiseResult = await b.GenerateSimpleCorePremise(
          context.projectName,
          context.movieFormat,
          context.movieStyle,
          context.series || null,
          context.durationUnit,
          generatedFields.primaryGenres || context.currentValues.primaryGenres || [],
          null, // existingPremise
        )

        if (premiseResult && premiseResult.trim()) {
          // Clean the premise response to remove formatting and extra text
          const cleanedPremise = cleanCorePremiseResponse(premiseResult)
          if (cleanedPremise) {
            generatedFields.corePremise = cleanedPremise
          }
        }
      } catch (error) {
        console.warn('Failed to generate core premise:', error)
        // Continue with other fields even if this one fails
      }
    }

    // Generate Target Audience if not provided or empty
    if (
      !context.currentValues.targetAudience ||
      context.currentValues.targetAudience.length === 0
    ) {
      try {
        const audienceResult = await b.GenerateTargetAudience(
          context.projectName,
          generatedFields.primaryGenres || context.currentValues.primaryGenres || [],
          generatedFields.corePremise || context.currentValues.corePremise || '',
          context.movieFormat,
          context.durationUnit,
          null, // existingAudience
        )

        if (audienceResult && Array.isArray(audienceResult) && audienceResult.length > 0) {
          // Convert audience names to IDs by finding them in the database
          const audienceIds = await convertAudienceNamesToIds(audienceResult)
          if (audienceIds.length > 0) {
            generatedFields.targetAudience = audienceIds
          }
        }
      } catch (error) {
        console.warn('Failed to generate target audience:', error)
        // Continue with other fields even if this one fails
      }
    }

    // Generate Tone if not provided or empty
    if (!context.currentValues.tone || context.currentValues.tone.length === 0) {
      try {
        // Convert target audience IDs to names for BAML function
        const targetAudienceNames = await convertAudienceIdsToNames(
          generatedFields.targetAudience || context.currentValues.targetAudience || [],
        )

        const toneResult = await b.GenerateTone(
          context.projectName,
          generatedFields.primaryGenres || context.currentValues.primaryGenres || [],
          generatedFields.corePremise || context.currentValues.corePremise || '',
          targetAudienceNames,
          context.movieStyle,
          null, // existingTone
        )

        if (toneResult && Array.isArray(toneResult) && toneResult.length > 0) {
          // Convert tone names to IDs by finding them in the database
          const toneIds = await convertToneNamesToIds(toneResult)
          if (toneIds.length > 0) {
            generatedFields.tone = toneIds
          }
        }
      } catch (error) {
        console.warn('Failed to generate tone:', error)
        // Continue with other fields even if this one fails
      }
    }

    // Generate Mood if not provided or empty
    if (!context.currentValues.mood || context.currentValues.mood.length === 0) {
      try {
        // Convert target audience IDs to names for BAML function
        const targetAudienceNames = await convertAudienceIdsToNames(
          generatedFields.targetAudience || context.currentValues.targetAudience || [],
        )

        // Convert tone IDs to names for BAML function
        const toneNames = await convertToneIdsToNames(
          generatedFields.tone || context.currentValues.tone || [],
        )

        const moodResult = await b.GenerateMood(
          context.projectName,
          generatedFields.primaryGenres || context.currentValues.primaryGenres || [],
          generatedFields.corePremise || context.currentValues.corePremise || '',
          targetAudienceNames,
          context.movieStyle,
          toneNames, // Pass selected tones for context
          null, // existingMood
        )

        if (moodResult && Array.isArray(moodResult) && moodResult.length > 0) {
          // Convert mood names to IDs by finding them in the database
          const moodIds = await convertMoodNamesToIds(moodResult)
          if (moodIds.length > 0) {
            generatedFields.mood = moodIds
          }
        }
      } catch (error) {
        console.warn('Failed to generate mood:', error)
        // Continue with other fields even if this one fails
      }
    }

    return generatedFields
  } catch (error) {
    console.error('Error generating core story elements:', error)

    // Re-throw credits errors to be handled at the API level
    if (error instanceof Error && error.message.includes('402 Insufficient credits')) {
      throw error
    }

    // Re-throw BAML/AI service errors
    if (
      error instanceof Error &&
      (error.message.includes('BAML') || error.message.includes('AI service'))
    ) {
      throw new Error(`Failed to generate core story elements: ${error.message}`)
    }

    throw new Error('Failed to generate core story elements')
  }
}

/**
 * Clean core premise response by removing formatting and extracting clean text
 */
function cleanCorePremiseResponse(response: string): string {
  // Remove markdown formatting, headers, and extra text
  const cleaned = response
    .replace(/\*\*.*?\*\*/g, '') // Remove bold text
    .replace(/^#+\s*/gm, '') // Remove markdown headers
    .replace(/^---+$/gm, '') // Remove horizontal rules
    .replace(/^Excellent\.\s*Let's.*$/gm, '') // Remove intro text
    .replace(/^Here is.*$/gm, '') // Remove "Here is..." text
    .replace(/^\*\*Project.*?\*\*$/gm, '') // Remove project headers
    .replace(/^Project.*?:.*$/gm, '') // Remove project labels
    .replace(/^\s*\n/gm, '') // Remove empty lines
    .trim()

  // Extract the actual premise content (usually the longest meaningful sentence)
  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 20)
  if (sentences.length > 0) {
    // Take the longest sentence as the premise
    const premise = sentences.reduce((a, b) => (a.length > b.length ? a : b)).trim()
    return premise.endsWith('.') ? premise : premise + '.'
  }

  return cleaned
}

/**
 * Convert genre names to IDs by finding them in the database
 */
async function convertGenreNamesToIds(genreNames: string[]): Promise<string[]> {
  try {
    const payload = await getPayload({ config })

    const genres = await payload.find({
      collection: 'genres',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })

    const genreIds: string[] = []

    for (const genreName of genreNames) {
      const genre = genres.docs.find(
        (g: any) =>
          g.name.toLowerCase() === genreName.toLowerCase() ||
          g.slug === genreName.toLowerCase().replace(/\s+/g, '-'),
      )
      if (genre) {
        genreIds.push(genre.id)
      }
    }

    return genreIds
  } catch (error) {
    console.error('Error converting genre names to IDs:', error)
  }

  return []
}

/**
 * Convert audience names to IDs by finding them in the database or creating new ones
 */
async function convertAudienceNamesToIds(audienceNames: string[]): Promise<string[]> {
  try {
    const payload = await getPayload({ config })

    const audiences = await payload.find({
      collection: 'audience-demographics',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })

    const audienceIds: string[] = []

    for (const audienceName of audienceNames) {
      // First, try to find existing audience
      const existingAudience = audiences.docs.find(
        (a: any) =>
          a.name.toLowerCase() === audienceName.toLowerCase() ||
          a.slug === audienceName.toLowerCase().replace(/\s+/g, '-'),
      )

      if (existingAudience) {
        audienceIds.push(existingAudience.id)
      } else {
        // Create new audience record if not found
        try {
          const newAudience = await payload.create({
            collection: 'audience-demographics',
            data: {
              name: audienceName,
              slug: audienceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              description: `AI-generated audience demographic: ${audienceName}`,
              category: 'age', // Use 'age' category since most AI-generated audiences are age-based
              isActive: true,
              sortOrder: 999, // Place AI-generated items at the end
              aiGenerationTags: [{ tag: 'ai-generated' }],
            },
          })
          audienceIds.push(newAudience.id)
          console.log(`Created new audience demographic: ${audienceName}`)
        } catch (createError) {
          console.error(`Failed to create audience demographic "${audienceName}":`, createError)
          // Continue with other audiences even if one fails
        }
      }
    }

    return audienceIds
  } catch (error) {
    console.error('Error converting audience names to IDs:', error)
  }

  return []
}

/**
 * Convert tone names to IDs by finding them in the database or creating new ones
 */
async function convertToneNamesToIds(toneNames: string[]): Promise<string[]> {
  try {
    const payload = await getPayload({ config })

    const tones = await payload.find({
      collection: 'tone-options',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })

    const toneIds: string[] = []

    for (const toneName of toneNames) {
      // First, try to find existing tone
      const existingTone = tones.docs.find(
        (t: any) =>
          t.name.toLowerCase() === toneName.toLowerCase() ||
          t.slug === toneName.toLowerCase().replace(/\s+/g, '-'),
      )

      if (existingTone) {
        toneIds.push(existingTone.id)
      } else {
        // Create new tone record if not found
        try {
          const newTone = await payload.create({
            collection: 'tone-options',
            data: {
              name: toneName,
              slug: toneName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              description: `AI-generated tone option: ${toneName}`,
              category: 'atmospheric', // Default category for AI-generated tones
              intensity: 'moderate', // Default intensity
              isActive: true,
              sortOrder: 999, // Place AI-generated items at the end
              aiGenerationTags: [{ tag: 'ai-generated' }],
            },
          })
          toneIds.push(newTone.id)
          console.log(`Created new tone option: ${toneName}`)
        } catch (createError) {
          console.error(`Failed to create tone option "${toneName}":`, createError)
          // Continue with other tones even if one fails
        }
      }
    }

    return toneIds
  } catch (error) {
    console.error('Error converting tone names to IDs:', error)
  }

  return []
}

/**
 * Convert mood names to IDs by finding them in the database or creating new ones
 */
async function convertMoodNamesToIds(moodNames: string[]): Promise<string[]> {
  try {
    const payload = await getPayload({ config })

    const moods = await payload.find({
      collection: 'mood-descriptors',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })

    const moodIds: string[] = []

    for (const moodName of moodNames) {
      // First, try to find existing mood
      const existingMood = moods.docs.find(
        (m: any) =>
          m.name.toLowerCase() === moodName.toLowerCase() ||
          m.slug === moodName.toLowerCase().replace(/\s+/g, '-'),
      )

      if (existingMood) {
        moodIds.push(existingMood.id)
      } else {
        // Create new mood record if not found
        try {
          const newMood = await payload.create({
            collection: 'mood-descriptors',
            data: {
              name: moodName,
              slug: moodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              description: `AI-generated mood descriptor: ${moodName}`,
              category: 'neutral', // Default category for AI-generated moods
              intensity: 'moderate', // Default intensity
              isActive: true,
              sortOrder: 999, // Place AI-generated items at the end
              aiGenerationTags: [{ tag: 'ai-generated' }],
            },
          })
          moodIds.push(newMood.id)
          console.log(`Created new mood descriptor: ${moodName}`)
        } catch (createError) {
          console.error(`Failed to create mood descriptor "${moodName}":`, createError)
          // Continue with other moods even if one fails
        }
      }
    }

    return moodIds
  } catch (error) {
    console.error('Error converting mood names to IDs:', error)
  }

  return []
}

/**
 * Convert audience IDs to names for BAML functions
 */
async function convertAudienceIdsToNames(audienceIds: string[]): Promise<string[]> {
  if (!audienceIds || audienceIds.length === 0) {
    return []
  }

  try {
    const payload = await getPayload({ config })

    const audiences = await payload.find({
      collection: 'audience-demographics',
      where: {
        id: { in: audienceIds },
        isActive: { equals: true },
      },
      limit: 100,
    })

    return audiences.docs.map((audience: any) => audience.name)
  } catch (error) {
    console.error('Error converting audience IDs to names:', error)
    return []
  }
}

/**
 * Convert tone IDs to names for BAML functions
 */
async function convertToneIdsToNames(toneIds: string[]): Promise<string[]> {
  if (!toneIds || toneIds.length === 0) {
    return []
  }

  try {
    const payload = await getPayload({ config })

    const tones = await payload.find({
      collection: 'tone-options',
      where: {
        id: { in: toneIds },
        isActive: { equals: true },
      },
      limit: 100,
    })

    return tones.docs.map((tone: any) => tone.name)
  } catch (error) {
    console.error('Error converting tone IDs to names:', error)
    return []
  }
}
