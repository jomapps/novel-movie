import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterSyncService } from '@/lib/services/character-sync-service'
import { createCORSPreflightResponse, withCORS } from '@/lib/cors'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    if (!id) {
      return withCORS(
        NextResponse.json({ success: false, error: 'Missing project id' }, { status: 400 }),
      )
    }

    // Trigger project-wide sync
    const result = await characterSyncService.syncProjectCharacters(id)

    // Fetch characters to provide current sync status and IDs
    const payload = await getPayload({ config })
    const characters = await payload.find({
      collection: 'characters',
      where: { project: { equals: id } },
      depth: 1,
    })

    const mapped = characters.docs.map((c: any) => ({
      id: c.id,
      name: c.name,
      project: c.project,
      libraryIntegration: c.libraryIntegration || null,
      legacyCharacterLibraryId: c.characterLibraryId || null,
    }))

    const responseBody = {
      success: result.success,
      result,
      characters: mapped,
    }

    return withCORS(NextResponse.json(responseBody, { status: result.success ? 200 : 500 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Project sync failed'
    return withCORS(NextResponse.json({ success: false, error: message }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return createCORSPreflightResponse(request)
}

