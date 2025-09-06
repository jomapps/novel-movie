export const CHARACTER_LIBRARY_CONFIG = {
  baseUrl: process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc',
  timeout: parseInt(process.env.CHARACTER_LIBRARY_TIMEOUT || '60000'),
  retryAttempts: parseInt(process.env.CHARACTER_LIBRARY_RETRY_ATTEMPTS || '3'),
  
  // Quality thresholds
  qualityThreshold: 70,
  consistencyThreshold: 85,
  
  // Generation settings
  defaultStyle: 'character_production',
  maxRetries: 5,
  
  // Endpoints
  endpoints: {
    characters: '/api/characters',
    generateSmart: '/api/characters/{id}/generate-smart-image',
    generateInitial: '/api/characters/{id}/generate-initial-image',
    generateCoreSet: '/api/characters/{id}/generate-core-set',
    query: '/api/characters/query',
    validate: '/api/characters/{id}/validate-consistency'
  }
}
