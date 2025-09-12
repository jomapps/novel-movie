import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterLibraryClient } from '@/lib/services/character-library-client'
import { CHARACTER_LIBRARY_CONFIG } from '@/lib/config/character-library'
import { buildReferenceImagePromptFromRef } from '@/lib/prompts/character-reference-image'

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

    const libraryDbId: string | undefined =
      (characterRef as any).libraryDbId || (characterRef as any).libraryIntegration?.libraryDbId

    if (!libraryDbId || !/^[a-f0-9]{24}$/.test(libraryDbId)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Character Library DB ID is missing or invalid. Link/sync this character so a 24‑char MongoDB ObjectId (libraryDbId) is stored before generating images.',
        },
        { status: 400 },
      )
    }

    // Pre-cleanup: auto-delete all existing images for this character
    try {
      // 1) Remote delete of master reference if one exists
      const existingImages = await payload.find({
        collection: 'character-image-metadata',
        where: { characterReference: { equals: characterRef.id } },
        depth: 0,
        limit: 200,
      })

      const hasReference = existingImages?.docs?.some((d: any) => d?.kind === 'reference')
      if (hasReference) {
        try {
          const endpoint = CHARACTER_LIBRARY_CONFIG.endpoints.referenceImage.replace(
            '{id}',
            libraryDbId,
          )
          const url = `${CHARACTER_LIBRARY_CONFIG.baseUrl}${endpoint}`
          const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(CHARACTER_LIBRARY_CONFIG.timeout),
          })
          if (!res.ok) {
            const text = await res.text().catch(() => '')
            console.error(
              'Character Library reference deletion failed:',
              res.status,
              res.statusText,
              text,
            )
          }
        } catch (err) {
          console.error('Character Library reference deletion failed (pre-cleanup):', err)
        }
      }

      // 2) Local delete of all media + metadata
      for (const meta of existingImages?.docs || []) {
        try {
          const mediaRel = (meta as any).media
          const mediaId = typeof mediaRel === 'string' ? mediaRel : mediaRel?.id
          if (mediaId) {
            try {
              await payload.delete({ collection: 'media', id: mediaId })
            } catch (err) {
              console.error('Failed deleting media record during pre-cleanup:', err)
            }
          }
          await payload.delete({ collection: 'character-image-metadata', id: (meta as any).id })
        } catch (err) {
          console.error('Failed deleting image metadata during pre-cleanup:', err)
        }
      }
    } catch (cleanupErr) {
      console.warn('Pre-cleanup warning: failed to auto-delete previous images:', cleanupErr)
    }

    // Optionally accept prompt override from client
    let clientPrompt: string | undefined
    try {
      const body = await request.json().catch(() => null)
      clientPrompt = body?.prompt
    } catch {}

    // Build prompt using Photorealistic Prompt Template (fallback)
    const fallbackPrompt = buildReferenceImagePromptFromRef(characterRef as any)

    const finalPrompt =
      clientPrompt && clientPrompt.trim().length > 0 ? clientPrompt : fallbackPrompt

    // Call Character Library to generate initial/master reference image with specific 400-recovery
    let response: any
    try {
      response = await characterLibraryClient.generateInitialImage(libraryDbId, finalPrompt)
    } catch (err: any) {
      const msg = String(err?.message || err)
      const alreadyHasRef =
        (err && (err as any)?.code === 'ALREADY_HAS_REFERENCE') ||
        (msg.includes('HTTP 400') && msg.includes('Character already has a master reference image'))
      if (alreadyHasRef) {
        // Remote delete existing master reference, then retry once
        try {
          const endpoint = CHARACTER_LIBRARY_CONFIG.endpoints.referenceImage.replace(
            '{id}',
            libraryDbId,
          )
          const url = `${CHARACTER_LIBRARY_CONFIG.baseUrl}${endpoint}`
          const delRes = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(CHARACTER_LIBRARY_CONFIG.timeout),
          })
          if (!delRes.ok) {
            const t = await delRes.text().catch(() => '')
            console.warn(
              'Character Library delete reference failed before retry:',
              delRes.status,
              delRes.statusText,
              t,
            )
          }
        } catch (delErr) {
          console.warn('Failed to delete existing master reference before retry:', delErr)
        }
        // Retry generation exactly once
        response = await characterLibraryClient.generateInitialImage(libraryDbId, finalPrompt)
      } else {
        throw err
      }
    }

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
