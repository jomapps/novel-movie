import type { CollectionConfig } from 'payload'

export const MoodDescriptors: CollectionConfig = {
  slug: 'mood-descriptors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'intensity', 'isActive', 'sortOrder'],
    group: 'Configuration',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => true || !user,
    update: ({ req: { user } }) => true,
    delete: ({ req: { user } }) => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Mood descriptor (e.g., "Optimistic", "Melancholic", "Tense")',
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
        description: 'Description of this mood and its emotional characteristics',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Negative', value: 'negative' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Complex', value: 'complex' },
      ],
    },
    {
      name: 'intensity',
      type: 'select',
      required: true,
      options: [
        { label: 'Subtle', value: 'subtle' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Strong', value: 'strong' },
        { label: 'Overwhelming', value: 'overwhelming' },
      ],
    },
    {
      name: 'emotionalImpact',
      type: 'textarea',
      admin: {
        description: 'How this mood affects audience emotional response',
      },
    },
    {
      name: 'visualElements',
      type: 'group',
      fields: [
        {
          name: 'colorAssociations',
          type: 'textarea',
          admin: {
            description: 'Colors that evoke this mood',
          },
        },
        {
          name: 'lightingStyle',
          type: 'textarea',
          admin: {
            description: 'Lighting techniques that create this mood',
          },
        },
        {
          name: 'compositionStyle',
          type: 'textarea',
          admin: {
            description: 'Visual composition approaches for this mood',
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
            description: 'Musical styles that support this mood',
          },
        },
        {
          name: 'soundDesign',
          type: 'textarea',
          admin: {
            description: 'Sound design elements that enhance this mood',
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
        description: 'Genres that commonly use this mood',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
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
    },
  ],
}
