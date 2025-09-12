import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterLibraryClient } from '@/lib/services/character-library-client'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing character reference id' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Fetch the character reference (Single Source Architecture)
    const characterRef = await payload.findByID({
      collection: 'character-references',
      id,
      depth: 2,
    })

    if (!characterRef) {
      return NextResponse.json(
        { success: false, error: 'Character reference not found' },
        { status: 404 },
      )
    }

    if (!characterRef.libraryCharacterId) {
      return NextResponse.json(
        { success: false, error: 'Character not linked to Character Library' },
        { status: 400 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const sceneContext: string = body?.sceneContext || body?.prompt || ''
    const sceneType: string = body?.sceneType || 'dialogue'
    const mood: string | undefined = body?.mood
    const lighting: string | undefined = body?.lighting

    if (!sceneContext || sceneContext.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'sceneContext (or prompt) is required' },
        { status: 400 },
      )
    }

    const response = await characterLibraryClient.generateSceneSpecificImage(
      characterRef.libraryCharacterId,
      { description: sceneContext, type: sceneType, mood, lighting },
    )

    // Ingest generated scene image into Media and create metadata record
    try {
      const imageUrl: string | undefined = response?.publicUrl || response?.imageUrl
      if (imageUrl) {
        const downloadRes = await fetch(imageUrl)
        if (!downloadRes.ok) {
          throw new Error(
            `Failed to download scene image: ${downloadRes.status} ${downloadRes.statusText}`,
          )
        }
        const contentType = downloadRes.headers.get('content-type') || 'image/jpeg'
        const filenameGuess =
          (response?.filename as string) ||
          (() => {
            try {
              return new URL(imageUrl).pathname.split('/').pop() || 'image.jpg'
            } catch {
              return 'image.jpg'
            }
          })()
        const arrayBuffer = await downloadRes.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const media = await payload.create({
          collection: 'media',
          data: { alt: `${characterRef.projectCharacterName} - scene image` },
          file: { data: buffer as any, filename: filenameGuess, mimeType: contentType } as any,
        })

        await payload.create({
          collection: 'character-image-metadata',
          data: {
            characterReference: characterRef.id,
            media: (media as any).id,
            kind: 'scene',
            provider: 'character-library',
            prompt: sceneContext,
            sourceUrl: imageUrl,
            externalId:
              (response?.imageId as string) || (response?.dinoAssetId as string) || undefined,
            status: response?.success === false ? 'failed' : 'succeeded',
            metrics: {},
          },
        })
      }
    } catch (ingestErr) {
      console.warn('Non-fatal: failed to ingest scene image into Media/Metadata:', ingestErr)
    }

    // Persist last image update timestamp (best-effort)
    try {
      await payload.update({
        collection: 'character-references',
        id: characterRef.id,
        data: {
          generationMetadata: {
            ...(characterRef.generationMetadata || {}),
            lastImageUpdate: new Date().toISOString(),
          },
        },
      })
    } catch {}

    return NextResponse.json({ success: response?.success !== false, data: response })
  } catch (error) {
    console.error('Generate scene image error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Scene image generation failed',
      },
      { status: 500 },
    )
  }
}
