import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'projectName', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // Project relationship
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Associated project for this character',
      },
    },
    {
      name: 'projectName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-populated from project name',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.project && typeof data.project === 'string') {
              const payload = req.payload
              const project = await payload.findByID({
                collection: 'projects',
                id: data.project,
              })
              return project?.name || 'Unknown Project'
            }
            return data?.projectName
          },
        ],
      },
    },

    // Story Structure relationship (for character arcs)
    {
      name: 'storyStructure',
      type: 'relationship',
      relationTo: 'story-structures',
      admin: {
        description: 'Associated story structure for character arc development',
      },
    },

    // Basic Character Information
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Character name',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Development', value: 'in_development' },
        { label: 'Ready', value: 'ready' },
        { label: 'In Production', value: 'in_production' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        description: 'Character development status',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Protagonist', value: 'protagonist' },
        { label: 'Antagonist', value: 'antagonist' },
        { label: 'Supporting', value: 'supporting' },
        { label: 'Minor', value: 'minor' },
      ],
      admin: {
        description: 'Character role in the story',
      },
    },
    {
      name: 'archetype',
      type: 'text',
      admin: {
        description: 'Character archetype (e.g., Hero, Mentor, Trickster)',
      },
    },

    // Character Development Core
    {
      name: 'characterDevelopment',
      type: 'group',
      admin: {
        description: 'Core character development information',
      },
      fields: [
        {
          name: 'biography',
          type: 'richText',
          admin: {
            description: 'Character background and history',
          },
        },
        {
          name: 'personality',
          type: 'richText',
          admin: {
            description: 'Personality traits and characteristics',
          },
        },
        {
          name: 'motivations',
          type: 'richText',
          admin: {
            description: 'Character motivations and goals',
          },
        },
        {
          name: 'backstory',
          type: 'richText',
          admin: {
            description: 'Character backstory and formative experiences',
          },
        },
        {
          name: 'psychology',
          type: 'group',
          fields: [
            {
              name: 'motivation',
              type: 'text',
              admin: {
                description: 'Primary motivation driving the character',
              },
            },
            {
              name: 'fears',
              type: 'text',
              admin: {
                description: 'Character fears and anxieties',
              },
            },
            {
              name: 'desires',
              type: 'text',
              admin: {
                description: 'Character desires and wants',
              },
            },
            {
              name: 'flaws',
              type: 'text',
              admin: {
                description: 'Character flaws and weaknesses',
              },
            },
          ],
        },
      ],
    },

    // Character Arc
    {
      name: 'characterArc',
      type: 'group',
      admin: {
        description: 'Character transformation throughout the story',
      },
      fields: [
        {
          name: 'startState',
          type: 'text',
          admin: {
            description: 'Character state at the beginning of the story',
          },
        },
        {
          name: 'transformation',
          type: 'text',
          admin: {
            description: 'How the character changes throughout the story',
          },
        },
        {
          name: 'endState',
          type: 'text',
          admin: {
            description: 'Character state at the end of the story',
          },
        },
      ],
    },

    // Physical Description
    {
      name: 'physicalDescription',
      type: 'group',
      admin: {
        description: 'Character physical appearance',
      },
      fields: [
        {
          name: 'description',
          type: 'richText',
          admin: {
            description: 'Overall physical description',
          },
        },
        {
          name: 'age',
          type: 'number',
          admin: {
            description: 'Character age',
          },
        },
        {
          name: 'height',
          type: 'text',
          admin: {
            description: 'Character height',
          },
        },
        {
          name: 'eyeColor',
          type: 'text',
          admin: {
            description: 'Eye color',
          },
        },
        {
          name: 'hairColor',
          type: 'text',
          admin: {
            description: 'Hair color',
          },
        },
        {
          name: 'clothing',
          type: 'richText',
          admin: {
            description: 'Typical clothing and style',
          },
        },
      ],
    },

    // Dialogue and Voice
    {
      name: 'dialogueVoice',
      type: 'group',
      admin: {
        description: 'Character dialogue style and voice',
      },
      fields: [
        {
          name: 'voiceDescription',
          type: 'richText',
          admin: {
            description: 'Character voice and speaking style',
          },
        },
        {
          name: 'style',
          type: 'text',
          admin: {
            description: 'Dialogue style (formal, casual, etc.)',
          },
        },
        {
          name: 'patterns',
          type: 'text',
          admin: {
            description: 'Speech patterns and mannerisms',
          },
        },
        {
          name: 'vocabulary',
          type: 'text',
          admin: {
            description: 'Vocabulary level and word choices',
          },
        },
      ],
    },

    // Relationships
    {
      name: 'relationships',
      type: 'array',
      admin: {
        description: 'Character relationships with other characters',
      },
      fields: [
        {
          name: 'character',
          type: 'relationship',
          relationTo: 'characters',
          admin: {
            description: 'Related character',
          },
        },
        {
          name: 'relationship',
          type: 'text',
          admin: {
            description: 'Type of relationship (friend, enemy, family, etc.)',
          },
        },
        {
          name: 'dynamic',
          type: 'text',
          admin: {
            description: 'Relationship dynamic and interaction style',
          },
        },
      ],
    },

    // Generation Metadata
    {
      name: 'generationMetadata',
      type: 'group',
      admin: {
        description: 'AI generation metadata and quality metrics',
      },
      fields: [
        {
          name: 'generatedAt',
          type: 'date',
          admin: {
            description: 'When this character was generated',
          },
        },
        {
          name: 'generationMethod',
          type: 'select',
          options: [
            { label: 'AI Generated', value: 'ai_generated' },
            { label: 'User Created', value: 'user_created' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
          admin: {
            description: 'How this character was created',
          },
        },
        {
          name: 'qualityScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Character development quality score (0-100)',
          },
        },
        {
          name: 'completeness',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Character profile completeness percentage',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Auto-populate project name
        if (data?.project && typeof data.project === 'string') {
          const project = await req.payload.findByID({
            collection: 'projects',
            id: data.project,
          })
          data.projectName = project?.name || 'Unknown Project'
        }
      },
    ],
  },
}
