# Series Collection

## Overview
The Series collection manages series information for projects that use the "Series" movie format. It provides a way to group related episodes together and maintain series-level metadata.

## Collection Configuration
- **Slug**: `series`
- **Admin Title Field**: `name`
- **Seeding Required**: No (user-created content)

## Fields

### name
- **Type**: `text`
- **Required**: `true`
- **Description**: The name/title of the series (e.g., "Mystery Chronicles", "Tech Adventures")
- **Admin**: Used as title field

### description
- **Type**: `textarea`
- **Required**: `false`
- **Description**: Brief description of the series concept, theme, or storyline

### isActive
- **Type**: `checkbox`
- **Required**: `true`
- **Default**: `true`
- **Description**: Whether this series is active and available for new episodes

## Relationships
- **Used by**: Projects collection (many-to-one relationship)
- **Note**: Only projects with movie format "Series" should reference this collection

## Access Control
- **Read**: Public (all users can read)
- **Create/Update/Delete**: All authenticated users

## Usage Notes
- This collection is only relevant when a project's movie format is set to "Series"
- Each series can have multiple projects (episodes) associated with it
- Series are created by users as needed, no seeding required
- Keep fields minimal to maintain simplicity as requested
