import type { CollectionConfig } from 'payload'

export const Genres: CollectionConfig = {
  slug: 'genres',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'isActive', 'sortOrder'],
    group: 'Configuration',
  },
  access: {
    read: () => true,
    create: () => true, // Allow during seeding
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Genre name (e.g., "Action", "Drama", "Comedy")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
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
        description: 'Brief description of the genre and its characteristics',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Primary Genre', value: 'primary' },
        { label: 'Sub-Genre', value: 'sub' },
        { label: 'Hybrid Genre', value: 'hybrid' },
      ],
      admin: {
        description: 'Classification of genre type',
      },
    },
    {
      name: 'parentGenre',
      type: 'relationship',
      relationTo: 'genres',
      admin: {
        description: 'Parent genre for sub-genres',
        condition: (data) => data?.category === 'sub',
      },
    },
    {
      name: 'narrativeElements',
      type: 'group',
      fields: [
        {
          name: 'typicalStructure',
          type: 'textarea',
          admin: {
            description: 'Common narrative structure for this genre',
          },
        },
        {
          name: 'characterArchetypes',
          type: 'textarea',
          admin: {
            description: 'Typical character types found in this genre',
          },
        },
        {
          name: 'commonThemes',
          type: 'textarea',
          admin: {
            description: 'Themes commonly explored in this genre',
          },
        },
        {
          name: 'visualStyle',
          type: 'textarea',
          admin: {
            description: 'Visual and cinematographic conventions',
          },
        },
      ],
    },
    {
      name: 'audienceAppeal',
      type: 'group',
      fields: [
        {
          name: 'primaryDemographics',
          type: 'textarea',
          admin: {
            description: 'Main audience demographics for this genre',
          },
        },
        {
          name: 'emotionalAppeal',
          type: 'textarea',
          admin: {
            description: 'What emotions this genre typically evokes',
          },
        },
      ],
    },
    {
      name: 'productionConsiderations',
      type: 'group',
      fields: [
        {
          name: 'budgetRange',
          type: 'select',
          options: [
            { label: 'Low Budget Friendly', value: 'low' },
            { label: 'Medium Budget', value: 'medium' },
            { label: 'High Budget Required', value: 'high' },
            { label: 'Variable', value: 'variable' },
          ],
          admin: {
            description: 'Typical budget requirements for this genre',
          },
        },
        {
          name: 'technicalRequirements',
          type: 'textarea',
          admin: {
            description: 'Special technical or production requirements',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this genre is available for selection',
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
        description: 'Tags to help AI understand this genre for content generation',
      },
    },
  ],
}
