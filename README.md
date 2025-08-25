# Novel Movie

> AI-powered movie production platform for in-house film creation

## Overview

Novel Movie automates the entire movie production pipeline using AI, from script generation to final video assembly. Built for internal production use with step-by-step workflow automation.

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