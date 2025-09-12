import { NextRequest, NextResponse } from 'next/server'
import { CharacterGenerationService } from '@/lib/services/character-generation-service'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing character reference id' },
        { status: 400 },
      )
    }

    const service = new CharacterGenerationService()
    const result = await service.regenerateCharacter(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Character regeneration failed' },
        { status: 500 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Character regeneration failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Character regeneration failed',
      },
      { status: 500 },
    )
  }
}
