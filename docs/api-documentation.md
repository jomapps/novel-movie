# API Documentation

## Overview

The Novel Movie API is built around a project-centric architecture where all workflow operations are scoped to individual projects. This ensures proper data isolation, security, and context management.

## Authentication

All API endpoints require authentication via JWT tokens or session cookies provided by PayloadCMS.

```typescript
// Headers required for all requests
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

## Project Management Endpoints

### List Projects

```http
GET /api/projects
```

**Description**: Get all projects accessible to the authenticated user.

**Query Parameters**:
- `limit` (number): Maximum number of projects to return (default: 10)
- `page` (number): Page number for pagination (default: 1)
- `sort` (string): Sort field (default: "-updatedAt")
- `where` (object): Filter conditions

**Response**:
```json
{
  "docs": [
    {
      "id": "project_id",
      "name": "My Movie Project",
      "format": "feature-film",
      "style": "cinematic-realism",
      "duration": 120,
      "status": "active",
      "workflowStatus": {
        "currentStep": "initial-concept",
        "completedSteps": [
          {
            "step": "project-setup",
            "completedAt": "2024-01-15T10:30:00Z"
          }
        ],
        "lastActivity": "2024-01-15T14:22:00Z"
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:22:00Z"
    }
  ],
  "totalDocs": 25,
  "limit": 10,
  "page": 1,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### Create Project

```http
POST /api/projects
```

**Request Body**:
```json
{
  "name": "New Movie Project",
  "format": "feature-film",
  "style": "cinematic-realism",
  "duration": 120,
  "description": "A thrilling adventure story"
}
```

**Response**:
```json
{
  "id": "new_project_id",
  "name": "New Movie Project",
  "format": "feature-film",
  "style": "cinematic-realism",
  "duration": 120,
  "status": "active",
  "workflowStatus": {
    "currentStep": "project-setup",
    "completedSteps": [],
    "lastActivity": "2024-01-15T15:00:00Z"
  },
  "createdAt": "2024-01-15T15:00:00Z",
  "updatedAt": "2024-01-15T15:00:00Z"
}
```

### Get Project Details

```http
GET /api/projects/{projectId}
```

**Parameters**:
- `projectId` (string): The project ID

**Response**:
```json
{
  "id": "project_id",
  "name": "My Movie Project",
  "format": "feature-film",
  "style": "cinematic-realism",
  "duration": 120,
  "description": "Project description",
  "status": "active",
  "workflowStatus": {
    "currentStep": "initial-concept",
    "completedSteps": [
      {
        "step": "project-setup",
        "completedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lastActivity": "2024-01-15T14:22:00Z"
  },
  "initialConcept": "concept_id",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T14:22:00Z"
}
```

### Update Project

```http
PUT /api/projects/{projectId}
```

**Request Body**:
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "active"
}
```

### Delete Project

```http
DELETE /api/projects/{projectId}
```

**Response**:
```json
{
  "message": "Project deleted successfully",
  "id": "project_id"
}
```

## Initial Concept Endpoints

### Get Initial Concept

```http
GET /api/projects/{projectId}/initial-concept
```

**Response**:
```json
{
  "id": "concept_id",
  "project": "project_id",
  "status": "user-refined",
  "primaryGenres": ["action", "thriller", "drama"],
  "corePremise": "A detailed story premise...",
  "targetAudience": {
    "demographics": ["adults-25-44", "young-adults-18-24"],
    "psychographics": "Action movie enthusiasts, thriller fans",
    "customDescription": "Additional audience details"
  },
  "toneAndMood": {
    "tones": ["serious", "suspenseful"],
    "moods": ["tense", "gritty"],
    "emotionalArc": "Builds tension to climactic resolution"
  },
  "visualStyle": {
    "cinematographyStyle": "realistic",
    "colorPalette": {
      "dominance": "cool",
      "saturation": "high",
      "symbolicColors": "Blue for technology, red for danger"
    },
    "lightingPreferences": "Dramatic lighting with strong contrasts",
    "cameraMovement": "Dynamic camera work with handheld sequences"
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T14:22:00Z"
}
```

### Create/Update Initial Concept

```http
POST /api/projects/{projectId}/initial-concept
PUT /api/projects/{projectId}/initial-concept
```

**Request Body**:
```json
{
  "primaryGenres": ["action", "thriller"],
  "corePremise": "A compelling story about...",
  "targetAudience": {
    "demographics": ["adults-25-44"],
    "psychographics": "Action enthusiasts",
    "customDescription": "Fans of intelligent action films"
  },
  "toneAndMood": {
    "tones": ["serious", "suspenseful"],
    "moods": ["tense"],
    "emotionalArc": "Building tension with satisfying resolution"
  },
  "visualStyle": {
    "cinematographyStyle": "realistic",
    "colorPalette": {
      "dominance": "cool",
      "saturation": "high"
    },
    "lightingPreferences": "Dramatic, high-contrast lighting",
    "cameraMovement": "Dynamic handheld camera work"
  }
}
```

## Workflow Management Endpoints

### Update Workflow Status

```http
PUT /api/projects/{projectId}/workflow-status
```

**Request Body**:
```json
{
  "currentStep": "story-generation",
  "completedStep": "initial-concept"
}
```

**Response**:
```json
{
  "workflowStatus": {
    "currentStep": "story-generation",
    "completedSteps": [
      {
        "step": "project-setup",
        "completedAt": "2024-01-15T10:30:00Z"
      },
      {
        "step": "initial-concept",
        "completedAt": "2024-01-15T15:45:00Z"
      }
    ],
    "lastActivity": "2024-01-15T15:45:00Z"
  }
}
```

### Get Workflow Progress

```http
GET /api/projects/{projectId}/progress
```

**Response**:
```json
{
  "currentStep": "initial-concept",
  "totalSteps": 8,
  "completedSteps": 1,
  "progressPercentage": 12.5,
  "availableSteps": ["project-setup", "initial-concept"],
  "nextStep": "story-generation",
  "canProceed": false,
  "blockers": [
    {
      "step": "initial-concept",
      "issue": "Core premise is required",
      "field": "corePremise"
    }
  ]
}
```

## Configuration Endpoints

### Get Genres

```http
GET /api/config/genres
```

**Response**:
```json
{
  "docs": [
    {
      "id": "action",
      "name": "Action",
      "slug": "action",
      "description": "High-energy films featuring physical feats...",
      "category": "primary",
      "isActive": true,
      "sortOrder": 1
    }
  ]
}
```

### Get Audience Demographics

```http
GET /api/config/audience-demographics
```

### Get Tone Options

```http
GET /api/config/tone-options
```

### Get Mood Descriptors

```http
GET /api/config/mood-descriptors
```

### Get Central Themes

```http
GET /api/config/central-themes
```

### Get Cinematography Styles

```http
GET /api/config/cinematography-styles
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {
      "field": "Specific field error",
      "validation": "Validation details"
    }
  }
}
```

### Common Error Codes

- `PROJECT_NOT_FOUND` (404): Project doesn't exist or user lacks access
- `VALIDATION_ERROR` (400): Request data validation failed
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): User lacks permission for this operation
- `WORKFLOW_VIOLATION` (422): Workflow step requirements not met
- `RELATIONSHIP_ERROR` (422): Related entity constraints violated

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **AI generation endpoints**: 10 requests per minute per user
- **File upload endpoints**: 20 requests per minute per user

## Webhooks

### Project Status Changes

```http
POST /webhooks/project-status
```

**Payload**:
```json
{
  "event": "project.workflow.step_completed",
  "projectId": "project_id",
  "userId": "user_id",
  "data": {
    "previousStep": "initial-concept",
    "currentStep": "story-generation",
    "completedAt": "2024-01-15T16:00:00Z"
  }
}
```

### Available Events

- `project.created`
- `project.updated`
- `project.deleted`
- `project.workflow.step_completed`
- `initial-concept.created`
- `initial-concept.updated`

This API documentation provides comprehensive coverage of all project-centric endpoints and follows RESTful conventions while maintaining the workflow-oriented architecture of the Novel Movie platform.
