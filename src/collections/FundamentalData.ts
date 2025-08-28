import type { CollectionConfig } from 'payload'

export const FundamentalData: CollectionConfig = {
  slug: 'fundamental-data',
  labels: {
    singular: 'Fundamental Data',
    plural: 'Fundamental Data',
  },
  admin: {
    useAsTitle: 'projectName',
    description: 'Extended story development data including themes, characters, settings, and references',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // Project Reference
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      unique: true,
      admin: {
        description: 'The project this fundamental data belongs to',
      },
    },
    {
      name: 'projectName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-populated from project name',
      },
    },

    // Visual Style Direction
    {
      name: 'visualStyle',
      type: 'group',
      fields: [
        {
          name: 'cinematographyStyle',
          type: 'relationship',
          relationTo: 'cinematography-styles',
          required: false,
          admin: {
            description: 'Overall visual approach',
          },
        },
        {
          name: 'colorPalette',
          type: 'group',
          fields: [
            {
              name: 'dominance',
              type: 'select',
              required: false,
              options: [
                { label: 'Warm Dominant', value: 'warm' },
                { label: 'Cool Dominant', value: 'cool' },
                { label: 'Balanced', value: 'balanced' },
                { label: 'Monochromatic', value: 'monochromatic' },
              ],
            },
            {
              name: 'saturation',
              type: 'select',
              required: false,
              options: [
                { label: 'High Saturation', value: 'high' },
                { label: 'Medium Saturation', value: 'medium' },
                { label: 'Low Saturation', value: 'low' },
                { label: 'Desaturated', value: 'desaturated' },
              ],
            },
            {
              name: 'symbolicColors',
              type: 'textarea',
              admin: {
                description: 'Specific colors and their symbolic meaning in the story',
              },
            },
          ],
        },
        {
          name: 'lightingPreferences',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Lighting approach and mood',
          },
        },
        {
          name: 'cameraMovement',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Camera movement and framing style',
          },
        },
      ],
    },

    // Reference Materials
    {
      name: 'references',
      type: 'group',
      fields: [
        {
          name: 'inspirationalMovies',
          type: 'array',
          maxRows: 5,
          fields: [
            {
              name: 'title',
              type: 'text',
              required: false,
            },
            {
              name: 'year',
              type: 'number',
              min: 1900,
              max: new Date().getFullYear() + 5,
            },
            {
              name: 'specificElements',
              type: 'textarea',
              required: false,
              admin: {
                description: 'What specific elements to emulate from this film',
              },
            },
          ],
        },
        {
          name: 'visualReferences',
          type: 'textarea',
          admin: {
            description: 'Art styles, photography, design movements that inspire the visual approach',
          },
        },
        {
          name: 'narrativeReferences',
          type: 'textarea',
          admin: {
            description: 'Books, plays, real events that inspire the story structure or themes',
          },
        },
      ],
    },

    // Character Archetypes
    {
      name: 'characterArchetypes',
      type: 'group',
      fields: [
        {
          name: 'protagonistType',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Primary character archetype for the main character',
          },
        },
        {
          name: 'supportingRoles',
          type: 'textarea',
          admin: {
            description: 'Key supporting character archetypes',
          },
        },
        {
          name: 'relationshipDynamics',
          type: 'textarea',
          required: false,
          admin: {
            description: 'How characters interact and drive conflict',
          },
        },
      ],
    },

    // Thematic Elements
    {
      name: 'themes',
      type: 'group',
      fields: [
        {
          name: 'centralThemes',
          type: 'relationship',
          relationTo: 'central-themes',
          hasMany: true,
          required: false,
          admin: {
            description: 'Primary themes explored in the story',
          },
        },
        {
          name: 'moralQuestions',
          type: 'textarea',
          admin: {
            description: 'Ethical dilemmas characters will face',
          },
        },
        {
          name: 'messageTakeaway',
          type: 'textarea',
          required: false,
          admin: {
            description: 'What should audiences feel or learn from this story?',
          },
        },
      ],
    },

    // Setting & World-building
    {
      name: 'setting',
      type: 'group',
      fields: [
        {
          name: 'timePeriod',
          type: 'textarea',
          required: false,
          admin: {
            description: 'When the story takes place',
          },
        },
        {
          name: 'geographicSetting',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Where the story takes place',
          },
        },
        {
          name: 'socialContext',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Social, economic, and cultural background',
          },
        },
        {
          name: 'scale',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Scope and scale of the story',
          },
        },
      ],
    },

    // Pacing & Structure Preferences
    {
      name: 'pacing',
      type: 'group',
      fields: [
        {
          name: 'narrativeStructure',
          type: 'textarea',
          admin: {
            description: 'Story structure approach',
          },
        },
        {
          name: 'pacingStyle',
          type: 'textarea',
          admin: {
            description: 'Overall pacing approach',
          },
        },
        {
          name: 'climaxIntensity',
          type: 'textarea',
          admin: {
            description: 'Type of climax and resolution',
          },
        },
      ],
    },

    // Content Guidelines
    {
      name: 'contentGuidelines',
      type: 'group',
      fields: [
        {
          name: 'contentRestrictions',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Content limitations and restrictions',
          },
        },
        {
          name: 'culturalSensitivities',
          type: 'textarea',
          admin: {
            description: 'Cultural considerations and sensitivities',
          },
        },
        {
          name: 'educationalValue',
          type: 'textarea',
          admin: {
            description: 'Educational aspects or informational content to include',
          },
        },
      ],
    },

    // Timestamps
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (!value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          () => {
            return new Date()
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (data?.project && typeof data.project === 'string') {
          const project = await req.payload.findByID({
            collection: 'projects',
            id: data.project,
          })
          if (project) {
            data.projectName = project.name
          }
        }
        return data
      },
    ],
  },
}
