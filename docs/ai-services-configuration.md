# AI Services Configuration

## OpenRouter (LLM Provider)

### Environment Setup

```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MILLION_MODEL=google/gemini-2.5-pro
```

### Client Configuration

```typescript
// lib/ai/openrouter-client.ts
import OpenAI from 'openai'

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL,
    "X-Title": "Novel Movie",
  }
})

export async function generateWithLLM(
  prompt: string,
  model: string = process.env.OPENROUTER_DEFAULT_MODEL!,
  maxTokens?: number
) {
  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || ''
}

export async function generateWithFallback(prompt: string) {
  try {
    return await generateWithLLM(prompt, process.env.OPENROUTER_DEFAULT_MODEL!)
  } catch (error) {
    console.warn('Primary model failed, using fallback:', error)
    return await generateWithLLM(prompt, process.env.OPENROUTER_MILLION_MODEL!)
  }
}
```

## Fal.ai (Media Generation)

### Environment Setup

```env
# Fal.ai Configuration
FAL_KEY=your_fal_api_key

# Swappable Models - Text to Image
FAL_TEXT_TO_IMAGE_MODEL_DEFAULT=fal-ai/flux-pro/kontext/text-to-image
FAL_TEXT_TO_IMAGE_MODEL_1=fal-ai/flux-pro/kontext/text-to-image
FAL_TEXT_TO_IMAGE_MODEL_2=fal-ai/stable-diffusion-v3-medium

# Swappable Models - Image to Video
FAL_IMAGE_TO_VIDEO_MODEL_DEFAULT=fal-ai/wan/v2.2-a14b/image-to-video
FAL_IMAGE_TO_VIDEO_MODEL_1=fal-ai/wan/v2.2-a14b/image-to-video
FAL_IMAGE_TO_VIDEO_MODEL_2=fal-ai/veo3/image-to-video

# Swappable Models - Text to Video
FAL_TEXT_TO_VIDEO_MODEL_DEFAULT=fal-ai/veo3/text-to-video
FAL_TEXT_TO_VIDEO_MODEL_1=fal-ai/veo3/text-to-video
FAL_TEXT_TO_VIDEO_MODEL_2=fal-ai/wan/v2.2-a14b/text-to-video
```

### Client Setup

```typescript
// lib/ai/fal-client.ts
import { fal } from "@fal-ai/client"

// Configure Fal client
fal.config({
  credentials: process.env.FAL_KEY!,
})

export interface MediaGenerationOptions {
  model?: string
  prompt: string
  width?: number
  height?: number
  steps?: number
  guidance_scale?: number
  seed?: number
}

export interface VideoGenerationOptions extends MediaGenerationOptions {
  duration?: number
  fps?: number
  image_url?: string // For image-to-video
}

export async function generateImage(options: MediaGenerationOptions) {
  const model = options.model || process.env.FAL_TEXT_TO_IMAGE_MODEL_DEFAULT!
  
  const result = await fal.subscribe(model, {
    input: {
      prompt: options.prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      num_inference_steps: options.steps || 28,
      guidance_scale: options.guidance_scale || 7.5,
      seed: options.seed,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs?.map((log) => log.message).forEach(console.log)
      }
    },
  })

  return result.data
}

export async function generateVideo(options: VideoGenerationOptions) {
  const model = options.image_url 
    ? (options.model || process.env.FAL_IMAGE_TO_VIDEO_MODEL_DEFAULT!)
    : (options.model || process.env.FAL_TEXT_TO_VIDEO_MODEL_DEFAULT!)
  
  const input: any = {
    prompt: options.prompt,
    duration: options.duration || 5,
    fps: options.fps || 24,
  }

  if (options.image_url) {
    input.image_url = options.image_url
  }

  const result = await fal.subscribe(model, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs?.map((log) => log.message).forEach(console.log)
      }
    },
  })

  return result.data
}
```

### Model Selection Service

```typescript
// lib/ai/model-selector.ts
export interface ModelOption {
  id: string
  name: string
  description: string
  type: 'text-to-image' | 'image-to-video' | 'text-to-video'
  envKey: string
}

export function getAvailableModels(type: string): ModelOption[] {
  const models: ModelOption[] = []
  
  // Dynamically load models from environment
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(`FAL_${type.toUpperCase().replace('-', '_')}_MODEL_`)) {
      const modelId = key.replace(`FAL_${type.toUpperCase().replace('-', '_')}_MODEL_`, '')
      const isDefault = modelId === 'DEFAULT'
      
      models.push({
        id: modelId,
        name: isDefault ? 'Default' : `Option ${modelId}`,
        description: process.env[key]!,
        type: type as any,
        envKey: key,
      })
    }
  })

  // Sort to put default first
  return models.sort((a, b) => a.id === 'DEFAULT' ? -1 : 1)
}

export function getModelByKey(envKey: string): string {
  return process.env[envKey] || process.env.FAL_TEXT_TO_IMAGE_MODEL_DEFAULT!
}
```

## BAML Integration

### BAML Configuration

```typescript
// lib/ai/baml-config.ts
import { BamlRuntime, createBamlRuntime } from '@boundaryml/baml'

// Initialize BAML runtime
export const baml = createBamlRuntime({
  // BAML configuration will be loaded from baml_src/
})

export interface ScriptGenerationParams {
  format: 'short-film' | 'feature-film' | 'series'
  length: number
  style: string
  genre?: string
  theme?: string
}

export interface SceneDescription {
  sceneNumber: number
  location: string
  timeOfDay: string
  characters: string[]
  action: string
  dialogue: string
  visualDescription: string
}
```

### BAML Templates

Create BAML templates in `/baml_src/`:

```baml
// baml_src/script_generation.baml
function GenerateScript(
  format: string,
  length: int,
  style: string,
  genre: string?,
  theme: string?
) -> string {
  client GPT4
  prompt #"
    Generate a complete movie script for a {{ format }} with the following specifications:
    
    Length: {{ length }} minutes
    Style: {{ style }}
    {% if genre %}Genre: {{ genre }}{% endif %}
    {% if theme %}Theme: {{ theme }}{% endif %}
    
    Format the script in standard screenplay format with:
    - Scene headings (INT./EXT. LOCATION - TIME)
    - Character names in caps
    - Action lines
    - Dialogue
    - Transitions
    
    Make it engaging and cinematically viable.
  "#
}

function GenerateSceneDescription(
  scene_text: string,
  style: string
) -> SceneDescription {
  client GPT4
  prompt #"
    Analyze this scene from a screenplay and generate a detailed visual description:
    
    Scene: {{ scene_text }}
    Visual Style: {{ style }}
    
    Provide:
    1. Location details
    2. Time of day/lighting
    3. Character descriptions and positions
    4. Key visual elements
    5. Camera suggestions
    6. Mood and atmosphere
    
    Format as structured data for AI image generation.
  "#
}
```

### Using BAML in Application

```typescript
// lib/ai/script-generator.ts
import { baml } from './baml-config'

export async function generateMovieScript(params: ScriptGenerationParams): Promise<string> {
  try {
    const script = await baml.GenerateScript(
      params.format,
      params.length,
      params.style,
      params.genre,
      params.theme
    )
    
    return script
  } catch (error) {
    console.error('Script generation failed:', error)
    throw new Error('Failed to generate script')
  }
}

export async function generateSceneDescription(
  sceneText: string,
  style: string
): Promise<SceneDescription> {
  try {
    const description = await baml.GenerateSceneDescription(sceneText, style)
    return description
  } catch (error) {
    console.error('Scene description generation failed:', error)
    throw new Error('Failed to generate scene description')
  }
}
```

## Unified AI Service

```typescript
// lib/ai/ai-service.ts
import { generateWithLLM, generateWithFallback } from './openrouter-client'
import { generateImage, generateVideo } from './fal-client'
import { generateMovieScript, generateSceneDescription } from './script-generator'

export class AIService {
  // Text Generation
  static async generateScript(params: ScriptGenerationParams): Promise<string> {
    return await generateMovieScript(params)
  }

  static async generateText(prompt: string, useAdvancedModel = false): Promise<string> {
    if (useAdvancedModel) {
      return await generateWithFallback(prompt)
    }
    return await generateWithLLM(prompt)
  }

  // Media Generation
  static async generateSceneImage(
    description: string,
    style: string,
    modelId?: string
  ): Promise<any> {
    const model = modelId ? getModelByKey(modelId) : undefined
    
    return await generateImage({
      model,
      prompt: `${description} in ${style} style`,
      width: 1920,
      height: 1080,
    })
  }

  static async generateSceneVideo(
    imageUrl: string,
    description: string,
    modelId?: string
  ): Promise<any> {
    const model = modelId ? getModelByKey(modelId) : undefined
    
    return await generateVideo({
      model,
      prompt: description,
      image_url: imageUrl,
      duration: 5,
      fps: 24,
    })
  }

  // Workflow Integration
  static async processWorkflowStep(
    step: string,
    data: any,
    options: any = {}
  ): Promise<any> {
    switch (step) {
      case 'script-generation':
        return await this.generateScript(data)
      
      case 'scene-description':
        return await generateSceneDescription(data.sceneText, data.style)
      
      case 'image-generation':
        return await this.generateSceneImage(
          data.description,
          data.style,
          options.modelId
        )
      
      case 'video-generation':
        return await this.generateSceneVideo(
          data.imageUrl,
          data.description,
          options.modelId
        )
      
      default:
        throw new Error(`Unknown workflow step: ${step}`)
    }
  }
}
```

## Error Handling & Retries

```typescript
// lib/ai/error-handling.ts
export class AIServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }
  
  throw new AIServiceError(
    `Operation failed after ${maxRetries} retries`,
    'retry-service',
    lastError
  )
}
```
