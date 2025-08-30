import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Utility for handling relationship fields in AI generation
 * Provides functions to select existing items or create new ones for relationship fields
 */

export interface RelationshipFieldConfig {
  collection: string
  searchFields: string[]
  createFields: Record<string, any>
  maxItems?: number
}

/**
 * Configuration for all relationship fields in Project collections
 */
export const RELATIONSHIP_FIELD_CONFIGS: Record<string, RelationshipFieldConfig> = {
  primaryGenres: {
    collection: 'genres',
    searchFields: ['name', 'slug'],
    createFields: {
      category: 'primary',
      isActive: true,
    },
    maxItems: 3,
  },
  targetAudience: {
    collection: 'audience-demographics',
    searchFields: ['name', 'slug'],
    createFields: {
      category: 'age',
      isActive: true,
    },
  },
  tone: {
    collection: 'tone-options',
    searchFields: ['name', 'slug'],
    createFields: {
      category: 'atmospheric',
      intensity: 'moderate',
      description: 'AI-generated tone option',
      isActive: true,
    },
  },
}

/**
 * Find existing items in a collection by name or create new ones
 */
export async function findOrCreateRelationshipItems(
  itemNames: string[],
  fieldConfig: RelationshipFieldConfig,
): Promise<string[]> {
  const payload = await getPayload({ config })
  const foundIds: string[] = []

  for (const itemName of itemNames) {
    // First, try to find existing item
    const searchQuery = fieldConfig.searchFields.map((field) => ({
      [field]: { contains: itemName.trim() },
    }))

    const existingItems = await payload.find({
      collection: fieldConfig.collection as any,
      where: {
        or: searchQuery,
      },
      limit: 1,
    })

    if (existingItems.totalDocs > 0) {
      foundIds.push(String(existingItems.docs[0].id))
    } else {
      // Create new item if not found
      try {
        const newItem = await payload.create({
          collection: fieldConfig.collection as any,
          data: {
            name: itemName.trim(),
            slug: itemName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
            description: `AI-generated ${fieldConfig.collection.replace('-', ' ')} for: ${itemName}`,
            ...fieldConfig.createFields,
          },
        })
        foundIds.push(String(newItem.id))
        console.log(`Created new ${fieldConfig.collection} item: ${itemName}`)
      } catch (error) {
        console.error(`Failed to create ${fieldConfig.collection} item "${itemName}":`, error)
        // Continue with other items even if one fails
      }
    }
  }

  // Respect maxItems limit if specified
  if (fieldConfig.maxItems && foundIds.length > fieldConfig.maxItems) {
    return foundIds.slice(0, fieldConfig.maxItems)
  }

  return foundIds
}

/**
 * Generate and populate a relationship field using AI
 */
export async function generateRelationshipField(
  fieldPath: string,
  context: any,
  aiGeneratorFunction: (context: any) => Promise<string[]>,
): Promise<string[]> {
  const config = RELATIONSHIP_FIELD_CONFIGS[fieldPath]
  if (!config) {
    throw new Error(`No configuration found for relationship field: ${fieldPath}`)
  }

  try {
    // Use AI to generate the item names
    const generatedNames = await aiGeneratorFunction(context)

    // Find or create the relationship items
    const relationshipIds = await findOrCreateRelationshipItems(generatedNames, config)

    return relationshipIds
  } catch (error) {
    console.error(`Failed to generate relationship field ${fieldPath}:`, error)
    throw error
  }
}

/**
 * AI generator functions for each relationship field
 */

export async function generatePrimaryGenres(context: any): Promise<string[]> {
  // For now, use intelligent defaults based on common combinations
  // This will be enhanced with proper AI generation in the future
  const genreCombinations = [
    ['Drama', 'Thriller', 'Mystery'],
    ['Action', 'Adventure', 'Thriller'],
    ['Romance', 'Comedy', 'Drama'],
    ['Sci-Fi', 'Thriller', 'Action'],
    ['Horror', 'Thriller', 'Mystery'],
    ['Fantasy', 'Adventure', 'Drama'],
    ['Crime', 'Drama', 'Thriller'],
    ['Comedy', 'Romance', 'Family'],
  ]

  // Select a random combination for now
  const selectedCombination =
    genreCombinations[Math.floor(Math.random() * genreCombinations.length)]
  return selectedCombination
}

export async function generateTargetDemographics(context: any): Promise<string[]> {
  // Generate demographics based on genre context
  const demographicOptions = [
    'Young Adults (18-24)',
    'Adults (25-34)',
    'Adults (35-44)',
    'Teens (13-17)',
    'Families with Children',
    'Mature Adults (45+)',
  ]

  // Select 2-3 demographics
  const shuffled = demographicOptions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2))
}

export async function generateTones(context: any): Promise<string[]> {
  // Generate tones based on genre
  const toneOptions = [
    'Dramatic',
    'Suspenseful',
    'Comedic',
    'Romantic',
    'Dark',
    'Uplifting',
    'Mysterious',
    'Intense',
    'Lighthearted',
    'Serious',
  ]

  // Select 2-3 tones
  const shuffled = toneOptions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2))
}

export async function generateMoods(context: any): Promise<string[]> {
  // Generate moods based on context
  const moodOptions = [
    'Tense',
    'Emotional',
    'Mysterious',
    'Hopeful',
    'Melancholic',
    'Energetic',
    'Contemplative',
    'Exciting',
    'Intimate',
    'Epic',
  ]

  // Select 2-3 moods deterministically based on context
  const projectLength = context.projectName?.length || 5
  const baseIndex = projectLength % moodOptions.length
  const count = 2 + (projectLength % 2) // Always 2 or 3 moods

  const selectedMoods = []
  for (let i = 0; i < count; i++) {
    const index = (baseIndex + i * 3) % moodOptions.length
    selectedMoods.push(moodOptions[index])
  }

  return selectedMoods
}

export async function generateCinematographyStyle(context: any): Promise<string[]> {
  // Generate cinematography style using seeded data (6 styles)
  const styleOptions = [
    'Realistic', // Natural, lifelike cinematography
    'Stylized', // Deliberately artificial cinematography
    'Documentary', // Observational cinematography
    'Experimental', // Avant-garde cinematography
    'Vintage', // Period-appropriate cinematography
    'Modern', // Contemporary cinematography
  ]

  // Select one style based on project context for consistency
  const index = (context.projectName.length + context.durationUnit) % styleOptions.length
  const selectedStyle = styleOptions[index]
  return [selectedStyle]
}

export async function generateCentralThemes(context: any): Promise<string[]> {
  // Generate central themes
  const themeOptions = [
    'Love',
    'Redemption',
    'Justice',
    'Family',
    'Friendship',
    'Betrayal',
    'Coming of Age',
    'Good vs Evil',
    'Sacrifice',
    'Identity',
    'Power',
    'Survival',
  ]

  // Select 2-4 themes
  const shuffled = themeOptions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 3))
}
