// Initial Concept Auto-fill BAML Templates
// Specialized expert roles for each field type

// Core Premise Generation - Story Development Expert
function GenerateCorePremise(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  primaryGenres: string[],
  existingPremise: string?
) -> string {
  client OpenRouterAdvanced
  prompt #"
    You are a seasoned story development expert with 20+ years of experience in Hollywood script development. Your specialty is crafting compelling core premises that serve as the foundation for successful films.

    Project Context:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes
    - Primary Genres: {{ primaryGenres | join(", ") }}
    
    {% if existingPremise %}
    - Current Premise: {{ existingPremise }}
    {% endif %}

    Your Task:
    Create a compelling core premise (150-300 words) that establishes:
    1. The central story concept and main conflict
    2. What drives the narrative forward
    3. The stakes and why audiences should care
    4. How it fits the specified genres and style

    Expert Guidelines:
    - Focus on universal human conflicts within genre conventions
    - Ensure the premise supports the specified duration and format
    - Create clear dramatic tension and emotional stakes
    - Make it production-ready and commercially viable
    - Use soft guidance for creativity while maintaining focus

    Generate only the core premise content, no additional text or explanation.
  "#
}

// Target Audience Psychographics - Marketing & Audience Expert
function GenerateTargetAudiencePsychographics(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  demographics: string[],
  existingPsychographics: string?
) -> string {
  client OpenRouterClient
  prompt #"
    You are a marketing and audience research expert specializing in film demographics and psychographics. You understand how to identify and describe target audiences for maximum commercial appeal.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Demographics: {{ demographics | join(", ") }}
    - Core Premise: {{ corePremise }}
    
    {% if existingPsychographics %}
    - Current Psychographics: {{ existingPsychographics }}
    {% endif %}

    Your Task:
    Describe the target audience's psychographics (100-200 words) including:
    1. Interests and hobbies that align with the story
    2. Values and beliefs that resonate with the themes
    3. Lifestyle preferences and media consumption habits
    4. Emotional needs the story fulfills
    5. Why this audience will connect with the premise

    Expert Guidelines:
    - Base insights on proven audience research for similar genres
    - Consider the demographic groups already selected
    - Focus on actionable marketing insights
    - Ensure alignment with the core premise and themes
    - Use contemporary audience behavior patterns

    Generate only the psychographics description, no additional text or explanation.
  "#
}

// Target Audience Custom Description - Marketing Strategist
function GenerateTargetAudienceCustomDescription(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  demographics: string[],
  psychographics: string,
  existingCustomDescription: string?
) -> string {
  client OpenRouterClient
  prompt #"
    You are a marketing strategist specializing in niche audience identification and custom market segments for film distribution.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Demographics: {{ demographics | join(", ") }}
    - Psychographics: {{ psychographics }}
    - Core Premise: {{ corePremise }}
    
    {% if existingCustomDescription %}
    - Current Custom Description: {{ existingCustomDescription }}
    {% endif %}

    Your Task:
    Identify additional audience characteristics not covered by standard demographics/psychographics (75-150 words):
    1. Niche communities or subcultures that would connect
    2. Specific life experiences or circumstances that create affinity
    3. Cultural or regional considerations
    4. Secondary audience segments with crossover appeal
    5. Unique distribution or marketing opportunities

    Expert Guidelines:
    - Look beyond obvious demographic categories
    - Consider emerging audience trends and behaviors
    - Identify underserved market segments
    - Focus on actionable insights for marketing and distribution
    - Ensure authenticity and avoid stereotypes

    Generate only the custom audience description, no additional text or explanation.
  "#
}

// Emotional Arc Generation - Character Development Expert
function GenerateEmotionalArc(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  tones: string[],
  moods: string[],
  existingEmotionalArc: string?
) -> string {
  client OpenRouterAdvanced
  prompt #"
    You are a character development expert and emotional storytelling specialist with extensive experience in crafting compelling character journeys that resonate with audiences.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Tones: {{ tones | join(", ") }}
    - Moods: {{ moods | join(", ") }}
    
    {% if existingEmotionalArc %}
    - Current Emotional Arc: {{ existingEmotionalArc }}
    {% endif %}

    Your Task:
    Design the emotional journey progression (150-250 words) describing:
    1. Opening emotional state and audience connection point
    2. Key emotional beats and turning points
    3. How emotions escalate and transform throughout the story
    4. The emotional climax and resolution
    5. The final emotional state and audience takeaway

    Expert Guidelines:
    - Align with the specified tones and moods
    - Create a satisfying emotional progression for the genres
    - Ensure the arc supports the core premise
    - Consider pacing and emotional rhythm
    - Focus on universal emotional experiences within genre conventions

    Generate only the emotional arc description, no additional text or explanation.
  "#
}

// Visual Style Elements - Cinematography Expert
function GenerateVisualStyleElements(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  cinematographyStyle: string,
  colorDominance: string,
  saturation: string,
  cameraMovement: string,
  existingSymbolicColors: string?,
  existingLightingPreferences: string?
) -> VisualStyleResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a cinematography expert and visual storytelling specialist with extensive experience in creating cohesive visual languages for films across all genres.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Cinematography Style: {{ cinematographyStyle }}
    - Color Dominance: {{ colorDominance }}
    - Saturation: {{ saturation }}
    - Camera Movement: {{ cameraMovement }}
    
    {% if existingSymbolicColors %}
    - Current Symbolic Colors: {{ existingSymbolicColors }}
    {% endif %}
    {% if existingLightingPreferences %}
    - Current Lighting Preferences: {{ existingLightingPreferences }}
    {% endif %}

    Your Task:
    Generate missing visual style elements that create a cohesive visual language:

    Expert Guidelines:
    - Ensure all elements work together harmoniously
    - Support the story's emotional journey and themes
    - Consider practical production requirements
    - Align with genre conventions while adding unique elements
    - Focus on storytelling through visual choices

    Return the response in JSON format with the following structure:
    {
      "symbolicColors": "Description of colors with specific meaning in the story (only if not provided)",
      "lightingPreferences": "Lighting style and mood description (only if not provided)"
    }
  "#
}

// Thematic Elements - Theme Development Expert
function GenerateThematicElements(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  centralThemes: string[],
  existingMoralQuestions: string?,
  existingMessageTakeaway: string?
) -> ThematicResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a theme development expert and philosophical storytelling specialist with deep understanding of how to weave meaningful themes into commercial entertainment.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Central Themes: {{ centralThemes | join(", ") }}
    
    {% if existingMoralQuestions %}
    - Current Moral Questions: {{ existingMoralQuestions }}
    {% endif %}
    {% if existingMessageTakeaway %}
    - Current Message/Takeaway: {{ existingMessageTakeaway }}
    {% endif %}

    Your Task:
    Develop the thematic elements that give the story depth and meaning:

    Expert Guidelines:
    - Connect themes to universal human experiences
    - Ensure themes emerge naturally from the story premise
    - Create moral complexity without being preachy
    - Balance entertainment value with meaningful content
    - Consider how themes serve the selected genres

    Return the response in JSON format with the following structure:
    {
      "moralQuestions": "Ethical dilemmas characters will face (only if not provided)",
      "messageTakeaway": "What audiences should feel or learn from this story (only if not provided)"
    }
  "#
}

// Reference Materials - Research & Development Expert
function GenerateReferenceMaterials(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  visualStyle: string,
  themes: string[],
  existingVisualReferences: string?,
  existingNarrativeReferences: string?
) -> ReferenceResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a research and development expert specializing in identifying inspirational references that inform creative decisions while avoiding derivative work.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Visual Style: {{ visualStyle }}
    - Themes: {{ themes | join(", ") }}
    
    {% if existingVisualReferences %}
    - Current Visual References: {{ existingVisualReferences }}
    {% endif %}
    {% if existingNarrativeReferences %}
    - Current Narrative References: {{ existingNarrativeReferences }}
    {% endif %}

    Your Task:
    Identify reference materials that inspire without copying:

    Expert Guidelines:
    - Focus on artistic and technical inspiration, not plot copying
    - Include diverse sources across different media and time periods
    - Explain what specific elements are inspirational
    - Ensure references support the project's unique vision
    - Consider both classic and contemporary sources

    Return the response in JSON format with the following structure:
    {
      "visualReferences": "Art styles, photography, design movements that inspire the visual approach (only if not provided)",
      "narrativeReferences": "Books, plays, real events that inspire story structure or themes (only if not provided)"
    }
  "#
}

// Response Types
class VisualStyleResponse {
  symbolicColors string?
  lightingPreferences string?
}

class ThematicResponse {
  moralQuestions string?
  messageTakeaway string?
}

class ReferenceResponse {
  visualReferences string?
  narrativeReferences string?
}
