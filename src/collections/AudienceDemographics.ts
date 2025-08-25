import type { CollectionConfig } from 'payload'

export const AudienceDemographics: CollectionConfig = {
  slug: 'audience-demographics',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'ageRange', 'isActive', 'sortOrder'],
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
        description: 'Demographic group name (e.g., "Young Adults", "Families with Children")',
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
        description: 'Description of this demographic group and their characteristics',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Age Group', value: 'age' },
        { label: 'Geographic', value: 'geographic' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Socioeconomic', value: 'socioeconomic' },
        { label: 'Lifestyle', value: 'lifestyle' },
      ],
      admin: {
        description: 'Type of demographic classification',
      },
    },
    {
      name: 'ageRange',
      type: 'group',
      admin: {
        condition: (data) => data?.category === 'age',
      },
      fields: [
        {
          name: 'minAge',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'maxAge',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'ratingGuideline',
          type: 'select',
          options: [
            { label: 'G - General Audiences', value: 'G' },
            { label: 'PG - Parental Guidance', value: 'PG' },
            { label: 'PG-13 - Parents Strongly Cautioned', value: 'PG-13' },
            { label: 'R - Restricted', value: 'R' },
            { label: 'NC-17 - Adults Only', value: 'NC-17' },
          ],
        },
      ],
    },
    {
      name: 'characteristics',
      type: 'group',
      fields: [
        {
          name: 'interests',
          type: 'textarea',
          admin: {
            description: 'Common interests and hobbies of this demographic',
          },
        },
        {
          name: 'mediaConsumption',
          type: 'textarea',
          admin: {
            description: 'How this demographic typically consumes media',
          },
        },
        {
          name: 'values',
          type: 'textarea',
          admin: {
            description: 'Core values and beliefs important to this group',
          },
        },
        {
          name: 'lifestyle',
          type: 'textarea',
          admin: {
            description: 'Lifestyle patterns and behaviors',
          },
        },
      ],
    },
    {
      name: 'contentPreferences',
      type: 'group',
      fields: [
        {
          name: 'preferredGenres',
          type: 'relationship',
          relationTo: 'genres',
          hasMany: true,
          admin: {
            description: 'Genres that typically appeal to this demographic',
          },
        },
        {
          name: 'contentComplexity',
          type: 'select',
          options: [
            { label: 'Simple/Straightforward', value: 'simple' },
            { label: 'Moderate Complexity', value: 'moderate' },
            { label: 'Complex/Sophisticated', value: 'complex' },
            { label: 'Variable', value: 'variable' },
          ],
        },
        {
          name: 'attentionSpan',
          type: 'select',
          options: [
            { label: 'Short (5-15 minutes)', value: 'short' },
            { label: 'Medium (15-45 minutes)', value: 'medium' },
            { label: 'Long (45+ minutes)', value: 'long' },
            { label: 'Variable', value: 'variable' },
          ],
        },
        {
          name: 'emotionalPreferences',
          type: 'textarea',
          admin: {
            description: 'Types of emotional content this demographic responds to',
          },
        },
      ],
    },
    {
      name: 'marketingConsiderations',
      type: 'group',
      fields: [
        {
          name: 'primaryChannels',
          type: 'textarea',
          admin: {
            description: 'Best marketing channels to reach this demographic',
          },
        },
        {
          name: 'messagingTone',
          type: 'textarea',
          admin: {
            description: 'Effective messaging tone and approach',
          },
        },
        {
          name: 'influencers',
          type: 'textarea',
          admin: {
            description: 'Key influencers or opinion leaders for this group',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this demographic is available for selection',
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
        description: 'Tags to help AI understand this demographic for content generation',
      },
    },
  ],
}
