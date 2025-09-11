import { NextRequest, NextResponse } from 'next/server'
import { CharacterGenerationService } from '@/lib/services/character-generation-service'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getBamlClient } from '@/lib/ai/baml-client'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Safely parse request body (allow empty body)
    let characters: string[] | undefined
    try {
      const raw = await request.text()
      if (raw && raw.trim().length > 0) {
        const data = JSON.parse(raw)
        if (data && Array.isArray(data.characters)) {
          characters = data.characters
        }
      }
    } catch (_) {
      // Ignore JSON parse errors; we'll derive characters from project/story below
    }

    // Get project data
    const payload = await getPayload({ config })
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2,
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 },
      )
    }

    // If no characters provided, derive them from BAML DevelopCharacters using project/story context
    if (!characters || characters.length === 0) {
      const bamlClient = await getBamlClient()

      const storyContent = project.storyStructure?.content || project.initialConcept?.premise || ''
      const movieFormat =
        typeof project.movieFormat === 'object'
          ? project.movieFormat?.name || 'Short Film'
          : project.movieFormat || 'Short Film'
      const movieStyle =
        typeof project.movieStyle === 'object'
          ? project.movieStyle?.name || 'Cinematic'
          : project.movieStyle || 'Cinematic'
      const genres = Array.isArray(project.initialConcept?.genre)
        ? project.initialConcept.genre.map((g: any) => (typeof g === 'object' ? g.name : g))
        : []
      const targetAudience = Array.isArray(project.initialConcept?.targetAudience)
        ? project.initialConcept.targetAudience.map((ta: any) =>
            typeof ta === 'object' ? ta.name : ta,
          )
        : []
      const characterArcs = project.storyStructure?.characterArcs || []
      const storyBeats = project.storyStructure?.storyBeats || []

      const devResult = await bamlClient.DevelopCharacters(
        storyContent,
        project.name,
        movieFormat,
        movieStyle,
        project.durationUnit || 15,
        genres,
        targetAudience,
        characterArcs,
        storyBeats,
      )

      if (devResult?.characters && Array.isArray(devResult.characters)) {
        characters = devResult.characters.map((c: any) => c?.name).filter(Boolean)
      }
    }

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No characters provided and none could be derived from the project/story context',
        },
        { status: 400 },
      )
    }

    console.log(`🎬 Starting character development for project: ${project.name}`)
    console.log(`👥 Characters to generate: ${characters.join(', ')}`)

    const characterGenerationService = new CharacterGenerationService()
    const results: any[] = []

    // Generate characters sequentially to avoid overwhelming the Character Library
    for (const characterName of characters) {
      console.log(`🎭 Processing character: ${characterName}`)

      const result = await characterGenerationService.generateAndStoreCharacter(
        projectId,
        characterName,
        project,
        'supporting', // Default role, can be updated later
      )

      results.push({
        name: characterName,
        ...result,
      })

      // Brief pause between characters
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    console.log(
      `✅ Character development complete: ${successCount} success, ${failureCount} failed`,
    )

    return NextResponse.json({
      success: true,
      message: `Generated ${successCount} characters successfully`,
      characters: results,
      summary: {
        total: characters.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error('❌ Character development failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Character development failed',
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const projectId = resolvedParams.id
    const characterGenerationService = new CharacterGenerationService()

    const characters = await characterGenerationService.getProjectCharacters(projectId)

    return NextResponse.json({
      success: true,
      characters,
      count: characters.length,
    })
  } catch (error) {
    console.error('❌ Failed to fetch project characters:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch characters',
      },
      { status: 500 },
    )
  }
}
