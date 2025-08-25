# Initial Concept Collection

## Overview
The Initial Concept collection stores the comprehensive creative blueprint generated during the Initial Concept Step of the movie production workflow. This collection captures all the creative decisions and preferences that will guide subsequent AI generation steps including script development, character creation, visual planning, and production decisions.

## Collection Configuration
- **Slug**: `initial-concepts`
- **Admin Title Field**: `projectName`
- **Seeding Required**: No (user-generated content)
- **Admin Group**: Content

## Relationships
- **Belongs to**: Project (one-to-one relationship)
- **References**: Multiple lookup collections for structured data

## Fields

### Core Project Reference
```typescript
{
  name: 'project',
  type: 'relationship',
  relationTo: 'projects',
  required: true,
  unique: true,
  admin: {
    description: 'Associated project for this concept'
  }
}
```

### Primary Genres (Required)
```typescript
{
  name: 'primaryGenres',
  type: 'relationship',
  relationTo: 'genres',
  hasMany: true,
  maxRows: 3,
  required: true,
  admin: {
    description: 'Select up to 3 genres in order of importance',
    sortOptions: 'name'
  }
}
```

### Core Premise (Required)
```typescript
{
  name: 'corePremise',
  type: 'richText',
  required: true,
  admin: {
    description: 'The central story concept and main conflict (150-300 words)'
  },
  validate: (val) => {
    const wordCount = val?.root?.children?.reduce((count, node) => {
      if (node.type === 'paragraph') {
        return count + (node.children?.[0]?.text?.split(' ').length || 0)
      }
      return count
    }, 0) || 0
    
    if (wordCount < 50) return 'Core premise must be at least 50 words'
    if (wordCount > 500) return 'Core premise should not exceed 500 words'
    return true
  }
}
```

### Target Audience (Required)
```typescript
{
  name: 'targetAudience',
  type: 'group',
  fields: [
    {
      name: 'demographics',
      type: 'relationship',
      relationTo: 'audience-demographics',
      hasMany: true,
      required: true,
      admin: {
        description: 'Primary demographic groups'
      }
    },
    {
      name: 'psychographics',
      type: 'relationship',
      relationTo: 'audience-psychographics',
      hasMany: true,
      admin: {
        description: 'Audience interests and values'
      }
    },
    {
      name: 'customDescription',
      type: 'textarea',
      admin: {
        description: 'Additional audience details not covered by selections'
      }
    }
  ]
}
```

### Tone & Mood (Required)
```typescript
{
  name: 'toneAndMood',
  type: 'group',
  fields: [
    {
      name: 'tones',
      type: 'relationship',
      relationTo: 'tone-options',
      hasMany: true,
      required: true,
      admin: {
        description: 'Overall tone of the story'
      }
    },
    {
      name: 'moods',
      type: 'relationship',
      relationTo: 'mood-descriptors',
      hasMany: true,
      required: true,
      admin: {
        description: 'Emotional atmosphere'
      }
    },
    {
      name: 'emotionalArc',
      type: 'textarea',
      required: true,
      admin: {
        description: 'How the emotional feeling should evolve throughout the story'
      }
    }
  ]
}
```

### Visual Style Direction (Required)
```typescript
{
  name: 'visualStyle',
  type: 'group',
  fields: [
    {
      name: 'cinematographyStyle',
      type: 'relationship',
      relationTo: 'cinematography-styles',
      required: true,
      admin: {
        description: 'Overall visual approach'
      }
    },
    {
      name: 'colorPalette',
      type: 'group',
      fields: [
        {
          name: 'dominance',
          type: 'select',
          required: true,
          options: [
            { label: 'Warm Dominant', value: 'warm' },
            { label: 'Cool Dominant', value: 'cool' },
            { label: 'Balanced', value: 'balanced' },
            { label: 'Monochromatic', value: 'monochromatic' }
          ]
        },
        {
          name: 'saturation',
          type: 'select',
          required: true,
          options: [
            { label: 'High Saturation', value: 'high' },
            { label: 'Medium Saturation', value: 'medium' },
            { label: 'Low Saturation', value: 'low' },
            { label: 'Desaturated', value: 'desaturated' }
          ]
        },
        {
          name: 'symbolicColors',
          type: 'textarea',
          admin: {
            description: 'Specific colors and their symbolic meaning in the story'
          }
        }
      ]
    },
    {
      name: 'lightingPreferences',
      type: 'relationship',
      relationTo: 'lighting-styles',
      hasMany: true,
      required: true,
      admin: {
        description: 'Lighting approach and mood'
      }
    },
    {
      name: 'cameraMovement',
      type: 'relationship',
      relationTo: 'camera-movements',
      hasMany: true,
      required: true,
      admin: {
        description: 'Camera movement and framing style'
      }
    }
  ]
}
```

### Reference Materials (Optional but Recommended)
```typescript
{
  name: 'references',
  type: 'group',
  fields: [
    {
      name: 'inspirationalMovies',
      type: 'array',
      maxRows: 5,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true
        },
        {
          name: 'year',
          type: 'number',
          min: 1900,
          max: new Date().getFullYear() + 5
        },
        {
          name: 'specificElements',
          type: 'textarea',
          required: true,
          admin: {
            description: 'What specific elements to emulate from this film'
          }
        }
      ]
    },
    {
      name: 'visualReferences',
      type: 'textarea',
      admin: {
        description: 'Art styles, photography, design movements that inspire the visual approach'
      }
    },
    {
      name: 'narrativeReferences',
      type: 'textarea',
      admin: {
        description: 'Books, plays, real events that inspire the story structure or themes'
      }
    }
  ]
}
```

### Character Archetypes (Auto-generated with user refinement)
```typescript
{
  name: 'characterArchetypes',
  type: 'group',
  fields: [
    {
      name: 'protagonistType',
      type: 'relationship',
      relationTo: 'protagonist-types',
      required: true,
      admin: {
        description: 'Primary character archetype for the main character'
      }
    },
    {
      name: 'supportingRoles',
      type: 'relationship',
      relationTo: 'supporting-archetypes',
      hasMany: true,
      admin: {
        description: 'Key supporting character archetypes'
      }
    },
    {
      name: 'relationshipDynamics',
      type: 'textarea',
      required: true,
      admin: {
        description: 'How characters interact and drive conflict'
      }
    }
  ]
}
```

### Thematic Elements (Required)
```typescript
{
  name: 'themes',
  type: 'group',
  fields: [
    {
      name: 'centralThemes',
      type: 'relationship',
      relationTo: 'central-themes',
      hasMany: true,
      required: true,
      admin: {
        description: 'Primary themes explored in the story'
      }
    },
    {
      name: 'moralQuestions',
      type: 'relationship',
      relationTo: 'moral-questions',
      hasMany: true,
      admin: {
        description: 'Ethical dilemmas characters will face'
      }
    },
    {
      name: 'messageTakeaway',
      type: 'textarea',
      required: true,
      admin: {
        description: 'What should audiences feel or learn from this story?'
      }
    }
  ]
}
```

### Setting & World-building (Required)
```typescript
{
  name: 'setting',
  type: 'group',
  fields: [
    {
      name: 'timePeriod',
      type: 'relationship',
      relationTo: 'time-periods',
      required: true,
      admin: {
        description: 'When the story takes place'
      }
    },
    {
      name: 'geographicSetting',
      type: 'relationship',
      relationTo: 'geographic-settings',
      hasMany: true,
      required: true,
      admin: {
        description: 'Where the story takes place'
      }
    },
    {
      name: 'socialContext',
      type: 'relationship',
      relationTo: 'social-contexts',
      hasMany: true,
      required: true,
      admin: {
        description: 'Social, economic, and cultural background'
      }
    },
    {
      name: 'scale',
      type: 'relationship',
      relationTo: 'story-scales',
      required: true,
      admin: {
        description: 'Scope and scale of the story'
      }
    }
  ]
}
```

## Access Control
- **Read**: All authenticated users
- **Create**: All authenticated users (one per project)
- **Update**: All authenticated users (project owners)
- **Delete**: All authenticated users (project owners)

## Validation Rules
- One initial concept per project (enforced by unique project relationship)
- All required fields must be completed before marking as "ready for story generation"
- Core premise word count validation (50-500 words)
- Maximum 3 primary genres
- Maximum 5 inspirational movies

## Hooks
- **beforeCreate**: Validate project exists and doesn't already have an initial concept
- **afterCreate**: Update project status to indicate concept is ready
- **beforeUpdate**: Log changes for audit trail
- **afterUpdate**: Trigger story generation if concept is marked as complete

## Usage Notes
- This collection serves as the creative foundation for all subsequent workflow steps
- AI generation can populate all fields based on basic project data
- Users can refine any AI-generated content
- Concept must be approved before proceeding to story generation
- All relationship fields reference lookup collections for consistency and data integrity

## Integration Points
- **Input**: Basic project data (name, format, style, duration)
- **Output**: Creative brief for script generation, character development, visual planning
- **Dependencies**: All referenced lookup collections must be seeded with appropriate options
- **Workflow**: Triggers story generation step upon completion and approval
