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

    DURATION-ADAPTIVE GENERATION REQUIREMENTS:
    {% if durationUnit <= 2 %}
    MICRO-FORMAT REQUIREMENTS ({{ durationUnit }} minutes):
    1. Create single powerful moment or conflict with immediate impact
    2. Develop 1-2 characters with clear, simple motivations
    3. Focus on one core genre element - avoid mixing
    4. Tailor for immediate audience engagement and emotional payoff
    5. Maintain consistent tone throughout (no tonal shifts)
    6. Visual style must be immediately apparent and impactful
    7. Every second must advance the core conflict
    8. Minimal dialogue - focus on visual storytelling
    9. Single relationship dynamic or internal conflict
    10. High cinematic impact through visual efficiency
    {% elif durationUnit <= 5 %}
    ULTRA-SHORT REQUIREMENTS ({{ durationUnit }} minutes):
    1. Create compressed three-act structure with rapid progression
    2. Develop 2-3 characters with clear, focused arcs
    3. Respect primary genre conventions, minimal secondary elements
    4. Quick audience connection with immediate stakes
    5. Consistent tone with possible single tonal shift
    6. Visual style supports rapid story development
    7. Efficient pacing - every moment serves story
    8. Dialogue must be essential and character-revealing
    9. Simple but compelling character relationships
    10. Strong cinematic moments within time constraints
    {% elif durationUnit <= 30 %}
    SHORT FILM REQUIREMENTS ({{ durationUnit }} minutes):
    1. Traditional three-act structure with compressed development
    2. Develop 3-5 characters with meaningful growth
    3. Blend genre elements while maintaining focus
    4. Build audience investment through character development
    5. Allow for tonal range while maintaining consistency
    6. Visual style enhances narrative and character arcs
    7. Balanced pacing with proper story development time
    8. Dialogue serves character and plot advancement
    9. Develop meaningful character relationships and conflicts
    10. Full cinematic storytelling within format constraints
    {% elif durationUnit <= 60 %}
    MEDIUM FORMAT REQUIREMENTS ({{ durationUnit }} minutes):
    1. Complete story structure with full character arcs
    2. Develop 4-8 characters with distinct motivations and growth
    3. Explore genre conventions with creative variations
    4. Build deep audience investment and emotional connection
    5. Rich tonal range supporting story themes
    6. Visual style integral to storytelling and character development
    7. Deliberate pacing allowing for character exploration
    8. Substantial dialogue revealing character depth
    9. Complex character relationships driving story forward
    10. Full cinematic potential with subplot development
    {% elif durationUnit <= 120 %}
    FEATURE LENGTH REQUIREMENTS ({{ durationUnit }} minutes):
    1. Complex multi-layered story structure with interconnected elements
    2. Develop 6-12 characters with full psychological depth
    3. Master genre conventions while adding unique innovations
    4. Create sustained audience engagement across full runtime
    5. Rich tonal complexity supporting thematic depth
    6. Visual style as storytelling language throughout
    7. Varied pacing with tension/release cycles
    8. Extensive dialogue showcasing character voices
    9. Intricate character relationships and conflicts
    10. Maximum cinematic storytelling potential
    {% else %}
    EXTENDED FORMAT REQUIREMENTS ({{ durationUnit }} minutes):
    1. Epic narrative structure with multiple interconnected storylines
    2. Develop 8-20+ characters across ensemble cast
    3. Explore multiple genres and innovative storytelling approaches
    4. Maintain audience engagement across extended runtime
    5. Complex tonal journey supporting epic themes
    6. Visual style evolution throughout the narrative
    7. Epic pacing with multiple climactic moments
    8. Extensive character dialogue and development
    9. Multi-generational or complex relationship webs
    10. Cinematic storytelling on epic scale
    {% endif %}

    DURATION-ADAPTIVE STORY STRUCTURE TEMPLATE:
    {% if durationUnit <= 2 %}
    **MICRO-FORMAT STRUCTURE ({{ durationUnit }} minutes):**

    **LOGLINE:**
    [Single powerful moment or realization in one sentence]

    **STORY OVERVIEW:**
    [One paragraph describing the central moment/conflict and its immediate resolution]

    **CHARACTER FOCUS:**
    **PRIMARY CHARACTER:**
    - Name: [Character name]
    - Situation: [Current state/problem]
    - Moment: [What changes in this brief time]
    - Impact: [Immediate consequence/realization]

    **SINGLE-MOMENT STRUCTURE:**
    **SETUP ({{ (durationUnit * 0.2)|round(1) }} minutes):** [Immediate situation establishment]
    **CONFLICT/REALIZATION ({{ (durationUnit * 0.6)|round(1) }} minutes):** [Central moment/conflict]
    **RESOLUTION ({{ (durationUnit * 0.2)|round(1) }} minutes):** [Immediate consequence/change]

    [Beat-by-beat breakdown with visual focus and minimal dialogue]
    {% elif durationUnit <= 5 %}
    **ULTRA-SHORT STRUCTURE ({{ durationUnit }} minutes):**

    **LOGLINE:**
    [Compelling hook capturing the core conflict in one sentence]

    **STORY OVERVIEW:**
    [1-2 paragraphs outlining the compressed narrative arc]

    **CHARACTER PROFILES:**
    **PROTAGONIST:**
    - Name: [Character name]
    - Goal: [What they want]
    - Obstacle: [What stops them]
    - Change: [How they transform]

    **KEY SUPPORTING CHARACTER:**
    - Name: [Character name]
    - Role: [How they affect the protagonist]

    **COMPRESSED THREE-ACT STRUCTURE:**
    **ACT I - SETUP ({{ (durationUnit * 0.2)|round(1) }} minutes)**
    **Opening & Inciting Incident:** [Combined setup and story trigger]
    **Plot Point 1:** [Launch into main conflict]

    **ACT II - CONFRONTATION ({{ (durationUnit * 0.6)|round(1) }} minutes)**
    **Escalation & Midpoint:** [Conflict development and turning point]
    **Crisis:** [Major obstacle/setback]

    **ACT III - RESOLUTION ({{ (durationUnit * 0.2)|round(1) }} minutes)**
    **Climax & Resolution:** [Final confrontation and immediate resolution]

    [Scene-by-scene breakdown with efficient dialogue and visual storytelling]
    {% elif durationUnit <= 30 %}
    **SHORT FILM STRUCTURE ({{ durationUnit }} minutes):**

    **LOGLINE:**
    [Compelling one-sentence story summary with clear stakes]

    **STORY OVERVIEW:**
    [2-3 paragraphs outlining complete narrative arc with character development]

    **CHARACTER PROFILES:**
    **PROTAGONIST:**
    - Name: [Character name]
    - Background: [Essential background]
    - Arc: [Character transformation]
    - Goal: [Primary objective]
    - Obstacle: [Main opposition]

    **ANTAGONIST/OPPOSITION:**
    - Name: [Character name or force]
    - Background: [Relevant background]
    - Role: [How they create conflict]

    **SUPPORTING CHARACTERS:**
    [2-3 key characters with specific roles]

    **TRADITIONAL THREE-ACT STRUCTURE:**
    **ACT I - SETUP ({{ (durationUnit * 0.25)|round }} minutes)**
    **Opening Image:** [Tone-setting visual]
    **Inciting Incident:** [Story catalyst]
    **Plot Point 1:** [Launch into Act II]

    **ACT II - CONFRONTATION ({{ (durationUnit * 0.5)|round }} minutes)**
    **Rising Action:** [Conflict development]
    **Midpoint:** [Major turning point]
    **Plot Point 2:** [Crisis leading to climax]

    **ACT III - RESOLUTION ({{ (durationUnit * 0.25)|round }} minutes)**
    **Climax:** [Final confrontation]
    **Resolution:** [Conflict resolution]
    **Closing Image:** [Thematic conclusion]

    [Detailed scene breakdown with character development and dialogue]
    {% elif durationUnit <= 120 %}
    **FEATURE LENGTH STRUCTURE ({{ durationUnit }} minutes):**

    **LOGLINE:**
    [Compelling hook with clear protagonist, conflict, and stakes]

    **STORY OVERVIEW:**
    [3-4 paragraphs covering complete narrative with subplots and character arcs]

    **CHARACTER PROFILES:**
    **PROTAGONIST:**
    - Name: [Character name]
    - Background: [Detailed background and psychology]
    - Arc: [Complete transformation journey]
    - Goal: [Primary and secondary objectives]
    - Obstacles: [Multiple layers of opposition]

    **ANTAGONIST:**
    - Name: [Character name]
    - Background: [Detailed background and motivation]
    - Methods: [How they create sustained conflict]
    - Arc: [Antagonist development]

    **SUPPORTING ENSEMBLE:**
    [4-8 key characters with individual arcs and relationships]

    **COMPLEX THREE-ACT STRUCTURE:**
    **ACT I - SETUP ({{ (durationUnit * 0.25)|round }} minutes)**
    **Opening Image:** [World and tone establishment]
    **Character Introduction:** [Protagonist in normal world]
    **Inciting Incident:** [Story catalyst]
    **Plot Point 1:** [Major story launch]

    **ACT II - CONFRONTATION ({{ (durationUnit * 0.5)|round }} minutes)**
    **Rising Action:** [Escalating conflicts and obstacles]
    **Midpoint:** [Major revelation or reversal]
    **Complications:** [Subplot development]
    **Plot Point 2:** [Major crisis/dark moment]

    **ACT III - RESOLUTION ({{ (durationUnit * 0.25)|round }} minutes)**
    **Climax:** [Final confrontation with full stakes]
    **Resolution:** [All storylines resolved]
    **Closing Image:** [Thematic and emotional conclusion]

    [Comprehensive scene-by-scene breakdown with full character development]
    {% else %}
    **EXTENDED FORMAT STRUCTURE ({{ durationUnit }} minutes):**

    **LOGLINE:**
    [Epic scope summary capturing multiple storylines and themes]

    **STORY OVERVIEW:**
    [4-5 paragraphs covering epic narrative scope, multiple protagonists, and thematic depth]

    **CHARACTER ENSEMBLE:**
    **PRIMARY PROTAGONISTS:**
    [2-4 main characters with complete individual arcs]

    **SECONDARY PROTAGONISTS:**
    [4-8 important characters with significant development]

    **ANTAGONIST FORCES:**
    [Multiple layers of opposition and conflict]

    **SUPPORTING CAST:**
    [Extended ensemble with specific roles and relationships]

    **EPIC STRUCTURE:**
    **ACT I - WORLD ESTABLISHMENT ({{ (durationUnit * 0.3)|round }} minutes)**
    **Opening Scope:** [Epic world and stakes establishment]
    **Character Introductions:** [Multiple protagonist introductions]
    **Inciting Events:** [Multiple story catalysts]
    **Plot Point 1:** [Major story launches]

    **ACT II - MULTIPLE CONFRONTATIONS ({{ (durationUnit * 0.45)|round }} minutes)**
    **Parallel Storylines:** [Multiple plot development]
    **Interconnected Conflicts:** [How storylines affect each other]
    **Multiple Midpoints:** [Various turning points]
    **Convergence:** [Storylines coming together]
    **Major Crisis:** [Epic scope crisis]

    **ACT III - EPIC RESOLUTION ({{ (durationUnit * 0.25)|round }} minutes)**
    **Multiple Climaxes:** [Various storyline climaxes]
    **Epic Confrontation:** [Final large-scale conflict]
    **Resolution Cascade:** [Multiple storyline resolutions]
    **Epic Conclusion:** [Thematic and emotional closure]

    [Epic scene-by-scene breakdown with multiple character arcs and storylines]
    {% endif %}

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

// Story enhancement function for iterative improvement
function EnhanceStory(
  currentStory: string,
  focusArea: string,
  targetMetrics: string[],
  currentQuality: QualityMetrics
) -> InitialStoryResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a master story editor and enhancement specialist. Your task is to improve an existing story by focusing on specific quality areas while maintaining the core narrative and characters.

    CURRENT STORY:
    {{ currentStory }}

    ENHANCEMENT FOCUS: {{ focusArea }}
    TARGET METRICS TO IMPROVE: {{ targetMetrics|join(", ") }}

    CURRENT QUALITY SCORES:
    - Overall Quality: {{ currentQuality.overallQuality }}/10
    - Structure Score: {{ currentQuality.structureScore }}/10
    - Character Depth: {{ currentQuality.characterDepth }}/10
    - Coherence Score: {{ currentQuality.coherenceScore }}/10
    - Conflict Tension: {{ currentQuality.conflictTension }}/10
    - Dialogue Quality: {{ currentQuality.dialogueQuality }}/10
    - Genre Alignment: {{ currentQuality.genreAlignment }}/10
    - Audience Engagement: {{ currentQuality.audienceEngagement }}/10
    - Visual Storytelling: {{ currentQuality.visualStorytelling }}/10
    - Production Readiness: {{ currentQuality.productionReadiness }}/10

    ENHANCEMENT INSTRUCTIONS:
    {% if focusArea == "Story Structure" %}
    Focus on improving narrative flow, pacing, three-act structure, plot points, and story beats. Ensure smooth transitions between scenes and clear story progression.
    {% elif focusArea == "Character Development" %}
    Deepen character motivations, backstories, relationships, and character arcs. Add more personality, internal conflicts, and character growth throughout the story.
    {% elif focusArea == "Story Coherence" %}
    Improve plot consistency, logical flow, cause-and-effect relationships, and eliminate plot holes. Ensure all story elements connect meaningfully.
    {% elif focusArea == "Conflict & Tension" %}
    Heighten dramatic tension, raise stakes, intensify conflicts, and create more compelling obstacles. Add urgency and emotional investment.
    {% elif focusArea == "Dialogue Quality" %}
    Improve character voice distinctiveness, subtext, naturalness, and dialogue that advances plot and reveals character. Make conversations more engaging and realistic.
    {% elif focusArea == "Genre Alignment" %}
    Better incorporate genre conventions, tropes, and expectations while maintaining originality. Ensure the story delivers on genre promises.
    {% elif focusArea == "Audience Engagement" %}
    Enhance emotional connection, relatability, and elements that will captivate the target audience. Add hooks and compelling moments.
    {% elif focusArea == "Visual Storytelling" %}
    Improve cinematic descriptions, visual metaphors, scene composition, and elements that translate well to screen. Enhance visual narrative.
    {% elif focusArea == "Production Readiness" %}
    Optimize for production feasibility, budget considerations, technical requirements, and practical filmmaking needs.
    {% endif %}

    ENHANCEMENT REQUIREMENTS:
    1. Maintain the core story, characters, and plot structure
    2. Focus specifically on improving the {{ focusArea }} aspect
    3. Enhance the target metrics: {{ targetMetrics|join(", ") }}
    4. Keep all existing strong elements intact
    5. Make improvements that feel natural and integrated
    6. Ensure the enhanced version flows smoothly
    7. Maintain consistency with established tone and style
    8. Improve quality scores by 1-2 points in target areas

    Return the enhanced story with the same comprehensive structure as the original, but with focused improvements in the specified area. The enhanced version should feel like a natural evolution of the original story.

    IMPORTANT: Return your response in this exact JSON format:
    {
      "storyContent": "[Complete enhanced story content as a single string]",
      "qualityMetrics": {
        "overallQuality": [improved number 1-10],
        "structureScore": [improved number 1-10],
        "characterDepth": [improved number 1-10],
        "coherenceScore": [improved number 1-10],
        "conflictTension": [improved number 1-10],
        "dialogueQuality": [improved number 1-10],
        "genreAlignment": [improved number 1-10],
        "audienceEngagement": [improved number 1-10],
        "visualStorytelling": [improved number 1-10],
        "productionReadiness": [improved number 1-10]
      },
      "generationNotes": "[Explanation of specific enhancements made and quality improvements achieved]"
    }
  "#
}
