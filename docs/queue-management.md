# Queue Management

## Overview

Long-running tasks (AI generation, video processing, etc.) are managed through **bee-queue** with Redis for reliable background processing.

## Environment Setup

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password  # if required
REDIS_DB=0  # database number
```

## Queue Configuration

```typescript
// lib/queue/queue-config.ts
import Queue from 'bee-queue'
import Redis from 'ioredis'

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
}

// Create Redis client
export const redis = new Redis(redisConfig)

// Queue settings
const queueSettings = {
  redis: redisConfig,
  isWorker: true,
  getEvents: true,
  sendEvents: true,
  storeJobs: true,
  ensureScripts: true,
  activateDelayedJobs: true,
  removeOnSuccess: false,
  removeOnFailure: false,
}

// Create queues for different task types
export const aiGenerationQueue = new Queue('ai-generation', queueSettings)
export const mediaProcessingQueue = new Queue('media-processing', queueSettings)
export const videoAssemblyQueue = new Queue('video-assembly', queueSettings)
export const webhookQueue = new Queue('webhook-processing', queueSettings)
```

## Job Types

```typescript
// lib/queue/job-types.ts
export interface BaseJob {
  id: string
  projectId: string
  userId: string
  createdAt: Date
}

export interface AIGenerationJob extends BaseJob {
  type: 'script' | 'scene-description' | 'image' | 'video'
  prompt: string
  parameters: Record<string, any>
  modelId?: string
}

export interface MediaProcessingJob extends BaseJob {
  type: 'video-stitch' | 'audio-stitch' | 'music-mix' | 'frame-extract'
  inputFiles: string[]
  outputPath: string
  parameters: Record<string, any>
}

export interface VideoAssemblyJob extends BaseJob {
  sceneVideos: string[]
  masterAudio: string
  outputFormats: ('mp4' | 'webm' | 'mov')[]
}

export interface WebhookJob extends BaseJob {
  webhookUrl: string
  payload: Record<string, any>
  retryCount: number
}
```

## Queue Service

```typescript
// lib/queue/queue-service.ts
import { aiGenerationQueue, mediaProcessingQueue, videoAssemblyQueue, webhookQueue } from './queue-config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export class QueueService {
  // Add AI generation job
  static async addAIGenerationJob(job: AIGenerationJob, options: any = {}) {
    const queueJob = await aiGenerationQueue.createJob(job)
      .timeout(30 * 60 * 1000) // 30 minutes
      .retries(3)
      .backoff('exponential', 2000)
      .save()

    // Store job in database
    await this.storeJobInDB('ai-generation', queueJob.id, job)
    
    return queueJob
  }

  // Add media processing job
  static async addMediaProcessingJob(job: MediaProcessingJob, options: any = {}) {
    const queueJob = await mediaProcessingQueue.createJob(job)
      .timeout(60 * 60 * 1000) // 60 minutes
      .retries(2)
      .backoff('exponential', 5000)
      .save()

    await this.storeJobInDB('media-processing', queueJob.id, job)
    
    return queueJob
  }

  // Add video assembly job
  static async addVideoAssemblyJob(job: VideoAssemblyJob, options: any = {}) {
    const queueJob = await videoAssemblyQueue.createJob(job)
      .timeout(120 * 60 * 1000) // 120 minutes
      .retries(1)
      .save()

    await this.storeJobInDB('video-assembly', queueJob.id, job)
    
    return queueJob
  }

  // Add webhook job
  static async addWebhookJob(job: WebhookJob, options: any = {}) {
    const queueJob = await webhookQueue.createJob(job)
      .timeout(30 * 1000) // 30 seconds
      .retries(5)
      .backoff('exponential', 1000)
      .save()

    await this.storeJobInDB('webhook', queueJob.id, job)
    
    return queueJob
  }

  // Store job metadata in MongoDB
  private static async storeJobInDB(queueName: string, jobId: string, jobData: any) {
    const payload = await getPayload({ config: configPromise })
    
    await payload.create({
      collection: 'queue-jobs',
      data: {
        queueName,
        jobId,
        status: 'queued',
        jobData,
        createdAt: new Date(),
      },
    })
  }

  // Update job status in database
  static async updateJobStatus(jobId: string, status: string, result?: any, error?: any) {
    const payload = await getPayload({ config: configPromise })
    
    await payload.update({
      collection: 'queue-jobs',
      where: { jobId: { equals: jobId } },
      data: {
        status,
        result,
        error,
        updatedAt: new Date(),
      },
    })
  }

  // Get job status
  static async getJobStatus(jobId: string) {
    const payload = await getPayload({ config: configPromise })
    
    const job = await payload.findOne({
      collection: 'queue-jobs',
      where: { jobId: { equals: jobId } },
    })

    return job
  }
}
```

## Job Processors

```typescript
// lib/queue/processors/ai-generation-processor.ts
import { aiGenerationQueue } from '../queue-config'
import { AIService } from '../../ai/ai-service'
import { QueueService } from '../queue-service'

// Process AI generation jobs
aiGenerationQueue.process(async (job) => {
  const { id, type, prompt, parameters, modelId, projectId } = job.data

  try {
    await QueueService.updateJobStatus(job.id, 'processing')

    let result: any

    switch (type) {
      case 'script':
        result = await AIService.generateScript(parameters)
        break
      
      case 'scene-description':
        result = await AIService.generateText(prompt)
        break
      
      case 'image':
        result = await AIService.generateSceneImage(prompt, parameters.style, modelId)
        break
      
      case 'video':
        result = await AIService.generateSceneVideo(
          parameters.imageUrl,
          prompt,
          modelId
        )
        break
      
      default:
        throw new Error(`Unknown AI generation type: ${type}`)
    }

    await QueueService.updateJobStatus(job.id, 'completed', result)
    
    return result
  } catch (error) {
    await QueueService.updateJobStatus(job.id, 'failed', null, error.message)
    throw error
  }
})

// Handle job events
aiGenerationQueue.on('ready', () => {
  console.log('AI Generation queue is ready')
})

aiGenerationQueue.on('error', (err) => {
  console.error('AI Generation queue error:', err)
})

aiGenerationQueue.on('succeeded', (job, result) => {
  console.log(`AI Generation job ${job.id} succeeded`)
})

aiGenerationQueue.on('failed', (job, err) => {
  console.error(`AI Generation job ${job.id} failed:`, err)
})
```

```typescript
// lib/queue/processors/media-processing-processor.ts
import { mediaProcessingQueue } from '../queue-config'
import { LastFrameService } from '../../external/lastframe-service'
import { QueueService } from '../queue-service'

mediaProcessingQueue.process(async (job) => {
  const { id, type, inputFiles, outputPath, parameters } = job.data

  try {
    await QueueService.updateJobStatus(job.id, 'processing')

    let result: any

    switch (type) {
      case 'video-stitch':
        result = await LastFrameService.stitchVideos(inputFiles, outputPath)
        break
      
      case 'audio-stitch':
        result = await LastFrameService.stitchAudio(inputFiles, outputPath)
        break
      
      case 'music-mix':
        result = await LastFrameService.mixWithMusic(
          inputFiles[0],
          parameters.musicTrack,
          outputPath
        )
        break
      
      case 'frame-extract':
        result = await LastFrameService.extractLastFrame(inputFiles[0], outputPath)
        break
      
      default:
        throw new Error(`Unknown media processing type: ${type}`)
    }

    await QueueService.updateJobStatus(job.id, 'completed', result)
    
    return result
  } catch (error) {
    await QueueService.updateJobStatus(job.id, 'failed', null, error.message)
    throw error
  }
})
```

## Queue Jobs Collection

```typescript
// collections/QueueJobs.ts
import { CollectionConfig } from 'payload'

export const QueueJobs: CollectionConfig = {
  slug: 'queue-jobs',
  admin: {
    useAsTitle: 'jobId',
    defaultColumns: ['jobId', 'queueName', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'jobId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'queueName',
      type: 'select',
      required: true,
      options: [
        { label: 'AI Generation', value: 'ai-generation' },
        { label: 'Media Processing', value: 'media-processing' },
        { label: 'Video Assembly', value: 'video-assembly' },
        { label: 'Webhook', value: 'webhook' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'jobData',
      type: 'json',
      required: true,
    },
    {
      name: 'result',
      type: 'json',
    },
    {
      name: 'error',
      type: 'textarea',
    },
    {
      name: 'projectId',
      type: 'relationship',
      relationTo: 'projects',
    },
  ],
}
```

## Usage Examples

```typescript
// app/v1/generate/script/route.ts
import { QueueService } from '@/lib/queue/queue-service'

export async function POST(request: Request) {
  const { projectId, userId, parameters } = await request.json()

  // Add script generation job to queue
  const job = await QueueService.addAIGenerationJob({
    id: crypto.randomUUID(),
    projectId,
    userId,
    type: 'script',
    prompt: 'Generate movie script',
    parameters,
    createdAt: new Date(),
  })

  return Response.json({
    jobId: job.id,
    message: 'Script generation started',
  })
}
```

```typescript
// app/v1/jobs/[jobId]/status/route.ts
import { QueueService } from '@/lib/queue/queue-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  
  const jobStatus = await QueueService.getJobStatus(jobId)
  
  if (!jobStatus) {
    return Response.json({ error: 'Job not found' }, { status: 404 })
  }

  return Response.json(jobStatus)
}
```

## Queue Monitoring

```typescript
// lib/queue/monitoring.ts
import { aiGenerationQueue, mediaProcessingQueue } from './queue-config'

export async function getQueueStats() {
  const stats = {
    aiGeneration: await aiGenerationQueue.checkHealth(),
    mediaProcessing: await mediaProcessingQueue.checkHealth(),
  }

  return stats
}

export async function getActiveJobs() {
  const [aiJobs, mediaJobs] = await Promise.all([
    aiGenerationQueue.getJobs('active'),
    mediaProcessingQueue.getJobs('active'),
  ])

  return {
    aiGeneration: aiJobs.length,
    mediaProcessing: mediaJobs.length,
  }
}
```

## Worker Process

```typescript
// scripts/queue-worker.ts
import './processors/ai-generation-processor'
import './processors/media-processing-processor'
import './processors/video-assembly-processor'
import './processors/webhook-processor'

console.log('Queue worker started')

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down queue worker...')
  process.exit(0)
})
```

**Package.json Script**:
```json
{
  "scripts": {
    "queue:worker": "cross-env NODE_OPTIONS=--no-deprecation payload scripts/queue-worker.ts"
  }
}
```
