# Movie Style Collection

## Overview
The Movie Style collection defines visual and artistic styles available for AI movie generation. These styles are specifically chosen based on current LLM capabilities for generating consistent visual content.

## Collection Configuration
- **Slug**: `movie-styles`
- **Admin Title Field**: `name`
- **Seeding Required**: Yes

## Fields

### name
- **Type**: `text`
- **Required**: `true`
- **Description**: The display name of the movie style (e.g., "Cinematic Realism", "Animation", "Film Noir")
- **Admin**: Used as title field

### slug
- **Type**: `text`
- **Required**: `true`
- **Unique**: `true`
- **Description**: URL-friendly identifier for the style (e.g., "cinematic-realism", "animation", "film-noir")

### description
- **Type**: `textarea`
- **Required**: `false`
- **Description**: Detailed description of the visual style and its characteristics

## Seeding Data Required
Initial styles to be seeded:
- Cinematic Realism (primary style)
- Animation (2D/3D compatible)
- Film Noir (black & white aesthetic)
- Sci-Fi (futuristic elements)
- Fantasy (magical/mythical elements)