# Logging and Auditing

## Overview

Comprehensive logging system for tracking all AI interactions, external service calls, and system operations for audit compliance and debugging.

## Logging Architecture

### Core Principles

1. **Complete LLM Audit Trail**: All prompts and responses logged
2. **External Service Tracking**: All API calls to external services logged
3. **Structured Logging**: Consistent format for easy analysis
4. **Performance Monitoring**: Request/response times tracked
5. **Error Tracking**: Detailed error logging with context

## LLM Interaction Logging

### LLM Logs Collection

```typescript
// collections/LLMLogs.ts
import { CollectionConfig } from 'payload'

export const LLMLogs: CollectionConfig = {
  slug: 'llm-logs',
  admin: {
    useAsTitle: 'requestId',
    defaultColumns: ['requestId', 'provider', 'model', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'requestId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'OpenRouter', value: 'openrouter' },
        { label: 'Fal.ai', value: 'fal' },
        { label: 'Direct API', value: 'direct' },
      ],
    },
    {
      name: 'model',
      type: 'text',
      required: true,
    },
    {
      name: 'prompt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'response',
      type: 'textarea',
    },
    {
      name: 'parameters',
      type: 'json',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Timeout', value: 'timeout' },
      ],
    },
    {
      name: 'responseTime',
      type: 'number',
      admin: {
        description: 'Response time in milliseconds',
      },
    },
    {
      name: 'tokenUsage',
      type: 'group',
      fields: [
        {
          name: 'promptTokens',
          type: 'number',
        },
        {
          name: 'completionTokens',
          type: 'number',
        },
        {
          name: 'totalTokens',
          type: 'number',
        },
      ],
    },
    {
      name: 'cost',
      type: 'number',
      admin: {
        description: 'Estimated cost in USD',
      },
    },
    {
      name: 'projectId',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'error',
      type: 'textarea',
    },
  ],
}
```

### LLM Logger Service

```typescript
// lib/logging/llm-logger.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface LLMLogEntry {
  requestId: string
  provider: 'openrouter' | 'fal' | 'direct'
  model: string
  prompt: string
  response?: string
  parameters?: Record<string, any>
  status: 'success' | 'error' | 'timeout'
  responseTime: number
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
  projectId?: string
  userId?: string
  error?: string
}

export class LLMLogger {
  static async logRequest(entry: LLMLogEntry) {
    try {
      const payload = await getPayload({ config: configPromise })
      
      await payload.create({
        collection: 'llm-logs',
        data: {
          ...entry,
          createdAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to log LLM request:', error)
    }
  }

  static async logOpenRouterRequest(
    requestId: string,
    model: string,
    prompt: string,
    response: any,
    responseTime: number,
    projectId?: string,
    userId?: string
  ) {
    const entry: LLMLogEntry = {
      requestId,
      provider: 'openrouter',
      model,
      prompt,
      response: response.choices?.[0]?.message?.content || '',
      status: 'success',
      responseTime,
      tokenUsage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      cost: this.calculateOpenRouterCost(model, response.usage),
      projectId,
      userId,
    }

    await this.logRequest(entry)
  }

  static async logFalRequest(
    requestId: string,
    model: string,
    prompt: string,
    result: any,
    responseTime: number,
    projectId?: string,
    userId?: string
  ) {
    const entry: LLMLogEntry = {
      requestId,
      provider: 'fal',
      model,
      prompt,
      response: JSON.stringify(result),
      status: 'success',
      responseTime,
      cost: this.calculateFalCost(model, result),
      projectId,
      userId,
    }

    await this.logRequest(entry)
  }

  static async logError(
    requestId: string,
    provider: string,
    model: string,
    prompt: string,
    error: Error,
    responseTime: number,
    projectId?: string,
    userId?: string
  ) {
    const entry: LLMLogEntry = {
      requestId,
      provider: provider as any,
      model,
      prompt,
      status: 'error',
      responseTime,
      error: error.message,
      projectId,
      userId,
    }

    await this.logRequest(entry)
  }

  private static calculateOpenRouterCost(model: string, usage: any): number {
    // Cost calculation based on model pricing
    const pricing = {
      'anthropic/claude-sonnet-4': { input: 0.003, output: 0.015 },
      'google/gemini-2.5-pro': { input: 0.001, output: 0.005 },
    }

    const modelPricing = pricing[model]
    if (!modelPricing || !usage) return 0

    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output

    return inputCost + outputCost
  }

  private static calculateFalCost(model: string, result: any): number {
    // Fal.ai cost calculation (example)
    const baseCost = 0.01 // Base cost per generation
    return baseCost
  }
}
```

## External Service Logging

### Service Logs Collection

```typescript
// collections/ServiceLogs.ts
import { CollectionConfig } from 'payload'

export const ServiceLogs: CollectionConfig = {
  slug: 'service-logs',
  admin: {
    useAsTitle: 'requestId',
    defaultColumns: ['requestId', 'service', 'endpoint', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'requestId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'service',
      type: 'select',
      required: true,
      options: [
        { label: 'Last Frame Service', value: 'lastframe' },
        { label: 'Cloudflare R2', value: 'r2' },
        { label: 'External API', value: 'external' },
      ],
    },
    {
      name: 'endpoint',
      type: 'text',
      required: true,
    },
    {
      name: 'method',
      type: 'select',
      required: true,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
      ],
    },
    {
      name: 'requestHeaders',
      type: 'json',
    },
    {
      name: 'requestBody',
      type: 'textarea',
    },
    {
      name: 'responseStatus',
      type: 'number',
    },
    {
      name: 'responseHeaders',
      type: 'json',
    },
    {
      name: 'responseBody',
      type: 'textarea',
    },
    {
      name: 'responseTime',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Timeout', value: 'timeout' },
      ],
    },
    {
      name: 'error',
      type: 'textarea',
    },
    {
      name: 'projectId',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
    },
  ],
}
```

### Service Logger

```typescript
// lib/logging/service-logger.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface ServiceLogEntry {
  requestId: string
  service: 'lastframe' | 'r2' | 'external'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  requestHeaders?: Record<string, string>
  requestBody?: string
  responseStatus?: number
  responseHeaders?: Record<string, string>
  responseBody?: string
  responseTime: number
  status: 'success' | 'error' | 'timeout'
  error?: string
  projectId?: string
  userId?: string
}

export class ServiceLogger {
  static async logRequest(entry: ServiceLogEntry) {
    try {
      const payload = await getPayload({ config: configPromise })
      
      await payload.create({
        collection: 'service-logs',
        data: {
          ...entry,
          createdAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to log service request:', error)
    }
  }

  static async logHTTPRequest(
    requestId: string,
    service: string,
    url: string,
    method: string,
    requestData: {
      headers?: Record<string, string>
      body?: any
    },
    response: {
      status: number
      headers?: Record<string, string>
      body?: any
    },
    responseTime: number,
    projectId?: string,
    userId?: string
  ) {
    const entry: ServiceLogEntry = {
      requestId,
      service: service as any,
      endpoint: url,
      method: method as any,
      requestHeaders: requestData.headers,
      requestBody: typeof requestData.body === 'string' 
        ? requestData.body 
        : JSON.stringify(requestData.body),
      responseStatus: response.status,
      responseHeaders: response.headers,
      responseBody: typeof response.body === 'string'
        ? response.body
        : JSON.stringify(response.body),
      responseTime,
      status: response.status < 400 ? 'success' : 'error',
      projectId,
      userId,
    }

    await this.logRequest(entry)
  }
}
```

## Instrumented HTTP Client

```typescript
// lib/logging/instrumented-fetch.ts
import { ServiceLogger } from './service-logger'

export async function instrumentedFetch(
  url: string,
  options: RequestInit & {
    service?: string
    projectId?: string
    userId?: string
  } = {}
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  const { service = 'external', projectId, userId, ...fetchOptions } = options

  try {
    const response = await fetch(url, fetchOptions)
    const responseTime = Date.now() - startTime
    
    // Clone response to read body without consuming it
    const responseClone = response.clone()
    const responseBody = await responseClone.text()

    await ServiceLogger.logHTTPRequest(
      requestId,
      service,
      url,
      fetchOptions.method || 'GET',
      {
        headers: fetchOptions.headers as Record<string, string>,
        body: fetchOptions.body,
      },
      {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
      },
      responseTime,
      projectId,
      userId
    )

    return response
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    await ServiceLogger.logRequest({
      requestId,
      service: service as any,
      endpoint: url,
      method: (fetchOptions.method || 'GET') as any,
      requestHeaders: fetchOptions.headers as Record<string, string>,
      requestBody: fetchOptions.body as string,
      responseTime,
      status: 'error',
      error: error.message,
      projectId,
      userId,
    })

    throw error
  }
}
```

## System Activity Logging

### Activity Logs Collection

```typescript
// collections/ActivityLogs.ts
import { CollectionConfig } from 'payload'

export const ActivityLogs: CollectionConfig = {
  slug: 'activity-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'userId', 'projectId', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Project Management', value: 'project' },
        { label: 'AI Generation', value: 'ai' },
        { label: 'Media Processing', value: 'media' },
        { label: 'User Action', value: 'user' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Error', value: 'error' },
        { label: 'Warning', value: 'warning' },
        { label: 'Info', value: 'info' },
      ],
    },
    {
      name: 'details',
      type: 'json',
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'projectId',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'ipAddress',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
  ],
}
```

### Activity Logger

```typescript
// lib/logging/activity-logger.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface ActivityLogEntry {
  action: string
  category: 'project' | 'ai' | 'media' | 'user' | 'system'
  status: 'success' | 'error' | 'warning' | 'info'
  details?: Record<string, any>
  userId?: string
  projectId?: string
  ipAddress?: string
  userAgent?: string
}

export class ActivityLogger {
  static async log(entry: ActivityLogEntry) {
    try {
      const payload = await getPayload({ config: configPromise })
      
      await payload.create({
        collection: 'activity-logs',
        data: {
          ...entry,
          createdAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  static async logProjectCreated(projectId: string, userId: string, details: any) {
    await this.log({
      action: 'project_created',
      category: 'project',
      status: 'success',
      details,
      userId,
      projectId,
    })
  }

  static async logAIGeneration(
    action: string,
    projectId: string,
    userId: string,
    status: 'success' | 'error',
    details: any
  ) {
    await this.log({
      action,
      category: 'ai',
      status,
      details,
      userId,
      projectId,
    })
  }

  static async logMediaProcessing(
    action: string,
    projectId: string,
    status: 'success' | 'error',
    details: any
  ) {
    await this.log({
      action,
      category: 'media',
      status,
      details,
      projectId,
    })
  }

  static async logUserAction(
    action: string,
    userId: string,
    projectId?: string,
    details?: any,
    request?: Request
  ) {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await this.log({
      action,
      category: 'user',
      status: 'info',
      details,
      userId,
      projectId,
      ipAddress,
      userAgent,
    })
  }
}
```

## Audit Reports

```typescript
// lib/logging/audit-reports.ts
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export class AuditReports {
  // Generate LLM usage report
  static async generateLLMUsageReport(
    startDate: Date,
    endDate: Date,
    projectId?: string
  ) {
    const payload = await getPayload({ config: configPromise })
    
    const where: any = {
      createdAt: {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      },
    }
    
    if (projectId) {
      where.projectId = { equals: projectId }
    }

    const logs = await payload.find({
      collection: 'llm-logs',
      where,
      limit: 10000,
    })

    const report = {
      totalRequests: logs.totalDocs,
      totalCost: logs.docs.reduce((sum, log) => sum + (log.cost || 0), 0),
      totalTokens: logs.docs.reduce((sum, log) => sum + (log.tokenUsage?.totalTokens || 0), 0),
      averageResponseTime: logs.docs.reduce((sum, log) => sum + log.responseTime, 0) / logs.totalDocs,
      providerBreakdown: this.groupBy(logs.docs, 'provider'),
      modelBreakdown: this.groupBy(logs.docs, 'model'),
      errorRate: logs.docs.filter(log => log.status === 'error').length / logs.totalDocs,
    }

    return report
  }

  // Generate service usage report
  static async generateServiceUsageReport(
    startDate: Date,
    endDate: Date,
    service?: string
  ) {
    const payload = await getPayload({ config: configPromise })
    
    const where: any = {
      createdAt: {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      },
    }
    
    if (service) {
      where.service = { equals: service }
    }

    const logs = await payload.find({
      collection: 'service-logs',
      where,
      limit: 10000,
    })

    const report = {
      totalRequests: logs.totalDocs,
      averageResponseTime: logs.docs.reduce((sum, log) => sum + log.responseTime, 0) / logs.totalDocs,
      serviceBreakdown: this.groupBy(logs.docs, 'service'),
      statusBreakdown: this.groupBy(logs.docs, 'status'),
      errorRate: logs.docs.filter(log => log.status === 'error').length / logs.totalDocs,
    }

    return report
  }

  private static groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown'
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }
}
```

## Environment Configuration

```env
# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Audit Settings
AUDIT_RETENTION_DAYS=365
AUDIT_EXPORT_ENABLED=true

# Performance Monitoring
SLOW_QUERY_THRESHOLD=5000  # milliseconds
ENABLE_PERFORMANCE_LOGGING=true
```

## Usage Examples

```typescript
// Example: Instrumented AI service call
export async function generateScriptWithLogging(
  projectId: string,
  userId: string,
  prompt: string
) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    const response = await generateWithLLM(prompt)
    const responseTime = Date.now() - startTime

    await LLMLogger.logOpenRouterRequest(
      requestId,
      'anthropic/claude-sonnet-4',
      prompt,
      response,
      responseTime,
      projectId,
      userId
    )

    await ActivityLogger.logAIGeneration(
      'script_generated',
      projectId,
      userId,
      'success',
      { requestId, responseTime }
    )

    return response
  } catch (error) {
    const responseTime = Date.now() - startTime

    await LLMLogger.logError(
      requestId,
      'openrouter',
      'anthropic/claude-sonnet-4',
      prompt,
      error,
      responseTime,
      projectId,
      userId
    )

    await ActivityLogger.logAIGeneration(
      'script_generation_failed',
      projectId,
      userId,
      'error',
      { requestId, error: error.message }
    )

    throw error
  }
}
```
