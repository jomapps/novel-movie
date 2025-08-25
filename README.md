# Novel Movie

> AI-powered movie production platform for in-house film creation

## Overview

Novel Movie automates the entire movie production pipeline using AI, from script generation to final video assembly. Built for internal production use with step-by-step workflow automation.

## Tech Stack

- **Frontend**: Next.js 15.x + React 19.x
- **Backend**: PayloadCMS 3.x + MongoDB
- **AI**: OpenRouter (LLMs) + Fal.ai (Media Generation) + BAML (Prompts)
- **Queue**: bee-queue + Redis
- **Storage**: Cloudflare R2
- **Processing**: Last Frame Service

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