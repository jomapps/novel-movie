import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for the request
const QualityScoreRequestSchema = z.object({
  // Project context
  projectName: z.string().min(1, 'Project name is required'),
  movieFormat: z.string().min(1, 'Movie format is required'),
  movieStyle: z.string().min(1, 'Movie style is required'),
  durationUnit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val)),
  series: z.string().optional().nullable(),

  // Form data - all the initial concept fields
  formData: z.object({
    primaryGenres: z.array(z.string()).min(1, 'At least one genre is required'),
    corePremise: z.string().min(1, 'Core premise is required'),
    targetAudience: z.object({
      demographics: z.array(z.string()).min(1, 'At least one demographic is required'),
      psychographics: z.string().min(1, 'Psychographics is required'),
      customDescription: z.string().optional().default(''),
    }),
    toneAndMood: z.object({
      tones: z.array(z.string()).min(1, 'At least one tone is required'),
      moods: z.array(z.string()).min(1, 'At least one mood is required'),
      emotionalArc: z.string().min(1, 'Emotional arc is required'),
    }),
    visualStyle: z.object({
      cinematographyStyle: z.string().min(1, 'Cinematography style is required'),
      colorPalette: z.object({
        dominance: z.string().min(1, 'Color dominance is required'),
        saturation: z.string().min(1, 'Color saturation is required'),
        symbolicColors: z.string().min(1, 'Symbolic colors is required'),
      }),
      lightingPreferences: z.string().min(1, 'Lighting preferences is required'),
      cameraMovement: z.string().min(1, 'Camera movement is required'),
    }),
    references: z.object({
      inspirationalMovies: z
        .array(
          z.object({
            title: z.string(),
            year: z.number().nullable(),
            specificElements: z.string(),
          }),
        )
        .min(1, 'At least one inspirational movie is required'),
      visualReferences: z.string().min(1, 'Visual references is required'),
      narrativeReferences: z.string().min(1, 'Narrative references is required'),
    }),
    themes: z.object({
      centralThemes: z.array(z.string()).min(1, 'At least one central theme is required'),
      moralQuestions: z.string().min(1, 'Moral questions is required'),
      messageTakeaway: z.string().min(1, 'Message takeaway is required'),
    }),
  }),
})

import { getBamlClient } from '@/lib/ai/initial-concept-autofill'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Received quality score request:', JSON.stringify(body, null, 2))

    // Validate the request data
    const validatedData = QualityScoreRequestSchema.parse(body)

    // Prepare data for BAML function
    const { projectName, movieFormat, movieStyle, series, durationUnit, formData } = validatedData

    // Format the data for the BAML function
    const targetAudience = `${formData.targetAudience.demographics.join(', ')} - ${formData.targetAudience.psychographics}${formData.targetAudience.customDescription ? ` - ${formData.targetAudience.customDescription}` : ''}`

    const toneAndMood = `Tones: ${formData.toneAndMood.tones.join(', ')}; Moods: ${formData.toneAndMood.moods.join(', ')}; Emotional Arc: ${formData.toneAndMood.emotionalArc}`

    const visualStyle = `Cinematography: ${formData.visualStyle.cinematographyStyle}; Color Palette: ${formData.visualStyle.colorPalette.dominance} dominance, ${formData.visualStyle.colorPalette.saturation} saturation, ${formData.visualStyle.colorPalette.symbolicColors} symbolic colors; Lighting: ${formData.visualStyle.lightingPreferences}; Camera Movement: ${formData.visualStyle.cameraMovement}`

    const themes = `Central Themes: ${formData.themes.centralThemes.join(', ')}; Moral Questions: ${formData.themes.moralQuestions}; Message Takeaway: ${formData.themes.messageTakeaway}`

    const references = `Inspirational Movies: ${formData.references.inspirationalMovies.map((movie) => `${movie.title} (${movie.year || 'N/A'}) - ${movie.specificElements}`).join('; ')}; Visual References: ${formData.references.visualReferences}; Narrative References: ${formData.references.narrativeReferences}`

    // For now, we'll create placeholder strings for character archetypes, setting elements, and pacing elements
    // These would normally come from the form data if they were filled
    const characterArchetypes = 'To be determined based on story development'
    const settingElements = 'To be determined based on story requirements'
    const pacingElements = 'To be determined based on narrative structure'

    console.log('🚀 Calling BAML AssessProjectQuality function...')

    // Call the BAML function directly
    const b = await getBamlClient()
    const result = await b.AssessProjectQuality(
      projectName,
      movieFormat,
      movieStyle,
      series,
      durationUnit,
      formData.primaryGenres,
      formData.corePremise,
      targetAudience,
      toneAndMood,
      visualStyle,
      themes,
      characterArchetypes,
      settingElements,
      pacingElements,
      references,
    )

    console.log('✅ Quality assessment completed:', result)

    return NextResponse.json({
      success: true,
      data: {
        qualityScore: result.qualityScore,
        recommendations: result.recommendations,
      },
    })
  } catch (error) {
    console.error('❌ Error in quality score assessment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 },
      )
    }

    // Handle AI service insufficient credits error
    if (error instanceof Error && error.message.includes('402 Insufficient credits')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service credits exhausted',
          userMessage:
            'The AI service has run out of credits. Please contact support or try again later.',
          errorType: 'INSUFFICIENT_CREDITS',
        },
        { status: 402 },
      )
    }

    // Handle BAML native binding errors
    if (
      error instanceof Error &&
      (error.message.includes('BAML client not available') ||
        error.message.includes('Failed to load native binding'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service temporarily unavailable',
          userMessage:
            'The AI quality assessment service is temporarily unavailable. This is likely due to a system configuration issue. Please try again later or contact support.',
          errorType: 'SERVICE_UNAVAILABLE',
        },
        { status: 503 },
      )
    }

    // Handle general AI service API errors
    if (
      error instanceof Error &&
      (error.message.includes('OpenRouter') || error.message.includes('AI service'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service error',
          userMessage: 'There was an issue with the AI service. Please try again in a few moments.',
          errorType: 'AI_SERVICE_ERROR',
        },
        { status: 503 },
      )
    }

    // Generic error fallback
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assess project quality. Please try again.',
        userMessage: 'An unexpected error occurred while assessing your project. Please try again.',
        errorType: 'UNKNOWN_ERROR',
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to assess project quality.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to assess project quality.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to assess project quality.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}
