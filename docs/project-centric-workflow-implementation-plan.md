# Project-Centric Workflow Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for establishing a project-centric workflow architecture in the Novel Movie platform. The architecture ensures all workflow steps are properly scoped to individual projects with proper navigation and data relationships.

## 1. Database Relationship Updates

### 1.1 Projects Collection Updates ✅ COMPLETED

**File**: `src/collections/Projects.ts`

**Changes Made**:
- Added reverse relationship field `initialConcept` to Projects collection
- Implemented bidirectional one-to-one relationship with InitialConcepts
- Added workflow status tracking with current step and completion history
- Added automatic last activity timestamp updates
- **CRITICAL**: Changed `longDescription` from `richText` to `textarea` to prevent data corruption

**⚠️ Important Field Type Note**:
All text fields that will receive AI-generated content or programmatic data must use `textarea` instead of `richText`. The Lexical editor in PayloadCMS expects structured JSON data and will corrupt plain string content.

**New Fields Added**:
```typescript
{
  name: 'initialConcept',
  type: 'relationship',
  relationTo: 'initial-concepts',
  admin: {
    description: 'Associated initial concept for this project',
    readOnly: true,
  }
}

{
  name: 'workflowStatus',
  type: 'group',
  fields: [
    {
      name: 'currentStep',
      type: 'select',
      options: [
        'project-setup', 'initial-concept', 'story-generation',
        'character-development', 'scene-planning', 'media-generation',
        'post-production', 'final-review', 'completed'
      ]
    },
    {
      name: 'completedSteps',
      type: 'array',
      // Tracks step completion with timestamps
    },
    {
      name: 'lastActivity',
      type: 'date',
      // Auto-updated on project changes
    }
  ]
}
```

### 1.2 InitialConcepts Collection Updates

**Status**: ✅ ALREADY IMPLEMENTED
- One-to-one relationship with Projects already exists
- Unique constraint ensures one concept per project
- Hooks update project status when concept is created/updated

### 1.3 Field Type Best Practices ⚠️ CRITICAL

**Documentation**: See `docs/payloadcms-field-types-guide.md` for complete guidelines

**Key Rules**:
- **NEVER use `richText`** for AI-generated or programmatically populated content
- **Always use `textarea`** for long-form text that may come from external sources
- **Use `text`** for short, single-line inputs
- **Only use `richText`** when users create content directly in PayloadCMS admin

**Field Type Checklist**:
```typescript
// ❌ DON'T - Will cause data corruption
{
  name: 'aiGeneratedContent',
  type: 'richText',  // Lexical editor expects JSON, not strings
}

// ✅ DO - Safe for all content sources
{
  name: 'aiGeneratedContent',
  type: 'textarea',  // Handles plain text safely
  admin: {
    rows: 6,
    description: 'AI-generated or user-written content',
  },
}
```

### 1.4 TypeScript Definition Updates

**Required Action**: Generate new types after database changes
```bash
pnpm run generate:types
```

## 2. Routing Architecture Implementation

### 2.1 Current Routing Structure

**Existing Routes**:
```
/projects - Project listing
/project/create - Create new project
/project/[id] - Project detail view
```

### 2.2 New Project-Scoped Routing Structure

**Target Architecture**:
```
/projects - Project listing and management
/projects/[projectId] - Project dashboard/overview
/projects/[projectId]/initial-concept - Initial concept workflow
/projects/[projectId]/story-generation - Story generation workflow
/projects/[projectId]/character-development - Character development
/projects/[projectId]/scene-planning - Scene planning
/projects/[projectId]/media-generation - Media generation
/projects/[projectId]/post-production - Post-production
/projects/[projectId]/settings - Project settings
```

### 2.3 Implementation Steps

#### Step 1: Create New Route Structure
**Files to Create**:
```
src/app/(frontend)/projects/[projectId]/
├── page.tsx                    # Project dashboard
├── layout.tsx                  # Project-scoped layout
├── initial-concept/
│   ├── page.tsx               # Initial concept form
│   └── loading.tsx            # Loading state
├── story-generation/
│   ├── page.tsx               # Story generation interface
│   └── loading.tsx
├── character-development/
│   ├── page.tsx
│   └── loading.tsx
├── scene-planning/
│   ├── page.tsx
│   └── loading.tsx
├── media-generation/
│   ├── page.tsx
│   └── loading.tsx
├── post-production/
│   ├── page.tsx
│   └── loading.tsx
└── settings/
    ├── page.tsx
    └── loading.tsx
```

#### Step 2: Project Context Provider
**File**: `src/contexts/ProjectContext.tsx`
```typescript
interface ProjectContextType {
  project: Project | null
  loading: boolean
  error: string | null
  refreshProject: () => Promise<void>
  updateWorkflowStep: (step: string) => Promise<void>
}
```

#### Step 3: Project Layout Component
**File**: `src/app/(frontend)/projects/[projectId]/layout.tsx`
- Provides project context to all child routes
- Handles project loading and error states
- Implements project-specific navigation
- Manages workflow step progression

#### Step 4: Route Parameter Extraction
**Implementation Pattern**:
```typescript
// In each workflow page
export default async function WorkflowPage({ 
  params 
}: { 
  params: { projectId: string } 
}) {
  const project = await getProject(params.projectId)
  // Pre-populate forms and filter data by project
}
```

## 3. Navigation and UX Implementation

### 3.1 Project Selector Component

**File**: `src/components/navigation/ProjectSelector.tsx`

**Features**:
- Dropdown with search functionality
- Recent projects quick access
- Create new project option
- Project status indicators

**Integration Points**:
- Main navigation header
- Sidebar navigation
- Breadcrumb navigation

### 3.2 Project-Aware Navigation

**File**: `src/components/navigation/ProjectNavigation.tsx`

**Features**:
- Workflow step indicators
- Progress tracking
- Step validation (prevent skipping required steps)
- Quick navigation between workflow steps

### 3.3 Breadcrumb Navigation

**File**: `src/components/navigation/ProjectBreadcrumbs.tsx`

**Pattern**:
```
Projects > [Project Name] > [Current Workflow Step]
```

### 3.4 Navigation State Management

**Implementation**:
- Use URL state for project selection
- Persist project context across page refreshes
- Handle project switching without losing workflow position
- Implement deep linking to specific workflow steps

## 4. Data Validation and Error Handling

### 4.1 Project Context Validation

**Middleware**: `src/middleware/projectContext.ts`
- Validate project ID exists and user has access
- Redirect to project selection if context is missing
- Handle project not found scenarios

### 4.2 Workflow Step Validation

**Rules**:
- Users cannot skip required workflow steps
- Validate data completeness before step progression
- Handle incomplete data gracefully
- Provide clear error messages and guidance

### 4.3 Error Boundaries

**Components**:
- Project-level error boundary
- Workflow step error boundaries
- Graceful degradation for missing data

## 5. API Endpoint Updates

### 5.1 Project-Scoped Endpoints

**New API Routes**:
```
GET    /api/projects/[projectId]                    # Get project details
PUT    /api/projects/[projectId]                    # Update project
GET    /api/projects/[projectId]/initial-concept    # Get concept
POST   /api/projects/[projectId]/initial-concept    # Create/update concept
PUT    /api/projects/[projectId]/workflow-status    # Update workflow step
GET    /api/projects/[projectId]/progress           # Get workflow progress
```

### 5.2 Data Filtering

**Implementation**:
- All workflow data queries filtered by project ID
- Automatic project context injection in API routes
- Validation of project ownership/access rights

## 6. Implementation Timeline

### Phase 1: Database and Backend (Week 1)
- ✅ Update Projects collection with relationships
- ✅ Generate new TypeScript types
- Create project-scoped API endpoints
- Implement data validation middleware

### Phase 2: Routing Infrastructure (Week 2)
- Create new route structure
- Implement project context provider
- Build project layout component
- Add route parameter extraction

### Phase 3: Navigation Components (Week 3)
- Build project selector component
- Implement project-aware navigation
- Create breadcrumb navigation
- Add workflow step indicators

### Phase 4: Workflow Pages (Week 4)
- Migrate existing workflow components
- Implement project-scoped forms
- Add workflow step validation
- Create loading and error states

### Phase 5: Testing and Polish (Week 5)
- End-to-end testing of workflow
- Error handling validation
- Performance optimization
- Documentation updates

## 7. Migration Strategy

### 7.1 Backward Compatibility
- Maintain existing `/project/[id]` routes during transition
- Implement redirects to new route structure
- Gradual migration of existing projects

### 7.2 Data Migration
- No database migration required (additive changes only)
- Existing projects will auto-populate workflow status
- Initial concepts maintain existing relationships

### 7.3 User Experience Transition
- Soft launch with feature flags
- User education and onboarding
- Feedback collection and iteration

## 8. Success Metrics

### 8.1 Technical Metrics
- Route loading performance < 200ms
- Zero data inconsistencies between projects
- 100% workflow step validation coverage

### 8.2 User Experience Metrics
- Reduced navigation time between workflow steps
- Increased workflow completion rates
- Decreased user errors and confusion

### 8.3 Development Metrics
- Consistent project context across all components
- Simplified data fetching patterns
- Reduced code duplication in workflow components

## Next Steps

1. **Immediate**: Begin Phase 1 implementation
2. **Week 1**: Complete API endpoint creation
3. **Week 2**: Start routing infrastructure development
4. **Ongoing**: Update documentation as implementation progresses

This implementation plan provides a structured approach to creating a robust, project-centric workflow architecture that will significantly improve the user experience and development maintainability of the Novel Movie platform.
