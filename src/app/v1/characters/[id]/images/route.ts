import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing character reference id' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const results = await payload.find({
      collection: 'character-image-metadata',
      where: { characterReference: { equals: id } },
      depth: 1,
      sort: '-createdAt',
      limit: 100,
    })

    return NextResponse.json({ success: true, count: results.totalDocs, images: results.docs })
  } catch (error) {
    console.error('List character images error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list images' },
      { status: 500 },
    )
  }
}

