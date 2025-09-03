import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-updatedAt'

    const projects = await payload.find({
      collection: 'projects',
      page,
      limit,
      sort,
      depth: 2, // Include related data like movieFormat and movieStyle
    })

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.movieFormat || !data.movieStyle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, movieFormat, and movieStyle are required',
        },
        { status: 400 },
      )
    }

    // Clean up relationship fields - remove empty arrays and undefined values
    const cleanedData = { ...data }

    // Handle tone field specifically
    if (cleanedData.tone && Array.isArray(cleanedData.tone)) {
      // Filter out empty strings and null values
      cleanedData.tone = cleanedData.tone.filter(
        (id) => id && typeof id === 'string' && id.trim() !== '',
      )
      // If no valid tone IDs, remove the field entirely
      if (cleanedData.tone.length === 0) {
        delete cleanedData.tone
      }
    } else if (!cleanedData.tone) {
      delete cleanedData.tone
    }

    // Handle other relationship arrays similarly
    const relationshipFields = ['primaryGenres', 'targetAudience']
    relationshipFields.forEach((field) => {
      if (cleanedData[field] && Array.isArray(cleanedData[field])) {
        cleanedData[field] = cleanedData[field].filter(
          (id) => id && typeof id === 'string' && id.trim() !== '',
        )
        if (cleanedData[field].length === 0) {
          delete cleanedData[field]
        }
      } else if (!cleanedData[field]) {
        delete cleanedData[field]
      }
    })

    const project = await payload.create({
      collection: 'projects',
      data: {
        ...cleanedData,
        status: cleanedData.status || 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Error creating project:', error)

    // Provide more detailed error information
    let errorMessage = 'Failed to create project'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
