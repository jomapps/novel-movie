# Development Guidelines

## Critical Rules

### Code Quality Standards
- **No Token Limiting**: Never limit tokens on our end; use prompts to control LLM output
- **No Fallbacks/Mocks**: Production-ready code only, no placeholder data
- **API Versioning**: All custom routes must be nested under `/src/app/v1/`
- **Server-First**: Prefer server-side components over API routes when possible
- **Async Patterns**: Always await `params` and `searchParams` in Next.js components

### Project Structure

```
src/
├── app/
│   ├── v1/                    # All custom API routes (versioned)
│   │   ├── generate/          # AI generation endpoints
│   │   ├── media/             # Media processing endpoints
│   │   └── workflow/          # Workflow management endpoints
│   ├── (dashboard)/           # Dashboard pages
│   └── globals.css
├── collections/               # PayloadCMS collections
├── components/               # Reusable React components
├── lib/                      # Utility functions
└── payload.config.ts         # PayloadCMS configuration
```

### Functions & Routes Registry

Maintain a centralized JSON registry at `/registry.json` to prevent duplication:

```json
{
  "generateScript": {
    "type": "function",
    "file": "src/lib/ai/script-generator.ts",
    "description": "Generates movie scripts using AI prompts"
  },
  "processVideo": {
    "type": "route",
    "route": "/api/v1/media/process-video",
    "description": "Processes video files through Last Frame Service"
  }
}
```

**Usage**: Check this registry before creating new functions or routes.

## Next.js Patterns

### Server Components (Preferred)

```typescript
// app/dashboard/page.tsx
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Always await params and searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const payload = await getPayload({ config: configPromise })
  
  // Fetch data directly in server component
  const projects = await payload.find({
    collection: 'projects',
    where: {
      user: { equals: resolvedParams.slug }
    }
  })

  return <div>{/* Your JSX */}</div>
}
```

### API Routes (When Necessary)

```typescript
// app/v1/generate/script/route.ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  
  const body = await request.json()
  
  // Your logic here
  
  return Response.json({ success: true })
}
```

### Client Components (When Interactive)

```typescript
'use client'

import { useState } from 'react'

export default function InteractiveComponent() {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/v1/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Generate a script' })
      })
      // Handle response
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate Script'}
    </button>
  )
}
```

## Error Handling

### API Routes

```typescript
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    // Your logic
    return Response.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Client Components

```typescript
const [error, setError] = useState<string | null>(null)

const handleAction = async () => {
  setError(null)
  try {
    // Your async operation
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
  }
}
```

## TypeScript Standards

### Strict Type Definitions

```typescript
// types/movie.ts
export interface MovieProject {
  id: string
  title: string
  format: 'short-film' | 'feature-film' | 'series'
  length: number // in minutes
  style: 'cinematic-realism' | 'animation' | 'documentary'
  status: 'draft' | 'generating' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface GenerationStep {
  id: string
  name: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  content?: string
  aiGenerated: boolean
  editedByUser: boolean
}
```

### Payload Collection Types

```typescript
// Always use generated types from PayloadCMS
import { Project, User } from '@/payload-types'

const createProject = async (data: Partial<Project>): Promise<Project> => {
  const payload = await getPayload({ config: configPromise })
  return await payload.create({
    collection: 'projects',
    data
  })
}
```

## Testing Standards

### Unit Tests (Vitest)

```typescript
// lib/__tests__/script-generator.test.ts
import { describe, it, expect, vi } from 'vitest'
import { generateScript } from '../ai/script-generator'

describe('Script Generator', () => {
  it('should generate a script with given parameters', async () => {
    const result = await generateScript({
      format: 'short-film',
      length: 2,
      style: 'cinematic-realism'
    })
    
    expect(result).toBeDefined()
    expect(result.content).toContain('FADE IN:')
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/movie-generation.spec.ts
import { test, expect } from '@playwright/test'

test('complete movie generation workflow', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Create new project
  await page.click('[data-testid="new-project"]')
  await page.fill('[data-testid="project-title"]', 'Test Movie')
  
  // Generate script
  await page.click('[data-testid="generate-script"]')
  await expect(page.locator('[data-testid="script-content"]')).toBeVisible()
})
```

## Performance Guidelines

### Database Queries

```typescript
// Efficient PayloadCMS queries
const projects = await payload.find({
  collection: 'projects',
  where: {
    user: { equals: userId }
  },
  limit: 10,
  select: {
    title: true,
    status: true,
    updatedAt: true
  }
})
```

### Image Optimization

```typescript
import Image from 'next/image'

// Always use Next.js Image component
<Image
  src="/generated-image.jpg"
  alt="Generated scene"
  width={800}
  height={600}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Security Guidelines

### Input Validation

```typescript
import { z } from 'zod'

const GenerateScriptSchema = z.object({
  format: z.enum(['short-film', 'feature-film', 'series']),
  length: z.number().min(1).max(180),
  style: z.string().min(1).max(50)
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate input
  const validatedData = GenerateScriptSchema.parse(body)
  
  // Proceed with validated data
}
```

### Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1),
  FAL_KEY: z.string().min(1),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url()
})

export const env = envSchema.parse(process.env)
```
