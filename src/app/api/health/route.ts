import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Health check endpoint for Novel Movie application
 * Tests basic connectivity to database and core services
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test database connectivity
    const payload = await getPayload({ config })
    
    // Simple database test - try to count projects
    const projectCount = await payload.count({
      collection: 'projects',
    })
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      service: 'novel-movie-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        projects: projectCount.totalDocs,
      },
      response_time_ms: responseTime,
      environment: process.env.ENVIRONMENT || 'development',
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'novel-movie-api',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
