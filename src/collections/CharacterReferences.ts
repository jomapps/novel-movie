import type { CollectionConfig } from 'payload'

export const CharacterReferences: CollectionConfig = {
  slug: 'character-references',
  admin: {
    useAsTitle: 'projectCharacterName',
    defaultColumns: [
      'projectCharacterName',
      'libraryCharacterId',
      'project',
      'characterRole',
      'generationStatus',
      'createdAt',
    ],
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
      name: 'libraryDbId',
      type: 'text',
      admin: {
        description: 'MongoDB ObjectId used in Character Library API paths (24 hex chars)',
      },
      validate: (val: unknown) => {
        if (!val) return true
        const s = String(val)
        return /^[a-f0-9]{24}$/.test(s) || 'Must be a 24-character hex ObjectId'
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
      name: 'dialogueVoice',
      type: 'group',
      admin: {
        description: 'Dialogue voice profile (plain text; synced to Character Library)',
      },
      fields: [
        {
          name: 'voiceDescription',
          type: 'text',
          admin: { description: 'Voice characteristics, accent, speech style' },
        },
        { name: 'style', type: 'text' },
        {
          name: 'patterns',
          type: 'array',
          fields: [{ name: 'pattern', type: 'text', required: true }],
        },
        { name: 'vocabulary', type: 'textarea' },
      ],
    },
    {
      name: 'voiceModels',
      type: 'array',
      admin: {
        description: 'Voice generation models; include optional sample audio from Media',
      },
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'ElevenLabs', value: 'elevenlabs' },
            { label: 'OpenAI', value: 'openai' },
            { label: 'Azure', value: 'azure' },
            { label: 'Other', value: 'other' },
          ],
        },
        { name: 'voiceId', type: 'text' },
        { name: 'voiceName', type: 'text' },
        {
          name: 'voiceSample',
          type: 'relationship',
          relationTo: 'media',
          admin: { description: 'Optional sample audio from our Media collection' },
        },
        { name: 'isDefault', type: 'checkbox' },
      ],
    },
    {
      name: 'libraryAssets',
      type: 'group',
      admin: { description: 'Quick verification fields for Character Library assets' },
      fields: [
        { name: 'masterReferencePublicUrl', type: 'text' },
        { name: 'coreSetGenerated', type: 'checkbox', defaultValue: false },
        { name: 'coreSetCount', type: 'number', min: 0 },
      ],
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
        {
          name: 'generationMethod',
          type: 'text',
          admin: {
            description: 'Method used to generate character (e.g., BAML DevelopCharacters)',
          },
        },
        {
          name: 'qualityScore',
          type: 'number',
          admin: {
            description: 'AI-generated quality score for the character',
          },
        },
        {
          name: 'completeness',
          type: 'number',
          admin: {
            description: 'AI-generated completeness score for the character',
          },
        },
        {
          name: 'characterLibraryStatus',
          type: 'text',
          admin: {
            description: 'Status of Character Library integration',
          },
        },
        {
          name: 'bamlData',
          type: 'json',
          admin: {
            description: 'Full BAML response data for character generation',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(
            `✅ Character reference created: ${doc.projectCharacterName} -> ${doc.libraryCharacterId}`,
          )
        }
        if (operation === 'update' && doc.generationStatus === 'complete') {
          console.log(`🎭 Character generation complete: ${doc.projectCharacterName}`)
        }
      },
    ],
  },
}
