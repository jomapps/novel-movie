import { NextRequest, NextResponse } from 'next/server'

// Get CORS configuration from environment variables
const getAllowedOrigins = (): string[] => {
  const origins =
    process.env.CORS_ALLOWED_ORIGINS ||
    'http://localhost:3001,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://local.ft.tc'
  return origins.split(',').map((origin) => origin.trim())
}

const getAllowedMethods = (): string[] => {
  const methods = process.env.CORS_ALLOWED_METHODS || 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
  return methods.split(',').map((method) => method.trim())
}

const getAllowedHeaders = (): string[] => {
  const headers =
    process.env.CORS_ALLOWED_HEADERS ||
    'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers'
  return headers.split(',').map((header) => header.trim())
}

const allowCredentials = (): boolean => {
  return process.env.CORS_ALLOW_CREDENTIALS === 'true'
}

export function middleware(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()
  const allowedMethods = getAllowedMethods()
  const allowedHeaders = getAllowedHeaders()

  // Check if origin is allowed
  const isAllowedOrigin = !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })

    if (isAllowedOrigin && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else if (allowedOrigins.includes('*')) {
      response.headers.set('Access-Control-Allow-Origin', '*')
    }

    response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

    if (allowCredentials()) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

    return response
  }

  // Handle actual requests
  const response = NextResponse.next()

  if (isAllowedOrigin && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  if (allowCredentials()) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Add other CORS headers for actual requests
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    '/v1/:path*',
    // Match all routes except static files and internal Next.js routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
