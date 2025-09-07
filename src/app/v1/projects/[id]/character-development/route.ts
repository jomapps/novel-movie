import { NextRequest, NextResponse } from 'next/server'
import { CharacterGenerationService } from '@/lib/services/character-generation-service'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { characters } = await request.json()
    const resolvedParams = await params
    const projectId = resolvedParams.id

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Characters array is required',
        },
        { status: 400 },
      )
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

    console.log(`🎬 Starting character development for project: ${project.name}`)
    console.log(`👥 Characters to generate: ${characters.join(', ')}`)

    const characterGenerationService = new CharacterGenerationService()
    const results = []

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
    const failureCount = results.filter((r) => !r.success).length

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
