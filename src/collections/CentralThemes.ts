import type { CollectionConfig } from 'payload'

export const CentralThemes: CollectionConfig = {
  slug: 'central-themes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'universality', 'isActive', 'sortOrder'],
    group: 'Configuration',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || !user,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Theme name (e.g., "Love", "Redemption", "Coming of Age")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of this theme and its significance',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Human Relationships', value: 'relationships' },
        { label: 'Personal Growth', value: 'growth' },
        { label: 'Social Issues', value: 'social' },
        { label: 'Moral/Ethical', value: 'moral' },
        { label: 'Existential', value: 'existential' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Universal Human Experience', value: 'universal' },
      ],
      admin: {
        description: 'Category of thematic content',
      },
    },
    {
      name: 'universality',
      type: 'select',
      required: true,
      options: [
        { label: 'Universal - All Cultures/Ages', value: 'universal' },
        { label: 'Broad - Most Cultures/Ages', value: 'broad' },
        { label: 'Specific - Certain Demographics', value: 'specific' },
        { label: 'Niche - Limited Appeal', value: 'niche' },
      ],
      admin: {
        description: 'How universally this theme resonates across audiences',
      },
    },
    {
      name: 'thematicElements',
      type: 'group',
      fields: [
        {
          name: 'coreQuestions',
          type: 'array',
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Central questions this theme explores',
          },
        },
        {
          name: 'commonConflicts',
          type: 'textarea',
          admin: {
            description: 'Types of conflicts that arise from this theme',
          },
        },
        {
          name: 'characterArcs',
          type: 'textarea',
          admin: {
            description: 'How characters typically develop when exploring this theme',
          },
        },
        {
          name: 'resolutionPatterns',
          type: 'textarea',
          admin: {
            description: 'Common ways stories resolve this thematic conflict',
          },
        },
      ],
    },
    {
      name: 'narrativeImpact',
      type: 'group',
      fields: [
        {
          name: 'plotInfluence',
          type: 'textarea',
          admin: {
            description: 'How this theme typically influences plot structure',
          },
        },
        {
          name: 'characterDevelopment',
          type: 'textarea',
          admin: {
            description: 'How this theme drives character growth and change',
          },
        },
        {
          name: 'dialogueStyle',
          type: 'textarea',
          admin: {
            description: 'How this theme influences character dialogue and interactions',
          },
        },
        {
          name: 'symbolism',
          type: 'textarea',
          admin: {
            description: 'Common symbols and metaphors associated with this theme',
          },
        },
      ],
    },
    {
      name: 'genreCompatibility',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      admin: {
        description: 'Genres that commonly explore this theme',
      },
    },
    {
      name: 'audienceResonance',
      type: 'group',
      fields: [
        {
          name: 'emotionalImpact',
          type: 'textarea',
          admin: {
            description: 'How audiences typically respond emotionally to this theme',
          },
        },
        {
          name: 'targetDemographics',
          type: 'relationship',
          relationTo: 'audience-demographics',
          hasMany: true,
          admin: {
            description: 'Demographics that particularly connect with this theme',
          },
        },
        {
          name: 'culturalConsiderations',
          type: 'textarea',
          admin: {
            description: 'Cultural factors that influence how this theme is received',
          },
        },
      ],
    },
    {
      name: 'visualRepresentation',
      type: 'group',
      fields: [
        {
          name: 'colorAssociations',
          type: 'textarea',
          admin: {
            description: 'Colors commonly associated with this theme',
          },
        },
        {
          name: 'visualMotifs',
          type: 'textarea',
          admin: {
            description: 'Visual elements and motifs that represent this theme',
          },
        },
        {
          name: 'settingInfluence',
          type: 'textarea',
          admin: {
            description: 'How this theme influences location and setting choices',
          },
        },
      ],
    },
    {
      name: 'examples',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          type: 'number',
          min: 1900,
          max: new Date().getFullYear() + 5,
        },
        {
          name: 'genre',
          type: 'relationship',
          relationTo: 'genres',
        },
        {
          name: 'thematicTreatment',
          type: 'textarea',
          admin: {
            description: 'How this example explores the theme',
          },
        },
      ],
      admin: {
        description: 'Example films that explore this theme effectively',
      },
    },
    {
      name: 'relatedThemes',
      type: 'relationship',
      relationTo: 'central-themes',
      hasMany: true,
      admin: {
        description: 'Other themes commonly paired with this one',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this theme is available for selection',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'aiGenerationTags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags to help AI understand this theme for content generation',
      },
    },
  ],
}
