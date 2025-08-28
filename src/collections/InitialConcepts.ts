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

    // === ESSENTIAL 4 FIELDS FOR STORY GENERATION ===

    // 1. Primary Genres (Required)
    {
      name: 'primaryGenres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      maxRows: 3,
      required: true,
      admin: {
        description:
          'Select up to 3 genres in order of importance - drives story structure and style',
        sortOptions: 'name',
      },
    },

    // 2. Core Premise (Required)
    {
      name: 'corePremise',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'The central story concept and main conflict - what is this story about? (50-300 words)',
      },
    },

    // 3. Tone (Required)
    {
      name: 'tone',
      type: 'relationship',
      relationTo: 'tone-options',
      hasMany: true,
      maxRows: 2,
      required: true,
      admin: {
        description: "Select 1-2 tones that define the story's emotional approach",
        sortOptions: 'name',
      },
    },

    // 4. Target Audience (Required)
    {
      name: 'targetAudience',
      type: 'relationship',
      relationTo: 'audience-demographics',
      hasMany: true,
      maxRows: 3,
      required: true,
      admin: {
        description: 'Select primary demographic groups this story should appeal to',
        sortOptions: 'name',
      },
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
