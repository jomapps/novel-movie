import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateCoreStoryElements } from '@/lib/ai/core-elements-autofill'

// Validation schema for the request
const CoreElementsAutofillRequestSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  movieFormat: z.string().min(1, 'Movie format is required'),
  movieStyle: z.string().min(1, 'Movie style is required'),
  durationUnit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val)),
  series: z.string().optional(),
  // Current core elements values
  primaryGenres: z.array(z.string()).optional().default([]),
  corePremise: z.string().optional().default(''),
  targetAudience: z.array(z.string()).optional().default([]),
  tone: z.array(z.string()).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validatedData = CoreElementsAutofillRequestSchema.parse(body)

    // Check if all required fields are present
    const requiredFields = ['name', 'movieFormat', 'movieStyle', 'durationUnit']
    const missingFields = requiredFields.filter((field) => !validatedData[field as keyof typeof validatedData])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 },
      )
    }

    // Check if series is required but missing
    if (validatedData.movieFormat === 'series' && !validatedData.series) {
      return NextResponse.json(
        {
          success: false,
          error: 'Series is required when movie format is "Series".',
        },
        { status: 400 },
      )
    }

    // Generate core story elements
    const generatedFields = await generateCoreStoryElements({
      projectName: validatedData.name,
      movieFormat: validatedData.movieFormat,
      movieStyle: validatedData.movieStyle,
      series: validatedData.series,
      durationUnit: validatedData.durationUnit,
      currentValues: {
        primaryGenres: validatedData.primaryGenres,
        corePremise: validatedData.corePremise,
        targetAudience: validatedData.targetAudience,
        tone: validatedData.tone,
      },
    })

    // Check if any fields were generated
    const hasGeneratedContent = Object.keys(generatedFields).length > 0

    if (!hasGeneratedContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'All core story elements are already filled. Nothing to generate.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedFields,
        message: `Successfully generated ${Object.keys(generatedFields).length} core story element(s)`,
      },
    })
  } catch (error) {
    console.error('Core elements autofill error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
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
          supportUrl: 'https://openrouter.ai/settings/credits',
        },
        { status: 402 },
      )
    }

    // Handle AI generation errors
    if (error instanceof Error && error.message.includes('Failed to generate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI generation failed. Please try again later.',
          userMessage:
            'The AI content generation service encountered an error. Please try again in a few moments.',
          errorType: 'AI_GENERATION_ERROR',
          details: error.message,
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

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred during AI generation.',
        userMessage: 'An unexpected error occurred during AI generation. Please try again.',
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
      error: 'Method not allowed. Use POST to generate AI content.',
    },
    { status: 405 },
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content.',
    },
    { status: 405 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content.',
    },
    { status: 405 },
  )
}
