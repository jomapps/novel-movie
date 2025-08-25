# PayloadCMS Integration

## Configuration

### Basic Setup

```typescript
// src/payload.config.ts
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  admin: {
    user: 'users',
    bundler: 'webpack'
  },
  collections: [
    // Your collections here
  ],
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2
      },
    }),
  ],
})
```

## Accessing Payload Instance

### In API Routes

```typescript
// app/v1/projects/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET() {
  const payload = await getPayload({
    config: configPromise,
  })

  const projects = await payload.find({
    collection: 'projects',
    limit: 10,
  })

  return Response.json(projects)
}

export async function POST(request: Request) {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await request.json()
  
  const project = await payload.create({
    collection: 'projects',
    data,
  })

  return Response.json(project)
}
```

### In Server Components

```typescript
// app/dashboard/page.tsx
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function Dashboard() {
  const payload = await getPayload({
    config: configPromise,
  })

  const projects = await payload.find({
    collection: 'projects',
    where: {
      status: { equals: 'active' }
    }
  })

  return (
    <div>
      {projects.docs.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  )
}
```

### In Standalone Scripts

```typescript
// scripts/migrate-data.ts
import { getPayload } from 'payload'
import configPromise from '../src/payload.config.js'

async function migrateData() {
  const payload = await getPayload({
    config: configPromise,
  })

  // Your migration logic
  const projects = await payload.find({
    collection: 'projects',
    limit: 1000,
  })

  console.log(`Found ${projects.totalDocs} projects`)
}

migrateData()
```

**Package.json Script**:
```json
{
  "scripts": {
    "migrate": "cross-env NODE_OPTIONS=--no-deprecation payload scripts/migrate-data.ts"
  }
}
```

## Collection Patterns

### Base Collection Structure

```typescript
// collections/Projects.ts
import { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'format',
      type: 'select',
      required: true,
      options: [
        { label: 'Short Film', value: 'short-film' },
        { label: 'Feature Film', value: 'feature-film' },
        { label: 'Series', value: 'series' },
      ],
    },
    {
      name: 'length',
      type: 'number',
      required: true,
      min: 1,
      max: 300,
    },
    {
      name: 'style',
      type: 'select',
      required: true,
      options: [
        { label: 'Cinematic Realism', value: 'cinematic-realism' },
        { label: 'Animation', value: 'animation' },
        { label: 'Documentary', value: 'documentary' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Generating', value: 'generating' },
        { label: 'Completed', value: 'completed' },
      ],
    },
    {
      name: 'workflow',
      type: 'array',
      fields: [
        {
          name: 'step',
          type: 'text',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Generating', value: 'generating' },
            { label: 'Completed', value: 'completed' },
            { label: 'Error', value: 'error' },
          ],
        },
        {
          name: 'content',
          type: 'textarea',
        },
        {
          name: 'aiGenerated',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
```

### Media Collection

```typescript
// collections/Media.ts
import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'video/*', 'audio/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'projectId',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'mediaType',
      type: 'select',
      options: [
        { label: 'Generated Image', value: 'generated-image' },
        { label: 'Generated Video', value: 'generated-video' },
        { label: 'Generated Audio', value: 'generated-audio' },
        { label: 'Processed Video', value: 'processed-video' },
      ],
    },
    {
      name: 'generationMetadata',
      type: 'group',
      fields: [
        {
          name: 'model',
          type: 'text',
        },
        {
          name: 'prompt',
          type: 'textarea',
        },
        {
          name: 'parameters',
          type: 'json',
        },
      ],
    },
  ],
}
```

## CRUD Operations

### Create

```typescript
const project = await payload.create({
  collection: 'projects',
  data: {
    title: 'My New Movie',
    format: 'short-film',
    length: 5,
    style: 'cinematic-realism',
    status: 'draft',
  },
})
```

### Read

```typescript
// Find multiple
const projects = await payload.find({
  collection: 'projects',
  where: {
    status: { equals: 'completed' },
    length: { greater_than: 10 },
  },
  limit: 20,
  page: 1,
  sort: '-updatedAt',
})

// Find by ID
const project = await payload.findByID({
  collection: 'projects',
  id: 'project-id',
})

// Find one
const project = await payload.findOne({
  collection: 'projects',
  where: {
    title: { equals: 'Specific Title' },
  },
})
```

### Update

```typescript
const updatedProject = await payload.update({
  collection: 'projects',
  id: 'project-id',
  data: {
    status: 'generating',
    workflow: [
      {
        step: 'script-generation',
        status: 'completed',
        content: 'Generated script content...',
        aiGenerated: true,
      },
    ],
  },
})
```

### Delete

```typescript
await payload.delete({
  collection: 'projects',
  id: 'project-id',
})
```

## Advanced Queries

### Complex Where Conditions

```typescript
const projects = await payload.find({
  collection: 'projects',
  where: {
    and: [
      {
        status: { equals: 'completed' }
      },
      {
        or: [
          { format: { equals: 'short-film' } },
          { format: { equals: 'feature-film' } }
        ]
      },
      {
        length: { 
          greater_than: 5,
          less_than: 60 
        }
      }
    ]
  }
})
```

### Population/Relationships

```typescript
const projectsWithMedia = await payload.find({
  collection: 'projects',
  populate: {
    media: true,
    user: {
      select: {
        name: true,
        email: true,
      }
    }
  }
})
```

## Hooks

### Collection Hooks

```typescript
// collections/Projects.ts
export const Projects: CollectionConfig = {
  slug: 'projects',
  hooks: {
    beforeCreate: [
      async ({ data }) => {
        // Initialize workflow steps
        data.workflow = [
          { step: 'script-generation', status: 'pending' },
          { step: 'scene-planning', status: 'pending' },
          { step: 'media-generation', status: 'pending' },
          { step: 'video-assembly', status: 'pending' },
        ]
        return data
      }
    ],
    afterCreate: [
      async ({ doc }) => {
        // Trigger initial workflow
        console.log(`Project created: ${doc.title}`)
      }
    ],
    beforeUpdate: [
      async ({ data, originalDoc }) => {
        // Log status changes
        if (data.status !== originalDoc.status) {
          console.log(`Status changed from ${originalDoc.status} to ${data.status}`)
        }
        return data
      }
    ],
  },
  // ... rest of config
}
```

## Authentication & Access Control

### User Collection

```typescript
// collections/Users.ts
import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
```

### Access Control

```typescript
// collections/Projects.ts
export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: { equals: user?.id }
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: { equals: user?.id }
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  // ... rest of config
}
```

## Type Generation

### Generate Types

```bash
pnpm run generate:types
```

### Using Generated Types

```typescript
// Import generated types
import { Project, User, Media } from '@/payload-types'

// Type-safe operations
const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
  const payload = await getPayload({ config: configPromise })
  
  return await payload.create({
    collection: 'projects',
    data,
  })
}
```
