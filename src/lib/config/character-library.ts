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

  // Endpoints - Updated to match new API structure
  endpoints: {
    characters: '/api/v1/characters',
    novelMovieCharacters: '/api/v1/characters/novel-movie',
    charactersByProject: '/api/v1/characters/by-project',
    characterSync: '/api/v1/characters/{id}/novel-movie-sync',
    search: '/api/v1/characters/search',
    query: '/api/v1/characters/query',
    generateInitial: '/api/v1/characters/{id}/generate-initial-image',
    generateCoreSet: '/api/v1/characters/{id}/generate-core-set',
    generate360Set: '/api/v1/characters/{id}/generate-360-set',
    generateSceneImage: '/api/v1/characters/{id}/generate-scene-image',
    generateSmartImage: '/api/v1/characters/{id}/generate-smart-image',
    referenceImage: '/api/v1/characters/{id}/reference-image',
    qualityMetrics: '/api/v1/characters/{id}/quality-metrics',
    validateConsistency: '/api/v1/characters/{id}/validate-consistency',
    relationships: '/api/v1/characters/{id}/relationships',
    relationshipGraph: '/api/v1/characters/relationships/graph',
    bulkNovelMovie: '/api/v1/characters/bulk/novel-movie',
    batchGenerateScenes: '/api/v1/characters/batch-generate-scenes',
    validateProjectConsistency: '/api/v1/characters/validate-project-consistency',
    batchValidate: '/api/v1/characters/batch-validate',
    health: '/api/health',
  },
}
