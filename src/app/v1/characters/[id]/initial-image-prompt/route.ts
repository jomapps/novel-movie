import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { buildReferenceImagePromptFromRef } from '@/lib/prompts/character-reference-image'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing character reference id' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const characterRef = await payload.findByID({ collection: 'character-references', id, depth: 2 })
    if (!characterRef) {
      return NextResponse.json({ success: false, error: 'Character reference not found' }, { status: 404 })
    }

    const prompt = buildReferenceImagePromptFromRef(characterRef)
    return NextResponse.json({ success: true, prompt })
  } catch (error) {
    console.error('Build initial-image prompt error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to build prompt' },
      { status: 500 },
    )
  }
}

