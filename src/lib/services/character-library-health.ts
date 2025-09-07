import { characterLibraryClient } from './character-library-client'

export interface HealthCheckResult {
  isHealthy: boolean
  responseTime: number
  error?: string
  timestamp: Date
}

export async function checkCharacterLibraryHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now()

  try {
    // Use the proper health endpoint with SSL certificate validation disabled
    const response = await fetch(
      `${process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc'}/api/health`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        // @ts-ignore - Node.js specific option to ignore SSL certificate errors
        agent:
          process.env.NODE_ENV === 'development'
            ? new (require('https').Agent)({ rejectUnauthorized: false })
            : undefined,
      },
    )

    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`)
    }

    const healthData = await response.json()

    return {
      isHealthy: healthData.status === 'ok',
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    }
  }
}
