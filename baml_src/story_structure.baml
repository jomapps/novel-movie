// Story Structure Planning BAML Functions
// Analyzes existing story content and generates structured screenplay elements

// Response types for story structure analysis
class StoryStructureResponse {
  actStructure ActStructure?
  threeActStructure ActStructure?
  storyBeats StoryBeat[]
  characterArcs CharacterArc[]
  subplots Subplot[]
  qualityScore int?
  qualityAssessment QualityAssessment?
  generationNotes string?
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

class CharacterArc {
  characterName string?
  character string?
  arcDescription string?
  startingState string?
  startState string?
  endingState string?
  endState string?
  transformationProcess string?
  transformation string?
  keyMoments string[]
}

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

    ANALYSIS REQUIREMENTS:

    1. THREE-ACT STRUCTURE BREAKDOWN:
    - Act 1 (Setup - ~25% of story): Identify the setup, inciting incident, and plot point 1
    - Act 2 (Confrontation - ~50% of story): Identify confrontation, midpoint, and plot point 2
    - Act 3 (Resolution - ~25% of story): Identify climax, falling action, and resolution
    - Estimate duration for each act based on the target runtime

    2. STORY BEATS IDENTIFICATION:
    - Extract 8-15 key story beats that drive the narrative forward
    - Assign approximate timing for each beat
    - Identify characters present in each beat
    - Classify emotional tone (tense, dramatic, comedic, romantic, action, suspenseful, emotional, mysterious)

    3. CHARACTER ARCS ANALYSIS:
    - Identify main characters and their transformation journeys
    - Define starting state, ending state, and transformation process
    - Extract key moments that drive character development

    4. SUBPLOT IDENTIFICATION:
    - Identify secondary storylines that support the main plot
    - Describe how each subplot resolves
    - List characters involved in each subplot

    QUALITY ASSESSMENT:
    Rate the structural quality of the story (1-100) based on:
    - Clear three-act progression
    - Strong character arcs
    - Compelling story beats
    - Effective subplot integration
    - Cinematic potential

    IMPORTANT FORMATTING REQUIREMENTS:
    - Keep all text descriptions concise but comprehensive
    - Focus on elements that will translate well to screenplay format
    - Consider the target duration when estimating act lengths
    - Ensure character names are consistent throughout
    - Make sure story beats flow logically and build tension

    Return your analysis in the exact JSON structure specified by the StoryStructureResponse class.

    REQUIRED JSON STRUCTURE:
    {
      "actStructure": {
        "act1": { "setup": "...", "incitingIncident": "...", "plotPoint1": "...", "duration": 15 },
        "act2": { "confrontation": "...", "midpoint": "...", "plotPoint2": "...", "duration": 30 },
        "act3": { "climax": "...", "fallingAction": "...", "resolution": "...", "duration": 15 }
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
      "generationNotes": "Analysis notes..."
    }
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
