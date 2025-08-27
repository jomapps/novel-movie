# BAML Troubleshooting Guide

This document provides comprehensive troubleshooting steps for BAML (Boundary AI Markup Language) issues in the Novel Movie project.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Native Binding Problems](#native-binding-problems)
3. [Environment Setup](#environment-setup)
4. [Data Validation Issues](#data-validation-issues)
5. [Testing BAML Functionality](#testing-baml-functionality)
6. [Error Patterns](#error-patterns)
7. [Resolution Steps](#resolution-steps)

## Common Issues

### 1. "Failed to load native binding" Error

**Symptoms:**
```
Failed to load BAML client: Error: Failed to load native binding
Module not found: Can't resolve './baml.wasi.cjs'
```

**Root Cause:** Missing or corrupted Windows-specific native bindings

**Solution:** [See Native Binding Problems](#native-binding-problems)

### 2. "BAML client not available" Error

**Symptoms:**
```
Error: BAML client not available
    at getBamlClient (src\lib\ai\initial-concept-autofill.ts:20:12)
```

**Root Cause:** BAML client import failing due to native binding issues

**Solution:** Reinstall BAML and regenerate client files

### 3. Data Validation Errors

**Symptoms:**
```
Invalid request data
Expected string, received object
```

**Root Cause:** Frontend sending PayloadCMS objects instead of transformed strings

**Solution:** [See Data Validation Issues](#data-validation-issues)

## Native Binding Problems

### Windows-Specific Issues

BAML requires platform-specific native bindings. On Windows, you need:
- `@boundaryml/baml-win32-x64-msvc` package
- `baml.win32-x64-msvc.node` native module

### Resolution Steps

1. **Remove and Reinstall BAML:**
   ```bash
   pnpm remove @boundaryml/baml
   pnpm add @boundaryml/baml
   ```

2. **Verify Native Module Installation:**
   ```bash
   ls node_modules/@boundaryml/baml/baml.win32-x64-msvc.node
   ```

3. **Regenerate BAML Client:**
   ```bash
   npx baml-cli generate
   ```

4. **Clear Node Modules (if needed):**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

## Environment Setup

### Required Environment Variables

Ensure these variables are set in your `.env` file:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MILLION_MODEL=google/gemini-2.5-pro
```

### Verification Script

Create a simple test to verify environment variables:

```javascript
const requiredVars = ['OPENROUTER_API_KEY', 'OPENROUTER_BASE_URL']
const missing = requiredVars.filter(v => !process.env[v])
if (missing.length > 0) {
  console.error('Missing env vars:', missing)
} else {
  console.log('✅ All environment variables present')
}
```

## Data Validation Issues

### Problem: Object vs String Mismatch

BAML API routes expect strings for relationship fields, but PayloadCMS returns objects.

**Example of problematic data:**
```javascript
{
  primaryGenres: [
    { id: "123", name: "Action", slug: "action" }, // ❌ Object
    { id: "456", name: "Drama", slug: "drama" }    // ❌ Object
  ]
}
```

**Expected format:**
```javascript
{
  primaryGenres: ["action", "drama"] // ✅ Strings (slugs)
}
```

### Solution: Data Transformation

Use the `transformInitialConceptFormData` utility:

```typescript
import { transformInitialConceptFormData } from '@/lib/utils/form-data-transformer'

// Transform before sending to API
const transformedData = transformInitialConceptFormData(formData)
```

## Testing BAML Functionality

### Standalone Test Script

Use the provided test script to verify BAML functionality:

```bash
npx tsx test-baml-standalone.ts
```

### Test Components

1. **Environment Variables Check**
2. **BAML Client Import**
3. **Simple Function Call** (GenerateCorePremise)
4. **Quality Score Function** (AssessProjectQuality)

### Expected Test Output

```
🎯 OVERALL RESULT:
==================================================
🎉 ALL TESTS PASSED! BAML is working correctly.
✅ Both AI Auto-fill and Quality Score should now work in the app.
```

## Error Patterns

### Pattern 1: Import Errors

```
Cannot find module 'baml_client'
Unknown file extension ".ts"
```

**Solutions:**
- Ensure BAML client is generated: `npx baml-cli generate`
- Use proper import path: `import { b } from 'baml_client'`
- Use tsx for TypeScript execution: `npx tsx script.ts`

### Pattern 2: Runtime Errors

```
Failed to load native binding
BAML client not available
```

**Solutions:**
- Reinstall BAML with native bindings
- Check Windows compatibility
- Verify node_modules integrity

### Pattern 3: API Errors

```
402 Insufficient credits
AI service temporarily unavailable
```

**Solutions:**
- Check OpenRouter account credits
- Verify API key validity
- Check network connectivity

## Resolution Steps

### Quick Fix Checklist

1. **✅ Check Environment Variables**
   ```bash
   echo $OPENROUTER_API_KEY
   ```

2. **✅ Verify BAML Installation**
   ```bash
   ls node_modules/@boundaryml/baml/baml.win32-x64-msvc.node
   ```

3. **✅ Regenerate BAML Client**
   ```bash
   npx baml-cli generate
   ```

4. **✅ Run Standalone Test**
   ```bash
   npx tsx test-baml-standalone.ts
   ```

5. **✅ Check Data Transformation**
   - Ensure form data is transformed before API calls
   - Verify relationship objects are converted to strings

### Full Reset Procedure

If issues persist, perform a complete reset:

```bash
# 1. Remove BAML
pnpm remove @boundaryml/baml

# 2. Clear dependencies
rm -rf node_modules pnpm-lock.yaml

# 3. Reinstall everything
pnpm install
pnpm add @boundaryml/baml

# 4. Regenerate BAML client
npx baml-cli generate

# 5. Test functionality
npx tsx test-baml-standalone.ts
```

## Debugging Tips

### Enable Verbose Logging

Add to your BAML functions:
```typescript
console.log('🔍 BAML client status:', !!bamlClient)
console.log('🔍 Available functions:', Object.keys(bamlClient))
```

### Check Network Issues

Test OpenRouter connectivity:
```bash
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
     https://openrouter.ai/api/v1/models
```

### Monitor API Usage

Check OpenRouter dashboard for:
- Credit balance
- API usage
- Error rates
- Model availability

## Prevention

### Best Practices

1. **Always transform data** before sending to BAML APIs
2. **Use standalone tests** to verify BAML functionality
3. **Monitor environment variables** in production
4. **Keep BAML updated** but test thoroughly after updates
5. **Document any custom configurations** or workarounds

### Regular Maintenance

- Monthly: Check BAML version updates
- Weekly: Verify API credits and usage
- Daily: Monitor error logs for BAML-related issues

## Platform-Specific Issues

### Windows

**Common Problems:**
- Native binding resolution failures
- Path separator issues in module loading
- PowerShell vs Command Prompt differences

**Solutions:**
- Use forward slashes in import paths
- Ensure Windows-specific native modules are installed
- Use Git Bash or WSL for better compatibility

### macOS

**Common Problems:**
- Apple Silicon (M1/M2) compatibility
- Rosetta translation issues

**Solutions:**
- Ensure ARM64 native bindings are available
- Use Rosetta if needed: `arch -x86_64 npm install`

### Linux

**Common Problems:**
- Missing system dependencies
- glibc version compatibility

**Solutions:**
- Install build essentials: `apt-get install build-essential`
- Check glibc version compatibility

## Performance Optimization

### Function Call Timing

BAML functions can be slow (30+ seconds). Optimize by:

1. **Implement proper loading states**
2. **Use timeouts and retries**
3. **Cache results when appropriate**
4. **Provide user feedback during long operations**

### Error Handling Best Practices

```typescript
async function callBAMLWithRetry(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.log(`Retry ${i + 1}/${maxRetries}:`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

## Monitoring and Alerting

### Key Metrics to Track

1. **BAML Function Success Rate**
2. **Average Response Time**
3. **API Credit Usage**
4. **Error Frequency by Type**

### Log Patterns to Monitor

```bash
# Success patterns
grep "BAML INFO.*Function.*completed" logs/

# Error patterns
grep "Failed to load BAML client" logs/
grep "BAML client not available" logs/
grep "402 Insufficient credits" logs/
```

---

## Support Resources

- **BAML Documentation**: https://docs.boundaryml.com/
- **OpenRouter API**: https://openrouter.ai/docs
- **Project Issues**: Check GitHub issues for similar problems
- **Test Script**: Use `test-baml-standalone.ts` for debugging
- **Native Bindings**: Check `node_modules/@boundaryml/baml/` for platform files
