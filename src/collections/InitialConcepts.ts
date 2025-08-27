import type { CollectionConfig } from 'payload'

export const InitialConcepts: CollectionConfig = {
  slug: 'initial-concepts',
  admin: {
    useAsTitle: 'projectName',
    defaultColumns: ['projectName', 'project', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // Core Project Reference
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      unique: true,
      admin: {
        description: 'Associated project for this concept',
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
    {
      name: 'status',
      type: 'select',
      required: false,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'AI Generated', value: 'ai-generated' },
        { label: 'User Refined', value: 'user-refined' },
        { label: 'Ready for Story Generation', value: 'ready' },
        { label: 'Approved', value: 'approved' },
      ],
      admin: {
        description: 'Current status of the concept development',
      },
    },

    // Primary Genres (Required)
    {
      name: 'primaryGenres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      maxRows: 3,
      required: false,
      admin: {
        description: 'Select up to 3 genres in order of importance',
        sortOptions: 'name',
      },
    },

    // Core Premise (Required)
    {
      name: 'corePremise',
      type: 'textarea',
      required: false,
      admin: {
        description: 'The central story concept and main conflict (50-500 words)',
      },
    },

    // Target Audience (Required)
    {
      name: 'targetAudience',
      type: 'group',
      fields: [
        {
          name: 'demographics',
          type: 'relationship',
          relationTo: 'audience-demographics',
          hasMany: true,
          required: false,
          admin: {
            description: 'Primary demographic groups',
          },
        },
        {
          name: 'psychographics',
          type: 'textarea',
          admin: {
            description: 'Audience interests and values (free text for now)',
          },
        },
        {
          name: 'customDescription',
          type: 'textarea',
          admin: {
            description: 'Additional audience details not covered by selections',
          },
        },
      ],
    },

    // Tone & Mood (Required)
    {
      name: 'toneAndMood',
      type: 'group',
      fields: [
        {
          name: 'tones',
          type: 'relationship',
          relationTo: 'tone-options',
          hasMany: true,
          required: false,
          admin: {
            description: 'Overall tone of the story',
          },
        },
        {
          name: 'moods',
          type: 'relationship',
          relationTo: 'mood-descriptors',
          hasMany: true,
          required: false,
          admin: {
            description: 'Emotional atmosphere',
          },
        },
        {
          name: 'emotionalArc',
          type: 'textarea',
          required: false,
          admin: {
            description: 'How the emotional feeling should evolve throughout the story',
          },
        },
      ],
    },

    // Visual Style Direction (Required)
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
            description: 'Lighting approach and mood (free text for now)',
          },
        },
        {
          name: 'cameraMovement',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Camera movement and framing style (free text for now)',
          },
        },
      ],
    },

    // Reference Materials (Optional but Recommended)
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
            description:
              'Art styles, photography, design movements that inspire the visual approach',
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

    // Character Archetypes (Auto-generated with user refinement)
    {
      name: 'characterArchetypes',
      type: 'group',
      fields: [
        {
          name: 'protagonistType',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Primary character archetype for the main character (free text for now)',
          },
        },
        {
          name: 'supportingRoles',
          type: 'textarea',
          admin: {
            description: 'Key supporting character archetypes (free text for now)',
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

    // Thematic Elements (Required)
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
            description: 'Ethical dilemmas characters will face (free text for now)',
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

    // Setting & World-building (Required)
    {
      name: 'setting',
      type: 'group',
      fields: [
        {
          name: 'timePeriod',
          type: 'textarea',
          required: false,
          admin: {
            description: 'When the story takes place (free text for now)',
          },
        },
        {
          name: 'geographicSetting',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Where the story takes place (free text for now)',
          },
        },
        {
          name: 'socialContext',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Social, economic, and cultural background (free text for now)',
          },
        },
        {
          name: 'scale',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Scope and scale of the story (free text for now)',
          },
        },
      ],
    },

    // Pacing & Structure Preferences (Optional)
    {
      name: 'pacing',
      type: 'group',
      fields: [
        {
          name: 'narrativeStructure',
          type: 'textarea',
          admin: {
            description: 'Story structure approach (free text for now)',
          },
        },
        {
          name: 'pacingStyle',
          type: 'textarea',
          admin: {
            description: 'Overall pacing approach (free text for now)',
          },
        },
        {
          name: 'climaxIntensity',
          type: 'textarea',
          admin: {
            description: 'Type of climax and resolution (free text for now)',
          },
        },
      ],
    },

    // Content Guidelines (Required)
    {
      name: 'contentGuidelines',
      type: 'group',
      fields: [
        {
          name: 'contentRestrictions',
          type: 'textarea',
          required: false,
          admin: {
            description: 'Content limitations and restrictions (free text for now)',
          },
        },
        {
          name: 'culturalSensitivities',
          type: 'textarea',
          admin: {
            description: 'Cultural considerations and sensitivities (free text for now)',
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

    // AI Generation Metadata
    {
      name: 'aiMetadata',
      type: 'group',
      admin: {
        condition: (data) => data?.status === 'ai-generated' || data?.status === 'user-refined',
      },
      fields: [
        {
          name: 'generatedAt',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'generationModel',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'userModifications',
          type: 'array',
          fields: [
            {
              name: 'field',
              type: 'text',
            },
            {
              name: 'modifiedAt',
              type: 'date',
            },
            {
              name: 'originalValue',
              type: 'textarea',
            },
            {
              name: 'newValue',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }: any) => {
        // Only validate on create operations, not updates
        if (operation === 'create' && data?.project) {
          const existingConcept = await req.payload.find({
            collection: 'initial-concepts',
            where: {
              project: { equals: data.project },
            },
            limit: 1,
          })

          if (existingConcept.totalDocs > 0) {
            throw new Error('This project already has an initial concept')
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: any) => {
        // Update project status to indicate concept is ready
        if (operation === 'create' && doc.project && typeof doc.project === 'string') {
          await req.payload.update({
            collection: 'projects',
            id: doc.project,
            data: {
              status: 'concept-created',
            },
          })
        }

        // Log changes for audit trail
        if (operation === 'update') {
          console.log(`Initial concept ${doc.id} updated`)
        }

        // Trigger story generation if concept is marked as approved
        if (
          operation === 'update' &&
          doc.status === 'approved' &&
          doc.project &&
          typeof doc.project === 'string'
        ) {
          await req.payload.update({
            collection: 'projects',
            id: doc.project,
            data: {
              status: 'ready-for-story-generation',
            },
          })
        }
      },
    ],
  },
}
