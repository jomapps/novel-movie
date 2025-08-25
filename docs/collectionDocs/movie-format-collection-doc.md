# Movie Format Collection

## Overview
The Movie Format collection defines different types of movie formats available for projects. This collection serves as a reference for project creation and helps determine appropriate movie length and production parameters.

## Collection Configuration
- **Slug**: `movie-formats`
- **Admin Title Field**: `name`
- **Seeding Required**: Yes

## Fields

### name
- **Type**: `text`
- **Required**: `true`
- **Description**: The display name of the movie format (e.g., "Short Film", "Feature Film", "Series", "Documentary")
- **Admin**: Used as title field

### slug
- **Type**: `text`
- **Required**: `true`
- **Unique**: `true`
- **Description**: URL-friendly identifier for the format (e.g., "short-film", "feature-film", "series", "documentary")

### description
- **Type**: `textarea`
- **Required**: `false`
- **Description**: Brief description of the movie format and its characteristics

### suggestedDuration
- **Type**: `number`
- **Required**: `true`
- **Description**: Suggested duration in minutes for this format
- **Default**: `5` (for short film)

### durationUnit
- **Type**: `select`
- **Required**: `true`
- **Options**:
  - `{ label: "Minutes", value: "minutes" }`
  - `{ label: "Hours", value: "hours" }`
- **Default**: `"minutes"`
- **Description**: Unit of measurement for the suggested duration

### isActive
- **Type**: `checkbox`
- **Required**: `true`
- **Default**: `true`
- **Description**: Whether this format is available for new projects

## Relationships
- **Used by**: Projects collection (many-to-one relationship)

## Access Control
- **Read**: Public (all users can read)
- **Create/Update/Delete**: Admin only (managed through seeding)

## Seeding Data Required
The following movie formats should be seeded:
- Short Film (5 minutes)
- Feature Film (90-120 minutes)
- Series (20-60 minutes per episode)
- Documentary (30-90 minutes)
- Music Video (3-5 minutes)
- Commercial (30-60 seconds)