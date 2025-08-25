# Routing Architecture

## Overview

Novel Movie implements a project-centric routing architecture where all workflow operations are scoped to individual projects. This ensures proper data isolation, context management, and user experience consistency.

## Route Structure

### Current Implementation

```
/                                    # Landing page
/projects                           # Project listing and management
/project/create                     # Create new project (legacy)
/project/[id]                      # Project detail view (legacy)
```

### Target Project-Centric Structure

```
/projects                                    # Project listing and management
/projects/create                            # Create new project
/projects/[projectId]                       # Project dashboard and overview
/projects/[projectId]/initial-concept       # Initial concept development
/projects/[projectId]/story-generation      # Story and script generation
/projects/[projectId]/character-development # Character development
/projects/[projectId]/scene-planning        # Scene planning and breakdown
/projects/[projectId]/media-generation      # Media and asset generation
/projects/[projectId]/post-production       # Post-production workflow
/projects/[projectId]/settings              # Project settings and configuration
```

## Route Implementation

### 1. Project Listing (`/projects`)

**File**: `src/app/(frontend)/projects/page.tsx`

**Features**:
- Display all user's projects with status indicators
- Quick actions (create, duplicate, delete)
- Filtering and sorting options
- Recent projects section
- Project search functionality

**Data Requirements**:
- User's projects with workflow status
- Project metadata (name, format, style, last activity)
- Progress indicators for each workflow step

### 2. Project Dashboard (`/projects/[projectId]`)

**File**: `src/app/(frontend)/projects/[projectId]/page.tsx`

**Features**:
- Project overview and status
- Workflow step navigation
- Recent activity feed
- Quick actions for next steps
- Project statistics and progress

**Data Requirements**:
- Complete project details
- Workflow status and progress
- Related entities (initial concept, etc.)
- User permissions for the project

### 3. Project Layout (`/projects/[projectId]/layout.tsx`)

**File**: `src/app/(frontend)/projects/[projectId]/layout.tsx`

**Responsibilities**:
- Project context provider
- Project-specific navigation
- Workflow step indicators
- Breadcrumb navigation
- Error boundaries for project-scoped errors

**Context Provided**:
```typescript
interface ProjectContextType {
  project: Project | null
  loading: boolean
  error: string | null
  refreshProject: () => Promise<void>
  updateWorkflowStep: (step: string) => Promise<void>
  canAccessStep: (step: string) => boolean
}
```

### 4. Workflow Step Routes

Each workflow step follows the same pattern:

**File Structure**:
```
/projects/[projectId]/[workflow-step]/
├── page.tsx                    # Main workflow interface
├── loading.tsx                 # Loading state
├── error.tsx                   # Error boundary
└── components/                 # Step-specific components
    ├── StepForm.tsx
    ├── StepNavigation.tsx
    └── StepValidation.tsx
```

**Common Features**:
- Project context consumption
- Form state management
- Auto-save functionality
- Step validation
- Progress tracking
- Navigation controls

## Route Parameters

### Project ID Extraction

All project-scoped routes receive the project ID as a parameter:

```typescript
interface PageProps {
  params: {
    projectId: string
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function WorkflowPage({ params }: PageProps) {
  const projectId = params.projectId
  // Use projectId for data fetching and context
}
```

### Parameter Validation

**Middleware**: `src/middleware/projectValidation.ts`

```typescript
export function validateProjectAccess(projectId: string, userId: string) {
  // Validate project exists
  // Validate user has access
  // Return project data or redirect
}
```

## Navigation Components

### 1. Project Selector

**File**: `src/components/navigation/ProjectSelector.tsx`

**Features**:
- Dropdown with search
- Recent projects
- Create new project
- Project switching

**Integration**:
- Main navigation header
- Persists selection in URL
- Updates project context

### 2. Workflow Navigation

**File**: `src/components/navigation/WorkflowNavigation.tsx`

**Features**:
- Step indicators with progress
- Step validation status
- Quick navigation between steps
- Disabled states for inaccessible steps

**Step Validation Rules**:
```typescript
const stepRequirements = {
  'initial-concept': ['project-setup'],
  'story-generation': ['project-setup', 'initial-concept'],
  'character-development': ['story-generation'],
  'scene-planning': ['character-development'],
  'media-generation': ['scene-planning'],
  'post-production': ['media-generation'],
  'final-review': ['post-production']
}
```

### 3. Breadcrumb Navigation

**File**: `src/components/navigation/Breadcrumbs.tsx`

**Pattern**:
```
Projects > [Project Name] > [Current Step]
```

**Features**:
- Clickable navigation
- Current step highlighting
- Project context display

## Data Fetching Patterns

### Server Components

```typescript
// Project data fetching in layout
export default async function ProjectLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { projectId: string }
}) {
  const project = await getProject(params.projectId)
  
  if (!project) {
    notFound()
  }
  
  return (
    <ProjectProvider project={project}>
      <ProjectNavigation />
      {children}
    </ProjectProvider>
  )
}
```

### Client Components

```typescript
// Using project context in client components
export function WorkflowForm() {
  const { project, updateWorkflowStep } = useProject()
  
  const handleSubmit = async (data) => {
    // Submit form data
    await updateWorkflowStep('next-step')
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## Error Handling

### Route-Level Error Boundaries

**File**: `src/app/(frontend)/projects/[projectId]/error.tsx`

```typescript
export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-boundary">
      <h2>Project Error</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Not Found Handling

**File**: `src/app/(frontend)/projects/[projectId]/not-found.tsx`

```typescript
export default function ProjectNotFound() {
  return (
    <div className="not-found">
      <h2>Project Not Found</h2>
      <p>The project you're looking for doesn't exist or you don't have access.</p>
      <Link href="/projects">Back to Projects</Link>
    </div>
  )
}
```

## URL State Management

### Project Selection Persistence

- Project ID stored in URL path
- Maintains context across page refreshes
- Deep linking to specific workflow steps
- Browser back/forward navigation support

### Query Parameters

```typescript
// Optional query parameters for workflow steps
/projects/[projectId]/initial-concept?tab=genres&edit=true
/projects/[projectId]/story-generation?mode=ai&template=thriller
```

## Migration Strategy

### Phase 1: Parallel Routes
- Maintain existing `/project/[id]` routes
- Implement new `/projects/[projectId]` routes
- Add redirects from old to new routes

### Phase 2: Feature Flags
- Use feature flags to control route access
- Gradual rollout to user segments
- A/B testing of navigation patterns

### Phase 3: Full Migration
- Remove legacy routes
- Update all internal links
- Implement permanent redirects

## Performance Considerations

### Route Optimization
- Static generation where possible
- Incremental Static Regeneration for project data
- Optimized bundle splitting by workflow step

### Data Loading
- Parallel data fetching in layouts
- Streaming for large datasets
- Optimistic updates for form submissions

### Caching Strategy
- Project data caching with revalidation
- Workflow step progress caching
- User-specific cache invalidation

This routing architecture provides a scalable, maintainable foundation for the project-centric workflow while ensuring excellent user experience and developer productivity.
