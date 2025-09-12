import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'project', 'characterLibraryId', 'updatedAt'],
    group: 'Content',
    description: 'Local character profiles (authoring-first), then sync to Character Library',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // Project association
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: { description: 'Owning project' },
    },

    // Core identity
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Protagonist', value: 'protagonist' },
        { label: 'Antagonist', value: 'antagonist' },
        { label: 'Supporting', value: 'supporting' },
        { label: 'Minor', value: 'minor' },
      ],
      defaultValue: 'supporting',
    },
    { name: 'archetype', type: 'text' },

    // Development
    {
      name: 'characterDevelopment',
      type: 'group',
      fields: [
        { name: 'biography', type: 'textarea' },
        { name: 'personality', type: 'textarea' },
        { name: 'motivations', type: 'textarea' },
        { name: 'backstory', type: 'textarea' },
        {
          name: 'psychology',
          type: 'group',
          fields: [
            { name: 'motivation', type: 'text' },
            { name: 'fears', type: 'text' },
            { name: 'desires', type: 'text' },
            { name: 'flaws', type: 'text' },
          ],
        },
      ],
    },

    // Arc
    {
      name: 'characterArc',
      type: 'group',
      fields: [
        { name: 'startState', type: 'textarea' },
        { name: 'transformation', type: 'textarea' },
        { name: 'endState', type: 'textarea' },
      ],
    },

    // Physical
    {
      name: 'physicalDescription',
      type: 'group',
      fields: [
        { name: 'description', type: 'textarea' },
        { name: 'age', type: 'number' },
        { name: 'height', type: 'text' },
        { name: 'weight', type: 'text' },
        { name: 'eyeColor', type: 'text' },
        { name: 'hairColor', type: 'text' },
        { name: 'clothing', type: 'textarea' },
      ],
    },

    // Voice profile
    {
      name: 'dialogueVoice',
      type: 'group',
      fields: [
        { name: 'voiceDescription', type: 'text' },
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
      admin: { description: 'Voice generation models; include optional sample audio from Media' },
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
        { name: 'voiceSample', type: 'relationship', relationTo: 'media' },
        { name: 'isDefault', type: 'checkbox' },
      ],
    },

    // Relationships
    {
      name: 'relationships',
      type: 'array',
      fields: [
        { name: 'character', type: 'text', admin: { description: 'Other character name or ID' } },
        { name: 'relationship', type: 'text' },
        { name: 'dynamic', type: 'textarea' },
      ],
    },

    // Library integration (dual-ID + status)
    {
      name: 'libraryIntegration',
      type: 'group',
      fields: [
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
          name: 'libraryCharacterId',
          type: 'text',
          admin: { description: 'Business CharacterID in Character Library' },
        },
        {
          name: 'characterLibraryId',
          type: 'text',
          admin: { description: 'Legacy single ID (kept for backwards compatibility)' },
        },
        {
          name: 'syncStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Created', value: 'created' },
            { label: 'Synced', value: 'synced' },
            { label: 'Conflict', value: 'conflict' },
            { label: 'Error', value: 'error' },
          ],
        },
        { name: 'lastSyncAt', type: 'date' },
      ],
    },

    // Visual assets (quick verification)
    {
      name: 'libraryAssets',
      type: 'group',
      fields: [
        { name: 'masterReferencePublicUrl', type: 'text' },
        { name: 'coreSetGenerated', type: 'checkbox', defaultValue: false },
        { name: 'coreSetCount', type: 'number', min: 0 },
        { name: 'lastImageUpdate', type: 'date' },
      ],
    },

    // Generation metadata
    {
      name: 'generationMetadata',
      type: 'group',
      fields: [
        { name: 'generatedAt', type: 'date' },
        { name: 'generationMethod', type: 'text' },
        { name: 'qualityScore', type: 'number' },
        { name: 'completeness', type: 'number' },
        { name: 'bamlData', type: 'json' },
      ],
    },
  ],
}

export default Characters
