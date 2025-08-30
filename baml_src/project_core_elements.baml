// Project Core Story Elements Auto-fill BAML Templates
// Simple functions for generating core story elements in project creation form

// Simple Core Premise Generation - Story Development Expert
function GenerateSimpleCorePremise(
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
    You are a master story architect specializing in concise, compelling story premises. Your task is to create a simple, clear core premise for this project.

    Project Context:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes
    - Primary Genres: {{ primaryGenres|join(", ") }}

    {% if existingPremise %}
    Current Premise: {{ existingPremise }}
    {% endif %}

    Instructions:
    - Create a compelling core premise in exactly 1-2 clear, concise sentences
    - Focus on the central conflict and what drives the story forward
    - Incorporate elements that align with the selected genres
    - Consider the format and duration when crafting the scope
    - Make it specific and engaging without being overly complex
    - Avoid clichés and strive for originality within genre conventions

    CRITICAL: Return ONLY the premise text as 1-2 sentences. No formatting, headers, explanations, introductions, or additional text. Just the core story premise as plain text.
  "#
}

// Primary Genres Generation - Genre Expert
function GeneratePrimaryGenres(
  projectName: string,
  movieFormat: string,
  movieStyle: string,
  series: string?,
  durationUnit: int,
  existingGenres: string[]?
) -> string[] {
  client OpenRouterAdvanced
  prompt #"
    You are a genre classification expert with deep knowledge of film and television categorization. Your task is to select exactly 3 primary genres that best fit this project based on the provided context.

    Project Context:
    - Project Name: {{ projectName }}
    - Movie Format: {{ movieFormat }}
    - Movie Style: {{ movieStyle }}
    {% if series %}
    - Series: {{ series }}
    {% endif %}
    - Duration: {{ durationUnit }} minutes

    {% if existingGenres %}
    Current Genres: {{ existingGenres|join(", ") }}
    {% endif %}

    Available Genres:
    Action, Adventure, Animation, Biography, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Sport, Thriller, War, Western

    Instructions:
    - Select exactly 3 genres that best represent this project
    - Consider the movie format, style, and duration when making selections
    - Choose genres that work well together and create compelling storytelling opportunities
    - Prioritize genres that align with the movie style and format
    - For series format, consider genres that sustain long-form storytelling
    - For shorter durations, focus on genres that work well in condensed formats

    Return only a JSON array of exactly 3 genre names, no additional text or explanation.
    Example: ["Drama", "Thriller", "Mystery"]
  "#
}

// Target Audience Generation - Audience Research Expert
function GenerateTargetAudience(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  movieFormat: string,
  durationUnit: int,
  existingAudience: string[]?
) -> string[] {
  client OpenRouterAdvanced
  prompt #"
    You are an audience research and demographic targeting expert. Your task is to identify the most suitable target audience segments for this project.

    Project Context:
    - Project Name: {{ projectName }}
    - Primary Genres: {{ primaryGenres|join(", ") }}
    - Core Premise: {{ corePremise }}
    - Movie Format: {{ movieFormat }}
    - Duration: {{ durationUnit }} minutes

    {% if existingAudience %}
    Current Target Audience: {{ existingAudience|join(", ") }}
    {% endif %}

    Available Audience Demographics:
    Children (5-12), Teens (13-17), Young Adults (18-24), Adults (25-34), Middle-aged Adults (35-49), Older Adults (50-64), Seniors (65+), Families, General Audience

    Instructions:
    - Select 2-3 audience demographics that best match this project
    - Consider the genres, premise, and format when determining audience appeal
    - Think about who would be most interested in and engaged by this story
    - Consider content appropriateness for different age groups
    - For family content, include "Families" as one of the demographics
    - Balance broad appeal with targeted specificity

    Return only a JSON array of 2-3 demographic names, no additional text or explanation.
    Example: ["Young Adults (18-24)", "Adults (25-34)", "General Audience"]
  "#
}

// Tone Generation - Tone and Mood Expert
function GenerateTone(
  projectName: string,
  primaryGenres: string[],
  corePremise: string,
  targetAudience: string[],
  movieStyle: string,
  existingTone: string[]?
) -> string[] {
  client OpenRouterAdvanced
  prompt #"
    You are a tone and mood specialist with expertise in crafting the emotional atmosphere of stories. Your task is to select appropriate tones that will guide the storytelling approach.

    Project Context:
    - Project Name: {{ projectName }}
    - Primary Genres: {{ primaryGenres|join(", ") }}
    - Core Premise: {{ corePremise }}
    - Target Audience: {{ targetAudience|join(", ") }}
    - Movie Style: {{ movieStyle }}

    {% if existingTone %}
    Current Tone: {{ existingTone|join(", ") }}
    {% endif %}

    Available Tones:
    Dramatic, Comedic, Dark, Light-hearted, Suspenseful, Romantic, Action-packed, Mysterious, Inspirational, Satirical, Melancholic, Uplifting, Gritty, Whimsical, Intense, Contemplative, Adventurous, Nostalgic, Surreal, Realistic

    Instructions:
    - Select 2-3 tones that best capture the intended emotional atmosphere
    - Ensure the tones complement the genres and premise
    - Consider the target audience when selecting appropriate tones
    - Choose tones that work well together and don't conflict
    - Align with the movie style and overall project vision
    - Think about how these tones will guide dialogue, pacing, and visual style

    Return only a JSON array of 2-3 tone names, no additional text or explanation.
    Example: ["Dramatic", "Suspenseful", "Dark"]
  "#
}
