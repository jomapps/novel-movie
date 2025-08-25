import type { CollectionConfig } from 'payload'

export const MovieFormats: CollectionConfig = {
  slug: 'movie-formats',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'suggestedDuration', 'isActive'],
    group: 'Configuration',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      // Only allow creation by admin users or during seeding
      return user?.role === 'admin' || !user
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name of the movie format (e.g., "Short Film", "Feature Film")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier for the format',
      },
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
      admin: {
        description: 'Brief description of the movie format and its characteristics',
      },
    },
    {
      name: 'suggestedDuration',
      type: 'number',
      required: true,
      defaultValue: 5,
      admin: {
        description: 'Suggested duration for this format',
        step: 1,
      },
    },

    {
      name: 'isActive',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Whether this format is available for new projects',
      },
    },
  ],
}
