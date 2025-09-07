import type { CollectionConfig } from 'payload'

export const CharacterReferences: CollectionConfig = {
  slug: 'character-references',
  admin: {
    useAsTitle: 'projectCharacterName',
    defaultColumns: ['projectCharacterName', 'libraryCharacterId', 'project', 'characterRole', 'generationStatus', 'createdAt'],
    group: 'Content',
    description: 'Character references linking to Character Library - Single Source Architecture',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Project this character belongs to',
      },
    },
    {
      name: 'projectCharacterName',
      type: 'text',
      required: true,
      admin: {
        description: 'Character name as used in this specific project',
      },
    },
    {
      name: 'libraryCharacterId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique Character Library ID for this character',
      },
    },
    {
      name: 'characterRole',
      type: 'select',
      options: [
        { label: 'Protagonist', value: 'protagonist' },
        { label: 'Antagonist', value: 'antagonist' },
        { label: 'Supporting', value: 'supporting' },
        { label: 'Minor', value: 'minor' },
      ],
      defaultValue: 'supporting',
      admin: {
        description: 'Character role in this project',
      },
    },
    {
      name: 'generationStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Generated', value: 'generated' },
        { label: 'Images Created', value: 'images_created' },
        { label: 'Complete', value: 'complete' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        description: 'Character generation and setup status',
      },
    },
    {
      name: 'generationMetadata',
      type: 'group',
      admin: {
        description: 'Character generation tracking information',
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
          name: 'lastImageUpdate',
          type: 'date',
          admin: {
            description: 'When character images were last updated',
          },
        },
        {
          name: 'errorMessage',
          type: 'textarea',
          admin: {
            description: 'Error message if generation failed',
            condition: (data) => data.generationStatus === 'failed',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`✅ Character reference created: ${doc.projectCharacterName} -> ${doc.libraryCharacterId}`)
        }
        if (operation === 'update' && doc.generationStatus === 'complete') {
          console.log(`🎭 Character generation complete: ${doc.projectCharacterName}`)
        }
      },
    ],
  },
}
