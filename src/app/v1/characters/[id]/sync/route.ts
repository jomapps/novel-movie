import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterSyncService } from '@/lib/services/character-sync-service'
import { createCORSPreflightResponse, withCORS } from '@/lib/cors'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return withCORS(
        NextResponse.json({ success: false, error: 'Missing character id' }, { status: 400 }),
      )
    }

    // Trigger sync (delete-and-recreate semantics handled inside the service)
    const result = await characterSyncService.syncCharacterToLibrary(id)

    // Fetch updated character to return current status and IDs
    const payload = await getPayload({ config })
    const character = await payload.findByID({ collection: 'characters', id, depth: 1 })

    const responseBody = {
      success: result.success,
      result,
      character: character
        ? {
            id: character.id,
            name: character.name,
            project: character.project,
            libraryIntegration: character.libraryIntegration || null,
            legacyCharacterLibraryId: (character as any).characterLibraryId || null,
          }
        : null,
    }

    return withCORS(NextResponse.json(responseBody, { status: result.success ? 200 : 500 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    return withCORS(NextResponse.json({ success: false, error: message }, { status: 500 }))
  }
}

export async function OPTIONS(request: NextRequest) {
  return createCORSPreflightResponse(request)
}
