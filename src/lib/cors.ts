import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS utility functions for API routes
 */

export interface CORSOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

/**
 * Get allowed origins from environment or default
 */
export function getAllowedOrigins(): string[] {
  const origins =
    process.env.CORS_ALLOWED_ORIGINS ||
    'http://localhost:3001,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://local.ft.tc'
  return origins.split(',').map((origin) => origin.trim())
}

/**
 * Get allowed methods from environment or default
 */
export function getAllowedMethods(): string[] {
  const methods = process.env.CORS_ALLOWED_METHODS || 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
  return methods.split(',').map((method) => method.trim())
}

/**
 * Get allowed headers from environment or default
 */
export function getAllowedHeaders(): string[] {
  const headers =
    process.env.CORS_ALLOWED_HEADERS ||
    'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers'
  return headers.split(',').map((header) => header.trim())
}

/**
 * Check if credentials are allowed
 */
export function allowCredentials(): boolean {
  return process.env.CORS_ALLOW_CREDENTIALS === 'true'
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true

  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes('*') || allowedOrigins.includes(origin)
}

/**
 * Add CORS headers to a response
 */
export function addCORSHeaders(response: NextResponse, request?: NextRequest): NextResponse {
  const origin = request?.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()
  const allowedMethods = getAllowedMethods()
  const allowedHeaders = getAllowedHeaders()

  // Set origin header
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  // Set other CORS headers
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

  if (allowCredentials()) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

/**
 * Create a CORS preflight response
 */
export function createCORSPreflightResponse(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()
  const allowedMethods = getAllowedMethods()
  const allowedHeaders = getAllowedHeaders()

  const response = new NextResponse(null, { status: 200 })

  // Set origin header
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  // Set preflight headers
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  if (allowCredentials()) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

/**
 * Wrapper function to add CORS to any NextResponse
 */
export function withCORS(response: NextResponse, request?: NextRequest): NextResponse {
  return addCORSHeaders(response, request)
}
