# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Novel Movie is an AI-powered movie production platform that automates the entire movie production pipeline from script generation to final video assembly. The platform uses a **project-centric architecture** where all creative decisions and assets are organized within individual movie projects following a structured 8-step workflow.

## Essential Development Commands

### Setup & Development
```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Configure your API keys in .env

# Generate TypeScript types from PayloadCMS
pnpm run generate:types

# Start development server
pnpm run dev

# Clean development start (removes .next directory)
pnpm run devsafe
```

### Database & Seeding
```bash
# Seed database with initial data from /seed folder
pnpm run payload seed

# PayloadCMS CLI access
pnpm run payload
```

### Testing
```bash
# Run all tests (integration + e2e)
pnpm run test

# Run only integration tests
pnpm run test:int

# Run only end-to-end tests
pnpm run test:e2e
```

### Production
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.x + React 19.x + Tailwind CSS 4.x
- **Backend**: PayloadCMS 3.x + MongoDB
- **AI**: OpenRouter (LLMs) + Fal.ai (Media Generation) + BAML (Prompts)
- **Queue**: bee-queue + Redis
- **Storage**: Cloudflare R2
- **Testing**: Vitest (integration) + Playwright (e2e)

### Project Structure
```
src/
├── app/
│   ├── (frontend)/           # Frontend pages (dashboard)
│   ├── (payload)/            # PayloadCMS admin
│   └── v1/                   # All custom API routes (versioned)
│       ├── projects/         # Project management endpoints
│       ├── movie-formats/    # Configuration endpoints
│       └── movie-styles/
├── collections/              # PayloadCMS collections
├── components/               # Reusable React components
├── lib/                      # Utility functions
└── payload.config.ts         # PayloadCMS configuration

baml_src/                     # BAML AI prompt templates
├── clients.baml              # OpenRouter client config
└── project_autofill.baml     # Project generation prompts
```

### Key Collections (PayloadCMS + MongoDB)

**Core Collections:**
- `Projects` - Main project entity with workflow status
- `InitialConcepts` - Comprehensive creative blueprints (1:1 with Projects)
- `Series` - Episodic content management

**Configuration Collections:**
- `MovieFormats`, `MovieStyles`, `Genres`, `AudienceDemographics`
- `ToneOptions`, `MoodDescriptors`, `CentralThemes`, `CinematographyStyles`

### Workflow Architecture

The platform follows an 8-step project-centric workflow:
1. **Project Setup** - Basic information (name, format, style, duration)
2. **Initial Concept** - 12-field comprehensive creative blueprint
3. **Story Generation** - AI-assisted script development
4. **Character Development** - Character creation and development
5. **Scene Planning** - Scene breakdown and planning
6. **Media Generation** - Asset creation and media production
7. **Post Production** - Editing and post-production workflow
8. **Final Review** - Quality assurance and final delivery

### Routing Pattern
All workflow operations use project-scoped routing:
```
/projects                                    # Project listing
/projects/[projectId]                       # Project dashboard
/projects/[projectId]/initial-concept       # Workflow steps...
/projects/[projectId]/story-generation
/projects/[projectId]/character-development
/projects/[projectId]/scene-planning
/projects/[projectId]/media-generation
/projects/[projectId]/post-production
/projects/[projectId]/settings
```

## Critical Development Rules

### API Development
- **All custom routes must be nested under `/src/app/v1/`** for versioning
- **Prefer server-side components** over API routes when possible
- **Always await `params` and `searchParams`** in Next.js components
- **Project Context Required**: All workflow data must be validated against project ownership

### Code Standards
- **No Token Limiting**: Never limit tokens; use prompts to control LLM output
- **No Fallbacks/Mocks**: Production-ready code only, no placeholder data
- **Server-First**: Prefer server components over client components when possible
- **Async Patterns**: Always await async operations properly

### Error Handling Pattern
```typescript
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    // Your logic
    return Response.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## AI Services Integration

### OpenRouter (LLM)
- **Default Model**: `anthropic/claude-sonnet-4`
- **Advanced Model**: `google/gemini-2.5-pro`
- Configuration in `baml_src/clients.baml`

### Fal.ai (Media Generation)
- **Text-to-Image**: `fal-ai/flux-pro/kontext/text-to-image`
- **Image-to-Video**: `fal-ai/wan/v2.2-a14b/image-to-video`
- **Text-to-Video**: `fal-ai/veo3/text-to-video`

### BAML Integration
- Prompt templates in `baml_src/`
- Type-safe AI function calls
- Generated client in `baml_client/`

## Environment Variables

```env
# Core
DATABASE_URI=mongodb://127.0.0.1/novel-movie
PAYLOAD_SECRET=your_secret_here

# AI Services
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MILLION_MODEL=google/gemini-2.5-pro
FAL_KEY=your_fal_key

# Storage
CLOUDFLARE_R2_ACCESS_KEY=your_key
CLOUDFLARE_R2_SECRET_KEY=your_secret

# Queue
REDIS_URL=redis://localhost:6379
```

## Testing Approach

### Unit Tests (Vitest)
- Located in `tests/int/**/*.int.spec.ts`
- Use `jsdom` environment
- Test individual functions and components

### E2E Tests (Playwright)
- Located in `tests/e2e/`
- Test complete user workflows
- Automatically start dev server during testing

### Testing Workflow Steps
Focus testing on:
- Project creation and management
- Workflow step transitions
- AI generation pipeline
- Media processing workflows

## Database Initialization

The `/seed` folder contains JSON files for initializing lookup collections:
- `genres.json` - Film genres with characteristics
- `audience-demographics.json` - Target audience classifications  
- `tone-options.json` - Story tone options
- `mood-descriptors.json` - Emotional atmosphere descriptors
- `central-themes.json` - Universal themes
- `cinematography-styles.json` - Visual approaches
- `movie-formats.json` - Format types

## Development Workflow

1. **Start with Project Context**: All features should consider which project they're operating on
2. **Follow Workflow Steps**: Understand the 8-step production pipeline
3. **Use Generated Types**: Always run `pnpm run generate:types` after collection changes
4. **Test AI Integration**: Ensure AI services are properly configured and working
5. **Validate Relationships**: Projects have complex relationships with configuration collections
6. **Consider Workflow Status**: Track user progress through the production pipeline

## Docker Development

Use the provided `docker-compose.yml` for containerized development:
```bash
docker-compose up
```

This provides:
- MongoDB instance
- Node.js development environment
- Volume mounting for live development
