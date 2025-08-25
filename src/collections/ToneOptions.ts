import type { CollectionConfig } from 'payload'

export const ToneOptions: CollectionConfig = {
  slug: 'tone-options',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'intensity', 'isActive', 'sortOrder'],
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
        description: 'Tone name (e.g., "Serious", "Comedic", "Dramatic")',
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
        description: 'Description of this tone and its characteristics',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Emotional', value: 'emotional' },
        { label: 'Stylistic', value: 'stylistic' },
        { label: 'Narrative', value: 'narrative' },
        { label: 'Atmospheric', value: 'atmospheric' },
      ],
      admin: {
        description: 'Category of tone classification',
      },
    },
    {
      name: 'intensity',
      type: 'select',
      required: true,
      options: [
        { label: 'Subtle', value: 'subtle' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Strong', value: 'strong' },
        { label: 'Intense', value: 'intense' },
      ],
      admin: {
        description: 'Intensity level of this tone',
      },
    },
    {
      name: 'narrativeImpact',
      type: 'group',
      fields: [
        {
          name: 'dialogueStyle',
          type: 'textarea',
          admin: {
            description: 'How this tone affects dialogue and character speech',
          },
        },
        {
          name: 'pacingInfluence',
          type: 'textarea',
          admin: {
            description: 'How this tone affects story pacing and rhythm',
          },
        },
        {
          name: 'characterBehavior',
          type: 'textarea',
          admin: {
            description: 'How characters typically behave with this tone',
          },
        },
        {
          name: 'conflictStyle',
          type: 'textarea',
          admin: {
            description: 'How conflicts are presented and resolved',
          },
        },
      ],
    },
    {
      name: 'visualElements',
      type: 'group',
      fields: [
        {
          name: 'colorPalette',
          type: 'textarea',
          admin: {
            description: 'Typical color schemes associated with this tone',
          },
        },
        {
          name: 'lightingStyle',
          type: 'textarea',
          admin: {
            description: 'Lighting approaches that support this tone',
          },
        },
        {
          name: 'cameraWork',
          type: 'textarea',
          admin: {
            description: 'Camera techniques that enhance this tone',
          },
        },
        {
          name: 'editingStyle',
          type: 'textarea',
          admin: {
            description: 'Editing approaches that support this tone',
          },
        },
      ],
    },
    {
      name: 'audioElements',
      type: 'group',
      fields: [
        {
          name: 'musicStyle',
          type: 'textarea',
          admin: {
            description: 'Musical styles and approaches that support this tone',
          },
        },
        {
          name: 'soundDesign',
          type: 'textarea',
          admin: {
            description: 'Sound design elements that enhance this tone',
          },
        },
        {
          name: 'voiceDirection',
          type: 'textarea',
          admin: {
            description: 'Voice acting and delivery style for this tone',
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
        description: 'Genres that commonly use this tone',
      },
    },
    {
      name: 'audienceResponse',
      type: 'group',
      fields: [
        {
          name: 'emotionalEffect',
          type: 'textarea',
          admin: {
            description: 'How audiences typically respond emotionally to this tone',
          },
        },
        {
          name: 'engagementLevel',
          type: 'select',
          options: [
            { label: 'Passive', value: 'passive' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Active', value: 'active' },
            { label: 'Intense', value: 'intense' },
          ],
        },
        {
          name: 'demographicAppeal',
          type: 'relationship',
          relationTo: 'audience-demographics',
          hasMany: true,
          admin: {
            description: 'Demographics that typically respond well to this tone',
          },
        },
      ],
    },
    {
      name: 'examples',
      type: 'array',
      maxRows: 5,
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
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'How this example demonstrates the tone',
          },
        },
      ],
      admin: {
        description: 'Example films that exemplify this tone',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this tone is available for selection',
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
        description: 'Tags to help AI understand this tone for content generation',
      },
    },
  ],
}
