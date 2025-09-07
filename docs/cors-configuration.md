# CORS Configuration

This document explains the Cross-Origin Resource Sharing (CORS) configuration for the Novel Movie application.

## Overview

The application supports multiple domains and ports for development and production environments:

- `http://localhost:3001` - Default Next.js development port
- `http://localhost:3001` - Alternative development port
- `http://localhost:3002` - Alternative development port  
- `http://localhost:3003` - Alternative development port
- `https://local.ft.tc` - Local development domain
- `https://crew.ft.tc` - CrewAI service domain
- `https://pathrag.ft.tc` - PathRAG service domain

## Environment Variables

Add these variables to your `.env` file:

```env
# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3001,http://localhost:3002,http://localhost:3003,https://local.ft.tc,https://crew.ft.tc,https://pathrag.ft.tc
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers
```

## Implementation

### 1. Middleware (`src/middleware.ts`)

The main CORS handling is implemented in Next.js middleware that:
- Handles preflight OPTIONS requests
- Sets appropriate CORS headers for all requests
- Validates origins against the allowed list
- Supports credentials when configured

### 2. CORS Utility (`src/lib/cors.ts`)

Provides utility functions for:
- Getting configuration from environment variables
- Checking if origins are allowed
- Adding CORS headers to responses
- Creating preflight responses

### 3. API Route Integration

API routes can use the CORS utilities:

```typescript
import { createCORSPreflightResponse } from '@/lib/cors'

export async function OPTIONS(request: NextRequest) {
  return createCORSPreflightResponse(request)
}
```

### 4. Next.js Development Assets (`next.config.mjs`)

For cross-origin requests to Next.js static assets (/_next/*), configure `allowedDevOrigins`:

```javascript
const nextConfig = {
  allowedDevOrigins: [
    'local.ft.tc',
    'novel.ft.tc',
    'crew.ft.tc',
    'pathrag.ft.tc',
  ],
}
```

This prevents warnings about cross-origin requests to development assets.

## Testing

Run the CORS test script to verify configuration:

```bash
node test-cors-configuration.js
```

This will test:
- Preflight OPTIONS requests
- Actual GET requests  
- All configured origins
- Multiple endpoints

## Configuration Options

### Origins
- **Development**: Multiple localhost ports for flexibility
- **Production**: Specific domains for security
- **Wildcard**: Use `*` for development only (not recommended for production)

### Credentials
- Set `CORS_ALLOW_CREDENTIALS=true` to allow cookies and authentication headers
- Required for authenticated API requests

### Methods
- Configure allowed HTTP methods
- Default includes all common REST methods

### Headers
- Configure allowed request headers
- Includes common headers for API requests and authentication

## Security Considerations

1. **Production Origins**: Only include necessary domains in production
2. **Credentials**: Only enable if needed for authentication
3. **Headers**: Limit to required headers for security
4. **Methods**: Only allow necessary HTTP methods

## Troubleshooting

### Common Issues

1. **CORS blocked**: Check if origin is in `CORS_ALLOWED_ORIGINS`
2. **Credentials not working**: Ensure `CORS_ALLOW_CREDENTIALS=true`
3. **Custom headers blocked**: Add headers to `CORS_ALLOWED_HEADERS`
4. **Method not allowed**: Add method to `CORS_ALLOWED_METHODS`

### Debug Steps

1. Check browser developer tools Network tab
2. Look for preflight OPTIONS requests
3. Verify CORS headers in response
4. Run the test script to validate configuration

## Examples

### Frontend Request (JavaScript)

```javascript
// This will work with proper CORS configuration
fetch('http://localhost:3001/v1/projects/123', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  credentials: 'include' // If credentials are needed
})
```

### cURL Test

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3001/v1/projects/123

# Test actual request
curl -X GET \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/projects/123
```
