import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  generateMissingFieldsSequentially,
  createInitialConceptContext,
  validateRequiredProjectFields,
  type InitialConceptFormData,
  type FieldGenerationProgress
} from '@/lib/ai/initial-concept-autofill'

// Validation schema for the request
const AutofillRequestSchema = z.object({
  // Project context
  projectName: z.string().min(1, 'Project name is required'),
  movieFormat: z.string().min(1, 'Movie format is required'),
  movieStyle: z.string().min(1, 'Movie style is required'),
  durationUnit: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseInt(val) : val
  ),
  series: z.string().optional(),
  
  // Current form data
  formData: z.object({
    status: z.string(),
    primaryGenres: z.array(z.string()),
    corePremise: z.string(),
    targetAudience: z.object({
      demographics: z.array(z.string()),
      psychographics: z.string(),
      customDescription: z.string(),
    }),
    toneAndMood: z.object({
      tones: z.array(z.string()),
      moods: z.array(z.string()),
      emotionalArc: z.string(),
    }),
    visualStyle: z.object({
      cinematographyStyle: z.string(),
      colorPalette: z.object({
        dominance: z.string(),
        saturation: z.string(),
        symbolicColors: z.string(),
      }),
      lightingPreferences: z.string(),
      cameraMovement: z.string(),
    }),
    references: z.object({
      inspirationalMovies: z.array(z.object({
        title: z.string(),
        year: z.number().nullable(),
        specificElements: z.string(),
      })),
      visualReferences: z.string(),
      narrativeReferences: z.string(),
    }),
    themes: z.object({
      centralThemes: z.array(z.string()),
      moralQuestions: z.string(),
      messageTakeaway: z.string(),
    }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validatedData = AutofillRequestSchema.parse(body)
    
    // Check if all required project fields are present
    if (!validateRequiredProjectFields(validatedData)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required project fields. Please ensure project name, format, style, and duration are provided.',
        },
        { status: 400 }
      )
    }
    
    // Check if series is required but missing
    if (validatedData.movieFormat === 'series' && !validatedData.series) {
      return NextResponse.json(
        {
          success: false,
          error: 'Series is required when movie format is "Series".',
        },
        { status: 400 }
      )
    }
    
    // Check if minimum required form fields are present for AI generation
    const { formData } = validatedData
    if (formData.primaryGenres.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one primary genre must be selected before using AI auto-fill.',
        },
        { status: 400 }
      )
    }
    
    // Create context for AI generation
    const context = createInitialConceptContext(
      validatedData.projectName,
      validatedData.movieFormat,
      validatedData.movieStyle,
      validatedData.durationUnit,
      validatedData.formData,
      validatedData.series
    )
    
    // Track progress for potential streaming response
    const progressUpdates: FieldGenerationProgress[] = []
    
    // Generate missing fields sequentially
    const generatedFields = await generateMissingFieldsSequentially(
      context,
      (progress) => {
        progressUpdates.push(progress)
        // In a real implementation, you might want to stream these updates
        // For now, we'll collect them and return at the end
      }
    )
    
    // Check if any fields were generated
    const hasGeneratedContent = Object.keys(generatedFields).length > 0
    
    if (!hasGeneratedContent) {
      return NextResponse.json(
        {
          success: false,
          error: 'All eligible fields are already filled or missing required dependencies. Nothing to generate.',
          details: 'Make sure required fields like primary genres are selected and that there are empty fields to fill.',
        },
        { status: 400 }
      )
    }
    
    // Count successful generations
    const successfulGenerations = progressUpdates.filter(p => p.status === 'completed').length
    const failedGenerations = progressUpdates.filter(p => p.status === 'error').length
    
    return NextResponse.json({
      success: true,
      data: {
        generatedFields,
        progress: progressUpdates,
        summary: {
          totalGenerated: successfulGenerations,
          totalFailed: failedGenerations,
          totalFields: Object.keys(generatedFields).length,
        },
        message: `Successfully generated ${successfulGenerations} field(s)${failedGenerations > 0 ? ` (${failedGenerations} failed)` : ''}`,
      },
    })
    
  } catch (error) {
    console.error('Initial Concept AI autofill error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }
    
    // Handle AI generation errors
    if (error instanceof Error && error.message.includes('Failed to generate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI generation failed. Please try again later.',
          details: error.message,
        },
        { status: 503 }
      )
    }
    
    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI generation timed out. Please try again with fewer fields or check your connection.',
          details: error.message,
        },
        { status: 504 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred during AI generation.',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined,
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 }
  )
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 }
  )
}
