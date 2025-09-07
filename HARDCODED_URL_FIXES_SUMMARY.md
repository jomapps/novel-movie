# Hardcoded URL Fixes Summary

This document summarizes all the changes made to replace hardcoded localhost URLs with environment variables throughout the codebase.

## Environment Variable Used

All hardcoded URLs have been replaced with the `SITE_URL` environment variable:
- **Environment Variable**: `SITE_URL=http://localhost:3001`
- **Fallback**: `http://localhost:3001` (if SITE_URL is not set)

## Files Modified

### 1. Test Scripts (scripts/)

#### Updated to use ESM + dotenv + SITE_URL:
- ✅ `scripts/test-quality-score.js`
- ✅ `scripts/test-credit-check.js`
- ✅ `scripts/test-screenplay-page.js`
- ✅ `scripts/test-screenplay-generation.js`
- ✅ `scripts/test-character-development.js`
- ✅ `scripts/test-story-structure.js`

#### Already properly configured:
- ✅ `scripts/check-database-seed.js` (already used SITE_URL)
- ✅ `scripts/clean-reset-db.js` (already ESM + dotenv)
- ✅ `scripts/db-backup.js` (already ESM + dotenv)
- ✅ `scripts/test-character-library-service.js` (already used env vars)
- ✅ `scripts/generate-icons.js` (no URLs needed)

### 2. Configuration Files

#### PM2 Configuration:
- ✅ `ecosystem.config.mjs` - Updated to use `process.env.PORT || 3000`

#### CrewAI Server:
- ✅ `novel-movie-crewai-server/config/settings.py` - Updated to use environment variable for NOVEL_MOVIE_API_URL

### 3. Test Files

#### E2E Tests:
- ✅ `tests/e2e/frontend.e2e.spec.ts` - Updated to use `process.env.SITE_URL`

### 4. Additional Environment Variables Used

The scripts now properly use these environment variables with fallbacks:
- `SITE_URL` - Main application URL (default: http://localhost:3001)
- `CREW_AI` - CrewAI server URL (default: http://localhost:5001)
- `PATHRAG_API_URL` - PathRAG service URL (default: http://movie.ft.tc:5000)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `CHARACTER_LIBRARY_API_URL` - Character library service URL (default: https://character.ft.tc)

## ESM and dotenv Implementation

All standalone scripts now follow this pattern:

```javascript
#!/usr/bin/env node

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../.env') })

// Use environment variables
const apiUrl = process.env.SITE_URL || 'http://localhost:3001'
```

## Package.json Configuration

The project is already configured for ESM modules:
- ✅ `"type": "module"` is set in package.json
- ✅ All npm scripts use `cross-env NODE_OPTIONS=--no-deprecation`

## Benefits

1. **Flexibility**: Easy to change URLs for different environments
2. **Security**: No hardcoded URLs in source code
3. **Consistency**: All scripts use the same environment variable pattern
4. **Maintainability**: Single source of truth for configuration

## Usage

To use a different URL, simply set the environment variable:

```bash
# In .env file
SITE_URL=https://your-production-domain.com

# Or as command line argument
SITE_URL=https://staging.example.com npm run test:services
```

## Verification

A test script has been created to verify environment variable loading:
- ✅ `scripts/test-env-variables.js` - Tests that all environment variables are properly loaded

## Files Not Modified

These files were already properly configured or don't contain hardcoded URLs:
- Configuration files in `src/lib/config/` (already use env vars)
- Documentation files (contain example configurations)
- External dependency files (node_modules, crewai_env)
