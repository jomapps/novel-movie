import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CHARACTER_LIBRARY_CONFIG } from '@/lib/config/character-library'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const { id, imageId } = await params
    if (!id || !imageId) {
      return NextResponse.json(
        { success: false, error: 'Missing character reference id or image id' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Load metadata
    const meta = await payload.findByID({
      collection: 'character-image-metadata',
      id: imageId,
      depth: 0,
    })

    if (!meta) {
      return NextResponse.json(
        { success: false, error: 'Image metadata not found' },
        { status: 404 },
      )
    }

    // Verify ownership
    const metaRef = (meta as any).characterReference
    const refId = typeof metaRef === 'string' ? metaRef : metaRef?.id
    if (refId !== id) {
      return NextResponse.json(
        { success: false, error: 'Image does not belong to this character reference' },
        { status: 400 },
      )
    }

    // Remote deletion (Character Library)
    const provider = (meta as any).provider
    const kind = (meta as any).kind

    if (provider === 'character-library') {
      // Fetch character-reference to get library DB ID
      const characterRef = await payload.findByID({
        collection: 'character-references',
        id,
        depth: 0,
      })

      const libraryDbId = (characterRef as any)?.libraryDbId

      // Only delete remote master reference via the documented endpoint
      if (libraryDbId && kind === 'reference') {
        try {
          const url = `${CHARACTER_LIBRARY_CONFIG.baseUrl}/api/v1/characters/${libraryDbId}/reference-image`
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
          // Per project rules: do not retry on 500; surface error but continue local cleanup
          console.error('Character Library reference deletion failed:', err)
        }
      }
    }

    // Delete local media (binary) first, then metadata
    const mediaRel = (meta as any).media
    const mediaId = typeof mediaRel === 'string' ? mediaRel : mediaRel?.id

    if (mediaId) {
      try {
        await payload.delete({ collection: 'media', id: mediaId })
      } catch (err) {
        console.error('Failed deleting media record:', err)
        // Continue to delete metadata regardless to avoid orphan records
      }
    }

    await payload.delete({ collection: 'character-image-metadata', id: imageId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 },
    )
  }
}
