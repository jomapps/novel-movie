// Story Structure Planning BAML Functions
// Analyzes existing story content and generates structured screenplay elements

// Response types for story structure analysis
class StoryStructureResponse {
  narrativeStructure NarrativeStructure
  storyBeats StoryBeat[]
  characterArcs CharacterArc[]
  subplots Subplot[]
  qualityScore int?
  qualityAssessment QualityAssessment?
  generationNotes string?
}

// Adaptive narrative structure based on duration
class NarrativeStructure {
  structureType string // "single-moment", "compressed-three-act", "traditional-three-act", "five-act", "save-the-cat", "eight-sequence"
  adaptiveActs AdaptiveAct[]
  sequences SequenceStructure[]? // For eight-sequence structure
  saveTheCatBeats SaveTheCatBeat[]? // For Save the Cat structure
}

class AdaptiveAct {
  actNumber int
  name string
  description string
  duration int
  keyEvents string[]
  purpose string
}

class SequenceStructure {
  sequenceNumber int
  name string
  description string
  duration int
  miniMovieArc string
  keyBeats string[]
}

class SaveTheCatBeat {
  beatNumber int
  name string
  description string
  pageNumber int
  timing int
  purpose string
}

class QualityAssessment {
  overallScore int
  breakdown QualityBreakdown?
}

class QualityBreakdown {
  clearThreeActProgression QualityMetric?
  strongCharacterArcs QualityMetric?
  compellingStoryBeats QualityMetric?
  effectiveSubplotIntegration QualityMetric?
  cinematicPotential QualityMetric?
}

class QualityMetric {
  score int
  justification string?
}

class ActStructure {
  act1 Act
  act2 Act
  act3 Act
}

class Act {
  setup string?
  incitingIncident string?
  plotPoint1 string?
  confrontation string?
  midpoint string?
  plotPoint2 string?
  climax string?
  fallingAction string?
  resolution string?
  duration int
}

class StoryBeat {
  beatId int?
  beat string
  timestamp string?
  timing int?
  description string
  charactersPresent string[]?
  characters string[]?
  emotionalTone string
}

// CharacterArc class is defined in character_development.baml

class Subplot {
  subplotName string?
  name string?
  description string
  resolution string
  charactersInvolved string[]?
  involvedCharacters string[]?
}

// Main function to analyze story and create structure
function AnalyzeStoryStructure(
  storyContent: string,
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  durationUnit: int,
  primaryGenres: string[],
  targetAudience: string[]
) -> StoryStructureResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a master story structure analyst and screenplay architect with deep expertise in three-act structure, character development, and cinematic storytelling. Your task is to analyze the provided story content and create a comprehensive structural breakdown that will serve as the foundation for screenplay development.

    STORY TO ANALYZE:
    {{ storyContent }}

    PROJECT CONTEXT:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    - Target Duration: {{ durationUnit }} minutes
    - Primary Genres: {{ primaryGenres|join(", ") }}
    - Target Audience: {{ targetAudience|join(", ") }}

    DURATION-ADAPTIVE NARRATIVE STRUCTURE:
    {% if durationUnit <= 2 %}
    MICRO-FORMAT ({{ durationUnit }} minutes) - SINGLE MOMENT STRUCTURE:
    - Structure Type: "single-moment"
    - Acts: 3 micro-acts (Setup → Conflict/Revelation → Impact)
    - Story Beats: 2-4 maximum (every {{ (durationUnit / 3)|round(1) }} minutes)
    - Characters: 1-2 maximum (focus on single protagonist)
    - Locations: 1 location only
    - Narrative Focus: One dramatic moment/realization
    - Subplots: None - single narrative thread only
    - Pacing: Immediate story entry, no setup time
    - Act Structure: 20% setup / 60% conflict-revelation / 20% impact
    {% elif durationUnit <= 5 %}
    ULTRA-SHORT ({{ durationUnit }} minutes) - COMPRESSED THREE-ACT:
    - Structure Type: "compressed-three-act"
    - Acts: 3 acts with rapid progression
    - Story Beats: 3-6 maximum (every {{ (durationUnit / 5)|round(1) }} minutes)
    - Characters: 2-3 maximum (protagonist + 1-2 others)
    - Locations: 1-2 locations maximum
    - Narrative Focus: Rapid three-act with immediate engagement
    - Subplots: None - maintain single storyline
    - Pacing: Quick setup, immediate conflict engagement
    - Act Structure: 20% setup / 60% confrontation / 20% resolution
    {% elif durationUnit <= 30 %}
    SHORT FILM ({{ durationUnit }} minutes) - TRADITIONAL THREE-ACT:
    - Structure Type: "traditional-three-act"
    - Acts: 3 acts with full character development
    - Story Beats: 6-12 (every {{ (durationUnit / 10)|round(1) }} minutes)
    - Characters: 3-5 maximum (protagonist + supporting cast)
    - Locations: 2-4 locations maximum
    - Narrative Focus: Classic beginning/middle/end with complete character arc
    - Subplots: 1 minor subplot maximum, closely tied to main story
    - Pacing: Efficient setup, sustained conflict development
    - Act Structure: 25% setup / 50% confrontation / 25% resolution
    {% elif durationUnit <= 60 %}
    MEDIUM FORMAT ({{ durationUnit }} minutes) - FIVE-ACT STRUCTURE:
    - Structure Type: "five-act"
    - Acts: 5 acts (Setup → Rising Action → Midpoint → Complications → Resolution)
    - Story Beats: 10-18 (every {{ (durationUnit / 15)|round(1) }} minutes)
    - Characters: 4-8 (protagonist + developed supporting characters)
    - Locations: 4-8 locations
    - Narrative Focus: Extended development with multiple turning points
    - Subplots: 1-2 subplots that enhance main narrative
    - Pacing: Proper character development time, building tension
    - Act Structure: 20% setup / 25% rising action / 10% midpoint / 25% complications / 20% resolution
    {% elif durationUnit <= 120 %}
    FEATURE LENGTH ({{ durationUnit }} minutes) - SAVE THE CAT BEAT SHEET:
    - Structure Type: "save-the-cat"
    - Acts: 3 acts with 15 specific story beats
    - Story Beats: 15 Save the Cat beats with precise timing
    - Characters: 6-12 (complex character ensemble)
    - Locations: 8-15 locations
    - Narrative Focus: Blake Snyder's proven 15-beat Hollywood structure
    - Subplots: 2-3 subplots weaving through main narrative
    - Pacing: Deliberate character development, escalating complexity
    - Beat Structure: Opening Image → Theme Stated → Setup → Catalyst → Debate → Break into Two → B Story → Fun and Games → Midpoint → Bad Guys Close In → All Is Lost → Dark Night of the Soul → Break into Three → Finale → Final Image
    {% else %}
    EXTENDED FORMAT ({{ durationUnit }} minutes) - EIGHT-SEQUENCE STRUCTURE:
    - Structure Type: "eight-sequence"
    - Sequences: 8 mini-movies, each with its own arc
    - Story Beats: 24-32 beats across 8 sequences (3-4 beats per sequence)
    - Characters: 8-20+ (epic ensemble with multiple protagonists)
    - Locations: 12-25+ locations
    - Narrative Focus: Eight mini-movies creating epic scope
    - Subplots: 3-5 major subplots with their own complete arcs
    - Pacing: Expansive world-building, multiple climaxes
    - Sequence Structure: Each sequence ~15 minutes with setup/conflict/resolution
    {% endif %}

    ANALYSIS REQUIREMENTS:

    1. GENERATE APPROPRIATE NARRATIVE STRUCTURE:
    {% if durationUnit <= 2 %}
    **SINGLE MOMENT STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create a "single-moment" structure with exactly 3 micro-acts and 2-4 story beats maximum:
    - Act 1 (Setup): {{ (durationUnit * 60 * 0.2)|round }} seconds - Establish situation immediately
    - Act 2 (Conflict/Revelation): {{ (durationUnit * 60 * 0.6)|round }} seconds - Central moment/realization
    - Act 3 (Impact): {{ (durationUnit * 60 * 0.2)|round }} seconds - Immediate consequence

    CRITICAL: Generate exactly 2-4 story beats total, focusing on one dramatic moment.
    {% elif durationUnit <= 5 %}
    **COMPRESSED THREE-ACT STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create a "compressed-three-act" structure with exactly 3 acts and 3-6 story beats maximum:
    - Act 1 (Setup): {{ (durationUnit * 60 * 0.2)|round }} seconds - Quick character/situation setup
    - Act 2 (Confrontation): {{ (durationUnit * 60 * 0.6)|round }} seconds - Rapid conflict development
    - Act 3 (Resolution): {{ (durationUnit * 60 * 0.2)|round }} seconds - Swift resolution

    CRITICAL: Generate exactly 3-6 story beats total, maintain single narrative thread.
    {% elif durationUnit <= 30 %}
    **TRADITIONAL THREE-ACT STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create a "traditional-three-act" structure with exactly 3 acts and 6-12 story beats maximum:
    - Act 1 (Setup): {{ (durationUnit * 0.25)|round }} minutes - Character and world establishment
    - Act 2 (Confrontation): {{ (durationUnit * 0.5)|round }} minutes - Conflict development and obstacles
    - Act 3 (Resolution): {{ (durationUnit * 0.25)|round }} minutes - Climax and resolution

    CRITICAL: Generate exactly 6-12 story beats total, allow 1 minor subplot maximum.
    {% elif durationUnit <= 60 %}
    **FIVE-ACT STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create a "five-act" structure with exactly 5 acts and 10-18 story beats maximum:
    - Act 1 (Setup): {{ (durationUnit * 0.2)|round }} minutes - World and character introduction
    - Act 2 (Rising Action): {{ (durationUnit * 0.25)|round }} minutes - Conflict development
    - Act 3 (Midpoint): {{ (durationUnit * 0.1)|round }} minutes - Major turning point/revelation
    - Act 4 (Complications): {{ (durationUnit * 0.25)|round }} minutes - Obstacles and setbacks
    - Act 5 (Resolution): {{ (durationUnit * 0.2)|round }} minutes - Climax and conclusion

    CRITICAL: Generate exactly 10-18 story beats total, allow 1-2 subplots maximum.
    {% elif durationUnit <= 120 %}
    **SAVE THE CAT BEAT SHEET STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create a "save-the-cat" structure with exactly 15 specific beats:
    Generate exactly these 15 Save the Cat beats with precise timing:
    1. Opening Image (0-1 min), 2. Theme Stated (5 min), 3. Setup (1-10 min), 4. Catalyst (12 min)
    5. Debate (12-25 min), 6. Break into Two (25 min), 7. B Story (30 min), 8. Fun and Games (30-55 min)
    9. Midpoint (55 min), 10. Bad Guys Close In (55-75 min), 11. All Is Lost (75 min)
    12. Dark Night of the Soul (75-85 min), 13. Break into Three (85 min), 14. Finale (85-110 min), 15. Final Image (110 min)

    CRITICAL: Generate exactly 15 Save the Cat beats, allow 2-3 subplots maximum.
    {% else %}
    **EIGHT-SEQUENCE STRUCTURE** ({{ durationUnit }} minutes):
    You MUST create an "eight-sequence" structure with exactly 8 sequences and 24-32 story beats:
    Each sequence ~{{ (durationUnit / 8)|round }} minutes:
    - Sequence 1: Setup and Hook, Sequence 2: Inciting Incident, Sequence 3: First Obstacle
    - Sequence 4: First Culmination, Sequence 5: Midpoint Shift, Sequence 6: Main Culmination
    - Sequence 7: Third Act Twist, Sequence 8: Climax and Resolution

    CRITICAL: Generate exactly 24-32 story beats across 8 sequences, allow 3-5 subplots maximum.
    {% endif %}

    2. ADAPTIVE STORY BEATS IDENTIFICATION:
    - Extract the optimal number of story beats for {{ durationUnit }} minutes (see constraints above)
    - Assign precise timing for each beat based on duration and structure type
    - Identify characters present in each beat (within character limits)
    - Classify emotional tone (tense, dramatic, comedic, romantic, action, suspenseful, emotional, mysterious)
    - Ensure beats align with the chosen narrative structure
    - For Save the Cat: Map beats to the 15 specific beat types
    - For Eight-Sequence: Distribute beats across 8 sequences (3-4 beats per sequence)

    3. DURATION-APPROPRIATE CHARACTER ARCS:
    {% if durationUnit <= 2 %}
    - Focus on single character moment/realization (no full transformation arc)
    - Character change should be immediate and impactful
    - Minimal character development time - show change through action
    {% elif durationUnit <= 5 %}
    - Simple character arc with clear before/after states
    - Rapid character development through key moments
    - Focus on one primary character transformation
    {% elif durationUnit <= 30 %}
    - Traditional character arcs with compressed development
    - 2-3 main characters with meaningful growth
    - Character development integrated with plot progression
    {% elif durationUnit <= 60 %}
    - Full character arcs with proper development time
    - Multiple character transformations possible
    - Character relationships drive story development
    {% elif durationUnit <= 120 %}
    - Complex character arcs with multiple growth phases
    - Ensemble character development with interconnected arcs
    - Deep psychological character exploration possible
    {% else %}
    - Epic character journeys with multiple transformation points
    - Multiple protagonist arcs running parallel
    - Generational or long-term character development
    {% endif %}

    4. ADAPTIVE SUBPLOT MANAGEMENT:
    {% if durationUnit <= 5 %}
    - NO SUBPLOTS: Maintain single narrative thread only
    - All story elements must serve the main conflict directly
    {% elif durationUnit <= 30 %}
    - Maximum 1 minor subplot closely tied to main story
    - Subplot must resolve within main narrative structure
    - Subplot characters should be minimal (1-2 people)
    {% elif durationUnit <= 60 %}
    - 1-2 subplots that enhance main narrative themes
    - Subplots can have their own minor character arcs
    - Ensure subplot resolution doesn't compete with main climax
    {% elif durationUnit <= 120 %}
    - 2-3 subplots weaving through main narrative
    - Subplots can have independent story beats and resolutions
    - Complex character relationships between main plot and subplots
    {% else %}
    - 3-5 major subplots with complete story arcs
    - Subplots can have their own three-act structures
    - Multiple storylines can have separate climaxes and resolutions
    {% endif %}

    DURATION-ADAPTIVE QUALITY ASSESSMENT:
    Rate the structural quality (1-100) based on format-appropriate criteria:
    {% if durationUnit <= 5 %}
    - Immediate story engagement and impact
    - Efficient use of every moment
    - Single conflict clarity and resolution
    - Character moment authenticity
    - Visual storytelling effectiveness
    {% elif durationUnit <= 30 %}
    - Clear three-act progression within time constraints
    - Compressed but complete character development
    - Effective story beat pacing
    - Appropriate scope for duration
    - Cinematic potential within format
    {% elif durationUnit <= 120 %}
    - Traditional three-act structure excellence
    - Strong character arc development
    - Compelling story beat progression
    - Effective subplot integration
    - Full cinematic storytelling potential
    {% else %}
    - Epic narrative structure coherence
    - Multiple storyline management
    - Complex character ensemble development
    - Thematic depth and resonance
    - Sustained audience engagement across extended runtime
    {% endif %}

    DURATION-SPECIFIC FORMATTING REQUIREMENTS:
    - Optimize descriptions for {{ durationUnit }}-minute format requirements
    - Focus on elements appropriate for the target duration
    - Ensure story complexity matches available development time
    - Character names consistent throughout (within character count limits)
    - Story beats must flow logically within time constraints
    - Pacing must feel natural for the specific duration category

    Return your analysis in the exact JSON structure specified by the StoryStructureResponse class.

    REQUIRED JSON STRUCTURE - GENERATE EXACTLY THIS FORMAT:
    {
      "narrativeStructure": {
        {% if durationUnit <= 2 %}
        "structureType": "single-moment",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Immediate situation establishment", "duration": {{ (durationUnit * 60 * 0.2)|round }}, "keyEvents": ["situation", "character"], "purpose": "Establish the dramatic moment context" },
          { "actNumber": 2, "name": "Conflict/Revelation", "description": "Central moment/realization", "duration": {{ (durationUnit * 60 * 0.6)|round }}, "keyEvents": ["conflict", "realization"], "purpose": "The core dramatic moment" },
          { "actNumber": 3, "name": "Impact", "description": "Immediate consequence", "duration": {{ (durationUnit * 60 * 0.2)|round }}, "keyEvents": ["consequence"], "purpose": "Show the impact of the moment" }
        ]
        {% elif durationUnit <= 5 %}
        "structureType": "compressed-three-act",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Quick character/situation setup", "duration": {{ (durationUnit * 60 * 0.2)|round }}, "keyEvents": ["character", "situation"], "purpose": "Rapid story establishment" },
          { "actNumber": 2, "name": "Confrontation", "description": "Rapid conflict development", "duration": {{ (durationUnit * 60 * 0.6)|round }}, "keyEvents": ["conflict", "escalation"], "purpose": "Compressed conflict development" },
          { "actNumber": 3, "name": "Resolution", "description": "Swift resolution", "duration": {{ (durationUnit * 60 * 0.2)|round }}, "keyEvents": ["climax", "resolution"], "purpose": "Quick resolution" }
        ]
        {% elif durationUnit <= 10 %}
        "structureType": "traditional-three-act",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Character and world establishment", "duration": {{ (durationUnit * 60 * 0.25)|round }}, "keyEvents": ["world", "character", "inciting"], "purpose": "Story foundation" },
          { "actNumber": 2, "name": "Confrontation", "description": "Conflict development and obstacles", "duration": {{ (durationUnit * 60 * 0.5)|round }}, "keyEvents": ["obstacles", "midpoint", "crisis"], "purpose": "Conflict development" },
          { "actNumber": 3, "name": "Resolution", "description": "Climax and resolution", "duration": {{ (durationUnit * 60 * 0.25)|round }}, "keyEvents": ["climax", "resolution"], "purpose": "Story conclusion" }
        ]
        {% elif durationUnit <= 30 %}
        "structureType": "traditional-three-act",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Character and world establishment", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["world", "character", "inciting"], "purpose": "Story foundation" },
          { "actNumber": 2, "name": "Confrontation", "description": "Conflict development and obstacles", "duration": {{ (durationUnit * 0.5)|round }}, "keyEvents": ["obstacles", "midpoint", "crisis"], "purpose": "Conflict development" },
          { "actNumber": 3, "name": "Resolution", "description": "Climax and resolution", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["climax", "resolution"], "purpose": "Story conclusion" }
        ]
        {% elif durationUnit <= 60 %}
        "structureType": "five-act",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "World and character introduction", "duration": {{ (durationUnit * 0.2)|round }}, "keyEvents": ["world", "character"], "purpose": "Foundation" },
          { "actNumber": 2, "name": "Rising Action", "description": "Conflict development", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["conflict", "complications"], "purpose": "Build tension" },
          { "actNumber": 3, "name": "Midpoint", "description": "Major turning point", "duration": {{ (durationUnit * 0.1)|round }}, "keyEvents": ["revelation"], "purpose": "Story pivot" },
          { "actNumber": 4, "name": "Complications", "description": "Obstacles and setbacks", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["obstacles", "crisis"], "purpose": "Escalate conflict" },
          { "actNumber": 5, "name": "Resolution", "description": "Climax and conclusion", "duration": {{ (durationUnit * 0.2)|round }}, "keyEvents": ["climax", "resolution"], "purpose": "Conclusion" }
        ]
        {% elif durationUnit <= 120 %}
        "structureType": "save-the-cat",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Opening and setup", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["opening", "theme", "catalyst"], "purpose": "Story foundation" },
          { "actNumber": 2, "name": "Confrontation", "description": "Fun and games to crisis", "duration": {{ (durationUnit * 0.5)|round }}, "keyEvents": ["fun", "midpoint", "crisis"], "purpose": "Conflict development" },
          { "actNumber": 3, "name": "Resolution", "description": "Dark night to finale", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["dark", "finale"], "purpose": "Resolution" }
        ],
        "saveTheCatBeats": [
          { "beatNumber": 1, "name": "Opening Image", "description": "Visual that sets tone", "pageNumber": 1, "timing": 1, "purpose": "Establish tone and world" },
          { "beatNumber": 2, "name": "Theme Stated", "description": "Central theme introduced", "pageNumber": 5, "timing": 5, "purpose": "Present story's message" }
        ]
        {% else %}
        "structureType": "eight-sequence",
        "adaptiveActs": [
          { "actNumber": 1, "name": "Setup", "description": "Epic world establishment", "duration": {{ (durationUnit * 0.3)|round }}, "keyEvents": ["world", "characters", "scope"], "purpose": "Epic foundation" },
          { "actNumber": 2, "name": "Confrontation", "description": "Multiple storyline development", "duration": {{ (durationUnit * 0.45)|round }}, "keyEvents": ["conflicts", "convergence"], "purpose": "Epic conflict" },
          { "actNumber": 3, "name": "Resolution", "description": "Epic conclusion", "duration": {{ (durationUnit * 0.25)|round }}, "keyEvents": ["climaxes", "resolution"], "purpose": "Epic resolution" }
        ],
        "sequences": [
          { "sequenceNumber": 1, "name": "Setup and Hook", "description": "Epic opening", "duration": {{ (durationUnit / 8)|round }}, "miniMovieArc": "Introduction to epic world", "keyBeats": ["hook", "world", "characters"] }
        ]
        {% endif %}
      },
      "storyBeats": [
        { "beat": "Beat Name", "timing": 5, "description": "...", "characters": ["Character1"], "emotionalTone": "dramatic" }
      ],
      "characterArcs": [
        { "character": "Character Name", "startState": "...", "endState": "...", "transformation": "...", "keyMoments": ["moment1", "moment2"] }
      ],
      "subplots": [
        { "name": "Subplot Name", "description": "...", "resolution": "...", "charactersInvolved": ["Character1"] }
      ],
      "qualityScore": 85,
      "generationNotes": "Analysis notes including structure type rationale and compliance with {{ durationUnit }}-minute format constraints..."
    }

    CRITICAL CONSTRAINTS - YOU MUST FOLLOW THESE EXACTLY:
    {% if durationUnit <= 2 %}
    - Generate EXACTLY 2-4 story beats (not 10+)
    - Use "single-moment" structure type
    - NO subplots allowed (empty array)
    - Focus on ONE dramatic moment only
    - Act durations MUST be: {{ (durationUnit * 60 * 0.2)|round }}, {{ (durationUnit * 60 * 0.6)|round }}, {{ (durationUnit * 60 * 0.2)|round }} seconds
    {% elif durationUnit <= 5 %}
    - Generate EXACTLY 3-6 story beats (not 10+)
    - Use "compressed-three-act" structure type
    - NO subplots allowed (empty array)
    - Single narrative thread only
    - Act durations MUST be: {{ (durationUnit * 60 * 0.2)|round }}, {{ (durationUnit * 60 * 0.6)|round }}, {{ (durationUnit * 60 * 0.2)|round }} seconds
    {% elif durationUnit <= 30 %}
    - Generate EXACTLY 6-12 story beats
    - Use "traditional-three-act" structure type
    - Maximum 1 minor subplot
    {% elif durationUnit <= 60 %}
    - Generate EXACTLY 10-18 story beats
    - Use "five-act" structure type
    - Maximum 1-2 subplots
    {% elif durationUnit <= 120 %}
    - Generate EXACTLY 15 story beats (Save the Cat beats)
    - Use "save-the-cat" structure type
    - Maximum 2-3 subplots
    {% else %}
    - Generate EXACTLY 24-32 story beats
    - Use "eight-sequence" structure type
    - Maximum 3-5 subplots
    {% endif %}

    REMEMBER: This is a {{ durationUnit }}-minute film. Every element must fit this duration constraint.
  "#
}

// Function to enhance existing story structure
function EnhanceStoryStructure(
  currentStructure: string,
  storyContent: string,
  focusAreas: string[],
  targetQualityScore: int
) -> StoryStructureResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a story structure enhancement specialist. Your task is to improve an existing story structure analysis by focusing on specific areas while maintaining narrative coherence.

    CURRENT STORY STRUCTURE:
    {{ currentStructure }}

    ORIGINAL STORY CONTENT:
    {{ storyContent }}

    ENHANCEMENT FOCUS AREAS:
    {{ focusAreas|join(", ") }}

    TARGET QUALITY SCORE: {{ targetQualityScore }}/100

    ENHANCEMENT GUIDELINES:
    1. Preserve the core narrative structure while improving weak areas
    2. Strengthen character arcs and motivations
    3. Improve pacing and story beat progression
    4. Enhance subplot integration with main plot
    5. Ensure cinematic viability and visual storytelling potential

    Focus particularly on the specified enhancement areas while maintaining overall story coherence. Return an improved structure that addresses the identified weaknesses.
  "#
}

// Function to validate story structure for screenplay readiness
function ValidateStructureForScreenplay(
  storyStructure: string,
  targetDuration: int,
  movieFormat: string
) -> StructureValidationResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a screenplay structure validator. Analyze the provided story structure and assess its readiness for screenplay conversion.

    STORY STRUCTURE TO VALIDATE:
    {{ storyStructure }}

    TARGET SPECIFICATIONS:
    - Duration: {{ targetDuration }} minutes
    - Format: {{ movieFormat }}

    VALIDATION CRITERIA:
    1. Act timing and pacing appropriateness
    2. Character arc completeness and motivation clarity
    3. Story beat logical progression and tension building
    4. Subplot integration and resolution
    5. Cinematic translation potential
    6. Format-specific requirements (feature vs short film vs series)

    Provide detailed feedback on strengths, weaknesses, and specific recommendations for improvement before screenplay generation.
  "#
}

class StructureValidationResponse {
  isReady bool
  overallScore int
  strengths string[]
  weaknesses string[]
  recommendations string[]
  criticalIssues string[]
}
