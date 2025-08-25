# Movie Production Workflow

## Overview

The movie production workflow is a step-by-step AI-driven process that transforms user input into a complete movie. Each step can be automated via AI or manually edited by the user.

## Workflow Architecture

### Core Principles

1. **AI-First Approach**: Each step has an AI generation button
2. **User Control**: All AI-generated content can be edited and regenerated
3. **Progressive Disclosure**: Steps are revealed progressively
4. **Collapsible Content**: Long text content is collapsed with clear headings
5. **Minimal Input**: Users provide format, length, and style to generate complete movies

## Workflow Steps

### 1. Project Initialization

```typescript
// lib/workflow/project-initialization.ts
export interface ProjectInitialization {
  title: string
  format: 'short-film' | 'feature-film' | 'series'
  length: number // in minutes
  style: 'cinematic-realism' | 'animation' | 'documentary' | 'experimental'
  genre?: string
  theme?: string
  targetAudience?: string
}

export async function initializeProject(data: ProjectInitialization) {
  const payload = await getPayload({ config: configPromise })

  const project = await payload.create({
    collection: 'projects',
    data: {
      ...data,
      status: 'draft',
      workflow: [
        { step: 'script-generation', status: 'pending', aiGenerated: false },
        { step: 'scene-breakdown', status: 'pending', aiGenerated: false },
        { step: 'character-development', status: 'pending', aiGenerated: false },
        { step: 'visual-planning', status: 'pending', aiGenerated: false },
        { step: 'image-generation', status: 'pending', aiGenerated: false },
        { step: 'video-generation', status: 'pending', aiGenerated: false },
        { step: 'audio-planning', status: 'pending', aiGenerated: false },
        { step: 'music-generation', status: 'pending', aiGenerated: false },
        { step: 'voice-generation', status: 'pending', aiGenerated: false },
        { step: 'scene-assembly', status: 'pending', aiGenerated: false },
        { step: 'audio-assembly', status: 'pending', aiGenerated: false },
        { step: 'final-assembly', status: 'pending', aiGenerated: false },
        { step: 'post-processing', status: 'pending', aiGenerated: false },
      ],
    },
  })

  return project
}
```

### 2. Script Generation

```typescript
// lib/workflow/script-generation.ts
export async function generateScript(projectId: string, userInput?: string) {
  const payload = await getPayload({ config: configPromise })
  const project = await payload.findByID({ collection: 'projects', id: projectId })

  const prompt = userInput || `
    Generate a ${project.format} script with the following specifications:
    - Length: ${project.length} minutes
    - Style: ${project.style}
    - Genre: ${project.genre || 'General'}
    - Theme: ${project.theme || 'Universal'}
    
    Format in standard screenplay format with scene headings, character names, action lines, and dialogue.
  `

  // Add to AI generation queue
  const job = await QueueService.addAIGenerationJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    type: 'script',
    prompt,
    parameters: {
      format: project.format,
      length: project.length,
      style: project.style,
    },
    createdAt: new Date(),
  })

  // Update workflow step
  await updateWorkflowStep(projectId, 'script-generation', 'generating', null, true)

  return job
}

export async function updateWorkflowStep(
  projectId: string,
  stepName: string,
  status: 'pending' | 'generating' | 'completed' | 'error',
  content?: string,
  aiGenerated?: boolean
) {
  const payload = await getPayload({ config: configPromise })
  const project = await payload.findByID({ collection: 'projects', id: projectId })

  const updatedWorkflow = project.workflow.map(step => {
    if (step.step === stepName) {
      return {
        ...step,
        status,
        content: content || step.content,
        aiGenerated: aiGenerated !== undefined ? aiGenerated : step.aiGenerated,
        updatedAt: new Date(),
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
```

### 3. Scene Breakdown

```typescript
// lib/workflow/scene-breakdown.ts
export async function generateSceneBreakdown(projectId: string, script: string) {
  const payload = await getPayload({ config: configPromise })
  const project = await payload.findByID({ collection: 'projects', id: projectId })

  const prompt = `
    Analyze this screenplay and break it down into individual scenes:
    
    ${script}
    
    For each scene, provide:
    1. Scene number
    2. Location (INT./EXT.)
    3. Time of day
    4. Characters present
    5. Key action/events
    6. Dialogue summary
    7. Visual description for AI generation
    8. Estimated duration
    
    Format as structured JSON for processing.
  `

  const job = await QueueService.addAIGenerationJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    type: 'scene-breakdown',
    prompt,
    parameters: { script },
    createdAt: new Date(),
  })

  await updateWorkflowStep(projectId, 'scene-breakdown', 'generating', null, true)

  return job
}
```

### 4. Visual Planning

```typescript
// lib/workflow/visual-planning.ts
export interface SceneVisual {
  sceneNumber: number
  location: string
  timeOfDay: string
  visualDescription: string
  cameraAngles: string[]
  lighting: string
  mood: string
  colorPalette: string[]
}

export async function generateVisualPlanning(projectId: string, scenes: any[]) {
  const payload = await getPayload({ config: configPromise })
  const project = await payload.findByID({ collection: 'projects', id: projectId })

  const prompt = `
    Create detailed visual planning for these scenes in ${project.style} style:
    
    ${JSON.stringify(scenes, null, 2)}
    
    For each scene, provide:
    1. Detailed visual description for AI image generation
    2. Camera angles and movements
    3. Lighting setup and mood
    4. Color palette
    5. Visual effects needed
    6. Props and set requirements
    
    Ensure consistency across scenes and adherence to ${project.style} style.
  `

  const job = await QueueService.addAIGenerationJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    type: 'visual-planning',
    prompt,
    parameters: { scenes, style: project.style },
    createdAt: new Date(),
  })

  await updateWorkflowStep(projectId, 'visual-planning', 'generating', null, true)

  return job
}
```

### 5. Media Generation Pipeline

```typescript
// lib/workflow/media-generation.ts
export async function generateSceneImages(projectId: string, visualPlans: SceneVisual[]) {
  const jobs = []

  for (const scene of visualPlans) {
    const prompt = `
      ${scene.visualDescription}
      Location: ${scene.location}
      Time: ${scene.timeOfDay}
      Mood: ${scene.mood}
      Lighting: ${scene.lighting}
      Style: cinematic, high quality, detailed
    `

    const job = await QueueService.addAIGenerationJob({
      id: crypto.randomUUID(),
      projectId,
      userId: 'system',
      type: 'image',
      prompt,
      parameters: {
        sceneNumber: scene.sceneNumber,
        width: 1920,
        height: 1080,
        style: 'cinematic',
      },
      createdAt: new Date(),
    })

    jobs.push(job)
  }

  await updateWorkflowStep(projectId, 'image-generation', 'generating', null, true)

  return jobs
}

export async function generateSceneVideos(projectId: string, sceneImages: any[]) {
  const jobs = []

  for (const image of sceneImages) {
    const job = await QueueService.addAIGenerationJob({
      id: crypto.randomUUID(),
      projectId,
      userId: 'system',
      type: 'video',
      prompt: `Animate this scene with subtle movement, maintaining cinematic quality`,
      parameters: {
        imageUrl: image.url,
        duration: 5,
        fps: 24,
        sceneNumber: image.sceneNumber,
      },
      createdAt: new Date(),
    })

    jobs.push(job)
  }

  await updateWorkflowStep(projectId, 'video-generation', 'generating', null, true)

  return jobs
}
```

### 6. Audio Generation

```typescript
// lib/workflow/audio-generation.ts
export async function generateAudioPlan(projectId: string, script: string) {
  const prompt = `
    Create an audio plan for this screenplay:
    
    ${script}
    
    Include:
    1. Voice-over requirements
    2. Dialogue timing
    3. Sound effects needed
    4. Background music style and timing
    5. Ambient sounds for each scene
    6. Audio transitions between scenes
    
    Provide detailed specifications for AI audio generation.
  `

  const job = await QueueService.addAIGenerationJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    type: 'audio-planning',
    prompt,
    parameters: { script },
    createdAt: new Date(),
  })

  await updateWorkflowStep(projectId, 'audio-planning', 'generating', null, true)

  return job
}
```

### 7. Assembly Pipeline

```typescript
// lib/workflow/assembly.ts
export async function assembleScenes(projectId: string) {
  const payload = await getPayload({ config: configPromise })
  
  // Get all scene videos
  const sceneVideos = await payload.find({
    collection: 'media',
    where: {
      projectId: { equals: projectId },
      mediaType: { equals: 'generated-video' },
    },
    sort: 'sceneNumber',
  })

  const videoUrls = sceneVideos.docs.map(video => video.url)

  // Add video stitching job
  const job = await QueueService.addMediaProcessingJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    type: 'video-stitch',
    inputFiles: videoUrls,
    outputPath: `/output/${projectId}/assembled-scenes.mp4`,
    parameters: {
      transition: 'cut',
      resolution: '1080p',
      fps: 24,
    },
    createdAt: new Date(),
  })

  await updateWorkflowStep(projectId, 'scene-assembly', 'generating', null, true)

  return job
}

export async function finalAssembly(projectId: string) {
  const payload = await getPayload({ config: configPromise })
  
  // Get assembled video and master audio
  const assembledVideo = await payload.findOne({
    collection: 'media',
    where: {
      projectId: { equals: projectId },
      mediaType: { equals: 'assembled-video' },
    },
  })

  const masterAudio = await payload.findOne({
    collection: 'media',
    where: {
      projectId: { equals: projectId },
      mediaType: { equals: 'master-audio' },
    },
  })

  // Final assembly with multiple output formats
  const job = await QueueService.addVideoAssemblyJob({
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    sceneVideos: [assembledVideo.url],
    masterAudio: masterAudio.url,
    outputFormats: ['mp4', 'webm', 'mov'],
    createdAt: new Date(),
  })

  await updateWorkflowStep(projectId, 'final-assembly', 'generating', null, true)

  return job
}
```

## Workflow UI Components

### Workflow Step Component

```typescript
// components/WorkflowStep.tsx
'use client'

import { useState } from 'react'
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface WorkflowStepProps {
  step: {
    step: string
    status: 'pending' | 'generating' | 'completed' | 'error'
    content?: string
    aiGenerated: boolean
  }
  onGenerate: () => void
  onEdit: (content: string) => void
  onRegenerate: () => void
}

export default function WorkflowStep({
  step,
  onGenerate,
  onEdit,
  onRegenerate,
}: WorkflowStepProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(step.content || '')

  const handleSave = () => {
    onEdit(editContent)
    setIsEditing(false)
  }

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          {step.step.replace('-', ' ')}
        </h3>
        
        <div className="flex items-center gap-2">
          {step.status === 'pending' && (
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              <SparklesIcon className="w-4 h-4" />
              Generate with AI
            </button>
          )}
          
          {step.status === 'generating' && (
            <div className="flex items-center gap-2 text-blue-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              Generating...
            </div>
          )}
          
          {step.status === 'completed' && step.content && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded"
              >
                <SparklesIcon className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1"
              >
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {step.status === 'completed' && step.content && isExpanded && (
        <div className="mt-4">
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-40 p-3 border rounded"
                placeholder="Edit content..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded">
              <pre className="whitespace-pre-wrap text-sm">
                {step.content}
              </pre>
              {step.aiGenerated && (
                <div className="text-xs text-blue-500 mt-2">
                  ✨ Generated by AI
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step.status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">
            Error occurred during generation. Please try again.
          </p>
        </div>
      )}
    </div>
  )
}
```

## Workflow Management API

```typescript
// app/v1/workflow/[projectId]/route.ts
import { WorkflowService } from '@/lib/workflow/workflow-service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  
  const workflow = await WorkflowService.getWorkflowStatus(projectId)
  return Response.json(workflow)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const { step, action, content } = await request.json()

  let result

  switch (action) {
    case 'generate':
      result = await WorkflowService.generateStep(projectId, step)
      break
    case 'edit':
      result = await WorkflowService.editStep(projectId, step, content)
      break
    case 'regenerate':
      result = await WorkflowService.regenerateStep(projectId, step)
      break
    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 })
  }

  return Response.json(result)
}
```
