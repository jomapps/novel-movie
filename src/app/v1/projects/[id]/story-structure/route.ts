import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getBamlClient } from '@/lib/ai/baml-client'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Fetch the project with related data
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2,
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Fetch the associated story
    const storyQuery = await payload.find({
      collection: 'stories',
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 1,
    })

    if (storyQuery.docs.length === 0) {
      return NextResponse.json(
        { error: 'No story found for this project. Please complete story development first.' },
        { status: 400 },
      )
    }

    const story = storyQuery.docs[0]

    // Check if story is ready for structure planning
    if (!story.currentContent || story.currentContent.trim().length < 500) {
      return NextResponse.json(
        {
          error:
            'Story content is too short for structure analysis. Please enhance the story first.',
        },
        { status: 400 },
      )
    }

    // Check if story structure already exists
    const existingStructure = await payload.find({
      collection: 'story-structures',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    if (existingStructure.docs.length > 0) {
      return NextResponse.json(existingStructure.docs[0], { status: 200 })
    }

    // Generate story structure using BAML
    const startTime = Date.now()

    const baml = await getBamlClient()
    const structureResult = await baml.AnalyzeStoryStructure(
      story.currentContent,
      project.name || 'Untitled Project',
      typeof project.movieFormat === 'string'
        ? project.movieFormat
        : project.movieFormat?.slug || 'feature-film',
      typeof project.movieStyle === 'string'
        ? project.movieStyle
        : project.movieStyle?.slug || 'dramatic',
      project.durationUnit || 90,
      project.primaryGenres?.map((g: any) => (typeof g === 'string' ? g : g.name)) || [],
      project.targetAudience?.map((a: any) => (typeof a === 'string' ? a : a.name)) || [],
    )

    const processingTime = Math.round((Date.now() - startTime) / 1000)

    // Extract quality score from either direct field or qualityAssessment
    const qualityScore =
      structureResult.qualityScore || structureResult.qualityAssessment?.overallScore || 0

    // Use either actStructure or threeActStructure
    const actData = structureResult.actStructure || structureResult.threeActStructure

    // Create the story structure record
    const storyStructure = await payload.create({
      collection: 'story-structures',
      data: {
        project: projectId,
        projectName: project.name || 'Untitled Project',
        story: story.id,
        actStructure: actData
          ? {
              act1: {
                setup: actData.act1?.setup || actData.act1_setup?.keyEvents?.setup || '',
                incitingIncident:
                  actData.act1?.incitingIncident ||
                  actData.act1_setup?.keyEvents?.incitingIncident ||
                  '',
                plotPoint1:
                  actData.act1?.plotPoint1 || actData.act1_setup?.keyEvents?.plotPoint1 || '',
                duration:
                  actData.act1?.duration ||
                  parseInt(actData.act1_setup?.duration?.replace(/\D/g, '') || '0') ||
                  0,
              },
              act2: {
                confrontation:
                  actData.act2?.confrontation ||
                  actData.act2_confrontation?.keyEvents?.risingAction ||
                  '',
                midpoint:
                  actData.act2?.midpoint || actData.act2_confrontation?.keyEvents?.midpoint || '',
                plotPoint2:
                  actData.act2?.plotPoint2 ||
                  actData.act2_confrontation?.keyEvents?.plotPoint2 ||
                  '',
                duration:
                  actData.act2?.duration ||
                  parseInt(actData.act2_confrontation?.duration?.replace(/\D/g, '') || '0') ||
                  0,
              },
              act3: {
                climax: actData.act3?.climax || actData.act3_resolution?.keyEvents?.climax || '',
                fallingAction:
                  actData.act3?.fallingAction ||
                  actData.act3_resolution?.keyEvents?.fallingAction ||
                  '',
                resolution:
                  actData.act3?.resolution || actData.act3_resolution?.keyEvents?.resolution || '',
                duration:
                  actData.act3?.duration ||
                  parseInt(actData.act3_resolution?.duration?.replace(/\D/g, '') || '0') ||
                  0,
              },
            }
          : undefined,
        storyBeats: structureResult.storyBeats.map((beat: any) => ({
          beat: beat.beat || beat.beatId?.toString() || '',
          timing:
            beat.timing || parseInt(beat.timestamp?.split('-')[0]?.replace(/\D/g, '') || '0') || 0,
          description: beat.description,
          characters: (beat.characters || beat.charactersPresent || []).map((char: string) => ({
            character: char,
          })),
          emotionalTone: beat.emotionalTone,
        })),
        characterArcs: structureResult.characterArcs.map((arc: any) => ({
          character: arc.character || arc.characterName || '',
          startState: arc.startState || arc.startingState || '',
          endState: arc.endState || arc.endingState || '',
          transformation:
            arc.transformation || arc.transformationProcess || arc.arcDescription || '',
          keyMoments: (arc.keyMoments || []).map((moment: string) => ({ moment })),
        })),
        subplots: structureResult.subplots.map((subplot: any) => ({
          name: subplot.name || subplot.subplotName || '',
          description: subplot.description,
          resolution: subplot.resolution,
          charactersInvolved: (subplot.charactersInvolved || subplot.involvedCharacters || []).map(
            (char: string) => ({
              character: char,
            }),
          ),
        })),
        generationMetadata: {
          generatedAt: new Date().toISOString(),
          processingTime,
          qualityScore,
          generationNotes: structureResult.generationNotes || 'Generated via AI analysis',
        },
        status: 'generated',
      },
    })

    return NextResponse.json(storyStructure, { status: 201 })
  } catch (error) {
    console.error('Error generating story structure:', error)
    return NextResponse.json({ error: 'Failed to generate story structure' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Find existing story structure for this project
    const storyStructure = await payload.find({
      collection: 'story-structures',
      where: {
        project: {
          equals: projectId,
        },
      },
      depth: 2,
    })

    if (storyStructure.docs.length === 0) {
      return NextResponse.json(
        { error: 'No story structure found for this project' },
        { status: 404 },
      )
    }

    return NextResponse.json(storyStructure.docs[0], { status: 200 })
  } catch (error) {
    console.error('Error fetching story structure:', error)
    return NextResponse.json({ error: 'Failed to fetch story structure' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id
    const { status } = await request.json()

    // Find existing story structure
    const existingStructure = await payload.find({
      collection: 'story-structures',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    if (existingStructure.docs.length === 0) {
      return NextResponse.json(
        { error: 'No story structure found for this project' },
        { status: 404 },
      )
    }

    // Update the story structure status
    const updatedStructure = await payload.update({
      collection: 'story-structures',
      id: existingStructure.docs[0].id,
      data: {
        status,
      },
    })

    return NextResponse.json(updatedStructure, { status: 200 })
  } catch (error) {
    console.error('Error updating story structure:', error)
    return NextResponse.json({ error: 'Failed to update story structure' }, { status: 500 })
  }
}
