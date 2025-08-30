// Story Generation BAML Templates
// Comprehensive story generation using all project data

// Response type for initial story generation
class InitialStoryResponse {
  storyContent string
  qualityMetrics QualityMetrics
  generationNotes string
}

class QualityMetrics {
  overallQuality int
  structureScore int
  characterDepth int
  coherenceScore int
  conflictTension int
  dialogueQuality int
  genreAlignment int
  audienceEngagement int
  visualStorytelling int
  productionReadiness int
}

// Main story generation function using all project fields
function GenerateInitialStory(
  projectName: string,
  projectTitle: string?,
  shortDescription: string?,
  longDescription: string?,
  movieFormat: string,
  movieStyle: string,
  durationUnit: int,
  primaryGenres: string[],
  corePremise: string,
  targetAudience: string[],
  tone: string[]
) -> InitialStoryResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a master storyteller and screenplay architect with expertise in creating compelling narratives across all genres and formats. Your task is to generate a comprehensive initial story that will serve as the foundation for iterative enhancement.

    PROJECT DETAILS:
    - Project Name: {{ projectName }}
    {% if projectTitle %}
    - Project Title: {{ projectTitle }}
    {% endif %}
    {% if shortDescription %}
    - Brief Description: {{ shortDescription }}
    {% endif %}
    {% if longDescription %}
    - Detailed Synopsis: {{ longDescription }}
    {% endif %}
    - Format: {{ movieFormat }}
    - Visual Style: {{ movieStyle }}
    - Duration: {{ durationUnit }} minutes
    - Primary Genres: {{ primaryGenres|join(", ") }}
    - Core Premise: {{ corePremise }}
    - Target Audience: {{ targetAudience|join(", ") }}
    - Tone: {{ tone|join(", ") }}

    GENERATION REQUIREMENTS:
    1. Create a complete story structure with clear three-act progression
    2. Develop compelling characters with distinct motivations and arcs
    3. Ensure genre conventions are respected while adding unique elements
    4. Tailor content appropriately for the target audience
    5. Maintain consistent tone throughout the narrative
    6. Consider the visual style in scene descriptions and pacing
    7. Optimize structure for the specified format and duration
    8. Include specific dialogue samples and scene descriptions
    9. Provide clear character relationships and conflicts
    10. Ensure the story has cinematic potential and production viability

    STORY STRUCTURE TEMPLATE:
    Generate a comprehensive story following this structure:

    **LOGLINE:**
    [One-sentence story summary that captures the essence and hook]

    **STORY OVERVIEW:**
    [2-3 paragraph summary of the complete narrative arc]

    **CHARACTER PROFILES:**
    **PROTAGONIST:**
    - Name: [Character name]
    - Background: [Brief background and motivation]
    - Arc: [How they change throughout the story]
    - Goal: [What they want to achieve]
    - Obstacle: [What stands in their way]

    **ANTAGONIST:**
    - Name: [Character name]
    - Background: [Brief background and motivation]
    - Role: [How they oppose the protagonist]
    - Methods: [How they create conflict]

    **SUPPORTING CHARACTERS:**
    [2-3 key supporting characters with brief descriptions]

    **THREE-ACT STRUCTURE:**

    **ACT I - SETUP ({{ (durationUnit * 0.25)|round }} minutes)**
    **Opening Image:** [Visual that sets tone and world]
    **Inciting Incident:** [Event that starts the story]
    **Plot Point 1:** [Major event that launches Act II]

    [Detailed scene-by-scene breakdown with specific dialogue samples and visual descriptions]

    **ACT II - CONFRONTATION ({{ (durationUnit * 0.5)|round }} minutes)**
    **Midpoint:** [Major revelation or turning point]
    **Plot Point 2:** [Crisis that launches Act III]

    [Detailed scene-by-scene breakdown with escalating conflict and character development]

    **ACT III - RESOLUTION ({{ (durationUnit * 0.25)|round }} minutes)**
    **Climax:** [Final confrontation]
    **Resolution:** [How conflicts are resolved]
    **Closing Image:** [Visual that mirrors or contrasts opening]

    [Detailed scene-by-scene breakdown showing character transformation and story resolution]

    **VISUAL STYLE INTEGRATION:**
    [How the {{ movieStyle }} style enhances the narrative through cinematography, color palette, and visual metaphors]

    **GENRE ELEMENTS:**
    [Specific {{ primaryGenres|join(", ") }} conventions utilized and how they serve the story]

    **AUDIENCE CONSIDERATIONS:**
    [How the story specifically appeals to {{ targetAudience|join(", ") }} while maintaining broad appeal]

    **TONE CONSISTENCY:**
    [How the {{ tone|join(", ") }} tone is maintained throughout while allowing for emotional range]

    **DIALOGUE SAMPLES:**
    [Include 3-4 key dialogue exchanges that demonstrate character voice and advance plot]

    **PRODUCTION NOTES:**
    [Considerations for {{ movieFormat }} format, budget implications, and technical requirements]

    **THEMATIC DEPTH:**
    [Core themes explored and how they resonate with the target audience]

    **ENHANCEMENT OPPORTUNITIES:**
    [Areas identified for future iterative improvement in character depth, dialogue, visual storytelling, etc.]

    Generate a story that is complete, engaging, and ready for iterative enhancement. Focus on creating a solid foundation that maximizes the potential of all provided project elements.

    IMPORTANT: Return your response in this exact JSON format:
    {
      "storyContent": "[Complete story content as a single string]",
      "qualityMetrics": {
        "overallQuality": [number 1-10],
        "structureScore": [number 1-10],
        "characterDepth": [number 1-10],
        "coherenceScore": [number 1-10],
        "conflictTension": [number 1-10],
        "dialogueQuality": [number 1-10],
        "genreAlignment": [number 1-10],
        "audienceEngagement": [number 1-10],
        "visualStorytelling": [number 1-10],
        "productionReadiness": [number 1-10]
      },
      "generationNotes": "[Explanation of key creative decisions and areas for future enhancement]"
    }
  "#
}

// Enhanced story generation with additional context
function GenerateStoryWithContext(
  projectData: string,
  additionalContext: string?,
  focusAreas: string[]?
) -> InitialStoryResponse {
  client OpenRouterAdvanced
  prompt #"
    You are an expert story architect. Generate a comprehensive story using the provided project data.

    PROJECT DATA:
    {{ projectData }}

    {% if additionalContext %}
    ADDITIONAL CONTEXT:
    {{ additionalContext }}
    {% endif %}

    {% if focusAreas %}
    FOCUS AREAS:
    Pay special attention to: {{ focusAreas|join(", ") }}
    {% endif %}

    Generate a complete, engaging story following the same comprehensive structure as the main story generation function. Ensure all elements work together cohesively and the story has strong cinematic potential.
  "#
}
