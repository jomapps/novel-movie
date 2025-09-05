import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getBamlClient } from '@/lib/ai/baml-client'

// Duration-adaptive story structure constraints
interface DurationConstraints {
  formatCategory: string
  structureType: string
  maxStoryBeats: number
  maxCharacters: number
  maxLocations: number
  maxSubplots: number
  beatsPerMinute: number
  actRatios: {
    act1: number
    act2: number
    act3: number
  }
  complexityLevel: 'minimal' | 'simple' | 'moderate' | 'complex' | 'epic'
  pacingGuidelines: string[]
  structureDescription: string
}

function getDurationConstraints(durationUnit: number): DurationConstraints {
  if (durationUnit <= 2) {
    return {
      formatCategory: 'Micro-format',
      structureType: 'single-moment',
      maxStoryBeats: 4,
      maxCharacters: 2,
      maxLocations: 1,
      maxSubplots: 0,
      beatsPerMinute: 2.0,
      actRatios: { act1: 0.2, act2: 0.6, act3: 0.2 },
      complexityLevel: 'minimal',
      pacingGuidelines: [
        'Immediate story entry - no setup time',
        'Single moment/conflict focus',
        'Visual storytelling over dialogue',
        'Every second must advance core conflict',
      ],
      structureDescription:
        'Single Moment Structure: One dramatic moment/realization with immediate impact',
    }
  } else if (durationUnit <= 5) {
    return {
      formatCategory: 'Ultra-short',
      structureType: 'compressed-three-act',
      maxStoryBeats: 6,
      maxCharacters: 3,
      maxLocations: 2,
      maxSubplots: 0,
      beatsPerMinute: 1.2,
      actRatios: { act1: 0.2, act2: 0.6, act3: 0.2 },
      complexityLevel: 'simple',
      pacingGuidelines: [
        'Quick setup with immediate conflict engagement',
        'Compressed three-act structure',
        'Essential dialogue only',
        'Single narrative thread',
      ],
      structureDescription: 'Compressed Three-Act: Rapid three-act with immediate engagement',
    }
  } else if (durationUnit <= 30) {
    return {
      formatCategory: 'Short film',
      structureType: 'traditional-three-act',
      maxStoryBeats: 12,
      maxCharacters: 5,
      maxLocations: 4,
      maxSubplots: 1,
      beatsPerMinute: 0.4,
      actRatios: { act1: 0.25, act2: 0.5, act3: 0.25 },
      complexityLevel: 'moderate',
      pacingGuidelines: [
        'Efficient setup with proper development time',
        'Traditional three-act with compressed arcs',
        'One minor subplot maximum',
        'Balanced character and plot development',
      ],
      structureDescription:
        'Traditional Three-Act: Classic beginning/middle/end with full character arc',
    }
  } else if (durationUnit <= 60) {
    return {
      formatCategory: 'Medium format',
      structureType: 'five-act',
      maxStoryBeats: 18,
      maxCharacters: 8,
      maxLocations: 8,
      maxSubplots: 2,
      beatsPerMinute: 0.3,
      actRatios: { act1: 0.2, act2: 0.25, act3: 0.25 }, // Five-act ratios: 20% + 25% + 10% + 25% + 20%
      complexityLevel: 'moderate',
      pacingGuidelines: [
        'Full character development time',
        'Subplot integration with main narrative',
        'Building tension with proper pacing',
        'Character relationships drive story',
      ],
      structureDescription: 'Five-Act Structure: Extended development with multiple turning points',
    }
  } else if (durationUnit <= 120) {
    return {
      formatCategory: 'Feature length',
      structureType: 'save-the-cat',
      maxStoryBeats: 15, // Save the Cat has exactly 15 beats
      maxCharacters: 12,
      maxLocations: 15,
      maxSubplots: 3,
      beatsPerMinute: 0.125, // 15 beats / 120 minutes
      actRatios: { act1: 0.25, act2: 0.5, act3: 0.25 },
      complexityLevel: 'complex',
      pacingGuidelines: [
        "Blake Snyder's proven 15-beat structure",
        'Precise timing for each story beat',
        'Complex character development',
        'Multiple subplot integration',
      ],
      structureDescription:
        "Save the Cat Beat Sheet: Blake Snyder's proven 15-beat Hollywood structure",
    }
  } else {
    return {
      formatCategory: 'Extended format',
      structureType: 'eight-sequence',
      maxStoryBeats: 32, // 8 sequences × 4 beats per sequence
      maxCharacters: 20,
      maxLocations: 25,
      maxSubplots: 5,
      beatsPerMinute: 0.13, // 32 beats / 240 minutes (4 hours)
      actRatios: { act1: 0.3, act2: 0.45, act3: 0.25 },
      complexityLevel: 'epic',
      pacingGuidelines: [
        'Eight mini-movies, each with its own arc',
        'Multiple climactic moments across sequences',
        'Expansive world-building and character development',
        'Sustained engagement across extended runtime',
      ],
      structureDescription: 'Eight-Sequence Structure: Eight mini-movies creating epic scope',
    }
  }
}

function validateStoryStructureCompliance(
  structureResult: any,
  constraints: DurationConstraints,
  durationUnit: number,
): {
  isCompliant: boolean
  warnings: string[]
  recommendations: string[]
  qualityAdjustments: number
} {
  const warnings: string[] = []
  const recommendations: string[] = []
  let qualityAdjustments = 0

  // Validate story beats count
  const storyBeatsCount = structureResult.storyBeats?.length || 0
  if (storyBeatsCount > constraints.maxStoryBeats) {
    warnings.push(
      `Too many story beats (${storyBeatsCount}) for ${constraints.formatCategory} format. Maximum recommended: ${constraints.maxStoryBeats}`,
    )
    recommendations.push(`Consolidate story beats to focus on essential narrative moments`)
    qualityAdjustments -= 10
  }

  // Validate act duration ratios
  const actStructure = structureResult.actStructure || structureResult.threeActStructure
  if (actStructure) {
    const totalActDuration =
      (actStructure.act1?.duration || 0) +
      (actStructure.act2?.duration || 0) +
      (actStructure.act3?.duration || 0)

    if (totalActDuration > durationUnit * 1.1) {
      warnings.push(
        `Act durations (${totalActDuration} min) exceed target duration (${durationUnit} min)`,
      )
      recommendations.push(
        `Compress act durations to fit ${constraints.formatCategory} constraints`,
      )
      qualityAdjustments -= 15
    }
  }

  // Validate subplot complexity
  const subplotsCount = structureResult.subplots?.length || 0
  if (subplotsCount > constraints.maxSubplots) {
    warnings.push(
      `Too many subplots (${subplotsCount}) for ${constraints.formatCategory}. Maximum: ${constraints.maxSubplots}`,
    )
    recommendations.push(`Remove or consolidate subplots to maintain focus`)
    qualityAdjustments -= 12
  }

  // Validate character count from character arcs
  const characterCount = structureResult.characterArcs?.length || 0
  if (characterCount > constraints.maxCharacters) {
    warnings.push(
      `Too many main characters (${characterCount}) for ${constraints.formatCategory}. Maximum recommended: ${constraints.maxCharacters}`,
    )
    recommendations.push(`Focus on fewer characters with deeper development`)
    qualityAdjustments -= 8
  }

  // Pacing validation
  const averageBeatsPerMinute = storyBeatsCount / durationUnit
  if (averageBeatsPerMinute > constraints.beatsPerMinute * 1.5) {
    warnings.push(
      `Pacing too fast (${averageBeatsPerMinute.toFixed(1)} beats/min) for sustainable storytelling`,
    )
    recommendations.push(`Slow down pacing to allow for proper story development`)
    qualityAdjustments -= 5
  } else if (averageBeatsPerMinute < constraints.beatsPerMinute * 0.5) {
    warnings.push(
      `Pacing too slow (${averageBeatsPerMinute.toFixed(1)} beats/min) may lose audience engagement`,
    )
    recommendations.push(`Increase story beat frequency to maintain engagement`)
    qualityAdjustments -= 5
  }

  return {
    isCompliant: warnings.length === 0,
    warnings,
    recommendations,
    qualityAdjustments,
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Check for force regeneration parameter
    const url = new URL(request.url)
    const forceRegenerate = url.searchParams.get('force') === 'true'

    // Fetch the project with related data
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2,
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // STEP 1: ESTABLISH DURATION-ADAPTIVE PARAMETERS
    const durationUnit = project.durationUnit || 90
    const constraints = getDurationConstraints(durationUnit)

    console.log(`\n=== DURATION-ADAPTIVE STORY STRUCTURE GENERATION ===`)
    console.log(`Project: ${project.name}`)
    console.log(`Target Duration: ${durationUnit} minutes`)
    console.log(`Format Category: ${constraints.formatCategory}`)
    console.log(`Structure Type: ${constraints.structureType}`)
    console.log(`Complexity Level: ${constraints.complexityLevel}`)
    console.log(`Structure Description: ${constraints.structureDescription}`)
    console.log(`\nConstraints Applied:`)
    console.log(`- Story Beats: ${constraints.maxStoryBeats} maximum`)
    console.log(`- Characters: ${constraints.maxCharacters} maximum`)
    console.log(`- Locations: ${constraints.maxLocations} maximum`)
    console.log(`- Subplots: ${constraints.maxSubplots} maximum`)
    console.log(`- Pacing: ${constraints.beatsPerMinute} beats/minute`)
    console.log(
      `- Act Ratios: ${Math.round(constraints.actRatios.act1 * 100)}% / ${Math.round(constraints.actRatios.act2 * 100)}% / ${Math.round(constraints.actRatios.act3 * 100)}%`,
    )
    console.log(`\nPacing Guidelines:`)
    constraints.pacingGuidelines.forEach((guideline, i) => {
      console.log(`${i + 1}. ${guideline}`)
    })
    console.log(`=====================================================\n`)

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

    // Check if story structure already exists (unless force regeneration)
    if (!forceRegenerate) {
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
    } else {
      // Delete existing structure if force regeneration
      const existingStructure = await payload.find({
        collection: 'story-structures',
        where: {
          project: {
            equals: projectId,
          },
        },
      })

      if (existingStructure.docs.length > 0) {
        await payload.delete({
          collection: 'story-structures',
          id: existingStructure.docs[0].id,
        })
        console.log(`🗑️  Deleted existing structure for force regeneration`)
      }
    }

    // Use previously established duration-adaptive constraints

    // Generate story structure using BAML with duration awareness
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
      durationUnit,
      project.primaryGenres?.map((g: any) => (typeof g === 'string' ? g : g.name)) || [],
      project.targetAudience?.map((a: any) => (typeof a === 'string' ? a : a.name)) || [],
    )

    const processingTime = Math.round((Date.now() - startTime) / 1000)

    // Validate structure compliance with duration constraints
    const compliance = validateStoryStructureCompliance(structureResult, constraints, durationUnit)

    // Extract and adjust quality score based on compliance
    let qualityScore =
      structureResult.qualityScore || structureResult.qualityAssessment?.overallScore || 0
    qualityScore = Math.max(0, Math.min(100, qualityScore + compliance.qualityAdjustments))

    // Extract narrative structure data
    const narrativeStructure = structureResult.narrativeStructure
    const structureType = narrativeStructure?.structureType || 'traditional-three-act'

    console.log(`Generated Structure Type: ${structureType}`)
    console.log(`Adaptive Acts: ${narrativeStructure?.adaptiveActs?.length || 0}`)
    if (narrativeStructure?.sequences) {
      console.log(`Sequences: ${narrativeStructure.sequences.length}`)
    }
    if (narrativeStructure?.saveTheCatBeats) {
      console.log(`Save the Cat Beats: ${narrativeStructure.saveTheCatBeats.length}`)
    }

    // Calculate correct act durations in seconds (BAML often generates incorrect values)
    const calculateActDuration = (actIndex: number, totalDurationMinutes: number): number => {
      const durationInSeconds = totalDurationMinutes * 60
      const actPercentages = [0.2, 0.6, 0.2] // Act 1: 20%, Act 2: 60%, Act 3: 20%
      return Math.round(durationInSeconds * actPercentages[actIndex])
    }

    // Create the story structure record with adaptive structure
    const storyStructure = await payload.create({
      collection: 'story-structures',
      data: {
        project: projectId,
        projectName: project.name || 'Untitled Project',
        story: story.id,

        // Store narrative structure information
        narrativeStructureType: structureType,
        adaptiveStructure: {
          structureType,
          acts:
            narrativeStructure?.adaptiveActs?.map((act: any, index: number) => ({
              actNumber: act.actNumber,
              name: act.name,
              description: act.description,
              duration: calculateActDuration(index, project.durationUnit), // Use calculated duration
              keyEvents: (act.keyEvents || []).map((event: string) => ({ event })),
              purpose: act.purpose,
            })) || [],
          sequences:
            narrativeStructure?.sequences?.map((seq: any) => ({
              sequenceNumber: seq.sequenceNumber,
              name: seq.name,
              description: seq.description,
              duration: seq.duration,
              miniMovieArc: seq.miniMovieArc,
              keyBeats: (seq.keyBeats || []).map((beat: string) => ({ beat })),
            })) || [],
          saveTheCatBeats:
            narrativeStructure?.saveTheCatBeats?.map((beat: any) => ({
              beatNumber: beat.beatNumber,
              name: beat.name,
              description: beat.description,
              pageNumber: beat.pageNumber,
              timing: beat.timing,
              purpose: beat.purpose,
            })) || [],
        },

        // Legacy actStructure for backward compatibility (using first 3 acts if available)
        actStructure:
          narrativeStructure?.adaptiveActs?.length >= 3
            ? {
                act1: {
                  setup: narrativeStructure.adaptiveActs[0]?.description || '',
                  incitingIncident: narrativeStructure.adaptiveActs[0]?.keyEvents?.[0] || '',
                  plotPoint1: narrativeStructure.adaptiveActs[0]?.keyEvents?.[1] || '',
                  duration: calculateActDuration(0, project.durationUnit), // Use calculated duration
                },
                act2: {
                  confrontation: narrativeStructure.adaptiveActs[1]?.description || '',
                  midpoint: narrativeStructure.adaptiveActs[1]?.keyEvents?.[0] || '',
                  plotPoint2: narrativeStructure.adaptiveActs[1]?.keyEvents?.[1] || '',
                  duration: calculateActDuration(1, project.durationUnit), // Use calculated duration
                },
                act3: {
                  climax: narrativeStructure.adaptiveActs[2]?.keyEvents?.[0] || '',
                  fallingAction: narrativeStructure.adaptiveActs[2]?.keyEvents?.[1] || '',
                  resolution: narrativeStructure.adaptiveActs[2]?.description || '',
                  duration: calculateActDuration(2, project.durationUnit), // Use calculated duration
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
          character: arc.character || arc.characterName || 'Orion',
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
        // Duration-adaptive compliance data
        durationCompliance: {
          formatCategory: constraints.formatCategory,
          targetDuration: durationUnit,
          isCompliant: compliance.isCompliant,
          complexityLevel: constraints.complexityLevel,
          constraints: {
            maxStoryBeats: constraints.maxStoryBeats,
            maxCharacters: constraints.maxCharacters,
            maxLocations: constraints.maxLocations,
            maxSubplots: constraints.maxSubplots,
            beatsPerMinute: constraints.beatsPerMinute,
          },
          actualMetrics: {
            storyBeatsCount: structureResult.storyBeats?.length || 0,
            characterCount: structureResult.characterArcs?.length || 0,
            subplotCount: structureResult.subplots?.length || 0,
            averageBeatsPerMinute: (structureResult.storyBeats?.length || 0) / durationUnit,
          },
          warnings: compliance.warnings.map((warning) => ({ warning })),
          recommendations: compliance.recommendations.map((recommendation) => ({ recommendation })),
          pacingGuidelines: constraints.pacingGuidelines.map((guideline) => ({ guideline })),
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
