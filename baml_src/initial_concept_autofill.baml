// Initial Concept Auto-fill BAML Templates
// Specialized expert roles for each field type with highest quality prompts
// Covers all fields from InitialConcepts collection with professional-grade expertise

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
    You are a master story architect and premise development expert with 25+ years of experience crafting compelling narratives for Academy Award-winning films. You understand the DNA of great storytelling and how to create premises that resonate across cultures and generations.

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
    Craft a compelling core premise (200-400 words) that serves as the creative DNA for the entire project. Your premise must establish:

    1. **The Central Conflict**: A specific, relatable human struggle that drives the entire narrative
    2. **The Protagonist's Journey**: What the main character wants vs. what they need
    3. **The Stakes**: What happens if the protagonist fails (personal, relational, and universal consequences)
    4. **The Unique Hook**: What makes this story different from others in the genre
    5. **The Emotional Core**: The universal human truth that will resonate with audiences
    6. **The Thematic Question**: The deeper philosophical question the story explores

    Expert Guidelines:
    - Root the premise in authentic human emotion and universal experiences
    - Ensure the conflict is both external (plot) and internal (character growth)
    - Create stakes that escalate from personal to universal significance
    - Balance genre expectations with fresh, unexpected elements
    - Consider the target duration and format in your story scope
    - Make every element serve both entertainment and meaning
    - Ensure the premise can sustain the specified runtime without padding
    - Create natural opportunities for character development and thematic exploration
    - Design conflicts that generate organic plot progression
    - Consider production feasibility while maintaining creative ambition

    Generate a rich, detailed premise that will inspire and guide all subsequent creative decisions. Focus on depth, authenticity, and emotional resonance.
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
    You are a leading audience psychology expert and behavioral analyst with deep expertise in film marketing, consumer psychology, and cultural trends. You've successfully identified and targeted audiences for billion-dollar franchises and understand the psychological drivers that create passionate fandoms.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Demographics: {{ demographics | join(", ") }}
    - Core Premise: {{ corePremise }}

    {% if existingPsychographics %}
    - Current Psychographics: {{ existingPsychographics }}
    {% endif %}

    Your Task:
    Create a comprehensive psychographic profile (150-250 words) that reveals the deep psychological and emotional drivers of your target audience:

    1. **Core Values & Beliefs**: What principles guide their decisions and worldview?
    2. **Lifestyle & Identity**: How do they see themselves and live their daily lives?
    3. **Media Consumption Patterns**: What content do they seek and why?
    4. **Emotional Needs & Desires**: What psychological needs does entertainment fulfill for them?
    5. **Social Behaviors**: How do they connect with others and share experiences?
    6. **Aspirations & Fears**: What do they hope for and what keeps them awake at night?
    7. **Cultural Touchstones**: What references, trends, and cultural moments resonate with them?

    Expert Guidelines:
    - Ground insights in contemporary behavioral research and cultural analysis
    - Consider generational differences and emerging social trends
    - Identify the emotional void your story fills in their lives
    - Focus on authentic human motivations, not marketing stereotypes
    - Consider how they discover, consume, and share content
    - Understand their relationship with the genres you're working in
    - Identify the deeper psychological reasons they'll connect with your premise
    - Consider global perspectives while maintaining cultural specificity
    - Think beyond surface-level interests to core psychological drivers

    Create a profile that reveals not just who they are, but why they'll be emotionally invested in this story.
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
    You are a master emotional architect and psychological storytelling expert with deep knowledge of neuroscience, emotional psychology, and the mechanics of how audiences form deep emotional connections with stories. You understand how to create emotional journeys that transform both characters and audiences.

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
    Design a sophisticated emotional journey (200-350 words) that creates profound audience connection and transformation:

    1. **Opening Emotional State**: Where the audience begins emotionally and how they connect with the protagonist
    2. **Emotional Escalation Pattern**: How feelings intensify and evolve through specific story beats
    3. **Emotional Turning Points**: Key moments where the emotional trajectory shifts dramatically
    4. **Emotional Complexity**: How multiple, sometimes conflicting emotions create depth
    5. **Cathartic Moments**: Where emotional tension releases and transforms
    6. **Emotional Climax**: The peak emotional experience that pays off the entire journey
    7. **Resolution & Transformation**: How both character and audience are changed by the experience
    8. **Lasting Emotional Impact**: What feelings and insights audiences carry with them

    Expert Guidelines:
    - Create emotional progression that mirrors the hero's psychological transformation
    - Use the specified tones and moods as emotional colors in your palette
    - Design moments of emotional vulnerability that create authentic connection
    - Balance emotional highs and lows to create satisfying rhythm
    - Ensure each emotional beat serves both character development and plot progression
    - Consider how genre conventions can be used to subvert or fulfill emotional expectations
    - Create opportunities for audiences to experience catharsis and growth
    - Design emotional complexity that reflects real human experience
    - Consider cultural and universal emotional touchstones
    - Plan for emotional moments that will be memorable and shareable

    Create an emotional journey that doesn't just entertain, but genuinely moves and transforms audiences.
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
    You are a visionary cinematographer and visual storytelling master with expertise spanning from Citizen Kane to Blade Runner 2049. You understand how visual language creates subconscious emotional responses and how every visual choice can reinforce character psychology, thematic depth, and narrative progression.

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
    Create sophisticated visual elements that function as storytelling tools, not just aesthetic choices:

    **For Symbolic Colors** (if needed):
    - Design a color psychology system that reinforces character arcs and themes
    - Consider how colors can represent internal states, relationships, and story progression
    - Think about color temperature shifts that mirror emotional journeys
    - Plan for colors that create visual motifs and callbacks
    - Consider cultural color associations and how to use or subvert them

    **For Lighting Preferences** (if needed):
    - Design lighting that reveals character psychology and emotional states
    - Create lighting patterns that support the narrative structure
    - Consider how light quality, direction, and intensity serve the story
    - Plan for lighting that enhances the chosen color palette
    - Think about practical vs. motivated lighting for authenticity
    - Design lighting that supports the cinematography style and camera movement

    Expert Guidelines:
    - Make every visual choice serve multiple storytelling functions
    - Create visual consistency that supports audience immersion
    - Balance artistic vision with production practicality
    - Consider how visuals will translate across different viewing platforms
    - Design elements that enhance rather than distract from performances
    - Think about how visual choices will age and remain timeless
    - Consider the emotional and psychological impact of your visual decisions
    - Plan for visual elements that can become iconic and memorable

    Return the response in JSON format with the following structure:
    {
      "symbolicColors": "Detailed color psychology system with specific meanings and story functions (only if not provided)",
      "lightingPreferences": "Comprehensive lighting approach that serves character, theme, and narrative (only if not provided)"
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
    You are a master thematic architect and philosophical storytelling expert with deep knowledge of mythology, psychology, and the great works of literature and cinema. You understand how to embed profound meaning into popular entertainment without sacrificing accessibility or emotional impact.

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
    Craft thematic elements that transform entertainment into meaningful human experience:

    **For Moral Questions** (if needed):
    - Design ethical dilemmas that have no easy answers, forcing characters and audiences to grapple with complexity
    - Create moral conflicts that reflect contemporary issues while remaining timeless
    - Ensure dilemmas emerge organically from character choices and story circumstances
    - Balance personal ethics with larger social/universal implications
    - Consider how different characters might approach the same moral question differently
    - Design questions that challenge audience assumptions and preconceptions
    - Create moral stakes that escalate throughout the story

    **For Message/Takeaway** (if needed):
    - Craft insights that feel earned through the story journey, not imposed
    - Create takeaways that resonate on multiple levels (personal, relational, societal, universal)
    - Design messages that inspire reflection and discussion long after viewing
    - Balance hope with realism, avoiding both cynicism and naive optimism
    - Consider how the message serves different audience segments and life experiences
    - Create takeaways that feel fresh and relevant to contemporary audiences
    - Ensure the message enhances rather than overshadows the entertainment value

    Expert Guidelines:
    - Root all thematic elements in authentic human experience and emotion
    - Create themes that deepen with multiple viewings and discussions
    - Avoid didactic messaging in favor of experiential learning
    - Consider cultural sensitivity while maintaining universal relevance
    - Design themes that complement and enhance the genre experience
    - Balance intellectual depth with emotional accessibility
    - Create thematic elements that inspire positive action and reflection
    - Consider how themes will resonate across different cultures and generations

    Return the response in JSON format with the following structure:
    {
      "moralQuestions": "Complex ethical dilemmas that challenge characters and audiences (only if not provided)",
      "messageTakeaway": "Profound yet accessible insights that transform and inspire (only if not provided)"
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
    You are a cultural curator and creative research expert with encyclopedic knowledge of art, literature, cinema, photography, design, and cultural movements across all time periods and cultures. You understand how to identify inspirational touchstones that elevate creative work while maintaining originality and avoiding derivative copying.

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
    Curate sophisticated reference materials that inspire innovation while honoring creative heritage:

    **For Visual References** (if needed):
    - Identify art movements, photographers, painters, and designers whose aesthetic philosophy aligns with your story
    - Consider architecture, fashion, and cultural artifacts that could inform production design
    - Include both obvious and unexpected visual influences that could spark creative innovation
    - Think about color theory, composition, and visual rhythm from various artistic traditions
    - Consider how different visual styles could represent different story elements or character perspectives
    - Include references that span different time periods and cultures for rich visual vocabulary

    **For Narrative References** (if needed):
    - Identify literature, plays, historical events, and real-world stories that share thematic DNA
    - Consider narrative structures, character archetypes, and storytelling techniques from various traditions
    - Include both classic and contemporary sources that handle similar themes with depth and nuance
    - Think about real-world events, social movements, or historical periods that inform your story's context
    - Consider mythology, folklore, and cultural stories that resonate with your themes
    - Include references that offer different perspectives on similar human experiences

    Expert Guidelines:
    - Focus on the essence and philosophy behind references, not surface-level copying
    - Create a diverse palette of influences that can cross-pollinate and create something new
    - Consider how references can inform not just aesthetics but also tone, pacing, and emotional approach
    - Include unexpected connections that could spark innovative creative solutions
    - Balance well-known influences with hidden gems that could provide fresh inspiration
    - Consider how references can help solve specific creative challenges in your story
    - Think about references that your target audience might recognize and appreciate
    - Ensure references support your unique vision rather than constraining it

    Return the response in JSON format with the following structure:
    {
      "visualReferences": "Curated visual influences with specific artistic and technical inspirations (only if not provided)",
      "narrativeReferences": "Thoughtfully selected narrative influences that inform structure, theme, and approach (only if not provided)"
    }
  "#
}

// Character Archetypes Generation - Character Development Expert
function GenerateCharacterArchetypes(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  themes: string[],
  targetAudience: string,
  existingProtagonistType: string?,
  existingSupportingRoles: string?,
  existingRelationshipDynamics: string?
) -> CharacterArchetypesResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a character development expert and archetypal storytelling specialist with deep knowledge of Joseph Campbell's Hero's Journey, Carl Jung's archetypes, and modern character development techniques used in successful films.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Central Themes: {{ themes | join(", ") }}
    - Target Audience: {{ targetAudience }}

    {% if existingProtagonistType %}
    - Current Protagonist Type: {{ existingProtagonistType }}
    {% endif %}
    {% if existingSupportingRoles %}
    - Current Supporting Roles: {{ existingSupportingRoles }}
    {% endif %}
    {% if existingRelationshipDynamics %}
    - Current Relationship Dynamics: {{ existingRelationshipDynamics }}
    {% endif %}

    Your Task:
    Design character archetypes that serve the story's thematic and dramatic needs:

    Expert Guidelines:
    - Draw from proven archetypal patterns while creating fresh interpretations
    - Ensure characters embody and explore the central themes
    - Create complementary character dynamics that generate natural conflict
    - Consider genre expectations while subverting clichés
    - Design characters that resonate with the target audience
    - Focus on internal conflicts that mirror external plot conflicts
    - Ensure each character serves a specific narrative function

    Return the response in JSON format with the following structure:
    {
      "protagonistType": "Primary character archetype with psychological depth and thematic relevance (only if not provided)",
      "supportingRoles": "Key supporting character archetypes and their narrative functions (only if not provided)",
      "relationshipDynamics": "How characters interact, conflict, and drive story progression (only if not provided)"
    }
  "#
}

// Setting & World-building Generation - World-building Expert
function GenerateSettingElements(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  themes: string[],
  visualStyle: string,
  existingTimePeriod: string?,
  existingGeographicSetting: string?,
  existingSocialContext: string?,
  existingScale: string?
) -> SettingResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a world-building expert and environmental storytelling specialist with extensive experience in creating immersive, thematically resonant settings for film. You understand how setting functions as character and drives narrative.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Central Themes: {{ themes | join(", ") }}
    - Visual Style: {{ visualStyle }}

    {% if existingTimePeriod %}
    - Current Time Period: {{ existingTimePeriod }}
    {% endif %}
    {% if existingGeographicSetting %}
    - Current Geographic Setting: {{ existingGeographicSetting }}
    {% endif %}
    {% if existingSocialContext %}
    - Current Social Context: {{ existingSocialContext }}
    {% endif %}
    {% if existingScale %}
    - Current Scale: {{ existingScale }}
    {% endif %}

    Your Task:
    Create a rich, thematically integrated setting that serves the story:

    Expert Guidelines:
    - Make setting an active participant in the story, not just backdrop
    - Ensure temporal and geographic choices support thematic exploration
    - Create social contexts that naturally generate the conflicts in your premise
    - Consider how setting influences character behavior and choices
    - Design environments that visually represent internal character states
    - Balance authenticity with dramatic necessity
    - Consider production feasibility while maintaining creative vision
    - Use setting to reinforce genre expectations and subvert them meaningfully

    Return the response in JSON format with the following structure:
    {
      "timePeriod": "When the story takes place with thematic justification (only if not provided)",
      "geographicSetting": "Where the story unfolds with specific, evocative details (only if not provided)",
      "socialContext": "Cultural, economic, and social backdrop that drives conflict (only if not provided)",
      "scale": "Scope and scale of the story world and its implications (only if not provided)"
    }
  "#
}

// Pacing & Structure Generation - Narrative Structure Expert
function GeneratePacingElements(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  durationUnit: int,
  movieFormat: string,
  themes: string[],
  existingNarrativeStructure: string?,
  existingPacingStyle: string?,
  existingClimaxIntensity: string?
) -> PacingResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a narrative structure expert and pacing specialist with deep knowledge of story architecture, including three-act structure, Save the Cat beats, and genre-specific pacing conventions. You understand how rhythm and structure serve emotional impact.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Duration: {{ durationUnit }} minutes
    - Format: {{ movieFormat }}
    - Central Themes: {{ themes | join(", ") }}

    {% if existingNarrativeStructure %}
    - Current Narrative Structure: {{ existingNarrativeStructure }}
    {% endif %}
    {% if existingPacingStyle %}
    - Current Pacing Style: {{ existingPacingStyle }}
    {% endif %}
    {% if existingClimaxIntensity %}
    - Current Climax Intensity: {{ existingClimaxIntensity }}
    {% endif %}

    Your Task:
    Design narrative structure and pacing that maximizes emotional impact:

    Expert Guidelines:
    - Consider genre conventions while finding fresh approaches
    - Ensure pacing serves character development and thematic exploration
    - Balance setup, confrontation, and resolution for the specified duration
    - Create rhythm that maintains audience engagement throughout
    - Design climax that pays off all setup and character arcs
    - Consider format-specific requirements (feature vs. series vs. short)
    - Use structure to reinforce themes and emotional journey
    - Plan for production realities while maintaining creative vision

    Return the response in JSON format with the following structure:
    {
      "narrativeStructure": "Story structure approach with act breaks and key beats (only if not provided)",
      "pacingStyle": "Overall rhythm and tempo strategy for maximum impact (only if not provided)",
      "climaxIntensity": "Type of climax, resolution style, and emotional payoff (only if not provided)"
    }
  "#
}

// Content Guidelines Generation - Content Strategy Expert
function GenerateContentGuidelines(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  targetAudience: string,
  themes: string[],
  existingContentRestrictions: string?,
  existingCulturalSensitivities: string?,
  existingEducationalValue: string?
) -> ContentGuidelinesResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a content strategy expert and cultural consultant with extensive experience in navigating content guidelines, cultural sensitivities, and educational value in film production. You understand how to balance creative vision with responsible storytelling.

    Project Context:
    - Project: {{ projectName }}
    - Genres: {{ primaryGenres | join(", ") }}
    - Core Premise: {{ corePremise }}
    - Target Audience: {{ targetAudience }}
    - Central Themes: {{ themes | join(", ") }}

    {% if existingContentRestrictions %}
    - Current Content Restrictions: {{ existingContentRestrictions }}
    {% endif %}
    {% if existingCulturalSensitivities %}
    - Current Cultural Sensitivities: {{ existingCulturalSensitivities }}
    {% endif %}
    {% if existingEducationalValue %}
    - Current Educational Value: {{ existingEducationalValue }}
    {% endif %}

    Your Task:
    Establish content guidelines that ensure responsible, impactful storytelling:

    Expert Guidelines:
    - Consider rating implications and audience appropriateness
    - Identify potential cultural sensitivities and respectful approaches
    - Balance creative freedom with social responsibility
    - Ensure authentic representation of diverse perspectives
    - Consider global audience and distribution requirements
    - Identify opportunities for positive social impact
    - Plan for potential controversy while maintaining artistic integrity
    - Consider educational or informational value without being didactic

    Return the response in JSON format with the following structure:
    {
      "contentRestrictions": "Content limitations, rating considerations, and creative boundaries (only if not provided)",
      "culturalSensitivities": "Cultural considerations, representation guidelines, and respectful approaches (only if not provided)",
      "educationalValue": "Learning opportunities, informational content, and positive impact potential (only if not provided)"
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

class CharacterArchetypesResponse {
  protagonistType string?
  supportingRoles string?
  relationshipDynamics string?
}

class SettingResponse {
  timePeriod string?
  geographicSetting string?
  socialContext string?
  scale string?
}

class PacingResponse {
  narrativeStructure string?
  pacingStyle string?
  climaxIntensity string?
}

class ContentGuidelinesResponse {
  contentRestrictions string?
  culturalSensitivities string?
  educationalValue string?
}
