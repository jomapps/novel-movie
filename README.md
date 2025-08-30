# Novel Movie

> AI-powered movie production platform for in-house film creation

## Overview

Novel Movie automates the entire movie production pipeline using AI, from script generation to final video assembly. Built for internal production use with step-by-step workflow automation.

## Project-Centric Architecture

Novel Movie is built around a **project-centric workflow** where every creative decision and asset is organized within individual movie projects. This approach ensures:

- **Contextual Organization**: All workflow steps are scoped to specific projects
- **Guided Progression**: Users follow a structured workflow from concept to completion
- **Data Integrity**: Project relationships ensure data consistency and prevent orphaned content
- **Collaborative Context**: Team members always know which project they're working on

### Workflow Steps

Each project follows a structured workflow with these steps:

1. **Project Setup** - Basic project information (name, format, style, duration)
2. **Initial Concept** - Comprehensive creative blueprint with 12 detailed fields
3. **Story Generation** - AI-assisted script and narrative development
4. **Character Development** - Character creation and development
5. **Scene Planning** - Scene breakdown and planning
6. **Media Generation** - Asset creation and media production
7. **Post Production** - Editing and post-production workflow
8. **Final Review** - Quality assurance and final delivery

### Routing Structure

The platform uses project-scoped routing for all workflow operations:

```
/projects                                    # Project listing and management
/projects/[projectId]                       # Project dashboard and overview
/projects/[projectId]/initial-concept       # Initial concept development
/projects/[projectId]/story-generation      # Story and script generation
/projects/[projectId]/character-development # Character development
/projects/[projectId]/scene-planning        # Scene planning and breakdown
/projects/[projectId]/media-generation      # Media and asset generation
/projects/[projectId]/post-production       # Post-production workflow
/projects/[projectId]/settings              # Project settings
```

### Initial Concept System

The project creation process includes comprehensive story development fields:

- **Core Story Elements**: Genres, premise, target audience, tone, and visual style
- **Professional Standards**: Industry terminology with accessible descriptions
- **AI Integration**: Auto-population with user refinement capabilities
- **Lookup Collections**: 8+ supporting collections with 100+ professional options
- **Comprehensive Seed Data**: Pre-populated with film industry standards

## Tech Stack

- **Frontend**: Next.js 15.x + React 19.x + Tailwind CSS 4.x
- **Backend**: PayloadCMS 3.x + MongoDB
- **AI**: OpenRouter (LLMs) + Fal.ai (Media Generation) + BAML (Prompts)
- **Queue**: bee-queue + Redis
- **Storage**: Cloudflare R2
- **Processing**: Last Frame Service
- **UI**: Modern dashboard interface with sidebar navigation

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Configure your API keys in .env

# Generate types and start
pnpm run generate:types
pnpm run dev
```

## Environment Variables

```env
# Core
MONGODB_URI=mongodb://localhost:27017/novel-movie
REDIS_URL=redis://localhost:6379

# AI Services
OPENROUTER_API_KEY=your_key
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MILLION_MODEL=google/gemini-2.5-pro
FAL_KEY=your_fal_key

# Storage
CLOUDFLARE_R2_ACCESS_KEY=your_key
CLOUDFLARE_R2_SECRET_KEY=your_secret
```

## Development Commands

```bash
# Development
pnpm run dev          # Start dev server
pnpm run devsafe      # Clean start (removes .next)

# Production
pnpm run build        # Build for production
pnpm run start        # Start production server

# Testing
pnpm run test         # Run all tests
pnpm run test:int     # Integration tests
pnpm run test:e2e     # End-to-end tests

# PayloadCMS
pnpm run generate:types    # Generate TypeScript types
pnpm run payload          # PayloadCMS CLI
```

## Database Architecture

### Core Collections

The platform uses PayloadCMS with MongoDB for data management, organized around these core collections:

#### Project Management
- **Projects** - Core project information with workflow status tracking
- **InitialConcepts** - Comprehensive creative blueprints (one-to-one with Projects)
- **Series** - Series and episodic content management

#### Configuration Collections
- **MovieFormats** - Format types (Short Film, Feature Film, Series, etc.)
- **MovieStyles** - Visual styles (Cinematic Realism, Animation, etc.)
- **Genres** - Film genres with detailed characteristics (20+ entries)
- **AudienceDemographics** - Target audience classifications (10+ entries)
- **ToneOptions** - Story tone options (8+ professional classifications)
- **MoodDescriptors** - Emotional atmosphere descriptors (8+ entries)
- **CentralThemes** - Universal themes (Love, Redemption, Justice, etc.)
- **CinematographyStyles** - Visual approaches (Realistic, Stylized, etc.)

#### System Collections
- **Users** - User management with role-based permissions
- **Media** - Asset management and file storage

### Relationship Structure

```
Projects (1) ←→ (1) InitialConcepts
Projects (1) → (n) Series Episodes
Projects (n) → (1) MovieFormat
Projects (n) → (1) MovieStyle
InitialConcepts (n) → (n) Genres (max 3)
InitialConcepts (n) → (n) AudienceDemographics
InitialConcepts (n) → (n) ToneOptions
InitialConcepts (n) → (n) MoodDescriptors
InitialConcepts (n) → (n) CentralThemes
InitialConcepts (n) → (1) CinematographyStyle
```

### Workflow Status Tracking

Each project maintains workflow status with:
- **Current Step**: Active workflow step
- **Completed Steps**: History with timestamps
- **Last Activity**: Automatic activity tracking

## API Architecture

### Project-Scoped Endpoints

All workflow operations are scoped to specific projects:

```
GET    /api/projects                           # List user's projects
POST   /api/projects                           # Create new project
GET    /api/projects/[projectId]               # Get project details
PUT    /api/projects/[projectId]               # Update project
DELETE /api/projects/[projectId]               # Delete project

GET    /api/projects/[projectId]/initial-concept    # Get concept
POST   /api/projects/[projectId]/initial-concept    # Create concept
PUT    /api/projects/[projectId]/initial-concept    # Update concept

PUT    /api/projects/[projectId]/workflow-status    # Update workflow step
GET    /api/projects/[projectId]/progress           # Get workflow progress
```

### Configuration Endpoints

Access to lookup collections for form population:

```
GET    /api/config/genres                     # Get all genres
GET    /api/config/audience-demographics      # Get audience options
GET    /api/config/tone-options              # Get tone options
GET    /api/config/mood-descriptors          # Get mood options
GET    /api/config/central-themes            # Get theme options
GET    /api/config/cinematography-styles     # Get visual styles
```

### Data Validation

- **Project Context**: All workflow data validated against project ownership
- **Workflow Progression**: Users cannot skip required steps
- **Relationship Integrity**: Foreign key validation for all relationships
- **User Permissions**: Role-based access control for all operations

## UI Architecture

Novel Movie features a modern, full-width dashboard interface designed for professional movie production workflows.

### Dashboard Layout

- **Full-width design** - Maximizes screen real estate for content
- **Collapsible sidebar** - Navigation with project management, media library, analytics
- **Responsive design** - Mobile-first approach with adaptive layouts
- **Multi-column layouts** - Efficient use of space with grid systems
- **Modern interface** - Clean, professional design with Tailwind CSS 4.x

### Key UI Components

#### Layout Components
- `DashboardLayout` - Main layout wrapper with sidebar and header
- `Sidebar` - Collapsible navigation with user profile and menu items
- `DashboardHeader` - Top header with search, notifications, and actions

#### Dashboard Components
- `StatsCard` - Metrics display with trend indicators
- `DashboardCard` - Reusable content containers with headers and actions
- `QuickActions` - Action buttons for common tasks

#### Form Components
- `FormField` - Consistent form field wrapper with labels and validation
- `Input`, `Textarea`, `Select` - Styled form controls
- `Button` - Multi-variant button component with loading states

#### UI Components
- `LoadingSpinner` - Loading indicators
- `ErrorBoundary` - Graceful error handling
- `Toast` system - User feedback notifications

### Styling Approach

- **Tailwind CSS 4.x** - Utility-first CSS framework with modern architecture
- **Design tokens** - Consistent spacing, colors, and typography
- **Component-based** - Reusable UI components with proper encapsulation
- **Responsive breakpoints** - Mobile-first responsive design
- **Dark mode ready** - Architecture supports theme switching

### Navigation Structure

```
Dashboard (/)
├── Projects (/projects)
│   ├── Project Detail (/project/[id])
│   └── Create Project (/project/create)
├── Media Library (/media)
├── Analytics (/analytics)
└── Settings (/settings)
```

### Page Layouts

All pages use the `DashboardLayout` component which provides:
- Consistent sidebar navigation
- Header with page title, subtitle, and actions
- Full-width content area with proper spacing
- Responsive behavior for mobile and desktop

## Documentation

Detailed documentation is organized in `/docs/`:

- **[Development Guidelines](docs/development-guidelines.md)** - Coding standards and patterns
- **[PayloadCMS Integration](docs/payloadcms-integration.md)** - CMS setup and usage
- **[AI Services Configuration](docs/ai-services-configuration.md)** - LLM and media generation setup
- **[Queue Management](docs/queue-management.md)** - Background task processing
- **[Media Processing](docs/media-processing.md)** - Video/audio processing workflows
- **[Webhook Integration](docs/webhook-integration.md)** - External service webhooks
- **[Movie Production Workflow](docs/movie-production-workflow.md)** - Step-by-step production process
- **[Logging and Auditing](docs/logging-and-auditing.md)** - System monitoring and audit trails

## License

MIT

## Database initializing data
create a script as follows that will take all the json data in /seed folder and seed the database
```bash
pnpm run payload seed
```

## Payloadcms external scripts
refer to https://payloadcms.com/docs/local-api/outside-nextjs