import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateMissingFields,
  createProjectContext,
  validateRequiredFields,
} from '@/lib/ai/project-autofill'

// Validation schema for the request
const AutofillRequestSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  movieFormat: z.string().min(1, 'Movie format is required'),
  movieStyle: z.string().min(1, 'Movie style is required'),
  durationUnit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val)),
  series: z.string().optional(),
  projectTitle: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validatedData = AutofillRequestSchema.parse(body)

    // Check if all required fields are present
    if (!validateRequiredFields(validatedData)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields. Please fill in all required fields before using AI auto-fill.',
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

    // Create project context for AI generation
    const context = createProjectContext(validatedData)

    // Generate missing fields
    const generatedFields = await generateMissingFields(context)

    // Check if any fields were generated
    const hasGeneratedContent = Object.keys(generatedFields).length > 0

    if (!hasGeneratedContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'All optional fields are already filled. Nothing to generate.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedFields,
        message: `Successfully generated ${Object.keys(generatedFields).length} field(s)`,
      },
    })
  } catch (error) {
    console.error('AI autofill error:', error)

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

    // Handle OpenRouter insufficient credits error
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

    // Handle general OpenRouter API errors
    if (error instanceof Error && error.message.includes('OpenRouter')) {
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
