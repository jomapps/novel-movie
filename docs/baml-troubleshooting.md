# BAML Next.js Integration Troubleshooting Guide

## Problem Description

**Issue**: BAML client failing with "Failed to load native binding" error in Next.js applications.

**Specific Error**: `Module not found: Can't resolve './baml.wasi.cjs'`

**Symptoms**:
- BAML works perfectly in standalone Node.js environments
- BAML fails when imported in Next.js API routes or server components
- Error occurs during webpack compilation/bundling
- Fallback to missing `.wasi.cjs` file indicates native binding resolution failure

## Root Cause

Next.js webpack bundling breaks BAML's native binding resolution mechanism. The webpack configuration prevents platform-specific `.node` files from loading correctly, causing BAML to fall back to the missing `.wasi.cjs` file.

## Solution

Use the **official BAML Next.js plugin** instead of manual webpack configuration.

### Step 1: Install the BAML Next.js Plugin

```bash
pnpm add @boundaryml/baml-nextjs-plugin
```

### Step 2: Update Next.js Configuration

Update your `next.config.mjs` file:

```javascript
import { withSentryConfig } from '@sentry/nextjs'
import { withPayload } from '@payloadcms/next/withPayload'
import { withBaml } from '@boundaryml/baml-nextjs-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
}

export default withSentryConfig(
  withPayload(withBaml()(nextConfig), { devBundleServerPackages: false }),
  {
    // Sentry configuration...
    org: 'your-org',
    project: 'your-project',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    disableLogger: true,
    automaticVercelMonitors: true,
  },
)
```

### Step 3: Remove Manual Webpack Configuration

**Important**: Remove any manual webpack configuration for BAML. The `withBaml()` plugin handles all necessary webpack configuration automatically.

**Do NOT use manual configurations like**:
- Externalizing BAML modules
- Adding webpack aliases for BAML files
- Custom module rules for `.node` files
- Manual fallback configurations

## Verification

After implementing the fix:

1. **Restart the development server**
2. **Test BAML functionality** in API routes
3. **Check server logs** for successful BAML function execution
4. **Verify LLM responses** are returned correctly

### Expected Success Indicators:
- No "Failed to load native binding" errors
- BAML logging shows successful function execution
- API responses return proper LLM-generated content
- Response times are normal (20-60 seconds for complex prompts)

## Package Versions

- **BAML Core**: `@boundaryml/baml@0.205.0`
- **Next.js Plugin**: `@boundaryml/baml-nextjs-plugin@0.1.0`
- **Next.js**: `15.4.4+`

## Key Points

1. **BAML works outside Next.js** - The issue is specifically with Next.js webpack bundling
2. **Use the official plugin** - Manual webpack configuration is unreliable and unsupported
3. **Plugin order matters** - Ensure `withBaml()` is applied in the correct order with other plugins
4. **Clean configuration** - Remove all manual BAML webpack configurations when using the plugin

## Common Mistakes to Avoid

1. **Don't mix manual webpack config with the plugin**
2. **Don't externalize the main BAML package**
3. **Don't try to resolve native bindings manually**
4. **Don't skip restarting the dev server after config changes**

## Alternative Approaches (Not Recommended)

While it's possible to create a standalone BAML service that runs outside Next.js, this adds unnecessary complexity. The official plugin is the recommended and supported approach.

---

**Last Updated**: August 27, 2025
**Status**: Verified Working
**Environment**: Windows 11, Node.js, pnpm, Next.js 15.4.4
