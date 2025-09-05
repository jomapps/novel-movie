// Character Development BAML Functions
// Generates detailed character profiles based on story structure and content

// Response types for character development
class CharacterDevelopmentResponse {
  characters Character[]
  qualityMetrics CharacterQualityMetrics
  generationNotes string
}

class Character {
  name string
  role string // protagonist, antagonist, supporting, minor
  archetype string?
  characterDevelopment CharacterDevelopmentDetails
  characterArc CharacterArc
  physicalDescription PhysicalDescription
  dialogueVoice DialogueVoice
  relationships CharacterRelationship[]
  generationMetadata CharacterGenerationMetadata
}

class CharacterDevelopmentDetails {
  biography string
  personality string
  motivations string
  backstory string
  psychology CharacterPsychology
}

class CharacterPsychology {
  motivation string
  fears string
  desires string
  flaws string
}

class CharacterArc {
  startState string
  transformation string
  endState string
}

class PhysicalDescription {
  description string
  age int?
  height string?
  eyeColor string?
  hairColor string?
  clothing string?
}

class DialogueVoice {
  voiceDescription string
  style string
  patterns string
  vocabulary string
}

class CharacterRelationship {
  character string
  relationship string
  dynamic string
}

class CharacterGenerationMetadata {
  generatedAt string
  generationMethod string
  qualityScore int
  completeness int
}

class CharacterQualityMetrics {
  overallQuality int
  characterDepth int
  arcConsistency int
  relationshipClarity int
  dialogueDistinction int
  psychologicalRealism int
}

// Main function to develop characters from story structure
function DevelopCharacters(
  storyContent: string,
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  durationUnit: int,
  primaryGenres: string[],
  targetAudience: string[],
  characterArcs: string[], // From story structure
  storyBeats: string[] // Key story beats for character presence
) -> CharacterDevelopmentResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a master character development specialist and psychology expert with deep understanding of character creation, personality development, and dramatic storytelling. Your task is to create comprehensive, psychologically realistic character profiles based on the provided story content and structure, optimized for the specific duration format.

    STORY CONTENT:
    {{ storyContent }}

    DURATION-ADAPTIVE CHARACTER DEVELOPMENT CONSTRAINTS:
    {% if durationUnit <= 2 %}
    MICRO-FORMAT CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 1-2 maximum (focus on single protagonist)
    - Development Depth: Essential traits only - no extensive backstory
    - Character Arc: Single moment of change or realization
    - Psychology: One primary motivation/conflict
    - Relationships: Minimal - focus on internal or single external relationship
    - Dialogue Voice: Distinctive but minimal - character shown through action
    - Physical Description: Key visual elements only
    - Backstory: Only what's essential to understand the moment
    {% elif durationUnit <= 5 %}
    ULTRA-SHORT CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 2-3 maximum (protagonist + 1-2 others)
    - Development Depth: Core traits and primary motivation
    - Character Arc: Simple but clear transformation
    - Psychology: Primary motivation with one key conflict/fear
    - Relationships: 1-2 key relationships that drive story
    - Dialogue Voice: Distinct and efficient
    - Physical Description: Essential visual characteristics
    - Backstory: Minimal but sufficient for character understanding
    {% elif durationUnit <= 30 %}
    SHORT FILM CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 3-5 maximum (protagonist + supporting cast)
    - Development Depth: Well-developed core traits and motivations
    - Character Arc: Traditional character growth with clear progression
    - Psychology: Primary and secondary motivations, key fears/desires
    - Relationships: 2-3 meaningful relationships affecting story
    - Dialogue Voice: Distinctive speech patterns and vocabulary
    - Physical Description: Detailed appearance supporting character
    - Backstory: Sufficient depth for character consistency
    {% elif durationUnit <= 60 %}
    MEDIUM FORMAT CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 4-8 (protagonist + developed supporting characters)
    - Development Depth: Full psychological profiles with complexity
    - Character Arc: Complete transformation with multiple growth phases
    - Psychology: Complex motivations, fears, desires, and flaws
    - Relationships: Multiple interconnected relationships
    - Dialogue Voice: Rich, distinctive speech patterns
    - Physical Description: Comprehensive appearance and mannerisms
    - Backstory: Detailed history informing current behavior
    {% elif durationUnit <= 120 %}
    FEATURE LENGTH CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 6-12 (complex character ensemble)
    - Development Depth: Deep psychological complexity and nuance
    - Character Arc: Multi-layered transformation with setbacks and growth
    - Psychology: Intricate psychological makeup with contradictions
    - Relationships: Complex web of relationships affecting all characters
    - Dialogue Voice: Highly distinctive and evolved speech patterns
    - Physical Description: Detailed physical presence and evolution
    - Backstory: Rich personal history with formative experiences
    {% else %}
    EXTENDED FORMAT CHARACTER REQUIREMENTS ({{ durationUnit }} minutes):
    - Character Count: 8-20+ (epic ensemble with multiple protagonists)
    - Development Depth: Epic character complexity across extended narrative
    - Character Arc: Multiple transformation phases, generational changes
    - Psychology: Deep psychological exploration with evolution over time
    - Relationships: Extensive relationship networks across storylines
    - Dialogue Voice: Evolving speech patterns showing character growth
    - Physical Description: Physical evolution throughout extended narrative
    - Backstory: Comprehensive personal histories spanning generations/time
    {% endif %}

    PROJECT CONTEXT:
    - Project Name: {{ projectName }}
    - Format: {{ movieFormat }}
    - Style: {{ movieStyle }}
    - Duration: {{ durationUnit }} minutes
    - Genres: {{ primaryGenres|join(", ") }}
    - Target Audience: {{ targetAudience|join(", ") }}

    CHARACTER ARCS FROM STORY STRUCTURE:
    {% for arc in characterArcs %}
    - {{ arc }}
    {% endfor %}

    KEY STORY BEATS:
    {% for beat in storyBeats %}
    - {{ beat }}
    {% endfor %}

    TASK: Create detailed character profiles for all major characters identified in the story. For each character, develop:

    1. BASIC INFORMATION:
    - Name and role (protagonist, antagonist, supporting, minor)
    - Character archetype (Hero, Mentor, Trickster, etc.)

    2. CHARACTER DEVELOPMENT:
    - Biography: Comprehensive background and life history
    - Personality: Core traits, behaviors, and characteristics
    - Motivations: What drives the character throughout the story
    - Backstory: Formative experiences that shaped the character
    - Psychology: Deep dive into motivation, fears, desires, and flaws

    3. CHARACTER ARC:
    - Starting state: How the character begins the story
    - Transformation: How they change and grow
    - Ending state: Where they end up by story's conclusion

    4. PHYSICAL DESCRIPTION:
    - Overall appearance and distinctive features
    - Age, height, eye color, hair color
    - Typical clothing and style choices
    - Physical mannerisms and presence

    5. DIALOGUE VOICE:
    - Speaking style and voice characteristics
    - Speech patterns and verbal mannerisms
    - Vocabulary level and word choices
    - How their dialogue differs from other characters

    6. RELATIONSHIPS:
    - Key relationships with other characters
    - Relationship dynamics and interaction styles
    - How relationships evolve throughout the story

    QUALITY REQUIREMENTS:
    - Characters must feel psychologically realistic and three-dimensional
    - Each character should have a distinct voice and personality
    - Character arcs should align with the story structure
    - Relationships should create meaningful dramatic tension
    - All characters should serve the story's themes and genre expectations
    - Consider the target audience when developing character appeal

    GENRE CONSIDERATIONS:
    {% for genre in primaryGenres %}
    - {{ genre }}: Ensure characters fit genre conventions while remaining original
    {% endfor %}

    FORMAT CONSIDERATIONS:
    - {{ movieFormat }}: Character development should suit the format's pacing and scope
    - {{ durationUnit }} minutes: Character arcs must fit within time constraints

    Generate comprehensive character profiles that will serve as the foundation for screenplay development. Focus on creating characters that are memorable, relatable, and dramatically compelling.

    Return your response in the exact JSON format specified by the CharacterDevelopmentResponse class.
  "#
}

// Function to enhance existing characters with additional details
function EnhanceCharacterProfiles(
  existingCharacters: string[], // JSON string of existing character data
  storyContent: string,
  focusAreas: string[] // Areas to enhance: dialogue, relationships, psychology, etc.
) -> CharacterDevelopmentResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a character development specialist focused on enhancing and deepening existing character profiles. Your task is to take the provided character data and enhance specific areas to create more compelling, three-dimensional characters.

    EXISTING CHARACTERS:
    {{ existingCharacters }}

    STORY CONTENT FOR REFERENCE:
    {{ storyContent }}

    FOCUS AREAS FOR ENHANCEMENT:
    {% for area in focusAreas %}
    - {{ area }}
    {% endfor %}

    TASK: Enhance the existing character profiles by:

    1. DEEPENING PSYCHOLOGY: Add layers to character motivations, fears, and internal conflicts
    2. REFINING DIALOGUE VOICE: Make each character's speaking style more distinct and memorable
    3. STRENGTHENING RELATIONSHIPS: Develop more complex, nuanced character dynamics
    4. EXPANDING BACKSTORY: Add relevant historical details that inform current behavior
    5. IMPROVING PHYSICAL PRESENCE: Enhance physical descriptions and mannerisms
    6. CLARIFYING ARCS: Ensure character transformations are clear and emotionally satisfying

    Focus particularly on the specified enhancement areas while maintaining consistency with the existing character foundation.

    Return enhanced character profiles in the exact JSON format specified by the CharacterDevelopmentResponse class.
  "#
}

// Function to validate character consistency across story beats
function ValidateCharacterConsistency(
  characters: string[], // JSON string of character data
  storyBeats: string[], // Story beats to check against
  storyContent: string
) -> CharacterQualityMetrics {
  client OpenRouterAdvanced
  prompt #"
    You are a character consistency analyst with expertise in narrative coherence and character development. Your task is to evaluate how well the developed characters align with their presence and behavior in the story content and beats.

    CHARACTERS TO VALIDATE:
    {{ characters }}

    STORY BEATS:
    {% for beat in storyBeats %}
    - {{ beat }}
    {% endfor %}

    STORY CONTENT:
    {{ storyContent }}

    EVALUATION CRITERIA:
    1. CHARACTER DEPTH (1-100): How well-developed and three-dimensional are the characters?
    2. ARC CONSISTENCY (1-100): Do character arcs align with their story journey?
    3. RELATIONSHIP CLARITY (1-100): Are character relationships clear and well-defined?
    4. DIALOGUE DISTINCTION (1-100): Does each character have a unique voice?
    5. PSYCHOLOGICAL REALISM (1-100): Are character motivations and behaviors believable?
    6. OVERALL QUALITY (1-100): Composite score of character development quality

    Analyze each character against these criteria and provide detailed scoring with justification.

    Return your assessment in the exact JSON format specified by the CharacterQualityMetrics class.
  "#
}
