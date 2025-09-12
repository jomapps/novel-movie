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

    // Optionally accept prompt override from client
    let clientPrompt: string | undefined
    try {
      const body = await request.json().catch(() => null)
      clientPrompt = body?.prompt
    } catch {}

    // Build a sensible prompt from BAML data when available (fallback)
    const bamlData: any = (characterRef as any)?.generationMetadata?.bamlData || {}
    const physical: string = bamlData?.physicalDescription?.description || ''
    const personality: string = bamlData?.characterDevelopment?.personality || ''

    const promptBase = `Professional character reference image: ${physical}. ${personality}. High quality, clear lighting, neutral background, full body view.`
    const fallbackPrompt =
      promptBase.trim().length > 0
        ? promptBase
        : `Professional character reference image for ${characterRef.projectCharacterName}. High quality, clear lighting, neutral background, full body view.`

    const finalPrompt =
      clientPrompt && clientPrompt.trim().length > 0 ? clientPrompt : fallbackPrompt

    // Call Character Library to generate initial/master reference image
    const response = await characterLibraryClient.generateInitialImage(
      characterRef.libraryCharacterId,
      finalPrompt,
    )

    // Ingest generated image into Media and create metadata record
    try {
      const imageUrl: string | undefined = response?.publicUrl || response?.imageUrl
      if (imageUrl) {
        const downloadRes = await fetch(imageUrl)
        if (!downloadRes.ok) {
          throw new Error(
            `Failed to download generated image: ${downloadRes.status} ${downloadRes.statusText}`,
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
          data: { alt: `${characterRef.projectCharacterName} - reference image` },
          file: {
            data: buffer as any,
            filename: filenameGuess,
            mimeType: contentType,
          } as any,
        })

        await payload.create({
          collection: 'character-image-metadata',
          data: {
            characterReference: characterRef.id,
            media: (media as any).id,
            kind: 'reference',
            provider: 'character-library',
            prompt: finalPrompt,
            sourceUrl: imageUrl,
            externalId:
              (response?.imageId as string) || (response?.dinoAssetId as string) || undefined,
            status: response?.success === false ? 'failed' : 'succeeded',
            metrics: {},
          },
        })
      }
    } catch (ingestErr) {
      console.warn('Non-fatal: failed to ingest generated image into Media/Metadata:', ingestErr)
    }

    // Persist quick verification fields
    try {
      await payload.update({
        collection: 'character-references',
        id: characterRef.id,
        data: {
          generationMetadata: {
            ...(characterRef.generationMetadata || {}),
            lastImageUpdate: new Date().toISOString(),
          },
          libraryAssets: {
            ...(characterRef.libraryAssets || {}),
            masterReferencePublicUrl: response?.publicUrl || response?.imageUrl || '',
            coreSetGenerated: characterRef?.libraryAssets?.coreSetGenerated || false,
            coreSetCount: characterRef?.libraryAssets?.coreSetCount || 0,
          },
          generationStatus: response?.success === false ? 'failed' : 'images_created',
        },
      })
    } catch (persistErr) {
      // Non-fatal; proceed with response
      console.warn(
        'Non-fatal: failed to persist image metadata to Character References:',
        persistErr,
      )
    }

    return NextResponse.json({ success: response?.success !== false, data: response })
  } catch (error) {
    console.error('Generate initial image error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Image generation failed' },
      { status: 500 },
    )
  }
}
