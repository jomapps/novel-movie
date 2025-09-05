import type { CollectionConfig } from 'payload'

export const CinematographyStyles: CollectionConfig = {
  slug: 'cinematography-styles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'complexity', 'isActive', 'sortOrder'],
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
        description: 'Cinematography style name (e.g., "Realistic", "Stylized", "Documentary")',
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
        description: 'Description of this cinematography style and its characteristics',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Realistic', value: 'realistic' },
        { label: 'Stylized', value: 'stylized' },
        { label: 'Experimental', value: 'experimental' },
        { label: 'Documentary', value: 'documentary' },
        { label: 'Artistic', value: 'artistic' },
      ],
    },
    {
      name: 'complexity',
      type: 'select',
      required: true,
      options: [
        { label: 'Simple', value: 'simple' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Complex', value: 'complex' },
        { label: 'Highly Complex', value: 'highly-complex' },
      ],
    },
    {
      name: 'technicalElements',
      type: 'group',
      fields: [
        {
          name: 'cameraMovement',
          type: 'textarea',
          admin: {
            description: 'Typical camera movement patterns for this style',
          },
        },
        {
          name: 'framingApproach',
          type: 'textarea',
          admin: {
            description: 'How shots are typically framed and composed',
          },
        },
        {
          name: 'lensChoices',
          type: 'textarea',
          admin: {
            description: 'Common lens selections and focal lengths',
          },
        },
        {
          name: 'colorGrading',
          type: 'textarea',
          admin: {
            description: 'Color grading and post-production approaches',
          },
        },
      ],
    },
    {
      name: 'visualCharacteristics',
      type: 'group',
      fields: [
        {
          name: 'lightingStyle',
          type: 'textarea',
          admin: {
            description: 'Lighting approaches typical of this style',
          },
        },
        {
          name: 'depthOfField',
          type: 'textarea',
          admin: {
            description: 'How depth of field is typically used',
          },
        },
        {
          name: 'visualTexture',
          type: 'textarea',
          admin: {
            description: 'Overall visual texture and feel',
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
        description: 'Genres that commonly use this cinematography style',
      },
    },
    {
      name: 'productionConsiderations',
      type: 'group',
      fields: [
        {
          name: 'budgetRequirements',
          type: 'select',
          options: [
            { label: 'Low Budget Friendly', value: 'low' },
            { label: 'Medium Budget', value: 'medium' },
            { label: 'High Budget Required', value: 'high' },
            { label: 'Variable', value: 'variable' },
          ],
        },
        {
          name: 'equipmentNeeds',
          type: 'textarea',
          admin: {
            description: 'Special equipment or technical requirements',
          },
        },
        {
          name: 'skillRequirements',
          type: 'textarea',
          admin: {
            description: 'Technical skills and expertise needed',
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
            description: 'How this example demonstrates the cinematography style',
          },
        },
      ],
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
