import type { CollectionConfig } from 'payload'

export const CharacterImageMetadata: CollectionConfig = {
  slug: 'character-image-metadata',
  admin: {
    useAsTitle: 'kind',
    defaultColumns: ['characterReference', 'kind', 'provider', 'status', 'createdAt'],
    group: 'Content',
    description: 'Pure metadata for character images; binary files live in Media',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'characterReference',
      type: 'relationship',
      relationTo: 'character-references',
      required: true,
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Reference', value: 'reference' },
        { label: 'Portfolio Item', value: 'portfolioItem' },
        { label: 'Scene', value: 'scene' },
      ],
      defaultValue: 'portfolioItem',
    },
    { name: 'provider', type: 'text', defaultValue: 'character-library' },
    { name: 'prompt', type: 'text' },
    { name: 'sourceUrl', type: 'text' },
    { name: 'externalId', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'succeeded',
    },
    { name: 'error', type: 'textarea' },
    { name: 'metrics', type: 'json' },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}

export default CharacterImageMetadata

