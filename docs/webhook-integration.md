# Webhook Integration

## Overview

The application integrates with external services via webhooks for asynchronous processing results and real-time updates.

## Supported Webhook Sources

- **Fal.ai**: AI media generation completion notifications
- **Last Frame Service**: Video/audio processing results
- **Custom Services**: Extensible webhook system for future integrations

## Webhook Configuration

### Environment Setup

```env
# Webhook Configuration
WEBHOOK_BASE_URL=https://your-domain.com
WEBHOOK_SECRET=your_webhook_secret

# ngrok for local development
NGROK_DOMAIN=local.ft.tc
NGROK_AUTH_TOKEN=your_ngrok_token
```

### Local Development with ngrok

```bash
# Start ngrok tunnel
ngrok http 3000 --domain=local.ft.tc

# Your webhook URLs will be:
# https://local.ft.tc/api/v1/webhooks/fal
# https://local.ft.tc/api/v1/webhooks/lastframe
```

## Webhook Security

```typescript
// lib/webhooks/security.ts
import crypto from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

export function validateWebhookTimestamp(
  timestamp: string,
  tolerance: number = 300 // 5 minutes
): boolean {
  const now = Math.floor(Date.now() / 1000)
  const webhookTime = parseInt(timestamp)
  
  return Math.abs(now - webhookTime) <= tolerance
}
```

## Fal.ai Webhook Integration

```typescript
// app/v1/webhooks/fal/route.ts
import { QueueService } from '@/lib/queue/queue-service'
import { verifyWebhookSignature } from '@/lib/webhooks/security'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-fal-signature')
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, process.env.FAL_WEBHOOK_SECRET!)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    await handleFalWebhook(payload)

    return Response.json({ success: true })

  } catch (error) {
    console.error('Fal webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

interface FalWebhookPayload {
  request_id: string
  status: 'completed' | 'failed' | 'in_progress'
  result?: {
    images?: Array<{ url: string; width: number; height: number }>
    video?: { url: string; duration: number }
    error?: string
  }
  metadata: {
    job_id: string
    project_id: string
    user_id: string
    generation_type: 'image' | 'video'
  }
}

async function handleFalWebhook(payload: FalWebhookPayload) {
  const { request_id, status, result, metadata } = payload

  // Update job status in queue
  await QueueService.updateJobStatus(
    metadata.job_id,
    status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
    result,
    result?.error
  )

  // Update project workflow if completed
  if (status === 'completed' && result) {
    await updateProjectWithGeneratedMedia(
      metadata.project_id,
      metadata.generation_type,
      result
    )
  }

  // Trigger next workflow step
  if (status === 'completed') {
    await triggerNextWorkflowStep(metadata.project_id, metadata.generation_type)
  }
}

async function updateProjectWithGeneratedMedia(
  projectId: string,
  type: 'image' | 'video',
  result: any
) {
  const payload = await getPayload({ config: configPromise })

  // Store generated media
  if (type === 'image' && result.images) {
    for (const image of result.images) {
      await payload.create({
        collection: 'media',
        data: {
          url: image.url,
          mediaType: 'generated-image',
          projectId,
          metadata: {
            width: image.width,
            height: image.height,
            generatedAt: new Date(),
          },
        },
      })
    }
  }

  if (type === 'video' && result.video) {
    await payload.create({
      collection: 'media',
      data: {
        url: result.video.url,
        mediaType: 'generated-video',
        projectId,
        metadata: {
          duration: result.video.duration,
          generatedAt: new Date(),
        },
      },
    })
  }
}
```

## Last Frame Service Webhook Integration

```typescript
// app/v1/webhooks/lastframe/route.ts
import { handleLastFrameWebhook } from '@/lib/external/lastframe-webhooks'
import { verifyWebhookSignature } from '@/lib/webhooks/security'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-lastframe-signature')
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, process.env.LASTFRAME_WEBHOOK_SECRET!)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    await handleLastFrameWebhook(payload)

    return Response.json({ success: true })

  } catch (error) {
    console.error('LastFrame webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
```

## Generic Webhook Handler

```typescript
// lib/webhooks/webhook-handler.ts
import { QueueService } from '../queue/queue-service'

export interface WebhookEvent {
  id: string
  source: 'fal' | 'lastframe' | 'custom'
  type: string
  data: any
  timestamp: Date
  signature?: string
}

export class WebhookHandler {
  private static handlers = new Map<string, (event: WebhookEvent) => Promise<void>>()

  // Register webhook handler
  static registerHandler(
    source: string,
    type: string,
    handler: (event: WebhookEvent) => Promise<void>
  ) {
    const key = `${source}:${type}`
    this.handlers.set(key, handler)
  }

  // Process webhook event
  static async processWebhook(event: WebhookEvent) {
    const key = `${event.source}:${event.type}`
    const handler = this.handlers.get(key)

    if (!handler) {
      console.warn(`No handler found for webhook: ${key}`)
      return
    }

    try {
      await handler(event)
      await this.logWebhookEvent(event, 'success')
    } catch (error) {
      console.error(`Webhook handler error for ${key}:`, error)
      await this.logWebhookEvent(event, 'error', error.message)
      throw error
    }
  }

  // Log webhook events
  private static async logWebhookEvent(
    event: WebhookEvent,
    status: 'success' | 'error',
    error?: string
  ) {
    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'webhook-logs',
      data: {
        webhookId: event.id,
        source: event.source,
        type: event.type,
        status,
        error,
        data: event.data,
        processedAt: new Date(),
      },
    })
  }

  // Retry failed webhooks
  static async retryFailedWebhook(webhookLogId: string) {
    const payload = await getPayload({ config: configPromise })
    
    const log = await payload.findByID({
      collection: 'webhook-logs',
      id: webhookLogId,
    })

    if (!log || log.status !== 'error') {
      throw new Error('Invalid webhook log for retry')
    }

    const event: WebhookEvent = {
      id: log.webhookId,
      source: log.source,
      type: log.type,
      data: log.data,
      timestamp: new Date(),
    }

    await this.processWebhook(event)
  }
}

// Register default handlers
WebhookHandler.registerHandler('fal', 'generation.completed', async (event) => {
  // Handle Fal.ai generation completion
  console.log('Fal generation completed:', event.data)
})

WebhookHandler.registerHandler('lastframe', 'processing.completed', async (event) => {
  // Handle Last Frame processing completion
  console.log('LastFrame processing completed:', event.data)
})
```

## Webhook Logs Collection

```typescript
// collections/WebhookLogs.ts
import { CollectionConfig } from 'payload'

export const WebhookLogs: CollectionConfig = {
  slug: 'webhook-logs',
  admin: {
    useAsTitle: 'webhookId',
    defaultColumns: ['webhookId', 'source', 'type', 'status', 'processedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'webhookId',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Fal.ai', value: 'fal' },
        { label: 'Last Frame Service', value: 'lastframe' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'type',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
    {
      name: 'error',
      type: 'textarea',
    },
    {
      name: 'retryCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'processedAt',
      type: 'date',
      required: true,
    },
  ],
}
```

## Webhook Testing Utilities

```typescript
// lib/webhooks/testing.ts
export class WebhookTester {
  // Test webhook endpoint
  static async testWebhook(
    url: string,
    payload: any,
    headers: Record<string, string> = {}
  ) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
      })

      return {
        success: response.ok,
        status: response.status,
        response: await response.text(),
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Generate test payloads
  static generateTestPayload(source: 'fal' | 'lastframe', type: string) {
    const basePayload = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }

    switch (source) {
      case 'fal':
        return {
          ...basePayload,
          request_id: crypto.randomUUID(),
          status: 'completed',
          result: {
            images: [
              {
                url: 'https://example.com/generated-image.jpg',
                width: 1024,
                height: 1024,
              },
            ],
          },
          metadata: {
            job_id: crypto.randomUUID(),
            project_id: crypto.randomUUID(),
            user_id: crypto.randomUUID(),
            generation_type: 'image',
          },
        }

      case 'lastframe':
        return {
          ...basePayload,
          job_id: crypto.randomUUID(),
          status: 'completed',
          service: 'video-stitch',
          result: {
            output_url: 'https://example.com/stitched-video.mp4',
            duration: 120,
          },
          metadata: {
            project_id: crypto.randomUUID(),
            user_id: crypto.randomUUID(),
            original_job_id: crypto.randomUUID(),
          },
        }

      default:
        return basePayload
    }
  }
}
```

## Webhook Management API

```typescript
// app/v1/webhooks/manage/route.ts
import { WebhookHandler } from '@/lib/webhooks/webhook-handler'

// Get webhook logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const status = searchParams.get('status')

  const payload = await getPayload({ config: configPromise })
  
  const where: any = {}
  if (source) where.source = { equals: source }
  if (status) where.status = { equals: status }

  const logs = await payload.find({
    collection: 'webhook-logs',
    where,
    limit: 50,
    sort: '-processedAt',
  })

  return Response.json(logs)
}

// Retry failed webhook
export async function POST(request: Request) {
  const { webhookLogId } = await request.json()

  try {
    await WebhookHandler.retryFailedWebhook(webhookLogId)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Retry failed' },
      { status: 500 }
    )
  }
}
```

## Environment Configuration

```env
# Webhook Secrets
FAL_WEBHOOK_SECRET=your_fal_webhook_secret
LASTFRAME_WEBHOOK_SECRET=your_lastframe_webhook_secret
WEBHOOK_SECRET=your_general_webhook_secret

# Webhook URLs (for registering with external services)
FAL_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/fal
LASTFRAME_WEBHOOK_URL=https://your-domain.com/api/v1/webhooks/lastframe

# ngrok Configuration (for local development)
NGROK_DOMAIN=local.ft.tc
NGROK_AUTH_TOKEN=your_ngrok_token
```

## Usage Examples

```typescript
// Register webhook with Fal.ai
export async function registerFalWebhook(projectId: string, jobId: string) {
  const webhookUrl = `${process.env.WEBHOOK_BASE_URL}/api/v1/webhooks/fal`
  
  // This would be part of your Fal.ai job creation
  const falJob = await fal.subscribe('fal-ai/flux-pro', {
    input: { /* your input */ },
    webhookUrl,
    metadata: {
      job_id: jobId,
      project_id: projectId,
    },
  })

  return falJob
}

// Test webhook locally
export async function testLocalWebhook() {
  const testPayload = WebhookTester.generateTestPayload('fal', 'generation.completed')
  
  const result = await WebhookTester.testWebhook(
    'http://localhost:3001/api/v1/webhooks/fal',
    testPayload,
    {
      'x-fal-signature': generateWebhookSignature(
        JSON.stringify(testPayload),
        process.env.FAL_WEBHOOK_SECRET!
      ),
    }
  )

  console.log('Webhook test result:', result)
}
```
