// Project Title Generation - Creative Writer Role
function GenerateProjectTitle(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  existingTitle: string?,
  existingShortDescription: string?,
  existingLongDescription: string?
) -> string {
  client OpenRouterClient
  prompt #"
    You are a creative writer specializing in compelling movie titles. Your task is to generate an engaging, memorable title for a movie project.

    Project Context:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes
    
    {% if existingTitle %}
    - Current Title: {{ existingTitle }}
    {% endif %}
    {% if existingShortDescription %}
    - Short Description: {{ existingShortDescription }}
    {% endif %}
    {% if existingLongDescription %}
    - Long Description: {{ existingLongDescription }}
    {% endif %}

    Guidelines:
    - Create a title that captures the essence and tone of the project
    - Consider the movie format and style when crafting the title
    - Make it memorable and marketable
    - Keep it concise but impactful
    - Ensure it fits the genre and style specified
    {% if series %}
    - Consider this is part of a series: {{ series }}
    {% endif %}

    Generate only the title, no additional text or explanation.
  "#
}

// Short Description Generation - Marketing Content Editor Role
function GenerateShortDescription(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  projectTitle: string?,
  existingShortDescription: string?,
  existingLongDescription: string?
) -> string {
  client OpenRouterClient
  prompt #"
    You are a marketing content editor specializing in compelling movie descriptions for promotional materials. Your task is to create a concise, engaging short description that would work for movie posters, streaming platforms, and marketing materials.

    Project Context:
    - Project Name: {{ projectName }}
    {% if projectTitle %}
    - Title: {{ projectTitle }}
    {% endif %}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes
    
    {% if existingShortDescription %}
    - Current Short Description: {{ existingShortDescription }}
    {% endif %}
    {% if existingLongDescription %}
    - Long Description: {{ existingLongDescription }}
    {% endif %}

    Guidelines:
    - Write a compelling 1-2 sentence description (50-100 words maximum)
    - Focus on the hook that would make audiences want to watch
    - Include the genre/style elements naturally
    - Make it suitable for marketing materials
    - Create intrigue without spoiling key plot points
    - Match the tone of the specified movie style
    {% if series %}
    - Consider this is part of a series: {{ series }}
    {% endif %}

    Generate only the short description, no additional text or explanation.
  "#
}

// Long Description Generation - Movie Screenwriter Role
function GenerateLongDescription(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  projectTitle: string?,
  existingShortDescription: string?,
  existingLongDescription: string?
) -> string {
  client OpenRouterAdvanced
  prompt #"
    You are an experienced movie screenwriter and story developer. Your task is to create a detailed, rich description that could serve as the foundation for a screenplay or detailed project synopsis.

    Project Context:
    - Project Name: {{ projectName }}
    {% if projectTitle %}
    - Title: {{ projectTitle }}
    {% endif %}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes
    
    {% if existingShortDescription %}
    - Short Description: {{ existingShortDescription }}
    {% endif %}
    {% if existingLongDescription %}
    - Current Long Description: {{ existingLongDescription }}
    {% endif %}

    Guidelines:
    - Create a comprehensive description (200-400 words)
    - Include character archetypes and motivations
    - Outline the main story arc and conflict
    - Describe the setting and atmosphere
    - Include thematic elements that match the movie style
    - Consider the runtime when planning story complexity
    - Make it cinematically viable and engaging
    - Include visual and emotional elements that would translate well to screen
    {% if series %}
    - Consider how this fits within the broader series: {{ series }}
    - Include elements that could connect to other episodes/installments
    {% endif %}

    Structure the description with:
    1. Setting and premise
    2. Main characters and their goals
    3. Central conflict or challenge
    4. Key story beats
    5. Thematic elements

    Generate only the long description, no additional text or explanation.
  "#
}

// Batch Generation Function - Generates all fields at once
function GenerateAllProjectFields(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  existingTitle: string?,
  existingShortDescription: string?,
  existingLongDescription: string?,
  primaryGenres: string[]?,
  corePremise: string?,
  targetAudience: string[]?,
  tone: string[]?
) -> ProjectFieldsResponse {
  client OpenRouterAdvanced
  prompt #"
    You are a comprehensive movie development team including a creative writer, marketing content editor, and screenwriter. Generate all missing project fields for this movie project.

    Project Context:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes

    Core Story Elements:
    {% if primaryGenres %}
    - Genres: {{ primaryGenres | join(", ") }}
    {% endif %}
    {% if corePremise %}
    - Core Premise: {{ corePremise }}
    {% endif %}
    {% if targetAudience %}
    - Target Audience: {{ targetAudience | join(", ") }}
    {% endif %}
    {% if tone %}
    - Tone: {{ tone | join(", ") }}
    {% endif %}
    
    Existing Content:
    {% if existingTitle %}
    - Title: {{ existingTitle }}
    {% endif %}
    {% if existingShortDescription %}
    - Short Description: {{ existingShortDescription }}
    {% endif %}
    {% if existingLongDescription %}
    - Long Description: {{ existingLongDescription }}
    {% endif %}

    Generate the missing fields with these roles:
    - Title: Creative writer creating memorable, marketable titles
    - Short Description: Marketing editor creating compelling 50-100 word promotional copy
    - Long Description: Screenwriter creating detailed 200-400 word story synopsis

    Ensure all generated content is cohesive and consistent with each other and the project parameters.

    Return the response in the exact JSON format specified by ProjectFieldsResponse.
  "#
}

class ProjectFieldsResponse {
  projectTitle string?
  shortDescription string?
  longDescription string?
}
