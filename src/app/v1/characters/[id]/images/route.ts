import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing character reference id' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Fetch images
    const results = await payload.find({
      collection: 'character-image-metadata',
      where: { characterReference: { equals: id } },
      depth: 1,
      sort: '-createdAt',
      limit: 100,
    })

    // Fetch character reference to surface library IDs in UI
    const characterRef = await payload.findByID({
      collection: 'character-references',
      id,
      depth: 0,
    })

    const character = characterRef
      ? {
          id: (characterRef as any).id,
          name: (characterRef as any).projectCharacterName,
          libraryDbId:
            (characterRef as any).libraryDbId ||
            (characterRef as any).libraryIntegration?.libraryDbId ||
            null,
          libraryCharacterId:
            (characterRef as any).libraryCharacterId ||
            (characterRef as any).libraryIntegration?.libraryCharacterId ||
            null,
          libraryAssets: {
            masterReferencePublicUrl:
              (characterRef as any).libraryAssets?.masterReferencePublicUrl || null,
            coreSetGenerated: (characterRef as any).libraryAssets?.coreSetGenerated || false,
            coreSetCount: (characterRef as any).libraryAssets?.coreSetCount || 0,
          },
        }
      : null

    return NextResponse.json({
      success: true,
      count: results.totalDocs,
      images: results.docs,
      character,
    })
  } catch (error) {
    console.error('List character images error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list images' },
      { status: 500 },
    )
  }
}
