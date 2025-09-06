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
    // Simple health check - query for any characters
    await characterLibraryClient.queryCharacters('test health check')
    
    return {
      isHealthy: true,
      responseTime: Date.now() - startTime,
      timestamp: new Date()
    }
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }
  }
}
