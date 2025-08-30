import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  generateInitialStoryWithBAML,
  extractProjectStoryData,
  validateProjectForStoryGeneration,
  generateFallbackStory,
} from '@/lib/ai/story-generation'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Fetch the project data
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2, // Include related data
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Validate project has minimum required data for story generation
    const validation = validateProjectForStoryGeneration(project)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Project missing required fields for story generation',
          missingFields: validation.missingFields,
        },
        { status: 400 },
      )
    }

    // Check if story already exists for this project
    const existingStory = await payload.find({
      collection: 'stories',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    if (existingStory.docs.length > 0) {
      return NextResponse.json(existingStory.docs[0], { status: 200 })
    }

    // Generate initial story content using BAML
    const projectStoryData = extractProjectStoryData(project)
    let storyResult

    try {
      storyResult = await generateInitialStoryWithBAML(projectStoryData)
    } catch (error) {
      console.warn('BAML story generation failed, using fallback:', error)
      storyResult = generateFallbackStory(projectStoryData)
    }

    // Create the story record with BAML-generated content and metrics
    const story = await payload.create({
      collection: 'stories',
      data: {
        project: projectId,
        projectName: project.name || 'Unknown Project',
        currentContent: storyResult.storyContent,
        currentStep: 3, // Initial generation is step 3
        status: 'in-progress',
        qualityMetrics: storyResult.qualityMetrics,
        generationParameters: {
          model: 'baml-openrouter-advanced',
          temperature: 0.8,
          maxTokens: 4000,
          prompt: 'initial-story-generation-comprehensive',
        },
        enhancementHistory: [
          {
            stepNumber: 3,
            stepName: 'initial-generation',
            startTime: new Date(),
            endTime: new Date(),
            processingTime: 0,
            contentBefore: '',
            contentAfter: storyResult.storyContent,
            qualityBefore: {
              overallQuality: 0,
              structureScore: 0,
              characterDepth: 0,
              coherenceScore: 0,
              conflictTension: 0,
              dialogueQuality: 0,
              genreAlignment: 0,
              audienceEngagement: 0,
              visualStorytelling: 0,
              productionReadiness: 0,
            },
            qualityAfter: storyResult.qualityMetrics,
            improvementsMade: [
              { improvement: 'Initial story generation using comprehensive project data' },
              { improvement: storyResult.generationNotes || 'Generated complete story structure' },
            ],
          },
        ],
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error generating story:', error)
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 })
  }
}
