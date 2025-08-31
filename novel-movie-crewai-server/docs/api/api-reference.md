# API Reference

Complete reference for the Novel Movie CrewAI Server REST API.

## 🌐 Base URL

- **Local Development**: `http://localhost:5001`
- **Production**: `https://your-domain.com` (configured with Nginx)

## 📋 API Overview

The CrewAI Server provides a REST API for orchestrating AI agents that process movie production tasks. All endpoints return JSON responses and use standard HTTP status codes.

### Content Type
All requests and responses use `application/json` content type.

### Authentication
Currently using API key authentication (configurable):
```http
Authorization: Bearer your-api-key
```

## 🔍 Health & Status Endpoints

### GET /health
Check server health and status.

**Response**:
```json
{
  "status": "healthy",
  "service": "novel-movie-crewai-server",
  "version": "1.0.0",
  "port": 5001,
  "timestamp": 1693420800.123
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service is unhealthy

---

### GET /stats
Get server statistics and metrics.

**Response**:
```json
{
  "active_jobs": 3,
  "completed_jobs": 47,
  "failed_jobs": 2,
  "total_jobs": 52,
  "uptime": 86400.5,
  "settings": {
    "workers": 4,
    "log_level": "INFO",
    "environment": "production"
  }
}
```

**Status Codes**:
- `200 OK`: Statistics retrieved successfully

## 🤖 Crew Execution Endpoints

### POST /crews/execute
Execute a CrewAI crew for story processing.

**Request Body**:
```json
{
  "crew_type": "architect",
  "project_id": "project-123",
  "user_id": "user-456",
  "input_data": {
    "story_text": "Your story content here...",
    "preferences": {
      "style": "cinematic",
      "complexity": "medium",
      "focus": "character_development"
    }
  },
  "config": {
    "temperature": 0.7,
    "verbose": true,
    "max_iterations": 3
  }
}
```

**Parameters**:
- `crew_type` (string, required): Type of crew to execute
  - `"architect"`: Story structure analysis
  - `"director"`: Scene breakdown and shot planning
- `project_id` (string, required): Novel Movie project identifier
- `user_id` (string, required): User identifier
- `input_data` (object, required): Input data for the crew
- `config` (object, optional): Crew execution configuration

**Response**:
```json
{
  "success": true,
  "job_id": "architect_project-123_1693420800",
  "message": "Crew architect queued successfully",
  "estimated_time": "2-5 minutes"
}
```

**Error Response**:
```json
{
  "success": false,
  "job_id": "",
  "error": "Unknown crew type: invalid_crew"
}
```

**Status Codes**:
- `200 OK`: Crew execution queued successfully
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error

---

### GET /crews/status/{job_id}
Get the status of a crew execution job.

**Path Parameters**:
- `job_id` (string, required): Job identifier returned from `/crews/execute`

**Response**:
```json
{
  "job_id": "architect_project-123_1693420800",
  "status": "completed",
  "crew_type": "architect",
  "project_id": "project-123",
  "created_at": 1693420800.0,
  "started_at": 1693420805.0,
  "completed_at": 1693420950.0,
  "progress": 100,
  "result": {
    "success": true,
    "phase": "architect",
    "project_id": "project-123",
    "result_summary": "Story analysis completed successfully...",
    "next_phase": "director",
    "recommendations": {
      "proceed_to_scene_breakdown": true,
      "estimated_scenes": 8,
      "complexity_level": "medium"
    }
  }
}
```

**Job Status Values**:
- `"queued"`: Job is waiting to be processed
- `"running"`: Job is currently being executed
- `"completed"`: Job finished successfully
- `"failed"`: Job failed with an error

**Status Codes**:
- `200 OK`: Job status retrieved successfully
- `404 Not Found`: Job ID not found

## 📊 Crew Types

### Architect Crew
Analyzes story structure and creates knowledge graphs.

**Input Data**:
```json
{
  "story_text": "Complete story text to analyze",
  "preferences": {
    "style": "cinematic|documentary|experimental",
    "complexity": "simple|medium|complex",
    "focus": "character_development|plot_structure|visual_storytelling"
  }
}
```

**Output**:
- Story scene breakdown
- Character analysis
- Location mapping
- Theme identification
- Knowledge graph creation in PathRAG

### Director Crew
Breaks down scenes into detailed shot plans.

**Input Data**:
```json
{
  "scenes": "all|specific_scene_ids",
  "preferences": {
    "style": "cinematic|documentary|handheld",
    "pacing": "slow|medium|fast",
    "complexity": "simple|moderate|complex"
  },
  "constraints": {
    "budget": "low|medium|high",
    "crew_size": "minimal|small|standard|large",
    "equipment": "basic|standard|professional",
    "timeline": "tight|flexible|extended"
  }
}
```

**Output**:
- Detailed scene breakdowns
- Shot lists with technical specifications
- Camera movement and angle recommendations
- Lighting and audio requirements
- Production notes and crew requirements

## 🔧 Configuration Options

### Crew Config Parameters
```json
{
  "temperature": 0.7,        // AI creativity level (0.0-1.0)
  "verbose": true,           // Detailed logging
  "max_iterations": 3,       // Maximum task iterations
  "timeout": 300,            // Timeout in seconds
  "model": "anthropic/claude-sonnet-4"  // Override default model
}
```

### Input Data Preferences
```json
{
  "style": "cinematic",      // Visual style preference
  "complexity": "medium",    // Processing complexity
  "focus": "character_development",  // Primary focus area
  "tone": "dramatic",        // Narrative tone
  "pacing": "medium"         // Story pacing preference
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "error": "Error description",
  "status_code": 400,
  "path": "/crews/execute",
  "timestamp": "2025-08-30T18:30:00Z",
  "details": {
    "field": "crew_type",
    "message": "Invalid crew type specified"
  }
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## 📝 Request Examples

### Execute Architect Crew
```bash
curl -X POST http://localhost:5001/crews/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "crew_type": "architect",
    "project_id": "novel-movie-123",
    "user_id": "user-456",
    "input_data": {
      "story_text": "In a grand theatre, Alistair the Great prepares for his final escape trick. The audience watches in anticipation as he enters the water-filled coffin. But something goes wrong - the magic becomes real, and terror ensues.",
      "preferences": {
        "style": "cinematic",
        "complexity": "medium",
        "focus": "character_development"
      }
    },
    "config": {
      "temperature": 0.7,
      "verbose": true
    }
  }'
```

### Check Job Status
```bash
curl -H "Authorization: Bearer your-api-key" \
  http://localhost:5001/crews/status/architect_novel-movie-123_1693420800
```

### Get Server Health
```bash
curl http://localhost:5001/health
```

## 🔄 Webhooks (Future)

Planned webhook support for job completion notifications:

```json
{
  "event": "job.completed",
  "job_id": "architect_project-123_1693420800",
  "status": "completed",
  "timestamp": "2025-08-30T18:30:00Z",
  "result": { /* job result data */ }
}
```

## 📚 SDK Support (Future)

Planned SDK support for popular languages:
- Python SDK
- JavaScript/TypeScript SDK
- Go SDK

---

For more examples and advanced usage, see the [API Examples](./examples.md) documentation.
