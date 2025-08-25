# Media Processing

## Last Frame Service Integration

The Last Frame Service provides comprehensive video/audio processing utilities for the movie production pipeline.

## Service Configuration

```typescript
// lib/external/lastframe-service.ts
export class LastFrameService {
  private static baseUrl = process.env.LASTFRAME_SERVICE_URL || 'http://localhost:8080'
  private static apiKey = process.env.LASTFRAME_API_KEY

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`LastFrame API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Video Length Service
  static async getVideoLength(videoUrl: string): Promise<number> {
    const result = await this.makeRequest('/api/video/length', {
      method: 'POST',
      body: JSON.stringify({ video_url: videoUrl }),
    })

    return result.duration_seconds
  }

  // Last Frame Extraction
  static async extractLastFrame(videoUrl: string, outputPath?: string): Promise<string> {
    const result = await this.makeRequest('/api/video/last-frame', {
      method: 'POST',
      body: JSON.stringify({
        video_url: videoUrl,
        output_path: outputPath,
        format: 'jpg',
        quality: 95,
      }),
    })

    return result.frame_url
  }

  // Video Stitching
  static async stitchVideos(
    videoUrls: string[],
    outputPath: string,
    options: {
      transition?: 'cut' | 'fade' | 'dissolve'
      transitionDuration?: number
      resolution?: '1080p' | '720p' | '4k'
      fps?: number
    } = {}
  ): Promise<string> {
    const result = await this.makeRequest('/api/video/stitch', {
      method: 'POST',
      body: JSON.stringify({
        video_urls: videoUrls,
        output_path: outputPath,
        transition: options.transition || 'cut',
        transition_duration: options.transitionDuration || 0.5,
        resolution: options.resolution || '1080p',
        fps: options.fps || 24,
      }),
    })

    return result.output_url
  }

  // Audio Stitching
  static async stitchAudio(
    audioUrls: string[],
    outputPath: string,
    options: {
      crossfade?: number
      normalize?: boolean
      format?: 'mp3' | 'wav' | 'aac'
    } = {}
  ): Promise<string> {
    const result = await this.makeRequest('/api/audio/stitch', {
      method: 'POST',
      body: JSON.stringify({
        audio_urls: audioUrls,
        output_path: outputPath,
        crossfade_duration: options.crossfade || 0.1,
        normalize: options.normalize || true,
        format: options.format || 'mp3',
      }),
    })

    return result.output_url
  }

  // Music Track Mixing
  static async mixWithMusic(
    videoUrl: string,
    musicUrl: string,
    outputPath: string,
    options: {
      musicVolume?: number
      videoVolume?: number
      fadeIn?: number
      fadeOut?: number
      loop?: boolean
    } = {}
  ): Promise<string> {
    const result = await this.makeRequest('/api/video/mix-music', {
      method: 'POST',
      body: JSON.stringify({
        video_url: videoUrl,
        music_url: musicUrl,
        output_path: outputPath,
        music_volume: options.musicVolume || 0.3,
        video_volume: options.videoVolume || 1.0,
        fade_in: options.fadeIn || 2.0,
        fade_out: options.fadeOut || 2.0,
        loop_music: options.loop || true,
      }),
    })

    return result.output_url
  }

  // Video + Audio Assembly (3 output formats)
  static async assembleVideoAudio(
    sceneVideoUrls: string[],
    masterAudioUrl: string,
    outputBasePath: string,
    options: {
      formats?: ('mp4' | 'webm' | 'mov')[]
      resolution?: '1080p' | '720p' | '4k'
      quality?: 'high' | 'medium' | 'low'
    } = {}
  ): Promise<{ mp4?: string; webm?: string; mov?: string }> {
    const result = await this.makeRequest('/api/video/assemble', {
      method: 'POST',
      body: JSON.stringify({
        scene_videos: sceneVideoUrls,
        master_audio: masterAudioUrl,
        output_base_path: outputBasePath,
        formats: options.formats || ['mp4', 'webm', 'mov'],
        resolution: options.resolution || '1080p',
        quality: options.quality || 'high',
      }),
    })

    return result.output_urls
  }
}
```

## Webhook Integration

```typescript
// lib/external/lastframe-webhooks.ts
import { QueueService } from '../queue/queue-service'

export interface LastFrameWebhookPayload {
  job_id: string
  status: 'completed' | 'failed' | 'processing'
  service: 'video-stitch' | 'audio-stitch' | 'music-mix' | 'video-assembly' | 'frame-extract'
  result?: {
    output_url?: string
    output_urls?: Record<string, string>
    duration?: number
    error?: string
  }
  metadata: {
    project_id: string
    user_id: string
    original_job_id: string
  }
}

export async function handleLastFrameWebhook(payload: LastFrameWebhookPayload) {
  const { job_id, status, service, result, metadata } = payload

  try {
    // Update job status in our queue system
    await QueueService.updateJobStatus(
      metadata.original_job_id,
      status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'processing',
      result,
      result?.error
    )

    // Update project workflow step
    if (status === 'completed') {
      await updateProjectWorkflowStep(metadata.project_id, service, result)
    }

    // Trigger next workflow step if applicable
    if (status === 'completed') {
      await triggerNextWorkflowStep(metadata.project_id, service)
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    throw error
  }
}

async function updateProjectWorkflowStep(
  projectId: string,
  service: string,
  result: any
) {
  const payload = await getPayload({ config: configPromise })

  // Map service to workflow step
  const stepMapping = {
    'video-stitch': 'scene-assembly',
    'audio-stitch': 'audio-assembly',
    'music-mix': 'music-integration',
    'video-assembly': 'final-assembly',
    'frame-extract': 'frame-extraction',
  }

  const stepName = stepMapping[service]
  if (!stepName) return

  // Update project workflow
  const project = await payload.findByID({
    collection: 'projects',
    id: projectId,
  })

  const updatedWorkflow = project.workflow.map(step => {
    if (step.step === stepName) {
      return {
        ...step,
        status: 'completed',
        content: JSON.stringify(result),
        completedAt: new Date(),
      }
    }
    return step
  })

  await payload.update({
    collection: 'projects',
    id: projectId,
    data: { workflow: updatedWorkflow },
  })
}

async function triggerNextWorkflowStep(projectId: string, completedService: string) {
  // Define workflow dependencies
  const workflowOrder = [
    'script-generation',
    'scene-planning',
    'image-generation',
    'video-generation',
    'scene-assembly',
    'audio-generation',
    'audio-assembly',
    'music-integration',
    'final-assembly',
  ]

  const serviceToStep = {
    'video-stitch': 'scene-assembly',
    'audio-stitch': 'audio-assembly',
    'music-mix': 'music-integration',
    'video-assembly': 'final-assembly',
  }

  const completedStep = serviceToStep[completedService]
  if (!completedStep) return

  const currentIndex = workflowOrder.indexOf(completedStep)
  const nextStep = workflowOrder[currentIndex + 1]

  if (nextStep) {
    // Trigger next step processing
    await QueueService.addAIGenerationJob({
      id: crypto.randomUUID(),
      projectId,
      userId: 'system',
      type: nextStep,
      prompt: `Process ${nextStep} for project ${projectId}`,
      parameters: { step: nextStep },
      createdAt: new Date(),
    })
  }
}
```

## Media Processing API Routes

```typescript
// app/v1/media/process/route.ts
import { LastFrameService } from '@/lib/external/lastframe-service'
import { QueueService } from '@/lib/queue/queue-service'

export async function POST(request: Request) {
  const {
    type,
    projectId,
    userId,
    inputFiles,
    outputPath,
    options = {}
  } = await request.json()

  try {
    // Add media processing job to queue
    const job = await QueueService.addMediaProcessingJob({
      id: crypto.randomUUID(),
      projectId,
      userId,
      type,
      inputFiles,
      outputPath,
      parameters: options,
      createdAt: new Date(),
    })

    return Response.json({
      jobId: job.id,
      message: `${type} processing started`,
    })

  } catch (error) {
    return Response.json(
      { error: 'Failed to start media processing' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/v1/media/stitch-videos/route.ts
import { LastFrameService } from '@/lib/external/lastframe-service'

export async function POST(request: Request) {
  const { videoUrls, outputPath, options } = await request.json()

  try {
    const result = await LastFrameService.stitchVideos(
      videoUrls,
      outputPath,
      options
    )

    return Response.json({ outputUrl: result })

  } catch (error) {
    return Response.json(
      { error: 'Video stitching failed' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/v1/media/assemble/route.ts
import { LastFrameService } from '@/lib/external/lastframe-service'

export async function POST(request: Request) {
  const {
    sceneVideos,
    masterAudio,
    outputBasePath,
    options = {}
  } = await request.json()

  try {
    const result = await LastFrameService.assembleVideoAudio(
      sceneVideos,
      masterAudio,
      outputBasePath,
      options
    )

    return Response.json({ outputUrls: result })

  } catch (error) {
    return Response.json(
      { error: 'Video assembly failed' },
      { status: 500 }
    )
  }
}
```

## Webhook Endpoint

```typescript
// app/v1/webhooks/lastframe/route.ts
import { handleLastFrameWebhook } from '@/lib/external/lastframe-webhooks'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    
    // Verify webhook signature if needed
    const signature = request.headers.get('x-lastframe-signature')
    if (!verifyWebhookSignature(payload, signature)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    await handleLastFrameWebhook(payload)

    return Response.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  // Implement signature verification logic
  // This depends on how LastFrame Service signs webhooks
  return true // Placeholder
}
```

## Media Processing Utilities

```typescript
// lib/media/media-utils.ts
export class MediaUtils {
  // Generate thumbnails for videos
  static async generateThumbnail(videoUrl: string): Promise<string> {
    return await LastFrameService.extractLastFrame(videoUrl)
  }

  // Get media metadata
  static async getMediaInfo(mediaUrl: string): Promise<{
    duration?: number
    resolution?: string
    format?: string
    size?: number
  }> {
    // Implementation depends on your media analysis needs
    const duration = await LastFrameService.getVideoLength(mediaUrl)
    
    return {
      duration,
      // Add other metadata as needed
    }
  }

  // Validate media files
  static validateMediaFile(file: File): {
    valid: boolean
    error?: string
  } {
    const maxSize = 500 * 1024 * 1024 // 500MB
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/mov',
      'audio/mp3',
      'audio/wav',
      'audio/aac',
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 500MB)' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported file type' }
    }

    return { valid: true }
  }

  // Convert media formats
  static async convertMedia(
    inputUrl: string,
    outputFormat: string,
    outputPath: string
  ): Promise<string> {
    // This would integrate with your media conversion service
    // For now, using LastFrame service as example
    
    if (outputFormat === 'mp3') {
      // Audio conversion logic
    } else {
      // Video conversion logic
    }

    return outputPath
  }
}
```

## Environment Variables

```env
# Last Frame Service
LASTFRAME_SERVICE_URL=http://localhost:8080
LASTFRAME_API_KEY=your_lastframe_api_key

# Webhook Configuration
WEBHOOK_BASE_URL=https://your-domain.com
LASTFRAME_WEBHOOK_SECRET=your_webhook_secret

# Media Storage
MEDIA_STORAGE_PATH=/uploads/media
TEMP_STORAGE_PATH=/tmp/processing
```

## Usage Examples

```typescript
// Example: Process complete movie workflow
export async function processMovieWorkflow(projectId: string) {
  const payload = await getPayload({ config: configPromise })
  const project = await payload.findByID({
    collection: 'projects',
    id: projectId,
  })

  // 1. Stitch scene videos
  const sceneVideos = project.scenes.map(scene => scene.videoUrl)
  const stitchedVideo = await LastFrameService.stitchVideos(
    sceneVideos,
    `/output/${projectId}/scenes.mp4`
  )

  // 2. Mix with background music
  const musicMixed = await LastFrameService.mixWithMusic(
    stitchedVideo,
    project.backgroundMusic,
    `/output/${projectId}/with-music.mp4`
  )

  // 3. Final assembly with master audio
  const finalOutputs = await LastFrameService.assembleVideoAudio(
    [musicMixed],
    project.masterAudio,
    `/output/${projectId}/final`,
    { formats: ['mp4', 'webm', 'mov'] }
  )

  return finalOutputs
}
```
