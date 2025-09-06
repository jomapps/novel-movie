import { NextResponse } from 'next/server'
import { checkCharacterLibraryHealth } from '@/lib/services/character-library-health'

export async function GET() {
  try {
    const health = await checkCharacterLibraryHealth()
    
    return NextResponse.json({
      service: 'Character Library',
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      responseTime: health.responseTime,
      timestamp: health.timestamp,
      error: health.error || null
    })
  } catch (error) {
    return NextResponse.json({
      service: 'Character Library',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 })
  }
}
