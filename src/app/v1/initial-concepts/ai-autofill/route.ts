import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  generateAndUpdateFieldsIndividually,
  generateMissingFieldsSequentially,
  validateRequiredProjectFields,
  type InitialConceptContext,
  type InitialConceptFormData,
  type FieldGenerationProgress,
} from '@/lib/ai/initial-concept-autofill'
// Removed problematic collection manager import

// Validation schema for the request
const AutofillRequestSchema = z.object({
  // Project context
  projectId: z.string().min(1, 'Project ID is required'), // Required for creating initial-concept record
  projectName: z.string().min(1, 'Project name is required'),
  projectDescription: z.string().optional().default(''), // Optional project description for better context
  movieFormat: z.string().min(1, 'Movie format is required'),
  movieStyle: z.string().min(1, 'Movie style is required'),
  durationUnit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val)),
  series: z.string().optional().nullable(),

  // Current form data
  formData: z.object({
    status: z.string(),
    primaryGenres: z.array(z.string()),
    corePremise: z.string().optional().default(''),
    targetAudience: z.object({
      demographics: z.array(z.string()).optional().default([]),
      psychographics: z.string().optional().default(''),
      customDescription: z.string().optional().default(''),
    }),
    toneAndMood: z.object({
      tones: z.array(z.string()).optional().default([]),
      moods: z.array(z.string()).optional().default([]),
      emotionalArc: z.string().optional().default(''),
    }),
    visualStyle: z.object({
      cinematographyStyle: z.string().optional().default(''),
      colorPalette: z.object({
        dominance: z.string().optional().default(''),
        saturation: z.string().optional().default(''),
        symbolicColors: z.string().optional().default(''),
      }),
      lightingPreferences: z.string().optional().default(''),
      cameraMovement: z.string().optional().default(''),
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
        .optional()
        .default([]),
      visualReferences: z.string().optional().default(''),
      narrativeReferences: z.string().optional().default(''),
    }),
    themes: z.object({
      centralThemes: z.array(z.string()).optional().default([]),
      moralQuestions: z.string().optional().default(''),
      messageTakeaway: z.string().optional().default(''),
    }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Received request body:', JSON.stringify(body, null, 2))
    console.log('🔍 FormData structure:', JSON.stringify(body.formData, null, 2))

    // Validate the request data
    const validatedData = AutofillRequestSchema.parse(body)

    // Check if all required project fields are present
    if (!validateRequiredProjectFields(validatedData)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required project fields. Please ensure project name, format, style, and duration are provided.',
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

    // Step 1: Create or find the initial-concept record
    console.log('🏗️ Creating or finding initial-concept record...')
    const payload = await getPayload({ config })

    // Check if record already exists
    const existingRecord = await payload.find({
      collection: 'initial-concepts',
      where: {
        project: { equals: validatedData.projectId },
      },
      limit: 1,
    })

    let initialConceptRecord: any

    if (existingRecord.totalDocs > 0) {
      // Use existing record
      initialConceptRecord = existingRecord.docs[0]
      console.log('✅ Found existing initial-concept record:', initialConceptRecord.id)
    } else {
      // Create new record
      initialConceptRecord = await payload.create({
        collection: 'initial-concepts',
        data: {
          project: validatedData.projectId,
          status: 'ai-generated',
          // All other fields will be populated by AI generation
        },
      })
      console.log('✅ Created new initial-concept record:', initialConceptRecord.id)
    }

    // Step 2: Generate each field individually and update the record
    console.log('🤖 Starting individual field generation...')
    const context: InitialConceptContext = {
      projectName: validatedData.projectName,
      movieFormat: validatedData.movieFormat,
      movieStyle: validatedData.movieStyle,
      durationUnit: validatedData.durationUnit,
      formData: validatedData.formData,
      series: validatedData.series || undefined,
    }

    // Track progress for response
    const progressUpdates: FieldGenerationProgress[] = []
    const generatedFields: string[] = []

    // Generate and update each field individually
    const updatedRecord = await generateAndUpdateFieldsIndividually(
      payload,
      initialConceptRecord.id,
      context,
      (progress) => {
        console.log(`📊 Field progress: ${progress.fieldName} - ${progress.status}`)
        progressUpdates.push(progress)
        if (progress.status === 'completed') {
          generatedFields.push(progress.fieldName)
        }
      },
    )

    console.log('✅ Individual field generation completed:', generatedFields)

    // Check if any fields were generated
    const hasGeneratedContent = generatedFields.length > 0

    if (!hasGeneratedContent) {
      return NextResponse.json(
        {
          success: false,
          error:
            'All eligible fields are already filled or missing required dependencies. Nothing to generate.',
          details:
            'Make sure required fields like primary genres are selected and that there are empty fields to fill.',
          recordId: initialConceptRecord.id, // Return the created record ID even if no fields were generated
        },
        { status: 400 },
      )
    }

    // Count successful generations
    const successfulGenerations = progressUpdates.filter((p) => p.status === 'completed').length
    const failedGenerations = progressUpdates.filter((p) => p.status === 'error').length

    return NextResponse.json({
      success: true,
      data: {
        recordId: initialConceptRecord.id,
        record: updatedRecord,
        generatedFields,
        progress: progressUpdates,
        summary: {
          totalGenerated: successfulGenerations,
          totalFailed: failedGenerations,
          totalFields: generatedFields.length,
        },
        message: `Successfully created initial-concept record and generated ${successfulGenerations} field(s)${failedGenerations > 0 ? ` (${failedGenerations} failed)` : ''}`,
      },
    })
  } catch (error) {
    console.error('Initial Concept AI autofill error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('🚨 Zod validation errors:', JSON.stringify(error.errors, null, 2))
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

    // Handle AI generation errors
    if (error instanceof Error && error.message.includes('Failed to generate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI generation failed. Please try again later.',
          details: error.message,
        },
        { status: 503 },
      )
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'AI generation timed out. Please try again with fewer fields or check your connection.',
          details: error.message,
        },
        { status: 504 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred during AI generation.',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
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
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate AI content for Initial Concept.',
      supportedMethods: ['POST'],
    },
    { status: 405 },
  )
}
