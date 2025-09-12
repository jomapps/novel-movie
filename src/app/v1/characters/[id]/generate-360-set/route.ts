import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterLibraryClient } from '@/lib/services/character-library-client'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const response = await characterLibraryClient.generate360ImageSet(
      characterRef.libraryCharacterId,
      { imageCount: 8, style: 'character_turnaround', qualityThreshold: 70 },
    )

    // Ingest each generated image into Media and create metadata records
    try {
      const images: Array<any> = (response?.images as any[]) || []
      for (const img of images) {
        const imageUrl: string | undefined = img?.publicUrl || img?.url || img?.imageUrl
        if (!imageUrl) continue

        const downloadRes = await fetch(imageUrl)
        if (!downloadRes.ok) continue
        const contentType = downloadRes.headers.get('content-type') || 'image/jpeg'
        const filenameGuess =
          (img?.filename as string) ||
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
          data: { alt: `${characterRef.projectCharacterName} - 360 portfolio` },
          file: { data: buffer as any, filename: filenameGuess, mimeType: contentType } as any,
        })

        await payload.create({
          collection: 'character-image-metadata',
          data: {
            characterReference: characterRef.id,
            media: (media as any).id,
            kind: 'portfolioItem',
            provider: 'character-library',
            prompt: undefined,
            sourceUrl: imageUrl,
            externalId: (img?.imageId as string) || (img?.dinoAssetId as string) || undefined,
            status: 'succeeded',
            metrics: {},
          },
        })
      }
    } catch (ingestErr) {
      console.warn('Non-fatal: failed to ingest 360 set images:', ingestErr)
    }

    // Persist quick verification fields (best-effort)
    try {
      await payload.update({
        collection: 'character-references',
        id: characterRef.id,
        data: {
          libraryAssets: {
            ...(characterRef.libraryAssets || {}),
            coreSetGenerated: true,
            coreSetCount:
              (response?.images as any[])?.length ||
              0 ||
              characterRef?.libraryAssets?.coreSetCount ||
              0,
          },
          generationMetadata: {
            ...(characterRef.generationMetadata || {}),
            lastImageUpdate: new Date().toISOString(),
          },
        },
      })
    } catch {}

    return NextResponse.json({ success: response?.success !== false, data: response })
  } catch (error) {
    console.error('Generate 360 set error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '360° set generation failed',
      },
      { status: 500 },
    )
  }
}
