# Implementation Steps for Project-Centric Workflow

## Phase 1: Database and Backend Foundation (Week 1)

### Step 1.1: Update Collections ✅ COMPLETED
- [x] Updated Projects collection with workflow status tracking
- [x] Added reverse relationship to InitialConcepts
- [x] Added workflow step validation and progression tracking

### Step 1.2: Generate TypeScript Types
```bash
pnpm run generate:types
```

**Expected Output**: Updated `src/payload-types.ts` with new Project fields

### Step 1.3: Create Project-Scoped API Routes

**Files to Create**:

1. **`src/app/api/projects/[projectId]/route.ts`**
```typescript
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const payload = await getPayload({ config })
  
  try {
    const project = await payload.findByID({
      collection: 'projects',
      id: params.projectId,
      user: request.user, // Add user context
    })
    
    return Response.json(project)
  } catch (error) {
    return Response.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }
}
```

2. **`src/app/api/projects/[projectId]/initial-concept/route.ts`**
3. **`src/app/api/projects/[projectId]/workflow-status/route.ts`**
4. **`src/app/api/projects/[projectId]/progress/route.ts`**

### Step 1.4: Create Configuration API Routes

**Files to Create**:
- `src/app/api/config/genres/route.ts`
- `src/app/api/config/audience-demographics/route.ts`
- `src/app/api/config/tone-options/route.ts`
- `src/app/api/config/mood-descriptors/route.ts`
- `src/app/api/config/central-themes/route.ts`
- `src/app/api/config/cinematography-styles/route.ts`

### Step 1.5: Create Middleware for Project Validation

**File**: `src/middleware/projectValidation.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function validateProjectAccess(
  request: NextRequest,
  projectId: string
) {
  const payload = await getPayload({ config })
  
  try {
    const project = await payload.findByID({
      collection: 'projects',
      id: projectId,
      user: request.user,
    })
    
    return { project, error: null }
  } catch (error) {
    return { project: null, error: 'Project not found or access denied' }
  }
}
```

## Phase 2: Routing Infrastructure (Week 2)

### Step 2.1: Create Project Context Provider

**File**: `src/contexts/ProjectContext.tsx`
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Project } from '@/payload-types'

interface ProjectContextType {
  project: Project | null
  loading: boolean
  error: string | null
  refreshProject: () => Promise<void>
  updateWorkflowStep: (step: string) => Promise<void>
  canAccessStep: (step: string) => boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ 
  children, 
  projectId 
}: { 
  children: React.ReactNode
  projectId: string 
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Implementation details...
  
  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
```

### Step 2.2: Create New Route Structure

**Directory Structure to Create**:
```
src/app/(frontend)/projects/
├── page.tsx                           # Project listing
├── create/
│   └── page.tsx                      # Create project form
└── [projectId]/
    ├── layout.tsx                    # Project-scoped layout
    ├── page.tsx                      # Project dashboard
    ├── loading.tsx                   # Loading state
    ├── error.tsx                     # Error boundary
    ├── not-found.tsx                 # Not found page
    ├── initial-concept/
    │   ├── page.tsx
    │   ├── loading.tsx
    │   └── components/
    │       ├── ConceptForm.tsx
    │       └── ConceptNavigation.tsx
    ├── story-generation/
    │   └── page.tsx
    ├── character-development/
    │   └── page.tsx
    ├── scene-planning/
    │   └── page.tsx
    ├── media-generation/
    │   └── page.tsx
    ├── post-production/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

### Step 2.3: Implement Project Layout

**File**: `src/app/(frontend)/projects/[projectId]/layout.tsx`
```typescript
import { notFound } from 'next/navigation'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ProjectNavigation } from '@/components/navigation/ProjectNavigation'
import { getProject } from '@/lib/api/projects'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const project = await getProject(params.projectId)
  
  if (!project) {
    notFound()
  }

  return (
    <ProjectProvider projectId={params.projectId}>
      <div className="project-layout">
        <ProjectNavigation />
        <main className="project-content">
          {children}
        </main>
      </div>
    </ProjectProvider>
  )
}
```

### Step 2.4: Create Project Dashboard

**File**: `src/app/(frontend)/projects/[projectId]/page.tsx`
```typescript
import { ProjectOverview } from '@/components/project/ProjectOverview'
import { WorkflowProgress } from '@/components/project/WorkflowProgress'
import { QuickActions } from '@/components/project/QuickActions'

export default function ProjectDashboard({
  params,
}: {
  params: { projectId: string }
}) {
  return (
    <div className="project-dashboard">
      <ProjectOverview />
      <WorkflowProgress />
      <QuickActions />
    </div>
  )
}
```

## Phase 3: Navigation Components (Week 3)

### Step 3.1: Create Project Selector

**File**: `src/components/navigation/ProjectSelector.tsx`
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/payload-types'

export function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const router = useRouter()

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    router.push(`/projects/${project.id}`)
  }

  // Implementation details...
  
  return (
    <div className="project-selector">
      {/* Dropdown implementation */}
    </div>
  )
}
```

### Step 3.2: Create Workflow Navigation

**File**: `src/components/navigation/WorkflowNavigation.tsx`
```typescript
'use client'

import { useProject } from '@/contexts/ProjectContext'
import { WorkflowStep } from '@/components/navigation/WorkflowStep'

const WORKFLOW_STEPS = [
  { id: 'project-setup', name: 'Project Setup', path: '' },
  { id: 'initial-concept', name: 'Initial Concept', path: '/initial-concept' },
  { id: 'story-generation', name: 'Story Generation', path: '/story-generation' },
  // ... other steps
]

export function WorkflowNavigation() {
  const { project, canAccessStep } = useProject()

  return (
    <nav className="workflow-navigation">
      {WORKFLOW_STEPS.map((step) => (
        <WorkflowStep
          key={step.id}
          step={step}
          isActive={project?.workflowStatus?.currentStep === step.id}
          isAccessible={canAccessStep(step.id)}
          isCompleted={project?.workflowStatus?.completedSteps?.some(
            (completed) => completed.step === step.id
          )}
        />
      ))}
    </nav>
  )
}
```

### Step 3.3: Create Breadcrumb Navigation

**File**: `src/components/navigation/Breadcrumbs.tsx`

## Phase 4: Workflow Pages (Week 4)

### Step 4.1: Migrate Initial Concept Page

**File**: `src/app/(frontend)/projects/[projectId]/initial-concept/page.tsx`
```typescript
import { InitialConceptForm } from '@/components/workflow/InitialConceptForm'
import { ConceptNavigation } from '@/components/workflow/ConceptNavigation'

export default function InitialConceptPage({
  params,
}: {
  params: { projectId: string }
}) {
  return (
    <div className="initial-concept-page">
      <div className="workflow-header">
        <h1>Initial Concept Development</h1>
        <p>Create a comprehensive creative blueprint for your project</p>
      </div>
      
      <InitialConceptForm projectId={params.projectId} />
      <ConceptNavigation />
    </div>
  )
}
```

### Step 4.2: Create Workflow Form Components

**Files to Create**:
- `src/components/workflow/InitialConceptForm.tsx`
- `src/components/workflow/ConceptNavigation.tsx`
- `src/components/workflow/WorkflowStepWrapper.tsx`

### Step 4.3: Implement Form State Management

**File**: `src/hooks/useWorkflowForm.ts`
```typescript
import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'

export function useWorkflowForm<T>(
  initialData: T,
  onSave: (data: T) => Promise<void>
) {
  const [formData, setFormData] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save implementation
  // Form validation
  // Error handling
  
  return {
    formData,
    setFormData,
    isDirty,
    isSaving,
    save: handleSave,
    reset: handleReset,
  }
}
```

## Phase 5: Testing and Polish (Week 5)

### Step 5.1: Create Test Suite

**Files to Create**:
- `src/__tests__/api/projects.test.ts`
- `src/__tests__/components/ProjectSelector.test.tsx`
- `src/__tests__/contexts/ProjectContext.test.tsx`
- `src/__tests__/workflows/initial-concept.test.ts`

### Step 5.2: End-to-End Testing

**File**: `cypress/e2e/project-workflow.cy.ts`
```typescript
describe('Project Workflow', () => {
  it('should complete initial concept workflow', () => {
    cy.visit('/projects')
    cy.get('[data-testid="create-project"]').click()
    // ... test implementation
  })
})
```

### Step 5.3: Performance Optimization

- Implement route-level code splitting
- Add loading states and skeleton screens
- Optimize bundle sizes
- Add caching strategies

### Step 5.4: Documentation Updates

- Update README.md with new architecture
- Create user guides for new workflow
- Update API documentation
- Create developer onboarding guide

## Validation Checklist

### Database ✅
- [x] Projects collection updated with workflow tracking
- [x] Reverse relationships properly configured
- [x] TypeScript types generated

### API Endpoints
- [ ] Project CRUD operations
- [ ] Initial concept endpoints
- [ ] Workflow status management
- [ ] Configuration endpoints
- [ ] Error handling and validation

### Routing
- [ ] Project-scoped route structure
- [ ] Project context provider
- [ ] Navigation components
- [ ] Error boundaries and loading states

### User Experience
- [ ] Project selector functionality
- [ ] Workflow step navigation
- [ ] Form state management
- [ ] Auto-save functionality
- [ ] Progress tracking

### Testing
- [ ] Unit tests for all components
- [ ] API endpoint testing
- [ ] End-to-end workflow testing
- [ ] Performance testing

This implementation plan provides a structured approach to building the project-centric workflow architecture while maintaining system stability and user experience quality.
