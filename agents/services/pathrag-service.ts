/**
 * PathRAG Service Integration
 * Provides TypeScript client for PathRAG API at http://movie.ft.tc:5000
 */

export interface PathRAGHealthResponse {
  services: {
    api: string
    arangodb: string
  }
  status: string
  timestamp: string
}

export interface PathRAGInsertResponse {
  message: string
  document_count: number
  timestamp: string
}

export interface PathRAGCustomKGResponse {
  message: string
  entities_count: number
  relationships_count: number
  chunks_count: number
  timestamp: string
}

export interface PathRAGQueryResponse {
  query: string
  result: string
  params: Record<string, any>
  timestamp: string
}

export interface PathRAGStatsResponse {
  total_documents: number
  total_entities: number
  total_relationships: number
  cache_hit_rate: number
  timestamp: string
}

export interface CustomKnowledgeGraph {
  chunks: string[]
  entities: Array<{
    name: string
    type: string
    description: string
    metadata?: Record<string, any>
  }>
  relationships: Array<{
    source: string
    target: string
    relation: string
  }>
}

export class PathRAGService {
  private static baseUrl = process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'

  /**
   * Check PathRAG service health
   */
  static async healthCheck(): Promise<PathRAGHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      if (!response.ok) {
        throw new Error(`PathRAG health check failed: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('PathRAG health check error:', error)
      throw error
    }
  }

  /**
   * Insert documents into PathRAG knowledge base
   */
  static async insertDocuments(documents: string | string[]): Promise<PathRAGInsertResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      })
      
      if (!response.ok) {
        throw new Error(`PathRAG insert failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('PathRAG insert error:', error)
      throw error
    }
  }

  /**
   * Insert custom knowledge graph with structured entities and relationships
   */
  static async insertCustomKG(customKG: CustomKnowledgeGraph): Promise<PathRAGCustomKGResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/insert_custom_kg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_kg: customKG })
      })
      
      if (!response.ok) {
        throw new Error(`PathRAG custom KG insert failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('PathRAG custom KG insert error:', error)
      throw error
    }
  }

  /**
   * Query PathRAG knowledge base using natural language
   */
  static async query(
    query: string, 
    params: {
      mode?: string
      only_need_context?: boolean
      only_need_prompt?: boolean
      response_type?: string
      stream?: boolean
      top_k?: number
      max_token_for_text_unit?: number
      max_token_for_global_context?: number
      max_token_for_local_context?: number
    } = {}
  ): Promise<PathRAGQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, params })
      })
      
      if (!response.ok) {
        throw new Error(`PathRAG query failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('PathRAG query error:', error)
      throw error
    }
  }

  /**
   * Delete an entity from the knowledge graph
   */
  static async deleteEntity(entityName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/delete_entity`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_name: entityName })
      })
      
      if (!response.ok) {
        throw new Error(`PathRAG delete entity failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('PathRAG delete entity error:', error)
      throw error
    }
  }

  /**
   * Get PathRAG system statistics
   */
  static async getStats(): Promise<PathRAGStatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)
      if (!response.ok) {
        throw new Error(`PathRAG stats failed: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('PathRAG stats error:', error)
      throw error
    }
  }

  /**
   * Get PathRAG configuration (sanitized)
   */
  static async getConfig(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/config`)
      if (!response.ok) {
        throw new Error(`PathRAG config failed: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('PathRAG config error:', error)
      throw error
    }
  }

  /**
   * Test PathRAG connectivity and basic functionality
   */
  static async testConnection(): Promise<{
    healthy: boolean
    stats?: PathRAGStatsResponse
    error?: string
  }> {
    try {
      const health = await this.healthCheck()
      if (health.status !== 'healthy') {
        return { healthy: false, error: 'PathRAG service not healthy' }
      }

      const stats = await this.getStats()
      return { healthy: true, stats }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}
