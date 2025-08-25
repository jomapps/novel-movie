# Initial Concept Step

## Overview

The Initial Concept Step is the critical foundation phase that transforms basic project information (name, format, style, duration) into a comprehensive creative blueprint. This step bridges the gap between user input and story generation by establishing the creative DNA of the movie project.

## Purpose

After collecting basic project metadata, this step generates a detailed creative concept that will guide all subsequent AI generation steps including:
- Script generation
- Character development
- Visual planning
- Scene breakdown
- Audio/music direction

## Core Concept Fields

### 1. **Primary Genres** *(Required)*
- **Type**: Multi-select (3 maximum, ordered by importance)
- **Options**: Action, Adventure, Animation, Biography, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Sport, Thriller, War, Western
- **Purpose**: Defines narrative structure, pacing, and audience expectations
- **AI Impact**: Influences script tone, character archetypes, and visual style

### 2. **Core Premise** *(Required)*
- **Type**: Rich text (150-300 words)
- **Description**: The central story concept and main conflict
- **Guidelines**: Should answer "What is this story about?" in one compelling paragraph
- **AI Impact**: Primary driver for plot structure and character motivations

### 3. **Target Audience** *(Required)*
- **Type**: Structured selection with custom details
- **Primary Demographics**:
  - Age groups: Children (G), Family (PG), Teen (PG-13), Adult (R), Mature (NC-17)
  - Geographic: Global, Regional, Cultural-specific
- **Psychographics**: Interests, values, viewing preferences
- **Purpose**: Guides content appropriateness, complexity, and marketing approach

### 4. **Tone & Mood** *(Required)*
- **Tone Options**: Serious, Comedic, Satirical, Dramatic, Lighthearted, Dark, Inspirational, Suspenseful
- **Mood Descriptors**: Optimistic, Melancholic, Tense, Whimsical, Gritty, Ethereal, Energetic, Contemplative
- **Emotional Arc**: How the overall feeling should evolve throughout the story
- **AI Impact**: Influences dialogue style, pacing, and visual atmosphere

### 5. **Visual Style Direction** *(Required)*
- **Cinematography Style**: Realistic, Stylized, Documentary, Experimental, Vintage, Modern
- **Color Psychology**: Warm/Cool dominance, saturation levels, symbolic color usage
- **Lighting Preferences**: Natural, Dramatic, Soft, High-contrast, Moody
- **Camera Movement**: Static, Dynamic, Handheld, Smooth, Experimental
- **AI Impact**: Guides image generation, scene composition, and visual effects

### 6. **Reference Materials** *(Optional but Recommended)*
- **Inspirational Movies**: Up to 5 films with specific elements to emulate
- **Visual References**: Art styles, photography, design movements
- **Narrative References**: Books, plays, real events that inspire the story
- **Purpose**: Provides concrete examples for AI to understand desired aesthetic and narrative approach

## Enhanced Creative Fields

### 7. **Character Archetypes** *(Auto-generated with user refinement)*
- **Protagonist Type**: Hero, Anti-hero, Everyman, Mentor, Rebel, etc.
- **Supporting Roles**: Mentor, Ally, Threshold Guardian, Shapeshifter, Shadow
- **Relationship Dynamics**: How characters interact and drive conflict
- **AI Impact**: Establishes character development framework for script generation

### 8. **Thematic Elements** *(Required)*
- **Central Themes**: Love, Redemption, Coming-of-age, Justice, Survival, Identity, etc.
- **Moral Questions**: What ethical dilemmas will characters face?
- **Message/Takeaway**: What should audiences feel or learn?
- **AI Impact**: Ensures narrative coherence and emotional resonance

### 9. **Setting & World-building** *(Required)*
- **Time Period**: Contemporary, Historical (specify era), Futuristic, Timeless
- **Geographic Setting**: Urban, Rural, Suburban, International, Fantasy realm
- **Social Context**: Economic status, cultural background, political climate
- **Scale**: Intimate/Personal, Community, National, Global, Universal
- **AI Impact**: Influences scene locations, costume design, and cultural authenticity

### 10. **Pacing & Structure Preferences** *(Optional)*
- **Narrative Structure**: Three-act, Hero's journey, Non-linear, Episodic
- **Pacing**: Fast-paced, Slow-burn, Variable, Rhythmic
- **Climax Intensity**: Subtle resolution, Major confrontation, Twist ending
- **AI Impact**: Guides script structure and scene distribution

### 11. **Content Guidelines** *(Required)*
- **Content Restrictions**: Violence level, language, sexual content, substance use
- **Cultural Sensitivities**: Religious considerations, political neutrality, inclusive representation
- **Educational Value**: Should the content teach or inform about specific topics?
- **AI Impact**: Ensures appropriate content generation within specified boundaries

### 12. **Production Considerations** *(Auto-populated from project data)*
- **Format Context**: How the chosen format (short film, feature, series) affects storytelling
- **Duration Impact**: How the specified length influences narrative complexity
- **Style Integration**: How the selected movie style affects the concept
- **AI Impact**: Ensures concept aligns with technical and format constraints

## AI Generation Strategy

### Concept Development Process
1. **Analysis Phase**: AI analyzes basic project data and user preferences
2. **Creative Synthesis**: Combines genre conventions with unique elements
3. **Coherence Check**: Ensures all elements work together harmoniously
4. **Refinement**: Iterates based on user feedback and adjustments

### Quality Assurance
- **Originality Check**: Ensures concept is unique while respecting genre conventions
- **Feasibility Assessment**: Considers production constraints and technical requirements
- **Audience Alignment**: Verifies concept matches target demographic expectations
- **Narrative Potential**: Evaluates whether concept can sustain the intended duration

## Integration with Workflow

### Input Dependencies
- Project name, format, style, and duration (from project initialization)
- User preferences and creative vision
- Any existing reference materials or inspiration

### Output for Next Steps
- **Script Generation**: Detailed creative brief for screenplay development
- **Character Development**: Character archetypes and relationship frameworks
- **Visual Planning**: Style guide and aesthetic direction
- **Audio Direction**: Mood and tone guidelines for music and sound design

## All fields in this step are required BUT can be filled by AI or user

## Technical Implementation Notes

### Data Structure
```typescript
interface InitialConcept {
  genres: string[] // Max 3, ordered by importance
  corePremise: string // Rich text, 150-300 words
  targetAudience: {
    demographics: AudienceDemographics
    psychographics: string[]
  }
  toneAndMood: {
    tone: string[]
    mood: string[]
    emotionalArc: string
  }
  visualStyle: {
    cinematography: string
    colorPalette: ColorScheme
    lighting: string
    cameraMovement: string
  }
  references: {
    movies: ReferenceMovie[]
    visual: string[]
    narrative: string[]
  }
  characterArchetypes: CharacterFramework
  themes: ThematicElements
  setting: WorldBuildingElements
  pacing: StructuralPreferences
  contentGuidelines: ContentRestrictions
}
```

### AI Prompt Strategy
- Use soft guidance rather than hard limits to preserve creativity
- Incorporate genre-specific conventions while encouraging originality
- Balance user preferences with narrative best practices
- Ensure consistency across all concept elements

## Success Metrics

### Concept Quality Indicators
- **Coherence**: All elements support and enhance each other
- **Originality**: Unique take on familiar elements
- **Feasibility**: Realistic for the specified format and duration
- **Engagement**: Compelling enough to sustain audience interest

### User Satisfaction Measures
- **Ease of Use**: Intuitive field completion and editing
- **Creative Inspiration**: Concept sparks excitement and vision
- **Flexibility**: Easy to modify and refine
- **Workflow Integration**: Smooth transition to story generation

This enhanced concept step provides the creative foundation necessary for generating compelling, coherent stories that align with user vision and production constraints.